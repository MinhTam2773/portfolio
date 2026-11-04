import * as THREE from "three";

// A school of fish that flock together (boids: separation, alignment, cohesion).
// Every so often the school gathers into a slow swirling tunnel around the camera's line
// of sight, then breaks apart again. All fish share one instanced mesh; the tail wiggle
// runs in the vertex shader, so the CPU only moves points around.

const VERT = /* glsl */ `
attribute float aPhase;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vLocalY;
varying float vDepth;

void main() {
  vec3 p = position;
  // The model faces +X; "back" is 0 at the head and 1 at the tail tip.
  float back = clamp((0.45 - p.x) / 1.25, 0.0, 1.0);
  p.z += sin(uTime * 9.0 + aPhase - p.x * 5.0) * 0.12 * back * back;

  vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  vNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  vView = normalize(cameraPosition - world.xyz);
  vLocalY = p.y;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uBack;
uniform vec3 uBelly;
uniform vec3 uSun;
uniform vec3 uRim;
uniform vec3 uFog;
uniform vec3 uSunDir;
uniform float uFogNear;
uniform float uFogFar;
uniform float uAlpha;
varying vec3 vNormal;
varying vec3 vView;
varying float vLocalY;
varying float vDepth;

void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 sunDir = normalize(uSunDir);

  vec3 base = mix(uBelly, uBack, smoothstep(-0.06, 0.1, vLocalY));
  float diff = max(dot(n, sunDir), 0.0);
  float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.5);
  float spec = pow(max(dot(reflect(-sunDir, n), vView), 0.0), 24.0);

  vec3 col = base * (0.45 + 0.55 * diff) + uRim * rim * 0.9 + uSun * spec * 0.8;
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, vDepth) * 0.6);

  gl_FragColor = vec4(col, uAlpha);
  #include <colorspace_fragment>
}
`;

export type SchoolOptions = {
  count: number;
  /** Size of one fish. The model is ~1.3 units long. */
  scale: number;
  /** Middle of the swimming area. */
  center: THREE.Vector3;
  /** Half-size of the swimming area; fish are steered back when they leave it. */
  bounds: THREE.Vector3;
  /** Whether this school gathers into the swirling tunnel. */
  vortex: boolean;
  alpha?: number;
  speed?: [number, number];
};

const NEIGHBOR = 1.8;
const SEPARATE = 0.85;
const GROUPS = 3;
const VORTEX_CYCLE = 28; // seconds between tunnels
const VORTEX_RADIUS = 4.5;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class School {
  readonly mesh: THREE.InstancedMesh;
  readonly bounds: THREE.Vector3;
  private readonly opts: SchoolOptions;
  private readonly material: THREE.ShaderMaterial;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly size: Float32Array;
  private readonly targets = new Float32Array(GROUPS * 3);
  private readonly matrix = new THREE.Matrix4();
  private readonly fwd = new THREE.Vector3();
  private readonly side = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly worldUp = new THREE.Vector3(0, 1, 0);

  constructor(geometry: THREE.BufferGeometry, opts: SchoolOptions) {
    this.opts = opts;
    this.bounds = opts.bounds.clone();
    const n = opts.count;
    const alpha = opts.alpha ?? 1;

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.DoubleSide,
      transparent: alpha < 1,
      depthWrite: alpha >= 1,
      uniforms: {
        uTime: { value: 0 },
        uBack: { value: new THREE.Color("#22334f") },
        uBelly: { value: new THREE.Color("#9fb0c8") },
        uSun: { value: new THREE.Color("#ffd2b0") },
        uRim: { value: new THREE.Color("#ffc29c") },
        uFog: { value: new THREE.Color("#8fa5c6") },
        uSunDir: { value: new THREE.Vector3(0.6, 0.5, 0.6) },
        uFogNear: { value: 20 },
        uFogFar: { value: 42 },
        uAlpha: { value: alpha },
      },
    });

    const geo = geometry.clone();
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) phase[i] = Math.random() * Math.PI * 2;
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));

    this.mesh = new THREE.InstancedMesh(geo, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.size = new Float32Array(n);
    const { center: c, bounds: b } = opts;
    for (let i = 0; i < n; i++) {
      this.pos[i * 3] = c.x + (Math.random() * 2 - 1) * b.x * 0.6;
      this.pos[i * 3 + 1] = c.y + (Math.random() * 2 - 1) * b.y * 0.6;
      this.pos[i * 3 + 2] = c.z + (Math.random() * 2 - 1) * b.z * 0.6;
      this.vel[i * 3] = 2 + Math.random();
      this.vel[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      this.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      this.size[i] = opts.scale * (0.75 + Math.random() * 0.5);
    }
    this.writeMatrices();
  }

  /** Runs the simulation for a while without drawing, so a still frame looks settled. */
  warmUp(steps: number) {
    for (let s = 0; s < steps; s++) this.update(1 / 30, s / 30, null);
  }

  /**
   * @param pointer where the cursor meets the swimming area, or null when it's away.
   */
  update(dt: number, time: number, pointer: THREE.Vector3 | null) {
    const { count: n, center: c, vortex } = this.opts;
    const [minSpeed, maxSpeed] = this.opts.speed ?? [2.2, 4.2];
    const b = this.bounds;
    const { pos, vel } = this;

    // Each group drifts toward its own slowly wandering point, so the school splits into
    // ribbons that cross, merge and split again.
    const targets = this.targets;
    for (let g = 0; g < GROUPS; g++) {
      const o = g * 2.1;
      targets[g * 3] = c.x + Math.sin(time * 0.13 + o) * b.x * 0.7;
      targets[g * 3 + 1] = c.y + Math.sin(time * 0.21 + 1.3 + o * 1.7) * b.y * 0.55;
      targets[g * 3 + 2] = c.z + Math.sin(time * 0.17 + 2.1 + o) * b.z * 0.4;
    }

    // How strongly the tunnel is pulling right now (0 most of the time).
    const t = time % VORTEX_CYCLE;
    const swirl = vortex ? smooth(15, 18, t) * (1 - smooth(23, 26, t)) : 0;

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
      let sx = 0, sy = 0, sz = 0; // separation
      let ax = 0, ay = 0, az = 0; // alignment
      let cx = 0, cy = 0, cz = 0; // cohesion
      let near = 0;

      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const j3 = j * 3;
        const dx = pos[j3] - px, dy = pos[j3 + 1] - py, dz = pos[j3 + 2] - pz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > NEIGHBOR * NEIGHBOR) continue;
        near++;
        ax += vel[j3]; ay += vel[j3 + 1]; az += vel[j3 + 2];
        cx += dx; cy += dy; cz += dz;
        if (d2 < SEPARATE * SEPARATE && d2 > 1e-6) {
          const k = 1 / d2;
          sx -= dx * k; sy -= dy * k; sz -= dz * k;
        }
      }

      let fx = sx * 0.9, fy = sy * 0.9, fz = sz * 0.9;
      if (near > 0) {
        fx += (ax / near - vel[i3]) * 1.0 + (cx / near) * 0.3;
        fy += (ay / near - vel[i3 + 1]) * 1.0 + (cy / near) * 0.3;
        fz += (az / near - vel[i3 + 2]) * 1.0 + (cz / near) * 0.3;
      }

      const g3 = (i % GROUPS) * 3;
      const wander = 0.06 * (1 - swirl);
      fx += (targets[g3] - px) * wander;
      fy += (targets[g3 + 1] - py) * wander;
      fz += (targets[g3 + 2] - pz) * wander;

      if (swirl > 0) {
        // Circle the camera axis at a set radius: from the front this reads as a tunnel.
        const rx = px - c.x, ry = py - c.y;
        const r = Math.hypot(rx, ry) || 1;
        const radius = Math.min(VORTEX_RADIUS, b.x * 0.75); // fit narrow (phone) screens
        fx += swirl * ((-ry / r) * 2.4 + (rx / r) * (radius - r) * 0.8);
        fy += swirl * ((rx / r) * 2.4 + (ry / r) * (radius - r) * 0.8);
        fz += swirl * (c.z - pz) * 0.3;
      }

      // Soft walls.
      const ox = px - c.x, oy = py - c.y, oz = pz - c.z;
      if (Math.abs(ox) > b.x) fx -= Math.sign(ox) * (Math.abs(ox) - b.x) * 1.5;
      if (Math.abs(oy) > b.y) fy -= Math.sign(oy) * (Math.abs(oy) - b.y) * 1.5;
      if (Math.abs(oz) > b.z) fz -= Math.sign(oz) * (Math.abs(oz) - b.z) * 1.5;

      if (pointer) {
        const dx = px - pointer.x, dy = py - pointer.y, dz = (pz - pointer.z) * 0.5;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 12 && d2 > 1e-4) {
          const k = (12 - d2) / 12 / Math.sqrt(d2);
          fx += dx * k * 9; fy += dy * k * 9; fz += dz * k * 4;
        }
      }

      let vx = vel[i3] + fx * dt * 2;
      let vy = vel[i3 + 1] + fy * dt * 2;
      let vz = vel[i3 + 2] + fz * dt * 2;
      const speed = Math.hypot(vx, vy, vz) || 1;
      const clamped = Math.min(maxSpeed, Math.max(minSpeed, speed));
      vx *= clamped / speed; vy *= clamped / speed; vz *= clamped / speed;
      vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
      pos[i3] = px + vx * dt;
      pos[i3 + 1] = py + vy * dt;
      pos[i3 + 2] = pz + vz * dt;
    }

    this.material.uniforms.uTime.value = time;
    this.writeMatrices();
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }

  private writeMatrices() {
    const { pos, vel, size, fwd, side, up, matrix } = this;
    for (let i = 0; i < this.opts.count; i++) {
      const i3 = i * 3;
      fwd.set(vel[i3], vel[i3 + 1], vel[i3 + 2]).normalize();
      side.crossVectors(fwd, this.worldUp);
      if (side.lengthSq() < 1e-6) side.set(0, 0, 1);
      side.normalize();
      up.crossVectors(side, fwd);
      const s = size[i];
      matrix.makeBasis(fwd.multiplyScalar(s), up.multiplyScalar(s), side.multiplyScalar(s));
      matrix.setPosition(pos[i3], pos[i3 + 1], pos[i3 + 2]);
      this.mesh.setMatrixAt(i, matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
