// ================= realism: image-based light, sun & shadows, wind-blown grass, quality switch =================
let quality = 'high';
try { quality = localStorage.getItem('modly-quality') || 'high'; } catch (_) { }
const SUN_REF = new V3(0.55, 0.62, 0.35).normalize();   // fixed "east-ish" reference so shadows don't spin with the camera
const sunDir = new V3();

// soft sky light for every PBR material (reflections in cars, water, glass)
function buildEnvironment() {
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const g = new THREE.SphereGeometry(10, 32, 16), col = [], p = g.attributes.position;
  const top = new THREE.Color(0x2f62a8), hor = new THREE.Color(0x8a9cb0), gnd = new THREE.Color(0x3a3628), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 10; if (y > 0) c.copy(hor).lerp(top, Math.pow(y, 0.6)); else c.copy(hor).lerp(gnd, Math.min(1, -y * 3)); col.push(c.r, c.g, c.b); }
  srgbArrayToLinear(col);
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const sunBall = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 8), new THREE.MeshBasicMaterial({ color: 0xb8ad98 })); sunBall.position.set(5, 7, 3); envScene.add(sunBall);
  const tex = pm.fromScene(envScene, 0.04).texture;
  scene.environment = tex; homeScene.environment = tex; sanc.environment = tex;
  linearize(scene); linearize(sanc); linearize(miniScene);
  pm.dispose();
}
// make sure everything that should throws and catches shadows does (also things spawned later)
function shadowPass(root) {
  root.traverse(o => {
    if (!o.isMesh || o.userData.shadowSet) return;
    o.userData.shadowSet = true;
    const m = o.material; if (!m || Array.isArray(m)) { o.castShadow = o.receiveShadow = true; return; }
    if (m.isMeshBasicMaterial || m.isShaderMaterial || (m.transparent && m.opacity < 0.7)) return;
    if (o.geometry && o.geometry.type === 'IcosahedronGeometry' && o.geometry.parameters && o.geometry.parameters.detail > 40) return; // the planet only receives
    o.castShadow = true; o.receiveShadow = true;
  });
}
let shadowT = 0;
function updateSun(dt, t) {
  const up = player.up;
  sunDir.copy(SUN_REF).addScaledVector(up, -SUN_REF.dot(up));
  if (sunDir.lengthSq() < 1e-4) sunDir.set(1, 0, 0).addScaledVector(up, -up.x);
  sunDir.normalize().multiplyScalar(0.62).addScaledVector(up, 0.78).normalize();
  // snap the shadow box to its texel grid so shadow edges don't shimmer while walking
  const focus = player.inCar && ride ? ride.pos : player.pos;
  sun.position.copy(focus).addScaledVector(sunDir, 110); sun.target.position.copy(focus);
  sun.target.updateMatrixWorld();
  bubbleU.uSun.value.copy(sunDir);
  shadowT -= dt; if (shadowT < 0) { shadowT = 1.5; shadowPass(world); linearize(world); }
  if (waterMat) { waterMat.normalMap.offset.x = t * 0.004; waterMat.normalMap.offset.y = t * 0.0025; }
  if (grass) grass.material.userData.shader && (grass.material.userData.shader.uniforms.uTime.value = t);
}

// ---------- grass that sways in the wind ----------
let grass = null;
function buildGrass() {
  // one tuft = a few bent blades
  const blades = 5, verts = [], cols = [];
  for (let b = 0; b < blades; b++) {
    const a = b / blades * Math.PI * 2 + Math.random(), r = 0.12 + Math.random() * 0.1, h = 0.45 + Math.random() * 0.35, w = 0.045;
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r, lean = 0.25 + Math.random() * 0.2, lx = Math.cos(a) * lean, lz = Math.sin(a) * lean;
    const px = -Math.sin(a) * w, pz = Math.cos(a) * w;
    verts.push(bx - px, 0, bz - pz, bx + px, 0, bz + pz, bx + lx * 0.5 + px * 0.5, h * 0.55, bz + lz * 0.5 + pz * 0.5);
    verts.push(bx - px, 0, bz - pz, bx + lx * 0.5 + px * 0.5, h * 0.55, bz + lz * 0.5 + pz * 0.5, bx + lx * 0.5 - px * 0.5, h * 0.55, bz + lz * 0.5 - pz * 0.5);
    verts.push(bx + lx * 0.5 - px * 0.5, h * 0.55, bz + lz * 0.5 - pz * 0.5, bx + lx * 0.5 + px * 0.5, h * 0.55, bz + lz * 0.5 + pz * 0.5, bx + lx, h, bz + lz);
    for (let k = 0; k < 9; k++) { const y = verts[verts.length - 27 + k * 3 + 1] / h; cols.push(0.55 + y * 0.5, 0.55 + y * 0.5, 0.55 + y * 0.5); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  m.onBeforeCompile = sh => {
    sh.uniforms.uTime = { value: 0 }; m.userData.shader = sh;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.,0.,0.,1.);
      float sway = sin(uTime*1.8 + wp.x*0.35 + wp.z*0.27) * 0.6 + sin(uTime*3.1 + wp.y*0.5) * 0.25;
      transformed.x += sway * 0.14 * position.y * position.y * 2.0;
      transformed.z += sway * 0.08 * position.y * position.y * 2.0;`);
  };
  // where grass grows
  const spots = [];
  const tryAdd = (bi, minW, n, colFn, cond) => { for (let k = 0; k < n; k++) { const d = dirIn(bi, minW, cond); if (d) spots.push([d, colFn(d)]); } };
  const notRoad = d => { const [u, v] = cityUV(d.x, d.y, d.z), r = Math.hypot(u, v); if (r < 22) return false; if (r < 58) { const mu = ((u % 20) + 20) % 20, mv = ((v % 20) + 20) % 20; if (mu < 3 || mu > 17 || mv < 3 || mv > 17) return false; } return TH(d) > 0.3; };
  tryAdd(0, 0.6, 5200, () => new THREE.Color().setHSL(0.27 + Math.random() * 0.04, 0.55, 0.32 + Math.random() * 0.1), notRoad);
  tryAdd(5, 0.6, 6500, () => new THREE.Color().setHSL(0.3 + Math.random() * 0.05, 0.6, 0.24 + Math.random() * 0.1), d => TH(d) > 0.2);
  tryAdd(1, 0.7, 900, () => new THREE.Color().setHSL(0.12, 0.45, 0.55 + Math.random() * 0.1), d => TH(d) > 0.5);
  tryAdd(3, 0.65, 2200, () => new THREE.Color().setHSL(0.78 + Math.random() * 0.08, 0.55, 0.5), d => TH(d) > 0.5);
  const im = new THREE.InstancedMesh(geo, m, spots.length), mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new V3(), pos = new V3(), yaw = new THREE.Quaternion();
  spots.forEach(([d, c], i) => {
    pos.copy(d).multiplyScalar(R + TH(d) - 0.03); q.setFromUnitVectors(UP, d); yaw.setFromAxisAngle(UP, Math.random() * 6.28); q.multiply(yaw);
    const k = 0.7 + Math.random() * 0.8; s.set(k, k * (0.8 + Math.random() * 0.6), k);
    mtx.compose(pos, q, s); im.setMatrixAt(i, mtx); im.setColorAt(i, c.convertSRGBToLinear());
  });
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.receiveShadow = true; im.frustumCulled = false; im.userData.shadowSet = true;
  world.add(im); grass = im;
}

// ---------- G: switch between nice and fast ----------
function applyQuality() {
  const hi = quality === 'high';
  renderer.shadowMap.enabled = hi; sun.castShadow = hi;
  renderer.setPixelRatio(hi ? Math.min(devicePixelRatio, 2) : 1); renderer.setSize(innerWidth, innerHeight);
  if (grass) grass.visible = hi;
  scene.traverse(o => { if (o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; });
}
function toggleQuality() {
  quality = quality === 'high' ? 'low' : 'high';
  try { localStorage.setItem('modly-quality', quality); } catch (_) { }
  applyQuality();
  toast(quality === 'high' ? 'Grafika: graži' : 'Grafika: greita', quality === 'high' ? 'Šešėliai, žolė ir atspindžiai įjungti' : 'Be šešėlių ir žolės – sklandžiau silpnesniam kompiuteriui', '#aab4cc');
}
