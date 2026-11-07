import * as THREE from "three";
import { createCreatureMaterial, type CreatureLook, type CreatureModel } from "./creatureMaterial";

// A school that moves like a river: every fish rides one shared track, packed into a tube
// that swells and thins along its length. Each fish has a fixed place in the ribbon and a
// fixed lane in the tube, so the school stays one coherent ribbon.
//
// The tunnel is part of that track, not a blend toward it. When it's due, a ring is
// inserted into the track at a fixed point on the path: the ring leaves the path along
// the path's own direction and comes back to the same point along the same direction.
// The leader peels into the ring first and every fish behind follows through the same
// entry point; once the tail is out, the ring is removed and the path carries on. No
// fish ever cuts across, so nothing scatters.

export type StreamOptions = {
  count: number;
  scale: number;
  /** Control points of the closed loop the stream follows. */
  path: THREE.Vector3[];
  /** How much of the loop the ribbon fills, 0–1. */
  length: number;
  /** Radius of the tube the fish pack into. */
  thickness: number;
  /** Loops per second. */
  speed: number;
  look: CreatureLook;
  tunnel?: {
    /** The ribbon peels into the ring at the point on the path closest to this. */
    near: THREE.Vector3;
    radius: number;
    /** How far the ring is tipped back into depth, in radians (0 = hangs straight down). */
    dive: number;
    /** Seconds before the first tunnel, and between the end of one and the next. */
    first: number;
    every: number;
  };
};

const UP = new THREE.Vector3(0, 1, 0);

export class Stream {
  readonly mesh: THREE.InstancedMesh;
  /** Horizontal squeeze for narrow screens (1 when the path was laid out for this screen). */
  widthScale = 1;
  private readonly opts: StreamOptions;
  private readonly material: THREE.ShaderMaterial;
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly base: THREE.Vector3[];
  private readonly along: Float32Array; // 0 = head of the ribbon, 1 = tail
  private readonly laneA: Float32Array; // lane angle around the tube
  private readonly laneR: Float32Array; // lane distance from the tube's centre
  private readonly surge: Float32Array; // phase of each fish's small back-and-forth
  private readonly size: Float32Array;
  private readonly push: Float32Array; // cursor displacement, eases back to 0
  private readonly forward: Float32Array; // smoothed heading per fish
  private started = false;

  // Track state, in world units travelled along the track.
  private head = 0;
  private inserted = 0; // total length of rings already passed through
  private ring: { start: number } | null = null;
  private nextTunnel: number;
  private tunnelAt = 0; // loop position (0–1) of the ring's entry point

  // Ring frame, re-anchored to the (slowly breathing) path every frame.
  private readonly entry = new THREE.Vector3();
  private readonly entryTan = new THREE.Vector3();
  private readonly ringOut = new THREE.Vector3();

  private readonly p = new THREE.Vector3();
  private readonly t = new THREE.Vector3();
  private readonly fwd = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly matrix = new THREE.Matrix4();

  constructor(model: CreatureModel, opts: StreamOptions) {
    this.opts = opts;
    const n = opts.count;
    this.base = opts.path.map((p) => p.clone());
    this.curve = new THREE.CatmullRomCurve3(opts.path.map((p) => p.clone()), true, "centripetal");
    this.material = createCreatureMaterial("fish", model.map, opts.look);
    this.nextTunnel = opts.tunnel?.first ?? Infinity;
    this.head = Math.random() * this.curve.getLength();
    if (opts.tunnel) {
      let best = Infinity;
      for (let k = 0; k < 400; k++) {
        const d = this.curve.getPointAt(k / 400, this.p).distanceToSquared(opts.tunnel.near);
        if (d < best) [best, this.tunnelAt] = [d, k / 400];
      }
      // Start the head where it reaches the entry point just after the first tunnel is due
      // (a little after, so it can't slip past a moment too early and wait a whole loop).
      const u0 = (((this.tunnelAt - opts.speed * (opts.tunnel.first + 1.5)) % 1) + 1) % 1;
      this.head = u0 * this.curve.getLength();
    }

    const geo = model.geometry.clone();
    const phase = new Float32Array(n);
    this.along = new Float32Array(n);
    this.laneA = new Float32Array(n);
    this.laneR = new Float32Array(n);
    this.surge = new Float32Array(n);
    this.size = new Float32Array(n);
    this.push = new Float32Array(n * 3);
    this.forward = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      phase[i] = Math.random() * Math.PI * 2;
      // Denser in the middle of the ribbon, thinning toward head and tail.
      this.along[i] = (Math.random() + Math.random()) / 2;
      this.laneA[i] = Math.random() * Math.PI * 2;
      this.laneR[i] = Math.sqrt(Math.random());
      this.surge[i] = Math.random() * Math.PI * 2;
      this.size[i] = opts.scale * (0.85 + Math.random() * 0.3);
    }
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));

    this.mesh = new THREE.InstancedMesh(geo, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  /** @param pointer where the cursor meets the scene, or null when it's away. */
  update(dt: number, time: number, pointer: THREE.Vector3 | null) {
    const { count: n, length, thickness, speed, tunnel } = this.opts;

    // The path breathes slowly so the loop never repeats exactly.
    this.curve.points.forEach((p, k) => {
      const b = this.base[k];
      p.set(
        b.x * this.widthScale,
        b.y + Math.sin(time * 0.11 + k * 1.7) * 1.2,
        b.z + Math.sin(time * 0.09 + k * 2.3) * 1.5,
      );
    });
    this.curve.updateArcLengths();
    const loop = this.curve.getLength();
    const ribbon = length * loop;
    const prevHead = this.head;
    this.head += speed * loop * dt;

    if (tunnel) this.updateTunnel(tunnel, prevHead, loop, ribbon, time);

    const ease = Math.exp(-dt * 1.5);
    const turn = this.started ? 1 - Math.exp(-dt * 14) : 1; // heading smoothing
    for (let i = 0; i < n; i++) {
      // A small, bounded surge lets fish drift forward and back in the ribbon without
      // ever losing their order.
      const s = this.along[i] + 0.008 * Math.sin(1.6 * time + this.surge[i]);
      const ringness = this.trackAt(this.head - s * ribbon, loop, this.p, this.t);

      const i3 = i * 3;
      this.fwd.set(this.forward[i3], this.forward[i3 + 1], this.forward[i3 + 2]).lerp(this.t, turn).normalize();
      this.forward[i3] = this.fwd.x;
      this.forward[i3 + 1] = this.fwd.y;
      this.forward[i3 + 2] = this.fwd.z;
      this.right.crossVectors(this.fwd, UP);
      if (this.right.lengthSq() < 1e-6) this.right.set(0, 0, 1);
      this.right.normalize();
      this.up.crossVectors(this.right, this.fwd);

      // The tube swells and thins along the ribbon, and tightens inside the ring.
      const width = thickness * (0.55 + 0.45 * Math.sin(s * 9 + time * 0.6)) * (1 - 0.35 * ringness);
      const r = this.laneR[i] * width;
      const ang = this.laneA[i];
      this.p.addScaledVector(this.right, Math.cos(ang) * r).addScaledVector(this.up, Math.sin(ang) * r);

      // Fish part around the cursor and drift back into their lane.
      this.push[i3] *= ease;
      this.push[i3 + 1] *= ease;
      if (pointer) {
        const dx = this.p.x + this.push[i3] - pointer.x;
        const dy = this.p.y + this.push[i3 + 1] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9 && d2 > 1e-4) {
          const k = (((9 - d2) / 9) * 6 * dt) / Math.sqrt(d2);
          this.push[i3] += dx * k;
          this.push[i3 + 1] += dy * k;
        }
      }
      this.p.x += this.push[i3];
      this.p.y += this.push[i3 + 1];

      const sz = this.size[i];
      this.matrix.makeBasis(
        this.fwd.multiplyScalar(sz),
        this.up.multiplyScalar(sz),
        this.right.multiplyScalar(sz),
      );
      this.matrix.setPosition(this.p);
      this.mesh.setMatrixAt(i, this.matrix);
    }
    this.started = true;

    this.mesh.instanceMatrix.needsUpdate = true;
    this.material.uniforms.uTime.value = time;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }

  /** Opens a ring when the head next reaches the entry point; removes it once the tail is out. */
  private updateTunnel(tunnel: NonNullable<StreamOptions["tunnel"]>, prevHead: number, loop: number, ribbon: number, time: number) {
    const ringLength = Math.PI * 2 * tunnel.radius;
    const uOf = (d: number) => ((((d - this.inserted) / loop) % 1) + 1) % 1;

    if (!this.ring && time >= this.nextTunnel) {
      const before = uOf(prevHead);
      const now = uOf(this.head);
      const crossed = before <= now ? before < this.tunnelAt && this.tunnelAt <= now : this.tunnelAt > before || this.tunnelAt <= now;
      if (crossed) this.ring = { start: this.head - (((now - this.tunnelAt) % 1) + 1) % 1 * loop };
    }
    if (this.ring && this.head - ribbon * 1.05 > this.ring.start + ringLength) {
      this.inserted += ringLength;
      this.ring = null;
      this.nextTunnel = time + tunnel.every;
    }
    if (!this.ring) return;

    // Ring frame: it leaves the path along the path's direction, curls down (and back into
    // depth by `dive`), and returns to the same point along the same direction.
    this.curve.getPointAt(this.tunnelAt, this.entry);
    this.curve.getTangentAt(this.tunnelAt, this.entryTan);
    const down = this.ringOut.copy(UP).addScaledVector(this.entryTan, -UP.dot(this.entryTan)).normalize().negate();
    const back = this.p.crossVectors(this.entryTan, down);
    if (back.z > 0) back.negate(); // tip away from the camera
    down.multiplyScalar(Math.cos(tunnel.dive)).addScaledVector(back, Math.sin(tunnel.dive)).normalize();
  }

  /**
   * Position and direction on the track at distance d, written to pos and tan.
   * @returns how deep inside the ring this point is (0 on the path, 1 well inside).
   */
  private trackAt(d: number, loop: number, pos: THREE.Vector3, tan: THREE.Vector3) {
    const tunnel = this.opts.tunnel;
    if (tunnel && this.ring) {
      const ringLength = Math.PI * 2 * tunnel.radius;
      const into = d - this.ring.start;
      if (into >= 0 && into < ringLength) {
        const a = into / tunnel.radius;
        const R = tunnel.radius;
        pos
          .copy(this.entry)
          .addScaledVector(this.ringOut, R * (1 - Math.cos(a)))
          .addScaledVector(this.entryTan, R * Math.sin(a));
        tan.copy(this.entryTan).multiplyScalar(Math.cos(a)).addScaledVector(this.ringOut, Math.sin(a)).normalize();
        return Math.min(1, into / 3, (ringLength - into) / 3);
      }
      if (into >= ringLength) d -= ringLength;
    }
    const u = ((((d - this.inserted) / loop) % 1) + 1) % 1;
    this.curve.getPointAt(u, pos);
    this.curve.getTangentAt(u, tan);
    return 0;
  }
}
