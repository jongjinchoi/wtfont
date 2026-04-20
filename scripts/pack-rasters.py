#!/usr/bin/env python3
"""Convert rendered PNGs to RGBA and pack favicon.ico with RGBA frames.

Next.js turbopack requires all PNG entries (including those embedded
in favicon.ico) to be in RGBA mode. Chrome headless outputs RGB when
a screenshot has no transparency, so we post-process here.
"""
import sys
import struct
from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "assets/logo"
WEB_APP = ROOT / "web/app"
TMP = Path("/tmp")

PNG_TARGETS = [
    "apple-icon.png",
    "icon.png",
    "opengraph-image.png",
    "twitter-image.png",
]

FAVICON_SIZES = [16, 32, 48, 64, 128]


def force_rgba(path: Path) -> None:
    im = Image.open(path)
    if im.mode != "RGBA":
        im.convert("RGBA").save(path, format="PNG")


def pack_favicon(frames: list[tuple[int, bytes]]) -> bytes:
    count = len(frames)
    hdr_size = 6 + count * 16
    entries = b""
    body = b""
    off = hdr_size
    for size, png in frames:
        w = 0 if size >= 256 else size
        entries += struct.pack("<BBBBHHII", w, w, 0, 0, 1, 32, len(png), off)
        off += len(png)
        body += png
    return struct.pack("<HHH", 0, 1, count) + entries + body


def main() -> None:
    for name in PNG_TARGETS:
        for d in (LOGO, WEB_APP):
            p = d / name
            if p.exists():
                force_rgba(p)
                print(f"rgba: {p.relative_to(ROOT)}")

    frames = []
    for size in FAVICON_SIZES:
        tmp_path = TMP / f"wtfont-fav-{size}.png"
        im = Image.open(tmp_path).convert("RGBA")
        buf = BytesIO()
        im.save(buf, format="PNG")
        frames.append((size, buf.getvalue()))
        print(f"frame {size}: {len(buf.getvalue())} bytes (RGBA)")

    ico = pack_favicon(frames)
    (LOGO / "favicon.ico").write_bytes(ico)
    (WEB_APP / "favicon.ico").write_bytes(ico)
    print(f"favicon.ico: {len(ico)} bytes ({len(frames)} RGBA frames)")


if __name__ == "__main__":
    main()
