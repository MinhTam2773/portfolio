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
    // Wings span Z (tips at ±1); tips rise and fall, lagging a little behind the body.
    float span = abs(p.z);
    p.y += sin(t - span * 1.5) * uBendAmount * span * span;
  #elif defined(KIND_WHALE)
    float back = clamp((0.3 - p.x) / 1.3, 0.0, 1.0);
    p.y += sin(t - p.x * 2.5) * uBendAmount * back * back;
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
uniform vec3 uRim;
uniform vec3 uSun;
uniform vec3 uFog;
uniform vec3 uSunDir;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogMax;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
varying float vDepth;

void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 sunDir = normalize(uSunDir);

  vec3 base = texture2D(uMap, vUv).rgb;
  float diff = max(dot(n, sunDir), 0.0);
  float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.5);
  float spec = pow(max(dot(reflect(-sunDir, n), vView), 0.0), 24.0);

  // The texture is already painted with soft shading, so lighting only nudges it.
  vec3 col = base * (0.7 + 0.45 * diff) + uRim * rim * 0.6 + uSun * spec * 0.4;
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, vDepth) * uFogMax);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export type CreatureLook = {
  rim?: string;
  bendSpeed: number;
  bendAmount: number;
  fogNear?: number;
  fogFar?: number;
  /** How far toward the sky colour the most distant creatures fade (0–1). */
  fogMax?: number;
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
      uRim: { value: new THREE.Color(look.rim ?? "#ffc29c") },
      uSun: { value: new THREE.Color("#ffd2b0") },
      uFog: { value: new THREE.Color("#8fa5c6") },
      uSunDir: { value: new THREE.Vector3(0.6, 0.5, 0.6) },
      uFogNear: { value: look.fogNear ?? 20 },
      uFogFar: { value: look.fogFar ?? 42 },
      uFogMax: { value: look.fogMax ?? 0.6 },
    },
  });
}
