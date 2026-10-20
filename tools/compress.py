"""Crop the generator watermark band and export compact WebP art for the skin plugin."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "raw"
OUT = ROOT / "assets"

# raw file -> output name
MAPPING = {
    "Elegant_editorial_anime_illust_2026-10-20T05-43-14.png": "jk",
    "Abstract_oriental_tech_editori_2026-10-20T05-43-21.png": "tech",
    "Stylized_ocean_waves__ukiyo_e__2026-10-20T05-43-37.png": "wave",
    "Minimal_lunar_landscape_illust_2026-10-20T05-43-38.png": "moon",
}

TARGET_WIDTH = 1440
WATERMARK_BAND = 0.072  # share of the height cut from the bottom

OUT.mkdir(parents=True, exist_ok=True)
for raw_name, slug in MAPPING.items():
    src = RAW / raw_name
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        cut = int(h * WATERMARK_BAND)
        im = im.crop((0, 0, w, h - cut))
        w, h = im.size
        height = round(h * TARGET_WIDTH / w)
        im = im.resize((TARGET_WIDTH, height), Image.LANCZOS)
        dest = OUT / f"{slug}.webp"
        im.save(dest, "WEBP", quality=62, method=6)
        print(f"{slug}: {im.size} -> {dest.stat().st_size / 1024:.0f} KB")
