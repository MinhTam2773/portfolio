import * as THREE from "three";
import { createCreatureMaterial, SWIM_WRAP, type CreatureLook, type CreatureModel } from "./creatureMaterial";

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
  /** How much the path breathes, 0–1 (default 1). */
  sway?: number;
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
const wrap = (x: number) => ((x % 1) + 1) % 1;
const smoothstep = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

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
  private readonly forward: Float32Array; // smoothed heading per fish
  private readonly sideways: Float32Array; // each fish's own "right", carried along frame to frame
  private readonly beat: Float32Array; // each fish's own beat rate (about +-15%)
  private readonly phase: Float64Array; // swim phase, advanced by distance travelled
  private readonly pace: Float32Array; // smoothed speed, relative to the stream's cruise speed
  private readonly last: Float32Array; // last frame's position
  private readonly bank: Float32Array; // smoothed roll into turns, radians
  private readonly curl: Float32Array; // smoothed path curvature (sideways, up), 1/world units
  private readonly swim: THREE.InstancedBufferAttribute; // aSwim, phase sent to the shader
  private readonly arc: THREE.InstancedBufferAttribute; // aBend, spine curve sent to the shader
  private started = false;

  // Track state, in loops (1 = once round the path), not world units: the path's length
  // breathes every frame, and a place counted in world units would slide along it.
  private head = 0; // track position of the ribbon's head; only head mod 1 matters on the path
  /** Where the ring starts on the track (always at tunnelAt on the path) and its length, in loops. */
  private ring: { start: number; length: number } | null = null;
  private nextTunnel: number;
  private tunnelAt = 0; // loop position (0–1) of the ring's entry point

  // Ring frame, re-anchored to the (slowly breathing) path every frame.
  private readonly entry = new THREE.Vector3();
  private readonly entryTan = new THREE.Vector3();
  private readonly ringOut = new THREE.Vector3();

  private readonly p = new THREE.Vector3();
  private readonly t = new THREE.Vector3();
  private readonly fwd = new THREE.Vector3();
  private readonly old = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly matrix = new THREE.Matrix4();

  constructor(model: CreatureModel, opts: StreamOptions) {
    this.opts = opts;
    const n = opts.count;
    this.base = opts.path.map((p) => p.clone());
    this.curve = new THREE.CatmullRomCurve3(opts.path.map((p) => p.clone()), true, "centripetal");
    // Arc-length table with samples landing exactly on the control points. The spline's own
    // speed jumps at each control point, so a sample straddling one (as with the default 200)
    // makes every fish hiccup there.
    this.curve.arcLengthDivisions = opts.path.length * 40;
    this.material = createCreatureMaterial("fish", model.map, opts.look);
    this.nextTunnel = opts.tunnel?.first ?? Infinity;
    this.head = Math.random();
    if (opts.tunnel) {
      let best = Infinity;
      for (let k = 0; k < 400; k++) {
        const d = this.curve.getPointAt(k / 400, this.p).distanceToSquared(opts.tunnel.near);
        if (d < best) [best, this.tunnelAt] = [d, k / 400];
      }
      // Start the head where it reaches the entry point just after the first tunnel is due
      // (a little after, so it can't slip past a moment too early and wait a whole loop).
      this.head = wrap(this.tunnelAt - opts.speed * (opts.tunnel.first + 1.5));
    }

    const geo = model.geometry.clone();
    this.along = new Float32Array(n);
    this.laneA = new Float32Array(n);
    this.laneR = new Float32Array(n);
    this.surge = new Float32Array(n);
    this.size = new Float32Array(n);
    this.forward = new Float32Array(n * 3);
    this.sideways = new Float32Array(n * 3);
    this.beat = new Float32Array(n);
    this.phase = new Float64Array(n);
    this.pace = new Float32Array(n).fill(1);
    this.last = new Float32Array(n * 3);
    this.bank = new Float32Array(n);
    this.curl = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      this.phase[i] = Math.random() * Math.PI * 2;
      this.beat[i] = 0.85 + Math.random() * 0.3;
      // Denser in the middle of the ribbon, thinning toward head and tail.
      this.along[i] = (Math.random() + Math.random()) / 2;
      this.laneA[i] = Math.random() * Math.PI * 2;
      this.laneR[i] = Math.sqrt(Math.random());
      this.surge[i] = Math.random() * Math.PI * 2;
      this.size[i] = opts.scale * (0.85 + Math.random() * 0.3);
    }
    this.swim = new THREE.InstancedBufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage);
    this.arc = new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 2).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aSwim", this.swim);
    geo.setAttribute("aBend", this.arc);

    this.mesh = new THREE.InstancedMesh(geo, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  update(dt: number, time: number) {
    const { count: n, length, thickness, speed, tunnel, sway = 1 } = this.opts;

    // The path breathes slowly so the loop never repeats exactly. The sway is a smooth field
    // over space, so neighbouring points move together and never pinch the path into a kink.
    this.curve.points.forEach((p, k) => {
      const b = this.base[k];
      p.set(
        b.x * this.widthScale,
        b.y + Math.sin(time * 0.11 + b.x * 0.17 + b.z * 0.1) * 1.2 * sway,
        b.z + Math.sin(time * 0.09 + b.x * 0.13 - b.y * 0.2) * 1.5 * sway,
      );
    });
    this.curve.updateArcLengths();
    const prevHead = this.head;
    this.head += speed * dt;

    if (tunnel) this.updateTunnel(tunnel, prevHead, time);
    // Keep the numbers small. Positions only depend on the track position mod 1 (and on its
    // distance from the ring's start), so shifting both by a whole loop changes nothing.
    if (this.head >= 2) {
      this.head -= 1;
      if (this.ring) this.ring.start -= 1;
    }

    const turn = this.started ? 1 - Math.exp(-dt * 14) : 1; // heading smoothing
    const level = 1 - Math.exp(-dt * 2); // how fast a fish rights itself after a steep climb
    const settle = 1 - Math.exp(-dt * 4); // smoothing for bank, bend and pace
    const cruise = speed * this.curve.getLength(); // world units per second along the track
    for (let i = 0; i < n; i++) {
      // A small, bounded surge lets fish drift forward and back in the ribbon without
      // ever losing their order.
      const s = this.along[i] + 0.008 * Math.sin(1.6 * time + this.surge[i]);
      const ringness = this.trackAt(this.head - s * length, this.p, this.t);

      const i3 = i * 3;
      this.old.set(this.forward[i3], this.forward[i3 + 1], this.forward[i3 + 2]);
      this.fwd.copy(this.old).lerp(this.t, turn).normalize();
      this.forward[i3] = this.fwd.x;
      this.forward[i3 + 1] = this.fwd.y;
      this.forward[i3 + 2] = this.fwd.z;
      // Sideways direction: last frame's, kept square to the new heading, and eased toward
      // level (fwd x UP) only as much as level is well defined. Building it fresh from world up
      // each frame flips it 180 degrees whenever the path passes straight up or down, which
      // threw the fish (and their lanes) across the tube in one frame.
      this.up.crossVectors(this.fwd, UP);
      const h2 = this.up.lengthSq();
      if (this.started) {
        this.right.set(this.sideways[i3], this.sideways[i3 + 1], this.sideways[i3 + 2]);
        this.right.addScaledVector(this.fwd, -this.right.dot(this.fwd));
        if (h2 > 1e-8) this.right.addScaledVector(this.up.normalize(), level * h2);
      } else {
        if (h2 > 1e-8) this.right.copy(this.up);
        else this.right.set(0, 0, 1);
      }
      this.right.normalize();
      this.sideways[i3] = this.right.x;
      this.sideways[i3 + 1] = this.right.y;
      this.sideways[i3 + 2] = this.right.z;
      this.up.crossVectors(this.right, this.fwd);

      // How the heading turned this frame: curvature (per world unit) toward the fish's side
      // and its back, and the sideways turn rate it banks into.
      if (this.started) {
        this.old.subVectors(this.fwd, this.old);
        const kSide = this.old.dot(this.right) / (cruise * dt);
        const kUp = this.old.dot(this.up) / (cruise * dt);
        this.curl[i * 2] += (kSide - this.curl[i * 2]) * settle;
        this.curl[i * 2 + 1] += (kUp - this.curl[i * 2 + 1]) * settle;
        const lean = THREE.MathUtils.clamp((this.old.dot(this.right) / dt) * 0.45, -0.6, 0.6);
        this.bank[i] += (lean - this.bank[i]) * settle;
      }
      const kSide = this.curl[i * 2];
      const kUp = this.curl[i * 2 + 1];

      // The tube swells and thins along the ribbon, and tightens inside the ring.
      const width = thickness * (0.55 + 0.45 * Math.sin(s * 9 + time * 0.6)) * (1 - 0.35 * ringness);
      const r = this.laneR[i] * width;
      const ang = this.laneA[i];
      this.p.addScaledVector(this.right, Math.cos(ang) * r).addScaledVector(this.up, Math.sin(ang) * r);

      // Swim beat follows actual speed: fish surging ahead beat faster, ones drifting back
      // beat slower.
      if (this.started) {
        const v = Math.hypot(this.p.x - this.last[i3], this.p.y - this.last[i3 + 1], this.p.z - this.last[i3 + 2]) / dt;
        this.pace[i] += (THREE.MathUtils.clamp(v / cruise, 0.6, 2.5) - this.pace[i]) * settle;
      }
      this.last[i3] = this.p.x;
      this.last[i3 + 1] = this.p.y;
      this.last[i3 + 2] = this.p.z;
      this.phase[i] = (this.phase[i] + dt * this.opts.look.bendSpeed * this.beat[i] * this.pace[i]) % SWIM_WRAP;
      this.swim.setX(i, this.phase[i]);

      // Roll into the turn (lanes above stay level; only the fish itself leans).
      const sz = this.size[i];
      const c = Math.cos(this.bank[i]);
      const sn = Math.sin(this.bank[i]);
      this.t.copy(this.up).multiplyScalar(c).addScaledVector(this.right, sn); // banked up
      this.right.multiplyScalar(c).addScaledVector(this.up, -sn); // banked side
      // Spine curve in the fish's own (banked) frame and model units, a little exaggerated.
      this.arc.setXY(
        i,
        THREE.MathUtils.clamp((kSide * c - kUp * sn) * sz * 1.5, -0.5, 0.5),
        THREE.MathUtils.clamp((kUp * c + kSide * sn) * sz * 1.5, -0.5, 0.5),
      );
      this.matrix.makeBasis(
        this.fwd.multiplyScalar(sz),
        this.t.multiplyScalar(sz),
        this.right.multiplyScalar(sz),
      );
      this.matrix.setPosition(this.p);
      this.mesh.setMatrixAt(i, this.matrix);
    }
    this.started = true;

    this.mesh.instanceMatrix.needsUpdate = true;
    this.swim.needsUpdate = true;
    this.arc.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }

  /** Opens a ring when the head next reaches the entry point; removes it once the tail is out. */
  private updateTunnel(tunnel: NonNullable<StreamOptions["tunnel"]>, prevHead: number, time: number) {
    if (!this.ring && time >= this.nextTunnel) {
      const before = wrap(prevHead);
      const now = wrap(this.head);
      const crossed = before <= now ? before < this.tunnelAt && this.tunnelAt <= now : this.tunnelAt > before || this.tunnelAt <= now;
      // The ring's length in loops is fixed when it opens, so its two ends stay pinned to
      // tunnelAt on the path however the path breathes while fish are inside.
      if (crossed) this.ring = { start: this.head - wrap(now - this.tunnelAt), length: (Math.PI * 2 * tunnel.radius) / this.curve.getLength() };
    }
    if (this.ring && this.head - this.opts.length * 1.05 > this.ring.start + this.ring.length) {
      // Everyone is out: drop the ring and pull the track back by its length, so every fish
      // keeps exactly the same place on the path.
      this.head -= this.ring.length;
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
   * Position and direction at track position x (in loops), written to pos and tan.
   * @returns how deep inside the ring this point is (0 on the path, 1 well inside).
   */
  private trackAt(x: number, pos: THREE.Vector3, tan: THREE.Vector3) {
    const tunnel = this.opts.tunnel;
    if (tunnel && this.ring) {
      const R = tunnel.radius;
      const ringLength = Math.PI * 2 * R;
      const k = (x - this.ring.start) / this.ring.length; // 0..1 once round the ring
      if (k >= 0 && k < 1) {
        const into = k * ringLength;
        const a = k * Math.PI * 2;
        pos
          .copy(this.entry)
          .addScaledVector(this.ringOut, R * (1 - Math.cos(a)))
          .addScaledVector(this.entryTan, R * Math.sin(a));
        tan.copy(this.entryTan).multiplyScalar(Math.cos(a)).addScaledVector(this.ringOut, Math.sin(a)).normalize();
        // Eased in and out (not a linear ramp), so lanes start and stop tightening smoothly.
        return smoothstep(into / 3) * smoothstep((ringLength - into) / 3);
      }
      if (k >= 1) x -= this.ring.length;
    }
    const u = wrap(x);
    this.curve.getPointAt(u, pos);
    this.curve.getTangentAt(u, tan);
    return 0;
  }
}
