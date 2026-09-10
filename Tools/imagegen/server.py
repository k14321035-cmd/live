"""
server.py

Pure API backend — no HTML here. Pair it with client.html.

Install once:
    pip install flask flask-cors pillow

Run:
    python server.py

Then open client.html directly in your browser (double-click it,
or drag it into a browser window). It talks to this server at
http://localhost:5000
"""

from pathlib import Path

from flask import Flask, request, send_file, send_from_directory
from flask_cors import CORS
from io import BytesIO
from favicon_generator import generate_favicon_image, hex_to_rgb

app = Flask(__name__)
CORS(app)  # allows client.html (opened as a local file) to call this API
APP_DIR = Path(__file__).resolve().parent


@app.route("/")
def index():
    return send_from_directory(APP_DIR, "client.html")


def get_params():
    """Read + validate query params, with sensible defaults."""
    text = request.args.get("text", "CT")[:4] or "CT"
    size = int(request.args.get("size", 256))
    size = max(16, min(size, 1024))
    color_dark = request.args.get("color_dark", "0d47a1")
    color_main = request.args.get("color_main", "1976d2")
    color_accent = request.args.get("color_accent", "42a5f5")
    return text, size, color_dark, color_main, color_accent


def build_image_bytes(text, size, color_dark, color_main, color_accent):
    img = generate_favicon_image(
        text=text,
        color_dark=hex_to_rgb(color_dark),
        color_main=hex_to_rgb(color_main),
        color_accent=hex_to_rgb(color_accent),
        size=size,
    )
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


@app.route("/api/image")
def image():
    """Returns the generated PNG for inline <img> preview."""
    text, size, color_dark, color_main, color_accent = get_params()
    buf = build_image_bytes(text, size, color_dark, color_main, color_accent)
    return send_file(buf, mimetype="image/png")


@app.route("/api/download")
def download():
    """Returns the same PNG but forces a file download."""
    text, size, color_dark, color_main, color_accent = get_params()
    buf = build_image_bytes(text, size, color_dark, color_main, color_accent)
    return send_file(
        buf,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"favicon_{text}_{size}.png",
    )


@app.route("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
