"""
Audio Cleaner — local Flask server
Cleans background noise from uploaded audio using spectral-gating noise
reduction (noisereduce), normalizes loudness, and exports the result as MP3.

Requires ffmpeg to be installed and on your PATH (used by pydub for MP3
encoding). On Windows: download from https://ffmpeg.org/download.html and
add the bin folder to PATH. On macOS: `brew install ffmpeg`. On Debian/Ubuntu:
`sudo apt install ffmpeg`.

Run:
    pip install -r requirements.txt
    python server.py
Then open http://localhost:5000 in a browser.
"""
import io
import os
import uuid
import traceback
import tempfile

import numpy as np
import soundfile as sf
import librosa
import noisereduce as nr
from pydub import AudioSegment
from flask import Flask, request, jsonify, send_file, send_from_directory

APP_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = APP_DIR
PROCESSED_DIR = os.path.join(APP_DIR, "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

MAX_UPLOAD_MB = 50
TARGET_SR = 44100
MP3_BITRATE = "192k"

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024


def normalize_peak(y: np.ndarray, target_db: float = -1.0) -> np.ndarray:
    """Scale audio so its peak sits at target_db dBFS (leaves headroom)."""
    peak = np.max(np.abs(y))
    if peak == 0:
        return y
    target_amp = 10 ** (target_db / 20)
    return y * (target_amp / peak)


def clean_audio(y: np.ndarray, sr: int, strength: float) -> np.ndarray:
    """
    Reduce background noise with spectral gating, then normalize.
    strength: 0.0 (barely touch it) .. 1.0 (aggressive cleaning)
    """
    prop_decrease = 0.2 + 0.8 * strength  # map 0..1 -> 0.2..1.0

    if y.ndim > 1:
        # process each channel independently
        cleaned_channels = [
            nr.reduce_noise(y=y[ch], sr=sr, prop_decrease=prop_decrease, stationary=False)
            for ch in range(y.shape[0])
        ]
        cleaned = np.stack(cleaned_channels, axis=0)
    else:
        cleaned = nr.reduce_noise(y=y, sr=sr, prop_decrease=prop_decrease, stationary=False)

    cleaned = normalize_peak(cleaned, target_db=-1.0)
    return cleaned


def wav_to_mp3(wav_path: str, mp3_path: str, bitrate: str = MP3_BITRATE) -> None:
    """Convert a WAV file on disk to an MP3 file on disk (via ffmpeg/pydub)."""
    audio = AudioSegment.from_wav(wav_path)
    audio.export(mp3_path, format="mp3", bitrate=bitrate)


@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/api/clean", methods=["POST"])
def api_clean():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided (expected form field 'audio')."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    try:
        strength = float(request.form.get("strength", 0.6))
    except ValueError:
        strength = 0.6
    strength = max(0.0, min(1.0, strength))

    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".wav"

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    tmp_path = tmp_file.name
    tmp_file.close()

    tmp_wav_path = None
    try:
        file.save(tmp_path)
        y, sr = librosa.load(tmp_path, sr=TARGET_SR, mono=False)

        cleaned = clean_audio(y, sr, strength)

        # soundfile wants shape (frames, channels) for multi-channel
        if cleaned.ndim > 1:
            out = cleaned.T
        else:
            out = cleaned

        out_id = uuid.uuid4().hex

        # Write an intermediate WAV (needed for encoding), then convert to MP3.
        tmp_wav_path = os.path.join(PROCESSED_DIR, f"{out_id}_tmp.wav")
        sf.write(tmp_wav_path, out, sr, subtype="PCM_16")

        out_path = os.path.join(PROCESSED_DIR, f"{out_id}.mp3")
        wav_to_mp3(tmp_wav_path, out_path)

        duration_sec = round(len(out) / sr, 2) if cleaned.ndim == 1 else round(out.shape[0] / sr, 2)

        return jsonify({
            "id": out_id,
            "download_url": f"api/download/{out_id}",
            "sample_rate": sr,
            "duration_sec": duration_sec,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to process audio: {e}"}), 500
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        if tmp_wav_path and os.path.exists(tmp_wav_path):
            try:
                os.remove(tmp_wav_path)
            except Exception:
                pass


@app.route("/api/download/<file_id>")
def api_download(file_id):
    safe_id = "".join(c for c in file_id if c.isalnum())
    path = os.path.join(PROCESSED_DIR, f"{safe_id}.mp3")
    if not os.path.isfile(path):
        return jsonify({"error": "File not found."}), 404
    return send_file(path, as_attachment=True, download_name="cleaned_audio.mp3", mimetype="audio/mpeg")


if __name__ == "__main__":
    print(f"Static dir : {STATIC_DIR}")
    print(f"Processed dir: {PROCESSED_DIR}")
    print("Server starting on http://127.0.0.1:5000")
    # debug=False + use_reloader=False avoids the Windows fork-crash that
    # causes ERR_CONNECTION_RESET when the reloader child process is killed
    # by heavy imports (librosa / noisereduce).
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
        use_reloader=False,
        threaded=True,
    )
