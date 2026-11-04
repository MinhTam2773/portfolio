"""Builds the stand-in manta ray and whale and exports them to public/ocean/.

Run headless from the repo root:
    "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup --python scripts/blender/make_creatures.py

Both face +X with +Y up and have no material; the web shader colours and animates them
(manta wing tips flap along Z, whale flukes beat along Y). These are placeholders until
the Higgsfield models replace them.
"""

import math
import os

import bmesh
import bpy

OUT_DIR = os.path.join(os.getcwd(), "public", "ocean")


def export(obj, name):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new("tri", "TRIANGULATE")
    bpy.ops.object.modifier_apply(modifier=mod.name)
    path = os.path.join(OUT_DIR, f"{name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="NONE",
        export_texcoords=False,
        export_normals=True,
    )
    print(f"{name} triangles: {len(obj.data.polygons)}  ->  {path}")


def new_object(name, bm):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def manta():
    """A flattened sphere pulled out into swept-back wings, plus a thin tail."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=14, radius=1.0)
    for v in bm.verts:
        sx, sy, sz = v.co.x, v.co.z, v.co.y  # sphere's own axes; we want span along Z
        x = sx * 0.55
        half_span = 1.0 if x < 0.1 else 1.0 - (x - 0.1) * 1.3
        span = abs(sz)
        z = sz * half_span
        x -= 0.4 * span * span  # sweep the wing tips back
        thick = 0.13 * (1.0 - 0.88 * span ** 1.5)
        y = sy * thick + 0.04 * (1.0 - span)  # slight dome on top
        v.co = (x, y, z)

    # Tail: a thin tapering spike.
    root = [bm.verts.new((-0.45, 0.015 * math.cos(a), 0.015 * math.sin(a))) for a in (0, 2.1, 4.2)]
    tip = bm.verts.new((-1.5, 0.0, 0.0))
    for k in range(3):
        bm.faces.new((root[k], root[(k + 1) % 3], tip))
    return new_object("manta", bm)


def whale():
    """Lofted body with a broad head, long pectoral fins and horizontal flukes."""
    bm = bmesh.new()
    sections, segments = 16, 14
    rings = []
    for i in range(sections):
        t = i / (sections - 1)  # 0 = tail stock, 1 = snout
        x = -1.3 + 2.3 * t
        r = math.sin(math.pi * min(1.0, 0.08 + t * 0.95)) ** 0.7
        height = 0.36 * r + 0.02
        width = 0.3 * r + 0.02
        ring = []
        for s in range(segments):
            a = 2 * math.pi * s / segments
            y = math.cos(a) * height
            if y < 0:
                y *= 1.15  # fuller belly
            ring.append(bm.verts.new((x, y, math.sin(a) * width)))
        rings.append(ring)
    for i in range(sections - 1):
        for s in range(segments):
            n = (s + 1) % segments
            bm.faces.new((rings[i][s], rings[i][n], rings[i + 1][n], rings[i + 1][s]))
    tail_cap = bm.verts.new((-1.32, 0.0, 0.0))
    nose_cap = bm.verts.new((1.02, -0.02, 0.0))
    for s in range(segments):
        n = (s + 1) % segments
        bm.faces.new((tail_cap, rings[0][n], rings[0][s]))
        bm.faces.new((nose_cap, rings[-1][s], rings[-1][n]))

    def flat(points):
        bm.faces.new([bm.verts.new(p) for p in points])

    # Flukes, spread along Z.
    flat([(-1.25, 0.0, 0.0), (-1.75, 0.02, 0.6), (-1.55, 0.0, 0.05)])
    flat([(-1.25, 0.0, 0.0), (-1.55, 0.0, -0.05), (-1.75, 0.02, -0.6)])
    # Long pectoral fins, angled down and back.
    flat([(0.45, -0.18, 0.26), (-0.35, -0.5, 0.95), (0.25, -0.2, 0.3)])
    flat([(0.45, -0.18, -0.26), (0.25, -0.2, -0.3), (-0.35, -0.5, -0.95)])
    # Small dorsal fin.
    flat([(-0.55, 0.28, 0.0), (-0.8, 0.42, 0.0), (-0.85, 0.24, 0.0)])
    return new_object("whale", bm)


bpy.ops.wm.read_factory_settings(use_empty=True)
os.makedirs(OUT_DIR, exist_ok=True)
export(manta(), "manta")
export(whale(), "whale")
