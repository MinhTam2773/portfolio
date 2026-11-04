import * as THREE from "three";

// One shader for every creature. Each kind bends differently:
//   fish  — tail swishes side to side
//   manta — wing tips flap up and down
//   whale — tail flukes beat up and down
// Lighting: a warm sun from the upper right, a warm rim around the silhouette, and haze
// toward the sky colour with distance.

export type CreatureKind = "fish" | "manta" | "whale";

const VERT = /* glsl */ `
attribute float aPhase;
uniform float uTime;
uniform float uBendSpeed;
uniform float uBendAmount;
varying vec3 vNormal;
varying vec3 vView;
varying float vLocalY;
varying float vDepth;

void main() {
  vec3 p = position;
  float t = uTime * uBendSpeed + aPhase;

  #if defined(KIND_FISH)
    // Model faces +X; "back" is 0 at the head and 1 at the tail tip.
    float back = clamp((0.45 - p.x) / 1.25, 0.0, 1.0);
    p.z += sin(t - p.x * 5.0) * uBendAmount * back * back;
  #elif defined(KIND_MANTA)
    // Wings span Z; tips rise and fall, lagging a little behind the body.
    float span = abs(p.z);
    p.y += sin(t - span * 1.5) * uBendAmount * span * span;
  #elif defined(KIND_WHALE)
    float back = clamp((0.3 - p.x) / 1.3, 0.0, 1.0);
    p.y += sin(t - p.x * 2.5) * uBendAmount * back * back;
  #endif

  mat4 model = modelMatrix * instanceMatrix; // every creature group is an InstancedMesh
  vec4 world = model * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  vNormal = normalize(mat3(model) * normal);
  vView = normalize(cameraPosition - world.xyz);
  vLocalY = p.y;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uBack;
uniform vec3 uBelly;
uniform vec3 uRim;
uniform vec3 uSun;
uniform vec3 uFog;
uniform vec3 uSunDir;
uniform float uSplit;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogMax;
uniform float uAlpha;
varying vec3 vNormal;
varying vec3 vView;
varying float vLocalY;
varying float vDepth;

void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 sunDir = normalize(uSunDir);

  vec3 base = mix(uBelly, uBack, smoothstep(uSplit - 0.08, uSplit + 0.08, vLocalY));
  float diff = max(dot(n, sunDir), 0.0);
  float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.5);
  float spec = pow(max(dot(reflect(-sunDir, n), vView), 0.0), 24.0);

  vec3 col = base * (0.45 + 0.55 * diff) + uRim * rim * 0.9 + uSun * spec * 0.8;
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, vDepth) * uFogMax);

  gl_FragColor = vec4(col, uAlpha);
  #include <colorspace_fragment>
}
`;

export type CreatureLook = {
  back: string;
  belly: string;
  rim?: string;
  /** Local height where back colour meets belly colour. */
  split?: number;
  bendSpeed: number;
  bendAmount: number;
  fogNear?: number;
  fogFar?: number;
  /** How far toward the sky colour the most distant creatures fade (0–1). */
  fogMax?: number;
};

export function createCreatureMaterial(kind: CreatureKind, look: CreatureLook) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.DoubleSide,
    defines: { [`KIND_${kind.toUpperCase()}`]: "" },
    uniforms: {
      uTime: { value: 0 },
      uBendSpeed: { value: look.bendSpeed },
      uBendAmount: { value: look.bendAmount },
      uBack: { value: new THREE.Color(look.back) },
      uBelly: { value: new THREE.Color(look.belly) },
      uRim: { value: new THREE.Color(look.rim ?? "#ffc29c") },
      uSun: { value: new THREE.Color("#ffd2b0") },
      uFog: { value: new THREE.Color("#8fa5c6") },
      uSunDir: { value: new THREE.Vector3(0.6, 0.5, 0.6) },
      uSplit: { value: look.split ?? 0.02 },
      uFogNear: { value: look.fogNear ?? 20 },
      uFogFar: { value: look.fogFar ?? 42 },
      uFogMax: { value: look.fogMax ?? 0.6 },
      uAlpha: { value: 1 },
    },
  });
}
