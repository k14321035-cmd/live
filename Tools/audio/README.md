# Audio Cleaner

A small local web app that removes background noise (hiss, hum, room tone)
from an audio file using spectral-gating noise reduction, then normalizes
the volume.

## Setup

```bash
cd audio-cleaner
pip install -r requirements.txt
python server.py
```

Then open **http://localhost:5000** in your browser.

## Usage

1. Drag an audio file (WAV, MP3, M4A, FLAC, OGG — up to 50MB) onto the page,
   or click to browse.
2. Adjust the **Clean Strength** slider (higher = more aggressive noise removal).
3. Click **Clean this audio**.
4. Compare the before/after players and download the cleaned WAV file.

## How it works

- The server decodes the uploaded audio with `librosa`.
- `noisereduce` applies spectral-gating noise reduction (it estimates the
  noise profile from the signal itself, non-stationary mode).
- The cleaned signal is peak-normalized to -1 dBFS.
- The result is saved as a 16-bit PCM WAV in `processed/` and served back
  to the browser for playback and download.

## Files

- `server.py` — Flask backend, exposes `POST /api/clean` and `GET /api/download/<id>`
- `static/index.html` — single-page frontend (upload, waveform preview, player, download)
- `requirements.txt` — Python dependencies

## Notes

- This runs Flask's built-in dev server — fine for local/personal use, not
  meant to be exposed to the internet as-is.
- Everything runs locally; no audio is sent anywhere outside your machine.
