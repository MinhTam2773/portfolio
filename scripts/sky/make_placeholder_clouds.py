# Draws simple single clouds with code, as stand-ins while the page layout is worked out.
# Each is a pile of soft spheres lit from the upper right: peach tops, lavender undersides.
# Real painted clouds can later replace public/ocean/clouds/cloud-N.webp one for one.
# usage (from the repo root): python scripts/sky/make_placeholder_clouds.py
import os

import numpy as np
from PIL import Image, ImageFilter

W, H = 900, 600
OUT = "public/ocean/clouds"
LIGHT = np.array([0.45, -0.72, 0.53])  # x right, y down, z toward the viewer

# Colour ramp from shadow to sunlit (sRGB).
RAMP_AT = [0.0, 0.35, 0.65, 1.0]
RAMP = np.array([(143, 131, 184), (205, 160, 190), (250, 196, 165), (255, 236, 214)], float)

# (seed, puffs, how far the pile spreads sideways, height of the pile)
SHAPES = [(3, 16, 0.40, 0.46), (11, 22, 0.44, 0.34), (23, 12, 0.32, 0.56), (37, 18, 0.42, 0.30), (41, 14, 0.36, 0.50), (59, 24, 0.45, 0.40)]


def noise(rng, size=6):
    """Smooth random field in -1..1, a few octaves of upscaled noise."""
    total = np.zeros((H, W))
    for octave in range(4):
        n = size * 2**octave
        grid = rng.random((n, int(n * W / H)))
        layer = Image.fromarray((grid * 255).astype("uint8")).resize((W, H), Image.BICUBIC)
        total += (np.asarray(layer, float) / 127.5 - 1) / 2**octave
    return total / 1.9


def blur(field, sigma):
    """Gaussian blur of a float image (Pillow only blurs 8-bit ones)."""
    x = np.arange(-3 * sigma, 3 * sigma + 1)
    kernel = np.exp(-0.5 * (x / sigma) ** 2)
    kernel /= kernel.sum()
    field = np.apply_along_axis(np.convolve, 0, field, kernel, mode="same")
    return np.apply_along_axis(np.convolve, 1, field, kernel, mode="same")


def cloud(seed, puffs, spread, height):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    wobble = noise(rng)
    xx_w, yy_w = xx + wobble * 14, yy + wobble * 14
    base = H * 0.76
    surface = np.zeros((H, W))
    for _ in range(puffs):
        side = rng.normal(0, 0.55)
        side = float(np.clip(side, -1, 1))
        cx = W * (0.5 + side * spread)
        # Puffs pile up in the middle and flatten toward the ends.
        lift = (1 - abs(side) ** 1.6) * rng.random()
        r = H * (0.09 + 0.13 * (1 - abs(side)) * rng.uniform(0.6, 1.2))
        cy = base - lift * H * height - r * 0.2
        d2 = (xx_w - cx) ** 2 + (yy_w - cy) ** 2
        surface = np.maximum(surface, np.sqrt(np.clip(r * r - d2, 0, None)))

    # Light it: the surface height gives a normal at every pixel.
    smooth = blur(surface, 5)
    gy, gx = np.gradient(smooth)
    n = np.dstack((-gx, -gy, np.ones_like(gx)))
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    lit = np.clip((n @ LIGHT) * 0.5 + 0.5, 0, 1)
    # Undersides fall into shadow, whatever the puffs do.
    fall = np.clip((base - yy) / (H * 0.42), 0, 1)
    shade = np.clip(lit * 0.72 + fall * 0.34 - 0.08 + wobble * 0.05, 0, 1)
    rgb = np.dstack([np.interp(shade, RAMP_AT, RAMP[:, c]) for c in range(3)])

    alpha = np.clip(surface / 6, 0, 1)
    alpha *= np.clip((H * 0.81 - yy_w) / (H * 0.09), 0, 1) ** 1.3  # the flat base dissolves
    alpha = np.asarray(Image.fromarray((alpha * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2.2)), "uint8")
    return Image.fromarray(np.dstack((rgb.round().astype("uint8"), alpha)), "RGBA")


os.makedirs(OUT, exist_ok=True)
for i, shape in enumerate(SHAPES, 1):
    path = f"{OUT}/cloud-{i}.webp"
    cloud(*shape).save(path, quality=80, method=6)
    print(path, os.path.getsize(path) // 1024, "KB")
