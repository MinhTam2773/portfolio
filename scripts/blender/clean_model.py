"""Turns a raw image-to-3D model into a small web-ready GLB for the sky ocean scene.

    blender -b --factory-startup --python scripts/blender/clean_model.py -- <in.glb> <out.glb> <kind>

kind is one of fish | whale | manta (see SPECS). Steps: join meshes, turn it to face +X
with +Z up (glTF +Y up), fit it to the size the web shader's swim animation expects,
decimate, shrink the texture, export with a JPEG texture.
"""

import math
import sys

import bpy
from mathutils import Matrix, Vector

# turn_z: degrees around up to make the head point +X (from inspect_model.py renders).
# length/span: fitted size. front: x of the nose. tris: decimate target. tex: texture px.
SPECS = {
    "fish": dict(turn_z=0, length=1.3, front=0.5, tris=1500, tex=512),
    "whale": dict(turn_z=90, length=2.75, front=1.0, tris=6000, tex=1024),
    "manta": dict(turn_z=90, span=2.0, front=0.6, tris=5000, tex=1024),
}

src, dst, kind = sys.argv[sys.argv.index("--") + 1 :][:3]
spec = SPECS[kind]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
obj.parent = None
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

mesh = obj.data
mesh.transform(Matrix.Rotation(math.radians(spec["turn_z"]), 4, "Z"))


def bounds():
    xs, ys, zs = zip(*(v.co for v in mesh.vertices))
    return Vector((min(xs), min(ys), min(zs))), Vector((max(xs), max(ys), max(zs)))


lo, hi = bounds()
size = hi - lo
scale = spec["span"] / size.y if "span" in spec else spec["length"] / size.x
mesh.transform(Matrix.Scale(scale, 4))
lo, hi = bounds()
mid = (lo + hi) / 2
mesh.transform(Matrix.Translation(Vector((spec["front"] - hi.x, -mid.y, -mid.z))))

before = len(mesh.polygons)
high = obj

# Low-poly copy with a fresh UV layout. Decimating the original UVs scrambles the texture,
# so the colour is baked from the high-poly model onto the new layout instead.
low = high.copy()
low.data = high.data.copy()
bpy.context.scene.collection.objects.link(low)
bpy.ops.object.select_all(action="DESELECT")
low.select_set(True)
bpy.context.view_layer.objects.active = low
# The generator splits the mesh at every texture seam; weld it back so decimation
# doesn't tear open cracks along those seams.
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
reach = max(hi - lo)  # model size after fitting
bpy.ops.mesh.remove_doubles(threshold=reach * 1e-4)
bpy.ops.object.mode_set(mode="OBJECT")
mod = low.modifiers.new("decimate", "DECIMATE")
mod.ratio = min(1.0, spec["tris"] / before)
bpy.ops.object.modifier_apply(modifier=mod.name)
while low.data.uv_layers:
    low.data.uv_layers.remove(low.data.uv_layers[0])
low.data.uv_layers.new(name="UVMap")
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.01)
bpy.ops.object.mode_set(mode="OBJECT")

baked = bpy.data.images.new(f"{kind}_color", spec["tex"], spec["tex"])
mat = bpy.data.materials.new(f"{kind}_baked")
mat.use_nodes = True
nodes = mat.node_tree.nodes
tex_node = nodes.new("ShaderNodeTexImage")
tex_node.image = baked
nodes.active = tex_node
mat.node_tree.links.new(tex_node.outputs["Color"], nodes["Principled BSDF"].inputs["Base Color"])
low.data.materials.clear()
low.data.materials.append(mat)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 1
scene.render.bake.use_selected_to_active = True
scene.render.bake.cage_extrusion = reach * 0.01
scene.render.bake.max_ray_distance = reach * 0.04
scene.render.bake.margin = 4
high.select_set(True)
low.select_set(True)
bpy.context.view_layer.objects.active = low
bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"})

bpy.data.objects.remove(high)
obj, mesh = low, low.data
bpy.ops.object.select_all(action="DESELECT")
low.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_image_format="JPEG",
    export_jpeg_quality=85,
    export_texcoords=True,
    export_normals=True,
)
lo, hi = bounds()
print(f"CLEANED {kind}: {before} -> {len(mesh.polygons)} faces, size {[round(v, 2) for v in hi - lo]} -> {dst}")
