"""Single entry point for the public Code Tutorium utility tools.

Run locally with ``waitress-serve --listen=127.0.0.1:8000 server:app``.
For production, run ``gunicorn --bind 0.0.0.0:$PORT server:app`` from this
directory. Individual tool servers must not be started separately.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from flask import Flask, jsonify, render_template_string
from werkzeug.middleware.dispatcher import DispatcherMiddleware

BASE_DIR = Path(__file__).resolve().parent

TOOL_SOURCES = {
    "pdf": BASE_DIR / "pdf" / "server.py",
    "audio": BASE_DIR / "audio" / "server.py",
    "cv": BASE_DIR / "cv" / "cv.py",
    "image": BASE_DIR / "imagegen" / "server.py",
    "video-frames": BASE_DIR / "splitvid" / "server.py",
}

TOOL_DETAILS = {
    "pdf": ("PDF tools", "Merge, split, watermark, and protect PDF files."),
    "audio": ("Audio cleaner", "Reduce background noise and download a cleaned MP3."),
    "cv": ("CV builder", "Create a downloadable CV document."),
    "image": ("Favicon generator", "Generate a PNG favicon from text and colours."),
    "video-frames": ("Video frame extractor", "Extract frames from an uploaded video as a ZIP file."),
}


def load_tool_app(name: str, source: Path):
    """Load an existing Flask tool without starting its development server."""
    module_name = f"codetutorium_tool_{name.replace('-', '_')}"
    spec = importlib.util.spec_from_file_location(module_name, source)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {source}")

    # Some legacy tools import a helper beside their server.py.
    sys.path.insert(0, str(source.parent))
    try:
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
    finally:
        sys.path.pop(0)

    return module.app


loaded_tools: dict[str, object] = {}
tool_errors: dict[str, str] = {}
for tool_name, source_path in TOOL_SOURCES.items():
    try:
        loaded_tools[tool_name] = load_tool_app(tool_name, source_path)
    except Exception as exc:  # Keep the landing page available when a dependency is missing.
        tool_errors[tool_name] = str(exc)


root_app = Flask(__name__)


@root_app.route("/")
def index():
    cards = []
    for slug, (title, description) in TOOL_DETAILS.items():
        cards.append({
            "slug": slug,
            "title": title,
            "description": description,
            "available": slug in loaded_tools,
            "error": tool_errors.get(slug),
        })
    return render_template_string("""
    <!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Code Tutorium Tools</title>
    <style>body{margin:0;background:#07111f;color:#e5edf8;font-family:system-ui,sans-serif}.wrap{max-width:960px;margin:0 auto;padding:64px 24px}h1{font-size:clamp(2rem,6vw,3.6rem);margin:0}.lead{max-width:680px;color:#9eb0c9;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:32px}.card{background:#0e1c30;border:1px solid #213653;border-radius:16px;padding:22px}.card h2{margin-top:0}.card p{color:#b8c7da;min-height:52px}.button{display:inline-block;background:#2563eb;color:white;padding:10px 14px;border-radius:8px;text-decoration:none}.off{color:#fbbf24;font-size:.9rem}</style>
    </head><body><main class="wrap"><h1>Utility Tools</h1><p class="lead">File-processing tools run on this server. Uploaded files should be handled only after you add authentication, rate limiting, and automatic deletion for public production use.</p><section class="grid">{% for card in cards %}<article class="card"><h2>{{ card.title }}</h2><p>{{ card.description }}</p>{% if card.available %}<a class="button" href="/tools/{{ card.slug }}/">Open tool</a>{% else %}<p class="off">Unavailable: dependency or configuration missing.</p>{% endif %}</article>{% endfor %}</section></main></body></html>
    """, cards=cards)


@root_app.route("/health")
def health():
    return jsonify({"status": "ok", "tools": sorted(loaded_tools), "unavailable": tool_errors})


# Each legacy Flask app is isolated under its own path. Its relative API URLs
# resolve inside the same mount, so route names cannot collide.
app = DispatcherMiddleware(
    root_app,
    {f"/tools/{name}": tool_app for name, tool_app in loaded_tools.items()},
)


if __name__ == "__main__":
    from waitress import serve

    serve(app, host="127.0.0.1", port=8000)
