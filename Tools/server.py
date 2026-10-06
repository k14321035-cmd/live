"""Single entry point for the public Code Tutorium utility tools.

Run locally with ``waitress-serve --listen=127.0.0.1:8000 server:app``.
For production, run ``gunicorn --bind 0.0.0.0:$PORT server:app`` from this
directory. Individual tool servers must not be started separately.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from flask import Flask, jsonify, render_template_string, send_from_directory
from werkzeug.middleware.dispatcher import DispatcherMiddleware

BASE_DIR = Path(__file__).resolve().parent

TOOL_SOURCES = {
    "pdf": BASE_DIR / "pdf" / "server.py",
    "audio": BASE_DIR / "audio" / "server.py",
    "cv": BASE_DIR / "cv" / "cv.py",
    "image": BASE_DIR / "imagegen" / "server.py",
    "video-frames": BASE_DIR / "splitvid" / "server.py",
    "image-editor": BASE_DIR / "imgeEditor" / "app.py",
    "video-downloader": BASE_DIR / "viddown" / "server.py",
}

TOOL_DETAILS = {
    "pdf": ("PDF Studio", "Merge, split, watermark, encrypt, and manipulate PDF documents.", "documents"),
    "audio": ("Audio Cleaner", "Reduce noise, balance audio levels, and generate clean MP3 sound files.", "audio"),
    "cv": ("CV & Resume Builder", "Draft ATS-ready resumes and professional developer curricula with ease.", "resume"),
    "image": ("Favicon & Icon Studio", "Generate modern vector and PNG icons, badges, and favicons from text.", "design"),
    "video-frames": ("Video Frame Splitter", "Slice video sequences into high-definition frame sequences packed in a ZIP archive.", "video"),
    "image-editor": ("Real-Time Image Editor", "Crop, rotate, filter, and adjust brightness and contrast directly in your browser.", "canvas"),
    "video-downloader": ("Media & Video Downloader", "Fetch video streams or extract high-fidelity MP3 audio from online URLs.", "downloader"),
}


def load_tool_app(name: str, source: Path):
    """Load an existing Flask tool without starting its development server."""
    if not source.exists():
        raise FileNotFoundError(f"Tool script not found: {source}")

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


root_app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


@root_app.route("/tools-shared.css")
def shared_css():
    return send_from_directory(BASE_DIR, "tools-shared.css")


LANDING_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Developer & Utility Tools | Code Tutorium</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/tools-shared.css">
  <style>
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin: 36px 0 60px;
    }
    .tool-hub-card {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
      position: relative;
      overflow: hidden;
    }
    .tool-hub-card:hover {
      transform: translateY(-4px);
      border-color: rgba(47, 111, 237, 0.5);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
    }
    .tool-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
      width: fit-content;
    }
    .badge-ready {
      background: rgba(34, 197, 94, 0.12);
      color: var(--success);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }
    .badge-offline {
      background: rgba(245, 158, 11, 0.12);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .tool-hub-title {
      font-size: 1.28rem;
      color: #ffffff;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .tool-hub-desc {
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.55;
      margin-bottom: 24px;
      flex-grow: 1;
    }
  </style>
</head>
<body>
  <!-- Standard Code Tutorium Header -->
  <nav class="top" aria-label="Main Navigation">
    <div class="header-inner">
      <div class="logo">
        <a href="https://codetutorium.com/" aria-label="Code Tutorium Home">Code<span>Tutorium</span></a>
      </div>
      <div class="animated-cursor" aria-hidden="true"></div>
      <div class="nav-links">
        <a href="https://codetutorium.com/">Home</a>
        <a href="https://codetutorium.com/tool.html" class="active">Tools</a>
        <a href="https://codetutorium.com/blog/index">Blog</a>
      </div>
    </div>
  </nav>

  <div class="tools-app-wrapper">
    <header class="tool-hero">
      <span class="tool-hero-tag">Unified Developer Suite</span>
      <h1>Code Tutorium Utility Tools</h1>
      <p>High-performance client and server processing tools built for developers, designers, and creators.</p>
    </header>

    <div class="tools-grid">
      {% for card in cards %}
      <article class="tool-hub-card">
        <div>
          {% if card.available %}
            <span class="tool-badge badge-ready">● Ready to use</span>
          {% else %}
            <span class="tool-badge badge-offline">⚠ Offline</span>
          {% endif %}
          <h2 class="tool-hub-title">{{ card.title }}</h2>
          <p class="tool-hub-desc">{{ card.description }}</p>
        </div>
        <div>
          {% if card.available %}
            <a class="btn btn-primary" style="width: 100%; justify-content: center;" href="/tools/{{ card.slug }}/">Launch Tool &rarr;</a>
          {% else %}
            <p class="status-msg status-warning" style="margin-bottom: 0; font-size: 0.8rem;">Requires optional library or configuration</p>
          {% endif %}
        </div>
      </article>
      {% endfor %}
    </div>
  </div>

  <!-- Standard Code Tutorium Footer -->
  <footer class="ct-footer">
    <div class="ct-footer-inner">
      <div class="ct-footer-col">
        <h3>Trending Courses</h3>
        <ul>
          <li><a href="https://codetutorium.com/courses/python">Python Masterclass</a></li>
          <li><a href="https://codetutorium.com/courses/javascript">Modern JavaScript</a></li>
          <li><a href="https://codetutorium.com/courses/data-structures">Data Structures &amp; Algorithms</a></li>
          <li><a href="https://codetutorium.com/courses/react">Full-Stack React Development</a></li>
          <li><a href="https://codetutorium.com/courses/cloud">Cloud &amp; DevOps Fundamentals</a></li>
        </ul>
      </div>

      <div class="ct-footer-col">
        <h3>Mobile Apps</h3>
        <ul>
          <li><a href="https://codetutorium.com/apps/ios">Code Tutorium for iOS</a></li>
          <li><a href="https://codetutorium.com/apps/android">Code Tutorium for Android</a></li>
          <li><a href="https://codetutorium.com/apps/offline">Offline Learning Mode</a></li>
          <li><a href="https://codetutorium.com/apps/practice">Daily Code Practice App</a></li>
        </ul>
      </div>

      <div class="ct-footer-col">
        <h3>Company</h3>
        <ul>
          <li><a href="https://codetutorium.com/about">About Us</a></li>
          <li><a href="https://codetutorium.com/careers">Careers</a></li>
          <li><a href="https://codetutorium.com/privacy-policy">Privacy Policy</a></li>
          <li><a href="https://codetutorium.com/terms">Terms of Service</a></li>
          <li><a href="https://codetutorium.com/contact">Contact Support</a></li>
        </ul>
      </div>

      <div class="ct-footer-col">
        <h3>Developer Tools</h3>
        <ul>
          <li><a href="/tools/pdf/">PDF Studio</a></li>
          <li><a href="/tools/audio/">Audio Cleaner</a></li>
          <li><a href="/tools/cv/">CV &amp; Resume Builder</a></li>
          <li><a href="/tools/image/">Icon &amp; Favicon Studio</a></li>
          <li><a href="/tools/video-frames/">Video Frame Extractor</a></li>
          <li><a href="/tools/image-editor/">Real-Time Image Editor</a></li>
          <li><a href="/tools/video-downloader/">Media Downloader</a></li>
        </ul>
      </div>

      <div class="ct-footer-col">
        <h3>Connect</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px;">
          Join our global engineering community for weekly coding insights and tutorials.
        </p>
        <div class="ct-social-links">
          <a href="https://twitter.com/codetutorium" aria-label="Twitter">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://github.com/codetutorium" aria-label="GitHub">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          </a>
          <a href="https://linkedin.com/company/codetutorium" aria-label="LinkedIn">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="ct-footer-bottom">
      <p>&copy; 2026 Code Tutorium. All rights reserved. Empowering developers worldwide.</p>
    </div>
  </footer>
</body>
</html>
"""


@root_app.route("/")
def index():
    cards = []
    for slug, (title, description, category) in TOOL_DETAILS.items():
        cards.append({
            "slug": slug,
            "title": title,
            "description": description,
            "category": category,
            "available": slug in loaded_tools,
            "error": tool_errors.get(slug),
        })
    return render_template_string(LANDING_TEMPLATE, cards=cards)


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
