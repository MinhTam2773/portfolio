import * as THREE from "three";

// One shader for every creature. Colour comes from the model's own painted texture.
// Each kind bends differently:
//   fish  — tail swishes side to side
//   manta — wing tips flap up and down
//   whale — tail flukes beat up and down
// Lighting: a warm sun from the upper right, a warm rim around the silhouette, and haze
// toward the sky colour with distance.

export type CreatureKind = "fish" | "manta" | "whale";

/** A loaded creature model: its mesh and its painted colour texture. */
export type CreatureModel = { geometry: THREE.BufferGeometry; map: THREE.Texture };

const VERT = /* glsl */ `
attribute float aPhase;
uniform float uTime;
uniform float uBendSpeed;
uniform float uBendAmount;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
varying float vDepth;

void main() {
  vec3 p = position;
  float t = uTime * uBendSpeed + aPhase;

  #if defined(KIND_FISH)
    // Model faces +X, nose at x = 0.5; "back" is 0 at the head and 1 at the tail tip.
    float back = clamp((0.45 - p.x) / 1.25, 0.0, 1.0);
    p.z += sin(t - p.x * 5.0) * uBendAmount * back * back;
  #elif defined(KIND_MANTA)
    // Wings span Z (tips at ±1). A power stroke for 60% of the cycle, then a glide where
    // the wings settle. Tips lag a little behind the body; the body heaves with the stroke.
    float span = abs(p.z);
    float cycle = fract(t / 6.2832 - span * 0.06);
    float flap = cycle < 0.6 ? sin(cycle / 0.6 * 6.2832) : 0.1 * exp(-(cycle - 0.6) * 8.0);
    p.y += flap * uBendAmount * span * span;
    float body = fract(t / 6.2832);
    p.y -= (body < 0.6 ? cos(body / 0.6 * 6.2832) : 1.0) * 0.04;
  #elif defined(KIND_WHALE)
    // Model x runs from the tail (-1.75) to the snout (+1.0). The wave starts behind the
    // pectoral fins and grows toward the flukes; the head nods against each stroke.
    float back = clamp((0.45 - p.x) / 2.2, 0.0, 1.0);
    p.y += sin(t - p.x * 1.6) * uBendAmount * back * back;
    float front = clamp((p.x - 0.3) / 0.7, 0.0, 1.0);
    p.y -= sin(t) * 0.04 * front;
  #endif

  mat4 model = modelMatrix * instanceMatrix; // every creature group is an InstancedMesh
  vec4 world = model * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  vUv = uv;
  vNormal = normalize(mat3(model) * normal);
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
  bendSpeed: number;
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
      uTime: { value: 0 },
      uBendSpeed: { value: look.bendSpeed },
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
