"""
Background Removal Server
--------------------------
A simple Flask API that accepts an image upload and returns the
same image with its background removed (transparent PNG), using
the `rembg` library (U^2-Net model) under the hood.

Run:
    pip install -r requirements.txt
    python app.py

The server listens on http://localhost:5000
Endpoint:
    POST /remove-bg   (multipart/form-data, field name: "image")
    GET  /health       -> simple health check
"""

import io
import os
import uuid

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image
from rembg import remove, new_session

app = Flask(__name__)
CORS(app)  # allow the client (served from a different origin/port) to call this API

# u2net is ~170MB and MIT-licensed (rembg's newer default, bria-rmbg, is ~1GB
# and requires a paid license for commercial use). Created once at startup so
# the model downloads/loads a single time instead of per-request.
SESSION = new_session("u2net")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp"}
MAX_FILE_SIZE_MB = 15

app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE_MB * 1024 * 1024


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/remove-bg", methods=["POST"])
def remove_bg():
    if "image" not in request.files:
        return jsonify({"error": "No 'image' file part in the request"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {sorted(ALLOWED_EXTENSIONS)}"}), 400

    try:
        input_bytes = file.read()
        input_image = Image.open(io.BytesIO(input_bytes)).convert("RGBA")

        # Core background removal step
        output_image = remove(input_image, session=SESSION)

        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG")
        buffer.seek(0)

        out_name = f"{uuid.uuid4().hex}.png"

        return send_file(
            buffer,
            mimetype="image/png",
            as_attachment=False,
            download_name=out_name,
        )

    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Failed to process image: {exc}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)