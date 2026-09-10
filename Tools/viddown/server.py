from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import glob

app = Flask(__name__)
CORS(app)

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def format_duration(seconds):
    if not seconds:
        return None
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


@app.route('/info')
def info():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Missing url parameter'}), 400
    try:
        with yt_dlp.YoutubeDL({'quiet': True, 'skip_download': True}) as ydl:
            data = ydl.extract_info(url, download=False)
        return jsonify({
            'title': data.get('title'),
            'duration': format_duration(data.get('duration')),
            'thumbnail': data.get('thumbnail'),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download')
def download():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Missing url parameter'}), 400

    is_audio = request.args.get('audio', 'false').lower() == 'true'
    quality = request.args.get('quality', '192')   # mp3 bitrate, e.g. "192" / "128"
    height = request.args.get('height', '720')      # video max height, e.g. "1080"

    outtmpl = os.path.join(DOWNLOAD_DIR, '%(title).100s.%(ext)s')

    try:
        if is_audio:
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': outtmpl,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': quality,
                }],
                'quiet': True,
                'noplaylist': True,
            }
        else:
            ydl_opts = {
                'format': f'bestvideo[height<={height}]+bestaudio/best[height<={height}]',
                'outtmpl': outtmpl,
                'merge_output_format': 'mp4',
                'quiet': True,
                'noplaylist': True,
            }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info_dict)

        base, _ = os.path.splitext(filename)
        final_path = base + ('.mp3' if is_audio else '.mp4')

        # yt-dlp sometimes reports a slightly different pre-postprocessing name;
        # fall back to the newest file in the downloads folder if needed.
        if not os.path.exists(final_path):
            candidates = sorted(glob.glob(os.path.join(DOWNLOAD_DIR, '*')), key=os.path.getmtime)
            final_path = candidates[-1] if candidates else filename

        return send_file(final_path, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)