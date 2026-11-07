import * as THREE from "three";
import { createCreatureMaterial, type CreatureKind, type CreatureLook, type CreatureModel } from "./creatureMaterial";

// Big, slow creatures (manta rays, whales). Each one glides along its own looping path.

export type GliderOptions = {
  kind: CreatureKind;
  scale: number;
  /** One closed loop per creature. */
  paths: THREE.Vector3[][];
  /** Loops per second. */
  speed: number;
  /** Tilt around the travel direction, in radians. */
  roll?: number;
  look: CreatureLook;
};

export class Gliders {
  readonly mesh: THREE.InstancedMesh;
  widthScale = 1;
  private readonly opts: GliderOptions;
  private readonly material: THREE.ShaderMaterial;
  private readonly curves: THREE.CatmullRomCurve3[];
  private readonly progress: number[];
  private readonly a = new THREE.Vector3();
  private readonly b = new THREE.Vector3();
  private readonly tan = new THREE.Vector3();
  private readonly side = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly worldUp = new THREE.Vector3(0, 1, 0);
  private readonly matrix = new THREE.Matrix4();

  constructor(model: CreatureModel, opts: GliderOptions) {
    this.opts = opts;
    const n = opts.paths.length;
    this.curves = opts.paths.map((points) => new THREE.CatmullRomCurve3(points, true, "centripetal"));
    this.progress = opts.paths.map((_, i) => i / n + Math.random() * 0.1);
    this.material = createCreatureMaterial(opts.kind, model.map, opts.look);

    const geo = model.geometry.clone();
    const phase = new Float32Array(n).map(() => Math.random() * Math.PI * 2);
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
    this.mesh = new THREE.InstancedMesh(geo, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  update(dt: number, time: number) {
    const s = this.opts.scale;
    this.curves.forEach((curve, i) => {
      this.progress[i] = (this.progress[i] + this.opts.speed * dt) % 1;
      const u = this.progress[i];
      curve.getPoint(u, this.a);
      curve.getPoint((u + 0.002) % 1, this.b);
      this.a.x *= this.widthScale;
      this.b.x *= this.widthScale;
      this.tan.subVectors(this.b, this.a).normalize();
      this.side.crossVectors(this.tan, this.worldUp).normalize();
      this.up.crossVectors(this.side, this.tan);
      const roll = this.opts.roll ?? 0;
      if (roll) {
        // Tilt around the travel direction so flat creatures show their back to the viewer.
        const c = Math.cos(roll), s2 = Math.sin(roll);
        const ux = this.up.x, uy = this.up.y, uz = this.up.z;
        this.up.set(ux * c + this.side.x * s2, uy * c + this.side.y * s2, uz * c + this.side.z * s2);
        this.side.set(this.side.x * c - ux * s2, this.side.y * c - uy * s2, this.side.z * c - uz * s2);
      }
      this.matrix.makeBasis(this.tan.multiplyScalar(s), this.up.multiplyScalar(s), this.side.multiplyScalar(s));
      this.matrix.setPosition(this.a);
      this.mesh.setMatrixAt(i, this.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    this.material.uniforms.uTime.value = time;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
