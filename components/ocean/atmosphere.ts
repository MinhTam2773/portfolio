import * as THREE from "three";

// Soft light shafts slanting down from above, and specks drifting up through the air.
// Both animate entirely on the GPU from a time uniform.

const SHAFT_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SHAFT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uSeed;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float down = smoothstep(0.0, 0.85, vUv.y);
  float pulse = 0.6 + 0.4 * sin(uTime * 0.35 + uSeed * 6.2831);
  float a = across * across * down * pulse * uIntensity;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}
`;

const SPECK_VERT = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uHeight;
uniform float uPixelRatio;
varying float vFade;
void main() {
  vec3 p = position;
  float rise = 0.25 + aSeed * 0.35;
  p.y = mod(p.y + uTime * rise + uHeight, uHeight * 2.0) - uHeight;
  p.x += sin(uTime * 0.4 + aSeed * 20.0) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.5 + aSeed * 2.5) * uPixelRatio * (22.0 / -mv.z);
  vFade = 0.35 + 0.65 * fract(aSeed * 7.13);
  gl_Position = projectionMatrix * mv;
}
`;

const SPECK_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * 0.55 * vFade;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`;

export function createAtmosphere(speckCount: number, pixelRatio: number) {
  const group = new THREE.Group();
  const materials: THREE.ShaderMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const shaftGeo = new THREE.PlaneGeometry(3.2, 34);
  geometries.push(shaftGeo);
  const shafts = [
    { x: -11, z: -10, w: 1.3 },
    { x: -4, z: -8, w: 0.8 },
    { x: 3, z: -12, w: 1.6 },
    { x: 9, z: -9, w: 1.0 },
    { x: 15, z: -11, w: 1.2 },
  ];
  shafts.forEach((s, i) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: SHAFT_VERT,
      fragmentShader: SHAFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color("#fff0dc") },
        uTime: { value: 0 },
        uSeed: { value: i / shafts.length },
        uIntensity: { value: 0.16 },
      },
    });
    materials.push(mat);
    const mesh = new THREE.Mesh(shaftGeo, mat);
    mesh.position.set(s.x, 4, s.z);
    mesh.scale.x = s.w;
    mesh.rotation.z = -0.32; // slanting in from the upper right, where the sun sits
    group.add(mesh);
  });

  const height = 12;
  const positions = new Float32Array(speckCount * 3);
  const seeds = new Float32Array(speckCount);
  for (let i = 0; i < speckCount; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * 20;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * height;
    positions[i * 3 + 2] = -12 + Math.random() * 22;
    seeds[i] = Math.random();
  }
  const speckGeo = new THREE.BufferGeometry();
  speckGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  speckGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometries.push(speckGeo);
  const speckMat = new THREE.ShaderMaterial({
    vertexShader: SPECK_VERT,
    fragmentShader: SPECK_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color("#fff6ea") },
      uTime: { value: 0 },
      uHeight: { value: height },
      uPixelRatio: { value: pixelRatio },
    },
  });
  materials.push(speckMat);
  const specks = new THREE.Points(speckGeo, speckMat);
  specks.frustumCulled = false;
  group.add(specks);

  return {
    group,
    update(time: number) {
      for (const m of materials) m.uniforms.uTime.value = time;
    },
    dispose() {
      materials.forEach((m) => m.dispose());
      geometries.forEach((g) => g.dispose());
    },
  };
}
