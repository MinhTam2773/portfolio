"""Prints a model's size per axis and renders top and side views, to check which way it faces.

    blender -b --factory-startup --python scripts/blender/inspect_model.py -- <in.glb> <out-prefix>
"""

import sys

import bpy
from mathutils import Vector

src, prefix = sys.argv[sys.argv.index("--") + 1 :][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
lo = Vector((min(p[i] for p in pts) for i in range(3)))
hi = Vector((max(p[i] for p in pts) for i in range(3)))
print("SIZE x/y/z:", [round(v, 3) for v in hi - lo], "faces:", sum(len(o.data.polygons) for o in meshes))

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.color_type = "TEXTURE"
scene.render.resolution_x = scene.render.resolution_y = 400
scene.render.film_transparent = True
centre, size = (lo + hi) / 2, max(hi - lo)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
scene.collection.objects.link(cam)
cam.data.type = "ORTHO"
cam.data.ortho_scale = size * 1.2
scene.camera = cam
# Top view looks down -Z (X right, Y up); side view looks along +Y (X right, Z up).
for name, offset, rot in [("top", (0, 0, size * 2), (0, 0, 0)), ("side", (0, -size * 2, 0), (1.5708, 0, 0))]:
    cam.location = centre + Vector(offset)
    cam.rotation_euler = rot
    scene.render.filepath = f"{prefix}-{name}.png"
    bpy.ops.render.render(write_still=True)
