import * as THREE from "three";
import { createCreatureMaterial, SWIM_WRAP, type CreatureKind, type CreatureLook, type CreatureModel } from "./creatureMaterial";

// Big, slow creatures (manta rays, whales). Each one glides along its own looping path at a
// steady speed, eases its heading round the turns and banks gently into them.

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
  private readonly phase: number[];
  private readonly heading: THREE.Vector3[]; // smoothed travel direction
  private readonly bank: number[]; // smoothed roll into turns
  private readonly swim: THREE.InstancedBufferAttribute;
  private readonly arc: THREE.InstancedBufferAttribute;
  private started = false;
  private readonly a = new THREE.Vector3();
  private readonly fwd = new THREE.Vector3();
  private readonly tan = new THREE.Vector3();
  private readonly turned = new THREE.Vector3();
  private readonly side = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly tilt = new THREE.Vector3();
  private readonly worldUp = new THREE.Vector3(0, 1, 0);
  private readonly matrix = new THREE.Matrix4();

  constructor(model: CreatureModel, opts: GliderOptions) {
    this.opts = opts;
    const n = opts.paths.length;
    this.curves = opts.paths.map((points) => {
      const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
      // Steady speed: move by arc length, with table samples on the control points (see Stream).
      curve.arcLengthDivisions = points.length * 40;
      return curve;
    });
    this.progress = opts.paths.map((_, i) => i / n + Math.random() * 0.1);
    this.phase = opts.paths.map(() => Math.random() * SWIM_WRAP);
    this.heading = opts.paths.map(() => new THREE.Vector3());
    this.bank = opts.paths.map(() => 0);
    this.material = createCreatureMaterial(opts.kind, model.map, opts.look);

    const geo = model.geometry.clone();
    this.swim = new THREE.InstancedBufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage);
    this.arc = new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 2).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aSwim", this.swim);
    geo.setAttribute("aBend", this.arc);
    this.mesh = new THREE.InstancedMesh(geo, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  update(dt: number) {
    const { scale: s, speed, roll = 0, look } = this.opts;
    const turn = this.started ? 1 - Math.exp(-dt * 3) : 1;
    const settle = 1 - Math.exp(-dt * 2);
    this.curves.forEach((curve, i) => {
      this.progress[i] = (this.progress[i] + speed * dt) % 1;
      const u = this.progress[i];
      curve.getPointAt(u, this.a);
      curve.getTangentAt(u, this.tan);
      this.a.x *= this.widthScale;
      this.tan.x *= this.widthScale;
      this.tan.normalize();

      // Ease the heading toward the path's direction; how much it turned this frame gives the
      // sideways turn rate (to bank into) and the curvature (to arc the spine along).
      const heading = this.heading[i];
      this.turned.copy(heading);
      heading.lerp(this.tan, turn).normalize();
      this.turned.subVectors(heading, this.turned);
      this.side.crossVectors(heading, this.worldUp).normalize();
      this.up.crossVectors(this.side, heading);
      if (this.started) {
        const lean = THREE.MathUtils.clamp((this.turned.dot(this.side) / dt) * 1.2, -0.35, 0.35);
        this.bank[i] += (lean - this.bank[i]) * settle;
      }

      // Tilt around the travel direction: the fixed roll (so flat creatures show their back to
      // the viewer) plus the bank.
      const r = roll + this.bank[i];
      const c = Math.cos(r);
      const sn = Math.sin(r);
      this.tilt.copy(this.up).multiplyScalar(c).addScaledVector(this.side, sn);
      this.side.multiplyScalar(c).addScaledVector(this.up, -sn);
      const cruise = speed * curve.getLength() * dt;
      this.arc.setXY(
        i,
        this.started ? THREE.MathUtils.clamp((this.turned.dot(this.side) / cruise) * s, -0.3, 0.3) : 0,
        this.started ? THREE.MathUtils.clamp((this.turned.dot(this.tilt) / cruise) * s, -0.3, 0.3) : 0,
      );

      this.phase[i] = (this.phase[i] + dt * look.bendSpeed) % SWIM_WRAP;
      this.swim.setX(i, this.phase[i]);

      this.matrix.makeBasis(this.fwd.copy(heading).multiplyScalar(s), this.tilt.multiplyScalar(s), this.side.multiplyScalar(s));
      this.matrix.setPosition(this.a);
      this.mesh.setMatrixAt(i, this.matrix);
    });
    this.started = true;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.swim.needsUpdate = true;
    this.arc.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
