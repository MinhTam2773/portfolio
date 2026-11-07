# Builds public/ocean/moon.webp: the original painted half moon (art/ocean/sky/moon.png) with a faint
# earthshine dark side filled in from the full moon's crater texture (art/ocean/sky/moon-full.png).
# usage (from the repo root): python scripts/sky/moon_darkside.py <dir for a preview jpg>
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
half = Image.open('art/ocean/sky/moon.png').convert('RGBA')
full = Image.open('art/ocean/sky/moon-full.png').convert('RGBA')
N = half.size[0]
cx, cy, r = 408.5, 515.5, 300.5
# Crater texture from the full moon, scaled onto the half moon's disc.
fx0, fy0, fx1, fy1 = 204, 200, 815, 823
tex = full.crop((fx0, fy0, fx1, fy1)).resize((round(2 * r), round(2 * r)), Image.LANCZOS)
lum = np.asarray(tex.convert('L'), dtype=np.float32) / 255.0
lum = (lum - lum.mean()) / (lum.std() + 1e-6)  # contrast only: maria vs highlands
# Dim cool earthshine: slightly brighter toward the lit edge, darker on the far limb.
h, w = lum.shape
yy, xx = np.mgrid[0:h, 0:w]
dx = (xx - r) / r
glow = np.clip(0.5 + 0.5 * dx, 0, 1)  # 0 far limb (left) .. 1 terminator
base = np.array([62, 72, 100], np.float32)
col = base[None, None, :] * (0.82 + 0.28 * glow[..., None]) + lum[..., None] * np.array([15, 17, 22], np.float32)
col = np.clip(col, 0, 255).astype(np.uint8)
# Antialiased disc mask (4x supersampled), with a soft limb.
S = 4
m = Image.new('L', (w * S, h * S), 0)
ImageDraw.Draw(m).ellipse((0, 0, w * S - 1, h * S - 1), fill=255)
m = m.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
dark = Image.fromarray(col, 'RGB').convert('RGBA')
dark.putalpha(m)
out = Image.new('RGBA', (N, N), (0, 0, 0, 0))
out.alpha_composite(dark, (round(cx - r), round(cy - r)))
out.alpha_composite(half)  # the original bright half, untouched, on top
out.save('art/ocean/sky/moon-earthshine.png')
x0, y0 = round(cx - r) - 8, round(cy - r) - 8
crop = out.crop((x0, y0, x0 + round(2 * r) + 16, y0 + round(2 * r) + 16)).resize((560, 560), Image.LANCZOS)
crop.save('public/ocean/moon.webp', quality=88, method=6)
bg = Image.new('RGBA', crop.size, (108, 140, 184, 255)); bg.alpha_composite(crop)
bg.convert('RGB').save(sys.argv[1] + '/moon-earthshine-prev.jpg')
print('ok', crop.size)
