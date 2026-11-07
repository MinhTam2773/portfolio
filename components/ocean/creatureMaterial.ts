import * as THREE from "three";

// One shader for every creature. Colour comes from the model's own painted texture.
// Each kind swims differently (all smooth, periodic functions; no piecewise strokes):
//   fish  — a wave runs down the body from head to tail, growing toward the tail; the head
//           yaws a little against it and the fins trail softly behind
//   manta — a wave rolls out along each wing to a curling tip, easing into glides now and
//           then; the body heaves and pitches against the beat
//   whale — a slow wave runs back to the flukes; the head nods against it
// The swim phase (aSwim) is advanced on the CPU from distance travelled, so a creature that
// speeds up beats faster. aBend is the path's curvature (sideways, up) in model units; the
// spine arcs along it.
// Lighting: a warm sun from the upper right, a warm rim around the silhouette, and haze
// toward the sky colour with distance.

export type CreatureKind = "fish" | "manta" | "whale";

/** A loaded creature model: its mesh and its painted colour texture. */
export type CreatureModel = { geometry: THREE.BufferGeometry; map: THREE.Texture };

/** Swim phases wrap here: a whole number of beats and of the manta's 4-beat glide cycle. */
export const SWIM_WRAP = Math.PI * 8;

const VERT = /* glsl */ `
attribute float aSwim;
attribute vec2 aBend;
uniform float uBendAmount;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
varying float vDepth;

void main() {
  vec3 p = position;
  vec3 n = normal;
  float a = uBendAmount;

  #if defined(KIND_FISH)
    // Model faces +X: nose at x = 0.5, tail tip at x = -0.8. "back" is 0 at the nose, 1 at the tip.
    float back = clamp((0.5 - p.x) / 1.3, 0.0, 1.0);
    // One body length per wave; the phase lags further back, so crests run nose to tail.
    float k = 4.83;
    float ph = aSwim - (0.5 - p.x) * k;
    float env = pow(back, 1.8);
    float side = a * env * sin(ph);
    // The head yaws a little against the tail's swing (opposite to the tail tip's phase).
    side -= a * 0.18 * (1.0 - back) * (1.0 - back) * sin(aSwim - 1.3 * k);
    // Fins (the parts far above and below the spine) trail the body a beat behind.
    float fin = smoothstep(0.1, 0.2, abs(p.y));
    side += a * 0.45 * fin * (0.3 + back) * sin(ph - 1.2);
    p.z += side;
    // Sideways slope along the body, to turn the normals with the bend (keeps the sheen
    // sliding over the flanks instead of staying painted on).
    float slope = a * (env * k * cos(ph) - 1.385 * pow(back, 0.8) * sin(ph));
    n.x -= slope * n.z;
  #elif defined(KIND_MANTA)
    // Wings span Z (tips at +-1), nose at x = 0.6. A wave rolls out from the body to the tips
    // (phase lag across the span, a little from front to back), skewed so the downstroke is
    // quicker than the upstroke. Every few beats the wings ease into a glide and back.
    float span = abs(p.z);
    float tip = span * span;
    float ph = aSwim - span * 1.4 + p.x * 0.5;
    float beat = sin(ph + 0.35 * sin(ph));
    float flapping = smoothstep(-0.45, 0.55, sin(aSwim * 0.25 + 1.3)); // 0 = gliding, every 4 beats
    float amp = a * mix(0.3, 1.0, flapping);
    float curl = smoothstep(0.55, 1.0, span); // the outer wing bends further, a beat later
    p.y += amp * (tip * beat + 0.3 * curl * sin(ph - 0.9));
    p.y += a * 0.25 * (1.0 - flapping) * tip; // wings held slightly raised in a glide
    // Body heaves against the wings and pitches a little with each beat.
    float core = 1.0 - smoothstep(0.0, 0.6, span);
    p.y -= core * amp * (0.14 * sin(aSwim) - 0.1 * p.x * cos(aSwim));
    float slope = amp * (2.0 * span * beat - 1.4 * tip * cos(ph));
    n.z -= slope * sign(p.z) * n.y;
  #elif defined(KIND_WHALE)
    // Model x runs from the flukes (-1.75) to the snout (+1.0). The wave starts behind the
    // flippers and grows toward the flukes, which flex a little later still; the head nods
    // gently against each stroke.
    float back = clamp((0.45 - p.x) / 2.2, 0.0, 1.0);
    float ph = aSwim - (1.0 - p.x) * 1.8;
    float env = pow(back, 1.8);
    float fluke = smoothstep(0.7, 1.0, back);
    p.y += a * (env * sin(ph) + 0.25 * fluke * sin(ph - 0.8));
    float front = clamp((p.x - 0.3) / 0.7, 0.0, 1.0);
    p.y -= a * 0.15 * front * sin(aSwim + 0.6);
    float slope = a * env * 1.8 * cos(ph);
    n.x -= slope * n.y;
  #endif

  // The spine arcs along the path's curve: points ahead of and behind the centre both lean
  // toward the inside of the turn.
  float arc = 0.5 * p.x * p.x;
  p.z += aBend.x * arc;
  p.y += aBend.y * arc;
  n.x -= aBend.x * p.x * n.z + aBend.y * p.x * n.y;

  mat4 model = modelMatrix * instanceMatrix; // every creature group is an InstancedMesh
  vec4 world = model * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  vUv = uv;
  vNormal = normalize(mat3(model) * n);
  vView = normalize(cameraPosition - world.xyz);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uResolution;
uniform vec3 uRim;
uniform vec3 uSun;
uniform vec3 uSunDir;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uBounce;
uniform vec3 uSky0;
uniform vec3 uSky1;
uniform vec3 uSky2;
uniform vec3 uSky3;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogMax;
uniform float uMinLight;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
varying float vDepth;

// The CSS sky gradient behind the canvas at this pixel's height (t = 0 top, 1 bottom).
vec3 skyAt(float t) {
  vec3 c = mix(uSky0, uSky1, smoothstep(0.0, 0.55, t));
  c = mix(c, uSky2, smoothstep(0.55, 0.76, t));
  return mix(c, uSky3, smoothstep(0.76, 0.88, t));
}

void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 l = normalize(uSunDir);
  vec3 sky = skyAt(1.0 - gl_FragCoord.y / uResolution.y);

  // Soften the baked texture's contrast a little (AI textures bake in muddy shadows).
  vec3 base = mix(vec3(0.55), texture2D(uMap, vUv).rgb, 0.85);

  // Sky light from above, warm light bounced up off the sunlit clouds below.
  vec3 hemi = n.y > 0.0 ? mix(uHorizon, uZenith, n.y) : mix(uHorizon, uBounce, -n.y * 0.85);
  // Half-Lambert wrap: the shadow side never drops to black.
  float wrap = pow(dot(n, l) * 0.5 + 0.5, 1.5);
  float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.5);
  float spec = pow(max(dot(reflect(-l, n), vView), 0.0), 24.0);
  // Light glowing through thin fins and bodies when the sun is behind them.
  float sss = pow(clamp(dot(vView, -l + n * 0.4), 0.0, 1.0), 3.0);

  vec3 col = base * (hemi * 0.55 + uSun * wrap * 0.65) + uRim * rim * 0.6 + uSun * (spec * 0.4 + sss * 0.3);
  // Never darker than a pale, mostly neutral version of the sky right behind it, so small
  // fish read as pearly highlights rather than dark specks (without taking on the sky's hue).
  float skyLum = dot(sky, vec3(0.299, 0.587, 0.114));
  col = max(col, mix(vec3(skyLum), sky, 0.25) * uMinLight);
  col = mix(col, sky, smoothstep(uFogNear, uFogFar, vDepth) * uFogMax);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/** Shared by every creature material; kept in sync with the canvas size in device pixels. */
export const resolution = { value: new THREE.Vector2(1, 1) };

export type CreatureLook = {
  rim?: string;
  /** Swim beat at cruising speed, in radians per second (faster when the creature speeds up). */
  bendSpeed: number;
  /** How far the body bends with each beat, in model units. */
  bendAmount: number;
  fogNear?: number;
  fogFar?: number;
  /** How far toward the sky colour the most distant creatures fade (0–1). */
  fogMax?: number;
  /** Floor on brightness as a share of the sky behind (0 = none). */
  minLight?: number;
};

export function createCreatureMaterial(kind: CreatureKind, map: THREE.Texture, look: CreatureLook) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.DoubleSide,
    defines: { [`KIND_${kind.toUpperCase()}`]: "" },
    uniforms: {
      uBendAmount: { value: look.bendAmount },
      uMap: { value: map },
      uResolution: resolution,
      uRim: { value: new THREE.Color(look.rim ?? "#ffc29c") },
      uSun: { value: new THREE.Color("#ffd2b0") },
      uSunDir: { value: new THREE.Vector3(0.6, 0.5, 0.6) },
      uZenith: { value: new THREE.Color("#6b8cc7") },
      uHorizon: { value: new THREE.Color("#c9c4dc") },
      uBounce: { value: new THREE.Color("#f2b48a") },
      // Same stops as the CSS sky gradient in SkyLayers.tsx.
      uSky0: { value: new THREE.Color("#6c8cb8") },
      uSky1: { value: new THREE.Color("#a6b4cc") },
      uSky2: { value: new THREE.Color("#d4b8ae") },
      uSky3: { value: new THREE.Color("#eab598") },
      uFogNear: { value: look.fogNear ?? 20 },
      uFogFar: { value: look.fogFar ?? 42 },
      uFogMax: { value: look.fogMax ?? 0.6 },
      uMinLight: { value: look.minLight ?? 0 },
    },
  });
}
