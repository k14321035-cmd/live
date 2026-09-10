#!/usr/bin/env python3
"""
server.py
---------
A small local web server that exposes video_to_images.py's frame-splitting
logic over HTTP, for use with index.html.

Usage:
    python server.py
    (then open http://127.0.0.1:5000 in your browser)

Requires: flask, ffmpeg (on PATH)
    pip install flask
"""

import io
import shutil
import subprocess
import sys
import tempfile
import uuid
import zipfile
from pathlib import Path

from flask import Flask, request, send_file, send_from_directory, jsonify

APP_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)

MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1 GB upload cap
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH


def check_ffmpeg():
    if shutil.which("ffmpeg") is None:
        sys.exit(
            "Error: ffmpeg was not found on your PATH.\n"
            "Install it first:\n"
            "  macOS:   brew install ffmpeg\n"
            "  Ubuntu:  sudo apt install ffmpeg\n"
            "  Windows: https://ffmpeg.org/download.html"
        )


def build_ffmpeg_command(input_path: Path, outdir: Path, opts: dict) -> list:
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]

    if opts.get("start"):
        cmd += ["-ss", opts["start"]]
    if opts.get("end"):
        cmd += ["-to", opts["end"]]

    cmd += ["-i", str(input_path)]

    interval = float(opts.get("interval", 2.0))
    filters = [f"fps=1/{interval}"]

    width = opts.get("width")
    if width:
        filters.append(f"scale={int(width)}:-1")
    cmd += ["-vf", ",".join(filters)]

    fmt = opts.get("format", "png")
    quality = int(opts.get("quality", 90))

    if fmt in ("jpg", "jpeg"):
        q = max(2, min(31, round(31 - (quality / 100) * 29)))
        cmd += ["-q:v", str(q)]
    elif fmt == "webp":
        cmd += ["-q:v", str(max(1, min(100, quality)))]

    pattern = outdir / f"frame_%05d.{fmt}"
    cmd.append(str(pattern))
    return cmd


@app.route("/")
def index():
    return send_from_directory(APP_DIR, "index.html")


@app.route("/api/extract", methods=["POST"])
def extract():
    if "video" not in request.files:
        return jsonify({"error": "No video file uploaded."}), 400

    video_file = request.files["video"]
    if video_file.filename == "":
        return jsonify({"error": "No video file selected."}), 400

    opts = {
        "interval": request.form.get("interval", "2"),
        "format": request.form.get("format", "png"),
        "quality": request.form.get("quality", "90"),
        "width": request.form.get("width") or None,
        "start": request.form.get("start") or None,
        "end": request.form.get("end") or None,
    }

    try:
        interval = float(opts["interval"])
        if interval <= 0:
            return jsonify({"error": "Interval must be greater than 0."}), 400
    except ValueError:
        return jsonify({"error": "Invalid interval value."}), 400

    if opts["format"] not in ("png", "jpg", "jpeg", "webp", "bmp"):
        return jsonify({"error": "Unsupported format."}), 400

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        input_path = tmp_path / f"input_{uuid.uuid4().hex}_{video_file.filename}"
        video_file.save(input_path)

        outdir = tmp_path / "frames"
        outdir.mkdir()

        cmd = build_ffmpeg_command(input_path, outdir, opts)

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        except subprocess.TimeoutExpired:
            return jsonify({"error": "Processing timed out (10 min limit)."}), 504

        if result.returncode != 0:
            return jsonify({"error": f"ffmpeg failed: {result.stderr.strip()[:500]}"}), 500

        frames = sorted(outdir.glob(f"frame_*.{opts['format']}"))
        if not frames:
            return jsonify({"error": "No frames were extracted. Check your time range and interval."}), 400

        # Build ZIP in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for frame in frames:
                zf.write(frame, arcname=frame.name)
        zip_buffer.seek(0)

        base_name = Path(video_file.filename).stem
        zip_name = f"{base_name}_frames.zip"

        return send_file(
            zip_buffer,
            mimetype="application/zip",
            as_attachment=True,
            download_name=zip_name,
        )


if __name__ == "__main__":
    check_ffmpeg()
    print("Starting server at http://127.0.0.1:5000")
    print("Press Ctrl+C to stop.")
    app.run(host="127.0.0.1", port=5000, debug=False)