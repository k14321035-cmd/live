"""
PDF Swiss Army Knife — local Flask server
Merge, split, set/remove/recover passwords, and watermark PDFs.

Engine: pypdf (page operations) + reportlab (watermark text generation).

Password recovery ("brute force") is meant for PDFs YOU own where you've
forgotten the password. It tries a bounded set of candidates — a common
password list, a custom list, or a full character-set sweep (digits /
letters / symbols, up to 8 characters) — spread across all CPU cores for
speed. It always reports honestly: for anything beyond a handful of
characters and a small charset, exhausting the full keyspace is not
actually achievable in reasonable time on a normal computer (see the
math note above BF_MAX_SECONDS below), so the job is bounded by a hard
time/attempt cap and reports back rather than hanging forever.

Run:
    pip install -r requirements.txt
    python server.py
Then open http://localhost:5000 in a browser.
"""
import io
import os
import re
import time
import uuid
import zipfile
import string
import tempfile
import itertools
import threading
import traceback
import multiprocessing as mp

from flask import Flask, request, jsonify, send_file, send_from_directory
from pypdf import PdfReader, PdfWriter
from pypdf.errors import FileNotDecryptedError
from pypdf.constants import UserAccessPermissions as UAP
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color

APP_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = APP_DIR
PROCESSED_DIR = os.path.join(APP_DIR, "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

MAX_UPLOAD_MB = 100

# --------------------------------------------------------------------------
# Brute-force / password-recovery safety caps.
#
# Reality check: PDF encryption (especially AES-256/R6) is deliberately
# slow to test — a few hundred to a few thousand attempts/sec per core even
# in optimized code, because the spec runs a costly key-derivation step on
# every attempt (that's the whole point — it resists brute forcing). Spread
# across every core on a normal machine that's maybe 5,000-15,000
# attempts/sec. An 8-character keyspace is enormous: digits-only (10^8) is
# reachable in minutes, but lowercase+digits (36^8 ≈ 2.8 trillion) already
# takes on the order of years, and adding uppercase/symbols pushes it to
# centuries or worse. No honest tool can promise to "try all 8-character
# passwords fast" for anything but a very small character set — so this
# tool is upfront about the real odds before it runs, and always stays
# within a hard bound rather than hanging.
# --------------------------------------------------------------------------
BF_MAX_SECONDS = 900             # hard wall-clock ceiling per job (15 minutes)
BF_MAX_ATTEMPTS = 100_000_000    # hard attempt ceiling per job
BF_MAX_CHARSET_LEN = 8           # longest brute-force password length allowed
BF_MAX_CUSTOM_LIST = 5000        # max candidates in a user-supplied list
BF_JOB_TTL_SECONDS = 1800        # stale job records are dropped after this long
BF_WORKERS = max(1, min(8, mp.cpu_count() or 1))  # parallel worker processes
BF_BENCH_SAMPLE = 40             # attempts used to measure this machine's real rate

CHARSETS = {
    "digits": string.digits,
    "lower": string.ascii_lowercase,
    "upper": string.ascii_uppercase,
    "symbols": "!@#$%^&*()-_=+",
}

BRUTEFORCE_JOBS = {}
BRUTEFORCE_LOCK = threading.Lock()

# A modest built-in list of very commonly used passwords / PINs, useful for
# recovering a forgotten password on your own document quickly before
# falling back to a slower charset sweep.
COMMON_PASSWORDS = [
    "123456", "password", "123456789", "12345678", "12345", "1234567",
    "1234567890", "qwerty", "abc123", "111111", "123123", "000000",
    "admin", "letmein", "welcome", "monkey", "login", "princess",
    "qwertyuiop", "solo", "passw0rd", "starwars", "dragon", "master",
    "hello", "freedom", "whatever", "qazwsx", "trustno1", "iloveyou",
    "sunshine", "shadow", "michael", "football", "baseball", "superman",
    "batman", "1q2w3e4r", "654321", "121212", "7777777", "1qaz2wsx",
    "password1", "password123", "pdf123", "document", "confidential",
    "secret", "changeme", "changeit", "test123", "admin123", "user",
    "guest", "temp123", "default", "1111", "0000", "1234", "12345",
    "letmein123", "welcome123", "qwerty123", "asdfgh", "zxcvbn",
    "abcd1234", "password!", "P@ssw0rd", "Passw0rd!", "root", "toor",
]


app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def _safe_id(file_id: str) -> str:
    return "".join(c for c in file_id if c.isalnum())


def _save_upload(file_storage, suffix=".pdf") -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=PROCESSED_DIR)
    path = tmp.name
    tmp.close()
    file_storage.save(path)
    return path


def _cleanup(*paths):
    for p in paths:
        if p and os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass


def _parse_page_ranges(spec: str, total_pages: int):
    """
    Parse a page-range spec like "1-3,5,8-10" into a list of 0-indexed page
    index lists, one list per group (so each group becomes its own output file).
    Raises ValueError on bad input or out-of-range pages.
    """
    groups = []
    spec = spec.strip()
    if not spec:
        raise ValueError("No page ranges provided.")

    for chunk in spec.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"^(\d+)(?:-(\d+))?$", chunk)
        if not m:
            raise ValueError(f"Invalid range: '{chunk}'")
        start = int(m.group(1))
        end = int(m.group(2)) if m.group(2) else start
        if start < 1 or end < 1 or start > total_pages or end > total_pages:
            raise ValueError(f"Range '{chunk}' is out of bounds (document has {total_pages} pages).")
        if start > end:
            start, end = end, start
        groups.append(list(range(start - 1, end)))  # 0-indexed, inclusive

    if not groups:
        raise ValueError("No valid page ranges provided.")
    return groups


def _try_password(raw_bytes: bytes, candidate: str) -> bool:
    """Return True if `candidate` opens the encrypted PDF held in raw_bytes."""
    try:
        reader = PdfReader(io.BytesIO(raw_bytes))
        if not reader.is_encrypted:
            return False
        result = reader.decrypt(candidate)
        return result != 0
    except Exception:
        return False


def _write_unlocked_copy(raw_bytes: bytes, password: str) -> str:
    """Decrypt raw_bytes with password and write a clean copy to disk.
    Returns the out_id."""
    reader = PdfReader(io.BytesIO(raw_bytes))
    if reader.is_encrypted:
        reader.decrypt(password)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    out_id = uuid.uuid4().hex
    out_path = os.path.join(PROCESSED_DIR, f"{out_id}.pdf")
    with open(out_path, "wb") as fh:
        writer.write(fh)
    return out_id


def _make_watermark_page(width, height, text, opacity, angle, font_size, color_hex):
    """Build a single-page reportlab PDF (in memory) sized to (width, height)
    with diagonal repeated watermark text, returned as a pypdf page."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))

    try:
        r = int(color_hex[0:2], 16) / 255.0
        g = int(color_hex[2:4], 16) / 255.0
        b = int(color_hex[4:6], 16) / 255.0
    except Exception:
        r, g, b = (0.5, 0.5, 0.5)

    c.setFillColor(Color(r, g, b, alpha=opacity))
    c.setFont("Helvetica-Bold", font_size)

    c.saveState()
    c.translate(width / 2, height / 2)
    c.rotate(angle)

    # Tile the text a few times so it covers the page reasonably on any size.
    text_width = c.stringWidth(text, "Helvetica-Bold", font_size)
    step_x = text_width + 80
    step_y = font_size * 4
    cols = 6
    rows = 6
    for row in range(-rows, rows + 1):
        for col in range(-cols, cols + 1):
            x = col * step_x - text_width / 2
            y = row * step_y
            c.drawString(x, y, text)

    c.restoreState()
    c.save()
    buf.seek(0)

    return PdfReader(buf).pages[0]


# --------------------------------------------------------------------------
# Static frontend
# --------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


# --------------------------------------------------------------------------
# Merge
# --------------------------------------------------------------------------

@app.route("/api/merge", methods=["POST"])
def api_merge():
    files = request.files.getlist("files")
    if not files or len(files) < 2:
        return jsonify({"error": "Upload at least two PDF files to merge."}), 400

    tmp_paths = []
    try:
        writer = PdfWriter()
        for f in files:
            if not f.filename.lower().endswith(".pdf"):
                return jsonify({"error": f"'{f.filename}' is not a PDF."}), 400
            path = _save_upload(f)
            tmp_paths.append(path)
            try:
                reader = PdfReader(path)
            except Exception:
                return jsonify({"error": f"Could not read '{f.filename}'. Is it a valid PDF?"}), 400
            if reader.is_encrypted:
                return jsonify({"error": f"'{f.filename}' is password-protected. Unlock it first."}), 400
            for page in reader.pages:
                writer.add_page(page)

        out_id = uuid.uuid4().hex
        out_path = os.path.join(PROCESSED_DIR, f"{out_id}.pdf")
        with open(out_path, "wb") as fh:
            writer.write(fh)

        return jsonify({
            "id": out_id,
            "download_url": f"api/download/{out_id}",
            "filename": "merged.pdf",
            "page_count": len(writer.pages),
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to merge PDFs: {e}"}), 500
    finally:
        _cleanup(*tmp_paths)


# --------------------------------------------------------------------------
# Split
# --------------------------------------------------------------------------

@app.route("/api/split", methods=["POST"])
def api_split():
    if "file" not in request.files:
        return jsonify({"error": "No PDF file provided (expected form field 'file')."}), 400

    file = request.files["file"]
    mode = request.form.get("mode", "all")  # "all" = one file per page, "ranges" = custom ranges
    ranges_spec = request.form.get("ranges", "")

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": f"'{file.filename}' is not a PDF."}), 400

    tmp_path = None
    try:
        tmp_path = _save_upload(file)
        try:
            reader = PdfReader(tmp_path)
        except Exception:
            return jsonify({"error": "Could not read the PDF. Is it valid?"}), 400

        if reader.is_encrypted:
            return jsonify({"error": "This PDF is password-protected. Unlock it first."}), 400

        total_pages = len(reader.pages)

        if mode == "ranges":
            try:
                groups = _parse_page_ranges(ranges_spec, total_pages)
            except ValueError as ve:
                return jsonify({"error": str(ve)}), 400
        else:
            groups = [[i] for i in range(total_pages)]

        out_id = uuid.uuid4().hex
        zip_path = os.path.join(PROCESSED_DIR, f"{out_id}.zip")

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for idx, page_indices in enumerate(groups, start=1):
                writer = PdfWriter()
                for p in page_indices:
                    writer.add_page(reader.pages[p])
                member_buf = io.BytesIO()
                writer.write(member_buf)
                member_buf.seek(0)

                if len(page_indices) == 1:
                    member_name = f"page_{page_indices[0] + 1}.pdf"
                else:
                    member_name = f"pages_{page_indices[0] + 1}-{page_indices[-1] + 1}.pdf"
                zf.writestr(member_name, member_buf.read())

        return jsonify({
            "id": out_id,
            "download_url": f"api/download/{out_id}",
            "filename": "split_pages.zip",
            "file_count": len(groups),
            "is_zip": True,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to split PDF: {e}"}), 500
    finally:
        _cleanup(tmp_path)


# --------------------------------------------------------------------------
# Unlock (remove password)
# --------------------------------------------------------------------------

@app.route("/api/unlock", methods=["POST"])
def api_unlock():
    if "file" not in request.files:
        return jsonify({"error": "No PDF file provided (expected form field 'file')."}), 400

    file = request.files["file"]
    password = request.form.get("password", "")

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": f"'{file.filename}' is not a PDF."}), 400

    tmp_path = None
    try:
        tmp_path = _save_upload(file)
        try:
            reader = PdfReader(tmp_path)
        except Exception:
            return jsonify({"error": "Could not read the PDF. Is it valid?"}), 400

        if reader.is_encrypted:
            result = reader.decrypt(password)
            if result == 0:
                return jsonify({"error": "Incorrect password."}), 400
        # else: not encrypted, nothing to unlock — still lets the user
        # get a clean copy back.

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        out_id = uuid.uuid4().hex
        out_path = os.path.join(PROCESSED_DIR, f"{out_id}.pdf")
        with open(out_path, "wb") as fh:
            writer.write(fh)

        return jsonify({
            "id": out_id,
            "download_url": f"api/download/{out_id}",
            "filename": "unlocked.pdf",
            "page_count": len(writer.pages),
        })
    except FileNotDecryptedError:
        return jsonify({"error": "Incorrect password."}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to unlock PDF: {e}"}), 500
    finally:
        _cleanup(tmp_path)


# --------------------------------------------------------------------------
# Set password (encrypt)
# --------------------------------------------------------------------------

@app.route("/api/set-password", methods=["POST"])
def api_set_password():
    if "file" not in request.files:
        return jsonify({"error": "No PDF file provided (expected form field 'file')."}), 400

    file = request.files["file"]
    user_password = request.form.get("user_password", "")
    owner_password = request.form.get("owner_password", "").strip()
    allow_printing = request.form.get("allow_printing", "true") == "true"
    allow_copying = request.form.get("allow_copying", "true") == "true"
    allow_modify = request.form.get("allow_modify", "false") == "true"

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": f"'{file.filename}' is not a PDF."}), 400
    if not user_password:
        return jsonify({"error": "Enter a password to protect the PDF with."}), 400

    if not owner_password:
        owner_password = user_password

    tmp_path = None
    try:
        tmp_path = _save_upload(file)
        try:
            reader = PdfReader(tmp_path)
        except Exception:
            return jsonify({"error": "Could not read the PDF. Is it valid?"}), 400

        if reader.is_encrypted:
            return jsonify({"error": "This PDF already has a password. Remove it first."}), 400

        permissions = UAP(0)
        if allow_printing:
            permissions |= UAP.PRINT | UAP.PRINT_TO_REPRESENTATION
        if allow_copying:
            permissions |= UAP.EXTRACT | UAP.EXTRACT_TEXT_AND_GRAPHICS
        if allow_modify:
            permissions |= UAP.MODIFY | UAP.ADD_OR_MODIFY | UAP.ASSEMBLE_DOC

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.encrypt(
            user_password=user_password,
            owner_password=owner_password,
            permissions_flag=permissions,
        )

        out_id = uuid.uuid4().hex
        out_path = os.path.join(PROCESSED_DIR, f"{out_id}.pdf")
        with open(out_path, "wb") as fh:
            writer.write(fh)

        return jsonify({
            "id": out_id,
            "download_url": f"api/download/{out_id}",
            "filename": "protected.pdf",
            "page_count": len(writer.pages),
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to set password: {e}"}), 500
    finally:
        _cleanup(tmp_path)


# --------------------------------------------------------------------------
# Brute-force password recovery
#
# For PDFs you own where you've forgotten the password. Runs as background
# worker PROCESSES (not just threads) spread across every CPU core for real
# speed, with live progress polling. Always bounded by BF_MAX_SECONDS and
# BF_MAX_ATTEMPTS so it can't hang the server — see the module docstring for
# why "try every 8-character password" can't be promised for anything but a
# small character set within that bound.
# --------------------------------------------------------------------------

def _bf_index_to_password(idx: int, charset: str, length: int) -> str:
    """Convert a 0-indexed integer into the idx-th password of `length`
    characters drawn from `charset`, in lexicographic order."""
    base = len(charset)
    chars = [""] * length
    for pos in range(length - 1, -1, -1):
        idx, r = divmod(idx, base)
        chars[pos] = charset[r]
    return "".join(chars)


def _bf_charset_from_params(params) -> str:
    charset = ""
    for key, chars in CHARSETS.items():
        if params.get(key):
            charset += chars
    return charset


def _bf_charset_total(charset_len: int, min_len: int, max_len: int) -> int:
    return sum(charset_len ** L for L in range(min_len, max_len + 1))


def _bf_worker_process(raw_bytes, charset, length, start_idx, end_idx,
                        counter, found_event, found_data, stop_event, batch=20):
    """Runs in its own process. Tests passwords for indices [start_idx, end_idx)
    at the given length, using the given charset. Reports progress in batches
    to keep shared-memory locking cheap."""
    local = 0
    try:
        for idx in range(start_idx, end_idx):
            if found_event.is_set() or stop_event.is_set():
                break
            candidate = _bf_index_to_password(idx, charset, length)
            local += 1
            if _try_password(raw_bytes, candidate):
                found_data["password"] = candidate
                found_event.set()
                with counter.get_lock():
                    counter.value += local
                return
            if local >= batch:
                with counter.get_lock():
                    counter.value += local
                local = 0
    finally:
        if local:
            with counter.get_lock():
                counter.value += local


def _bf_run_charset_sweep(job_id, raw_bytes, charset, min_len, max_len,
                           deadline, cancel_event):
    """Splits each length's keyspace across BF_WORKERS processes, aggregates
    progress into the job dict, and stops cleanly at found/cancelled/deadline."""
    job = BRUTEFORCE_JOBS[job_id]
    started = time.time()
    total_attempts_so_far = 0

    manager = mp.Manager()
    stop_event = manager.Event()
    found_event = manager.Event()
    found_data = manager.dict()
    counter = mp.Value("q", 0)

    try:
        for length in range(min_len, max_len + 1):
            keyspace = len(charset) ** length
            n_workers = min(BF_WORKERS, max(1, keyspace))
            chunk = max(1, keyspace // n_workers)

            slices = []
            pos = 0
            for w in range(n_workers):
                s = pos
                e = keyspace if w == n_workers - 1 else min(keyspace, pos + chunk)
                slices.append((s, e))
                pos = e

            counter.value = 0
            procs = [
                mp.Process(target=_bf_worker_process,
                           args=(raw_bytes, charset, length, s, e,
                                 counter, found_event, found_data, stop_event))
                for (s, e) in slices
            ]
            for p in procs:
                p.start()

            while any(p.is_alive() for p in procs):
                time.sleep(0.2)

                if cancel_event.is_set():
                    stop_event.set()
                    for p in procs:
                        p.join(timeout=2)
                    with BRUTEFORCE_LOCK:
                        job["status"] = "cancelled"
                        job["attempts"] = total_attempts_so_far + counter.value
                        job["elapsed"] = round(time.time() - started, 1)
                    return

                if found_event.is_set():
                    for p in procs:
                        p.join(timeout=2)
                    candidate = found_data.get("password", "")
                    out_id = _write_unlocked_copy(raw_bytes, candidate)
                    with BRUTEFORCE_LOCK:
                        job["status"] = "found"
                        job["found_password"] = candidate
                        job["attempts"] = total_attempts_so_far + counter.value
                        job["elapsed"] = round(time.time() - started, 1)
                        job["download_url"] = f"api/download/{out_id}"
                        job["filename"] = "unlocked.pdf"
                    return

                now = time.time()
                if now >= deadline or total_attempts_so_far + counter.value >= BF_MAX_ATTEMPTS:
                    stop_event.set()
                    for p in procs:
                        p.join(timeout=2)
                    reason = (f"Reached the {BF_MAX_SECONDS // 60}-minute time cap."
                              if now >= deadline else
                              f"Reached the {BF_MAX_ATTEMPTS:,}-attempt safety cap.")
                    with BRUTEFORCE_LOCK:
                        job["status"] = "not_found"
                        job["stop_reason"] = reason
                        job["attempts"] = total_attempts_so_far + counter.value
                        job["elapsed"] = round(time.time() - started, 1)
                    return

                with BRUTEFORCE_LOCK:
                    job["attempts"] = total_attempts_so_far + counter.value
                    job["elapsed"] = round(time.time() - started, 1)

            total_attempts_so_far += counter.value

        with BRUTEFORCE_LOCK:
            job["status"] = "not_found"
            job["stop_reason"] = "Exhausted the full keyspace for this configuration."
            job["attempts"] = total_attempts_so_far
            job["elapsed"] = round(time.time() - started, 1)

    except Exception as e:
        traceback.print_exc()
        with BRUTEFORCE_LOCK:
            job["status"] = "error"
            job["error"] = str(e)
    finally:
        manager.shutdown()


def _bf_run_list_mode(job_id, raw_bytes, candidates, cancel_event):
    """Fast in-process path for small lists (common passwords / custom list)
    where spinning up worker processes isn't worth the overhead."""
    job = BRUTEFORCE_JOBS[job_id]
    started = time.time()
    attempts = 0

    try:
        for candidate in candidates:
            if cancel_event.is_set():
                with BRUTEFORCE_LOCK:
                    job["status"] = "cancelled"
                    job["attempts"] = attempts
                    job["elapsed"] = round(time.time() - started, 1)
                return

            attempts += 1
            found = _try_password(raw_bytes, candidate)

            if attempts % 10 == 0 or found:
                with BRUTEFORCE_LOCK:
                    job["attempts"] = attempts
                    job["elapsed"] = round(time.time() - started, 1)

            if found:
                out_id = _write_unlocked_copy(raw_bytes, candidate)
                with BRUTEFORCE_LOCK:
                    job["status"] = "found"
                    job["found_password"] = candidate
                    job["attempts"] = attempts
                    job["elapsed"] = round(time.time() - started, 1)
                    job["download_url"] = f"api/download/{out_id}"
                    job["filename"] = "unlocked.pdf"
                return

        with BRUTEFORCE_LOCK:
            job["status"] = "not_found"
            job["stop_reason"] = "Exhausted all candidates in this list."
            job["attempts"] = attempts
            job["elapsed"] = round(time.time() - started, 1)

    except Exception as e:
        traceback.print_exc()
        with BRUTEFORCE_LOCK:
            job["status"] = "error"
            job["error"] = str(e)


def _bf_dispatch(job_id, raw_bytes, mode, params):
    job = BRUTEFORCE_JOBS[job_id]
    cancel_event = job["cancel_event"]

    if mode == "common":
        _bf_run_list_mode(job_id, raw_bytes, COMMON_PASSWORDS, cancel_event)
    elif mode == "custom":
        _bf_run_list_mode(job_id, raw_bytes, params["candidates"][:BF_MAX_CUSTOM_LIST], cancel_event)
    elif mode == "charset":
        deadline = time.time() + BF_MAX_SECONDS
        _bf_run_charset_sweep(job_id, raw_bytes, params["charset"],
                               params["min_len"], params["max_len"],
                               deadline, cancel_event)


def _bf_measure_rate(raw_bytes) -> float:
    """Quick single-core benchmark: how many attempts/sec can this machine
    do against THIS file's encryption? Used to give an honest time estimate."""
    t0 = time.time()
    for i in range(BF_BENCH_SAMPLE):
        _try_password(raw_bytes, f"__bf_bench_probe_{i}__")
    elapsed = max(1e-6, time.time() - t0)
    return BF_BENCH_SAMPLE / elapsed


def _bf_prune_stale_jobs():
    now = time.time()
    stale = [jid for jid, j in BRUTEFORCE_JOBS.items()
             if now - j.get("created_at", now) > BF_JOB_TTL_SECONDS]
    for jid in stale:
        BRUTEFORCE_JOBS.pop(jid, None)


@app.route("/api/bruteforce/start", methods=["POST"])
def api_bruteforce_start():
    if os.environ.get("ENABLE_PASSWORD_RECOVERY") != "true":
        return jsonify({"error": "Password recovery is disabled on this server."}), 403
    if "file" not in request.files:
        return jsonify({"error": "No PDF file provided (expected form field 'file')."}), 400

    file = request.files["file"]
    mode = request.form.get("mode", "common")

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": f"'{file.filename}' is not a PDF."}), 400
    if mode not in ("common", "custom", "charset"):
        return jsonify({"error": "Invalid mode."}), 400

    raw_bytes = file.read()

    try:
        reader = PdfReader(io.BytesIO(raw_bytes))
    except Exception:
        return jsonify({"error": "Could not read the PDF. Is it valid?"}), 400

    if not reader.is_encrypted:
        return jsonify({"error": "This PDF isn't password-protected — nothing to recover."}), 400

    params = {}
    total_estimate = 0

    if mode == "custom":
        raw_list = request.form.get("candidates", "")
        candidates = [c for c in re.split(r"[\n,]+", raw_list) if c.strip()]
        if not candidates:
            return jsonify({"error": "Provide at least one candidate password."}), 400
        if len(candidates) > BF_MAX_CUSTOM_LIST:
            return jsonify({"error": f"Limit custom lists to {BF_MAX_CUSTOM_LIST} candidates."}), 400
        params["candidates"] = candidates
        total_estimate = len(candidates)

    elif mode == "common":
        total_estimate = len(COMMON_PASSWORDS)

    elif mode == "charset":
        charset = _bf_charset_from_params(request.form)
        if not charset:
            return jsonify({"error": "Pick at least one character set (digits, lowercase, uppercase, symbols)."}), 400
        try:
            min_len = int(request.form.get("min_len", 1))
            max_len = int(request.form.get("max_len", 4))
        except ValueError:
            return jsonify({"error": "Min/max length must be numbers."}), 400
        if max_len > BF_MAX_CHARSET_LEN:
            return jsonify({"error": f"Length is capped at {BF_MAX_CHARSET_LEN} characters to keep this bounded."}), 400
        if min_len < 1 or min_len > max_len:
            return jsonify({"error": "Min length must be between 1 and max length."}), 400

        params["charset"] = charset
        params["min_len"] = min_len
        params["max_len"] = max_len
        total_estimate = _bf_charset_total(len(charset), min_len, max_len)

    # Honest time estimate, based on measuring this machine's actual rate
    # against this file, scaled by the number of worker processes we'll use.
    rate_per_core = _bf_measure_rate(raw_bytes)
    est_rate = rate_per_core * (BF_WORKERS if mode == "charset" else 1)
    est_seconds_full_sweep = total_estimate / est_rate if est_rate > 0 else None
    coverage_in_cap = (min(1.0, (BF_MAX_SECONDS * est_rate) / total_estimate)
                        if total_estimate > 0 else 1.0)

    job_id = uuid.uuid4().hex
    with BRUTEFORCE_LOCK:
        _bf_prune_stale_jobs()
        BRUTEFORCE_JOBS[job_id] = {
            "status": "running",
            "mode": mode,
            "attempts": 0,
            "total_estimate": total_estimate,
            "elapsed": 0,
            "created_at": time.time(),
            "cancel_event": threading.Event(),
            "found_password": None,
            "download_url": None,
            "filename": None,
            "error": None,
            "stop_reason": None,
        }

    thread = threading.Thread(target=_bf_dispatch, args=(job_id, raw_bytes, mode, params), daemon=True)
    thread.start()

    return jsonify({
        "job_id": job_id,
        "total_estimate": total_estimate,
        "workers": BF_WORKERS if mode == "charset" else 1,
        "measured_rate_per_sec": round(est_rate),
        "estimated_seconds_full_sweep": est_seconds_full_sweep,
        "coverage_within_time_cap": round(coverage_in_cap, 4),
        "time_cap_seconds": BF_MAX_SECONDS,
    })


@app.route("/api/bruteforce/status/<job_id>")
def api_bruteforce_status(job_id):
    job = BRUTEFORCE_JOBS.get(job_id)
    if not job:
        return jsonify({"error": "Unknown job."}), 404

    return jsonify({
        "status": job["status"],
        "mode": job["mode"],
        "attempts": job["attempts"],
        "total_estimate": job["total_estimate"],
        "elapsed": job["elapsed"],
        "found_password": job["found_password"],
        "download_url": job["download_url"],
        "filename": job["filename"],
        "error": job["error"],
        "stop_reason": job["stop_reason"],
    })


@app.route("/api/bruteforce/cancel/<job_id>", methods=["POST"])
def api_bruteforce_cancel(job_id):
    job = BRUTEFORCE_JOBS.get(job_id)
    if not job:
        return jsonify({"error": "Unknown job."}), 404
    job["cancel_event"].set()
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# Watermark
# --------------------------------------------------------------------------

@app.route("/api/watermark", methods=["POST"])
def api_watermark():
    if "file" not in request.files:
        return jsonify({"error": "No PDF file provided (expected form field 'file')."}), 400

    file = request.files["file"]
    text = request.form.get("text", "CONFIDENTIAL").strip() or "CONFIDENTIAL"

    try:
        opacity = float(request.form.get("opacity", 0.25))
    except ValueError:
        opacity = 0.25
    opacity = max(0.02, min(1.0, opacity))

    try:
        angle = float(request.form.get("angle", 45))
    except ValueError:
        angle = 45

    try:
        font_size = float(request.form.get("font_size", 40))
    except ValueError:
        font_size = 40
    font_size = max(6, min(200, font_size))

    color_hex = request.form.get("color", "808080").lstrip("#")
    if not re.match(r"^[0-9a-fA-F]{6}$", color_hex):
        color_hex = "808080"

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": f"'{file.filename}' is not a PDF."}), 400

    tmp_path = None
    try:
        tmp_path = _save_upload(file)
        try:
            reader = PdfReader(tmp_path)
        except Exception:
            return jsonify({"error": "Could not read the PDF. Is it valid?"}), 400

        if reader.is_encrypted:
            return jsonify({"error": "This PDF is password-protected. Unlock it first."}), 400

        writer = PdfWriter()
        watermark_cache = {}

        for page in reader.pages:
            w = float(page.mediabox.width)
            h = float(page.mediabox.height)
            key = (w, h)
            if key not in watermark_cache:
                watermark_cache[key] = _make_watermark_page(
                    w, h, text, opacity, angle, font_size, color_hex
                )
            page.merge_page(watermark_cache[key])
            writer.add_page(page)

        out_id = uuid.uuid4().hex
        out_path = os.path.join(PROCESSED_DIR, f"{out_id}.pdf")
        with open(out_path, "wb") as fh:
            writer.write(fh)

        return jsonify({
            "id": out_id,
            "download_url": f"api/download/{out_id}",
            "filename": "watermarked.pdf",
            "page_count": len(writer.pages),
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to watermark PDF: {e}"}), 500
    finally:
        _cleanup(tmp_path)


# --------------------------------------------------------------------------
# Download
# --------------------------------------------------------------------------

@app.route("/api/download/<file_id>")
def api_download(file_id):
    safe_id = _safe_id(file_id)

    pdf_path = os.path.join(PROCESSED_DIR, f"{safe_id}.pdf")
    zip_path = os.path.join(PROCESSED_DIR, f"{safe_id}.zip")

    if os.path.isfile(pdf_path):
        return send_file(pdf_path, as_attachment=True, download_name="result.pdf", mimetype="application/pdf")
    if os.path.isfile(zip_path):
        return send_file(zip_path, as_attachment=True, download_name="split_pages.zip", mimetype="application/zip")

    return jsonify({"error": "File not found."}), 404


if __name__ == "__main__":
    print(f"Static dir   : {STATIC_DIR}")
    print(f"Processed dir: {PROCESSED_DIR}")
    print("Server starting on http://127.0.0.1:5000")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
        use_reloader=False,
        threaded=True,
    )
