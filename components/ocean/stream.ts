import * as THREE from "three";
import { createCreatureMaterial, type CreatureLook, type CreatureModel } from "./creatureMaterial";

// A school that moves like a river: every fish rides the same smooth looping path, packed
// into a tube that swells and thins along its length. Fish keep their lane, so the
// stream stays coherent instead of jittering. Every so often the path coils into a
// spiral tunnel around the camera's line of sight, then unwinds again.

export type StreamOptions = {
  count: number;
  scale: number;
  /** Control points of the closed loop the stream follows (desktop layout). */
  path: THREE.Vector3[];
  /** How much of the loop the stream fills, 0–1. */
  length: number;
  /** Radius of the tube the fish pack into. */
  thickness: number;
  /** Loops per second. */
  speed: number;
  look: CreatureLook;
  vortex?: { center: THREE.Vector3; radius: number; turns: number; cycle: number; from: number; to: number };
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const EPS = 0.004;

export class Stream {
  readonly mesh: THREE.InstancedMesh;
  /** Horizontal squeeze for narrow screens (1 on desktop). */
  widthScale = 1;
  private readonly opts: StreamOptions;
  private readonly material: THREE.ShaderMaterial;
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly base: THREE.Vector3[];
  private readonly along: Float32Array; // 0 = head of the stream, 1 = tail
  private readonly laneA: Float32Array; // lane angle around the tube
  private readonly laneR: Float32Array; // lane distance from the tube's centre
  private readonly size: Float32Array;
  private readonly push: Float32Array; // cursor displacement, eases back to 0
  private head = Math.random();
  private readonly a = new THREE.Vector3();
  private readonly b = new THREE.Vector3();
  private readonly tan = new THREE.Vector3();
  private readonly nrm = new THREE.Vector3();
  private readonly bin = new THREE.Vector3();
  private readonly pos = new THREE.Vector3();
  private readonly up = new THREE.Vector3(0, 1, 0);
  private readonly helix = new THREE.Vector3();
  private readonly matrix = new THREE.Matrix4();

  constructor(model: CreatureModel, opts: StreamOptions) {
    this.opts = opts;
    const n = opts.count;
    this.base = opts.path.map((p) => p.clone());
    this.curve = new THREE.CatmullRomCurve3(opts.path.map((p) => p.clone()), true, "centripetal");
    this.material = createCreatureMaterial("fish", model.map, opts.look);

    const geo = model.geometry.clone();
    const phase = new Float32Array(n);
    this.along = new Float32Array(n);
    this.laneA = new Float32Array(n);
    this.laneR = new Float32Array(n);
    this.size = new Float32Array(n);
    this.push = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      phase[i] = Math.random() * Math.PI * 2;
      // Denser in the middle of the stream, thinning toward head and tail.
      this.along[i] = (Math.random() + Math.random()) / 2;
      this.laneA[i] = Math.random() * Math.PI * 2;
      this.laneR[i] = Math.sqrt(Math.random());
      this.size[i] = opts.scale * (0.85 + Math.random() * 0.3);
    }
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));

    this.mesh = new THREE.InstancedMesh(geo, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  /** @param pointer where the cursor meets the scene, or null when it's away. */
  update(dt: number, time: number, pointer: THREE.Vector3 | null) {
    const { count: n, length, thickness, speed, vortex } = this.opts;
    this.head = (this.head + speed * dt) % 1;

    // The path breathes slowly so the loop never repeats exactly.
    this.curve.points.forEach((p, k) => {
      const b = this.base[k];
      p.set(
        b.x * this.widthScale,
        b.y + Math.sin(time * 0.11 + k * 1.7) * 1.2,
        b.z + Math.sin(time * 0.09 + k * 2.3) * 1.5,
      );
    });

    const cycleT = vortex ? time % vortex.cycle : 0;
    const swirl = vortex ? smooth(vortex.from, vortex.from + 3, cycleT) * (1 - smooth(vortex.to - 3, vortex.to, cycleT)) : 0;

    for (let i = 0; i < n; i++) {
      const s = this.along[i];
      const u = (((this.head - s * length) % 1) + 1) % 1;

      this.centre(u, s, time, swirl, this.a);
      this.centre((u + EPS) % 1, s - EPS / length, time, swirl, this.b);
      this.tan.subVectors(this.b, this.a).normalize();
      this.nrm.crossVectors(this.tan, this.up);
      if (this.nrm.lengthSq() < 1e-6) this.nrm.set(0, 0, 1);
      this.nrm.normalize();
      this.bin.crossVectors(this.nrm, this.tan);

      // The tube swells and thins along the stream, like the shoals in the reference.
      const width = thickness * (0.55 + 0.45 * Math.sin(s * 9 + time * 0.6));
      const r = this.laneR[i] * width;
      const ang = this.laneA[i];
      this.pos
        .copy(this.a)
        .addScaledVector(this.nrm, Math.cos(ang) * r)
        .addScaledVector(this.bin, Math.sin(ang) * r);

      // Fish part around the cursor and drift back into their lane.
      const i3 = i * 3;
      const ease = Math.exp(-dt * 1.5);
      this.push[i3] *= ease;
      this.push[i3 + 1] *= ease;
      this.push[i3 + 2] *= ease;
      if (pointer) {
        const dx = this.pos.x + this.push[i3] - pointer.x;
        const dy = this.pos.y + this.push[i3 + 1] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9 && d2 > 1e-4) {
          const k = ((9 - d2) / 9) * 6 * dt / Math.sqrt(d2);
          this.push[i3] += dx * k;
          this.push[i3 + 1] += dy * k;
        }
      }
      this.pos.x += this.push[i3];
      this.pos.y += this.push[i3 + 1];
      this.pos.z += this.push[i3 + 2];

      const sz = this.size[i];
      this.matrix.makeBasis(
        this.tan.multiplyScalar(sz),
        this.bin.multiplyScalar(sz),
        this.nrm.multiplyScalar(sz),
      );
      this.matrix.setPosition(this.pos);
      this.mesh.setMatrixAt(i, this.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.material.uniforms.uTime.value = time;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }

  /** Centre line of the stream at loop position u, blended toward the spiral tunnel. */
  private centre(u: number, s: number, time: number, swirl: number, out: THREE.Vector3) {
    this.curve.getPoint(u, out);
    const v = this.opts.vortex;
    if (!v || swirl <= 0) return out;
    // Tunnel: fish spread along a helix around the camera axis by their place in the stream.
    const radius = Math.min(v.radius, 7 * this.widthScale);
    const angle = s * Math.PI * 2 * v.turns - time * 0.9;
    this.helix.set(
      v.center.x + Math.cos(angle) * radius,
      v.center.y + Math.sin(angle) * radius,
      v.center.z + (0.5 - s) * 8,
    );
    return out.lerp(this.helix, swirl);
  }
}
