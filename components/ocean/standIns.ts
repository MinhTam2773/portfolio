import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CreatureModel } from "./creatureMaterial";

// Simple creatures built from code, to settle the look and layout before real models are
// made for them. Like every model they face +X with +Y up. Each part takes its colour from
// one cell of a tiny palette texture.

function palette(colors: string[]) {
  const data = new Uint8Array(colors.length * 4);
  colors.forEach((hex, i) => {
    const value = parseInt(hex.slice(1), 16);
    data.set([value >> 16, (value >> 8) & 255, value & 255, 255], i * 4);
  });
  const map = new THREE.DataTexture(data, colors.length, 1, THREE.RGBAFormat);
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.needsUpdate = true;
  return map;
}

function paint(part: THREE.BufferGeometry, cell: number, cells: number) {
  const uv = part.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (cell + 0.5) / cells, 0.5);
  return part;
}

/** Bell at the front (+X), tentacles trailing behind it to -X. */
export function jellyModel(): CreatureModel {
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 0.55;
    profile.push(new THREE.Vector2(Math.sin(a) * 0.55 + 0.001, Math.cos(a) * 0.5));
  }
  const parts = [paint(new THREE.LatheGeometry(profile, 18), 0, 2)];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = 0.36;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.02, z),
      new THREE.Vector3(x * 0.8, -0.45, z * 0.8),
      new THREE.Vector3(x * 1.05, -0.9, z * 1.05),
      new THREE.Vector3(x * 0.7, -1.35 - (i % 2) * 0.2, z * 0.7),
    ]);
    parts.push(paint(new THREE.TubeGeometry(curve, 10, 0.02, 4), 1, 2));
  }
  const geometry = mergeGeometries(parts.map((part) => part.toNonIndexed()));
  geometry.rotateZ(-Math.PI / 2);
  return { geometry, map: palette(["#eaf0ff", "#f7f9ff"]) };
}

/** Shell in the middle, front flippers spanning Z, head at +X. */
export function turtleModel(): CreatureModel {
  const blob = (sx: number, sy: number, sz: number, x: number, y: number, z: number, cell: number, yaw = 0) => {
    const part = new THREE.SphereGeometry(1, 20, 14).scale(sx, sy, sz);
    if (yaw) part.rotateY(yaw);
    return paint(part.translate(x, y, z), cell, 5);
  };
  const parts = [
    blob(0.95, 0.34, 0.72, -0.1, 0.03, 0, 0), // shell
    blob(0.9, 0.2, 0.66, -0.1, -0.1, 0, 1), // belly
    blob(0.28, 0.2, 0.21, 1.0, 0.05, 0, 2), // head
    blob(0.4, 0.05, 0.6, 0.38, -0.03, 0.95, 3, 0.5),
    blob(0.4, 0.05, 0.6, 0.38, -0.03, -0.95, 3, -0.5),
    blob(0.24, 0.04, 0.3, -0.88, -0.03, 0.58, 4, 0.6),
    blob(0.24, 0.04, 0.3, -0.88, -0.03, -0.58, 4, -0.6),
  ];
  return { geometry: mergeGeometries(parts), map: palette(["#86ad86", "#ece0bd", "#b3c9a0", "#9fb894", "#97b08f"]) };
}
