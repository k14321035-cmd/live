"""
favicon_generator.py

Core image-generation logic. Import generate_favicon() to use it
programmatically, or run this file directly to produce files on disk.
"""

from PIL import Image, ImageDraw, ImageFont
import os


def hex_to_rgb(hex_color):
    """Convert '#1976D2' or '1976D2' to an (r, g, b) tuple."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))


def generate_favicon_image(
    text="CT",
    color_dark=(13, 71, 161),
    color_main=(25, 118, 210),
    color_accent=(66, 165, 245),
    size=512,
    radius_ratio=0.215,
):
    """Build and return a single PIL Image (RGBA) — no disk I/O."""
    radius = int(size * radius_ratio)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Rounded-square mask
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=radius, fill=255)

    # Vertical gradient background
    gradient = Image.new("RGB", (1, size), color=0)
    for y in range(size):
        t = y / size
        r = int(color_dark[0] + (color_main[0] - color_dark[0]) * t)
        g = int(color_dark[1] + (color_main[1] - color_dark[1]) * t)
        b = int(color_dark[2] + (color_main[2] - color_dark[2]) * t)
        gradient.putpixel((0, y), (r, g, b))
    gradient = gradient.resize((size, size))

    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg.paste(gradient, (0, 0))
    bg.putalpha(mask)
    img = Image.alpha_composite(img, bg)

    # Diagonal glossy highlight
    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    hd.polygon([(0, 0), (size, 0), (0, size)], fill=(255, 255, 255, 25))
    highlight.putalpha(
        Image.composite(highlight.split()[3], Image.new("L", (size, size), 0), mask)
    )
    img = Image.alpha_composite(img, highlight)

    draw = ImageDraw.Draw(img)

    # Font
    font_candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    font_path = next((p for p in font_candidates if os.path.exists(p)), None)
    font_size = int(size * 0.43)
    font = ImageFont.truetype(font_path, font_size) if font_path else ImageFont.load_default()

    # Center text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) / 2 - bbox[0]
    ty = (size - th) / 2 - bbox[1]

    shadow_offset = max(2, size // 128)
    draw.text((tx + shadow_offset, ty + shadow_offset + 2), text, font=font, fill=(0, 0, 0, 60))

    if len(text) > 1:
        first_bbox = draw.textbbox((0, 0), text[0], font=font)
        first_w = first_bbox[2] - first_bbox[0]
        draw.text((tx, ty), text[0], font=font, fill=(255, 255, 255, 255))
        draw.text((tx + first_w, ty), text[1:], font=font, fill=color_accent + (255,))
    else:
        draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    return img


def generate_favicon(
    text="CT",
    color_dark=(13, 71, 161),
    color_main=(25, 118, 210),
    color_accent=(66, 165, 245),
    size=512,
    output_prefix="favicon",
    output_dir=".",
    export_sizes=(16, 32, 48, 64, 128, 256),
):
    """Build the icon and save it (+ common sizes) to output_dir."""
    img = generate_favicon_image(text, color_dark, color_main, color_accent, size)

    os.makedirs(output_dir, exist_ok=True)
    img.save(os.path.join(output_dir, f"{output_prefix}_{size}.png"))

    for s in export_sizes:
        img.resize((s, s), Image.LANCZOS).save(
            os.path.join(output_dir, f"{output_prefix}_{s}.png")
        )

    img.resize((256, 256), Image.LANCZOS).save(
        os.path.join(output_dir, f"{output_prefix}.png")
    )
    print(f"Saved '{output_prefix}' icons ({size}px + {export_sizes}) to {output_dir}")


if __name__ == "__main__":
    # Quick CLI usage / defaults — edit these and re-run any time
    generate_favicon(text="CT", output_dir="./output")