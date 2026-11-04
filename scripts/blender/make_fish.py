"""Builds the low-poly school fish and exports public/ocean/fish.glb.

Run headless from the repo root:
    blender -b --factory-startup --python scripts/blender/make_fish.py

The fish faces +X (nose at x=+0.5, tail tip at x=-0.8) with +Y up. It has no material:
the web shader colours it and bends the tail, using the x position as "how far back".
"""

import math
import os

import bmesh
import bpy

OUT = os.path.join(os.getcwd(), "public", "ocean", "fish.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)

mesh = bpy.data.meshes.new("fish")
bm = bmesh.new()

# Body: elliptical rings lofted along X. Taller than it is wide, like a sardine.
SECTIONS = 12
SEGMENTS = 10
rings = []
for i in range(SECTIONS):
    t = i / (SECTIONS - 1)  # 0 = tail root, 1 = nose
    x = -0.5 + t
    # Thick at the front third, pinched toward the tail, rounded at the nose.
    profile = math.sin(math.pi * min(1.0, t * 1.05)) ** 0.6
    if t > 0.78:
        profile *= math.cos((t - 0.78) / 0.22 * math.pi / 2) ** 0.5
    height = 0.16 * profile + 0.012
    width = 0.065 * profile + 0.006
    ring = []
    for s in range(SEGMENTS):
        a = 2 * math.pi * s / SEGMENTS
        ring.append(bm.verts.new((x, math.cos(a) * height, math.sin(a) * width)))
    rings.append(ring)

for i in range(SECTIONS - 1):
    for s in range(SEGMENTS):
        n = (s + 1) % SEGMENTS
        bm.faces.new((rings[i][s], rings[i][n], rings[i + 1][n], rings[i + 1][s]))

# Close both ends with a fan.
tail_cap = bm.verts.new((-0.5, 0.0, 0.0))
nose_cap = bm.verts.new((0.52, 0.0, 0.0))
for s in range(SEGMENTS):
    n = (s + 1) % SEGMENTS
    bm.faces.new((tail_cap, rings[0][n], rings[0][s]))
    bm.faces.new((nose_cap, rings[-1][s], rings[-1][n]))


def fin(points):
    verts = [bm.verts.new(p) for p in points]
    bm.faces.new(verts)


# Forked tail fin (flat, in the XY plane; rendered double-sided).
fin([(-0.46, 0.0, 0.0), (-0.8, 0.2, 0.0), (-0.68, 0.0, 0.0)])
fin([(-0.46, 0.0, 0.0), (-0.68, 0.0, 0.0), (-0.8, -0.2, 0.0)])
# Dorsal fin.
fin([(0.05, 0.15, 0.0), (-0.12, 0.27, 0.0), (-0.2, 0.12, 0.0)])
# Small pectoral fins, angled out.
fin([(0.22, -0.06, 0.05), (0.06, -0.14, 0.14), (0.1, -0.05, 0.06)])
fin([(0.22, -0.06, -0.05), (0.1, -0.05, -0.06), (0.06, -0.14, -0.14)])

bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if len(f.verts) == 4])
bm.to_mesh(mesh)
bm.free()

for poly in mesh.polygons:
    poly.use_smooth = True

obj = bpy.data.objects.new("fish", mesh)
bpy.context.scene.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Triangulate so the web gets a plain triangle list.
mod = obj.modifiers.new("tri", "TRIANGULATE")
bpy.ops.object.modifier_apply(modifier=mod.name)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_materials="NONE",
    export_texcoords=False,
    export_normals=True,
)

print(f"fish triangles: {len(obj.data.polygons)}  ->  {OUT}")
