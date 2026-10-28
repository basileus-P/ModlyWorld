// ================= Fish costume + the Sun God takes you to THE SUN =================
// After all 20 fish families are helped, the Sea God gives you a fish costume and writes to the gods.
// Then the Sun God answers – and a golden sun beam lifts you out of the sea, all the way to the Sun.

// ---------- the fish costume ----------
SKINS.push({ id: 'fish', name: 'Žuvis', desc: 'Oranžiniai žvynai, pelekai ir uodega. Jūrų Dievo dovana už 18 išgelbėtų žuvų šeimų.', price: -1, body: '#ff8a2a', hat: '#ffd23a', secret: true, hint: 'Sako, jį duoda Jūrų Dievas tam, kas padeda visoms vargšėms žuvims…' });
{
  const _eq = equipSkin; equipSkin = (id, quiet) => { _eq(id, quiet); if (skinNow === 'fish') tintPlayer(0xff8a2a, 0xe0601a); };
  const _bs = buildSkin; buildSkin = (id, g) => {
    _bs(id, g); if (id !== 'fish') return;
    const fin = mat(0xffd23a, { roughness: 0.5 }), fin2 = mat(0x4ac8ff, { roughness: 0.4 });
    // dorsal fin on the head and back
    const d = S(G.cone, fin, 0.05, 0.42, 0.3, 0, 2.05, -0.05); d.rotation.x = -0.5; g.add(d);
    const d2 = S(G.cone, fin, 0.04, 0.3, 0.22, 0, 1.55, -0.24); d2.rotation.x = -0.9; g.add(d2);
    // side fins
    for (const sx of [-1, 1]) { const f = S(G.cone, fin2, 0.04, 0.26, 0.16, sx * 0.27, 1.35, 0); f.rotation.z = sx * 1.9; g.add(f); }
    // big tail fin behind
    for (const sx of [-1, 1]) { const t = S(G.cone, fin, 0.05, 0.42, 0.22, sx * 0.12, 0.92, -0.42); t.rotation.set(-1.2, 0, sx * 0.6); g.add(t); }
    // scales
    for (let i = 0; i < 8; i++) g.add(S(G.sph, mat(0xffb04a, { roughness: 0.4 }), 0.06, 0.06, 0.02, ((i % 4) - 1.5) * 0.1, 1.2 + Math.floor(i / 4) * 0.16, 0.22));
    // bubble glasses
    for (const x of [-0.1, 0.1]) g.add(mesh(new THREE.TorusGeometry(0.075, 0.015, 6, 14), mat(0x4ac8ff), x, 1.88, 0.31));
  };
}
function giveFishSkin() {
  let got = false; try { got = localStorage.getItem('modly-fishgift') === '1'; localStorage.setItem('modly-fishgift', '1'); } catch (_) { }
  if (got && skinOwned.includes('fish')) return false;
  unlockSkin('fish'); equipSkin('fish', true); if (mode === 'sea') poofSea(player.pos.clone().add(new V3(0, 1, 0)));
  [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.08 }));
  toast('Gavai ŽUVIES KOSTIUMĄ!', 'Jūrų Dievo dovana – oranžiniai žvynai, pelekai ir uodega', '#ff8a2a');
  return true;
}

// test world: "I passed the sea planet" – all 20 families helped at once, then the reward, the phone and the Sun
function testFinishOcean() {
  if (mode !== 'sea' || Q16.stage === 'done') return false;
  hideCard(); Q16.helped = OC.fams.length ? OC.fams.map(f => f.i) : Array.from({ length: 20 }, (_, i) => i).filter(i => !FAM_SKIP.includes(i)); Q16.bag = { food: 0, shell: 0, pearl: 0, baby: [] };
  toast('Bandymų pasaulis: jūrų planeta pereita!', 'Visos 18 žuvų šeimų jau laimingos', '#ffd23a');
  finishOcean(); return true;
}

// ---------- the Sun God's golden beam ----------
const inSun = () => { try { return localStorage.getItem('modly-insun') === '1'; } catch (_) { return false; } };
let sunPicking = false;
function sunPickup() {
  if (sunPicking || inSun() || mode !== 'sea') return; sunPicking = true; hideCard();
  for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  const beam = new THREE.Group(); beam.position.set(player.pos.x, 0, player.pos.z); seaScene.add(beam);
  const bm = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  beam.add(S(new THREE.CylinderGeometry(1, 1.6, 1, 24, 1, true), bm, 1.6, 60, 1.6, 0, 30, 0));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(4); beam.add(glow);
  toast('Saulės Dievė tave pasiima!', 'Auksinis saulės spindulys kelia tave iš jūros – tiesiai į SAULĘ!', '#ffb020');
  tone(196, 3, { to: 784, type: 'sine', vol: 0.08, attack: 0.5 }); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.05, when: 0.8 + i * 0.25 }));
  let t = 0; const y0 = player.pos.y;
  cinema = dt => {
    t += dt; bm.opacity = Math.min(0.55, t * 0.5); glow.material.opacity = Math.min(1, t);
    player.pos.y = y0 + Math.max(0, t - 0.8) ** 2 * 4; player.mesh.position.copy(player.pos); player.mesh.rotation.y += dt * 3; glow.position.y = player.pos.y + 1;
    const p = player.mesh.userData.parts; p.armL.rotation.set(-2.8, 0, 0.3); p.armR.rotation.set(-2.8, 0, -0.3);
    camera.position.lerp(_ct.set(player.pos.x + 9, Math.max(3, player.pos.y - 4), player.pos.z + 9), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.x, player.pos.y + 1, player.pos.z);
    if (t > 3.6 && !transitioning) {
      transitioning = true;
      fadeTo(() => { transitioning = false; cinema = null; sunPicking = false; seaScene.remove(beam); enterSun(); });
    }
  };
}

// ---------- the Sun ----------
const sunScene = new THREE.Scene(); sunScene.background = new THREE.Color(0x2a0a04); sunScene.fog = new THREE.Fog(0x5a1a06, 50, 280);
sunScene.add(new THREE.AmbientLight(0xffc890, 0.75)); sunScene.add(new THREE.HemisphereLight(0xffe0a0, 0xff5a10, 0.8));
{ const l = new THREE.DirectionalLight(0xfff0c0, 0.8); l.position.set(20, 80, 30); sunScene.add(l); }
const SUN = { built: false, boxes: [], jets: [], flames: [], flares: [], god: null, tex: null };
function sunGroundTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#ff7a10'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { const px = Math.random() * 512, py = Math.random() * 512, r = 14 + Math.random() * 26; const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,240,120,.95)'); g.addColorStop(0.6, 'rgba(255,190,40,.6)'); g.addColorStop(1, 'rgba(255,120,10,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = 'rgba(200,40,0,.55)'; x.lineWidth = 3;
  for (let i = 0; i < 40; i++) { x.beginPath(); let px = Math.random() * 512, py = Math.random() * 512; x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (Math.random() - 0.5) * 60; py += (Math.random() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); return t;
}
function makeFlameKid(col) {   // a little RAY person (spindulys): a glowing ball with rays all around
  const g = new THREE.Group();
  const add = new THREE.MeshBasicMaterial({ color: 0xffe680 });
  const body = S(G.sph, add, 0.5, 0.5, 0.5, 0, 0.8, 0); g.add(body);
  const top = new THREE.Group(); top.position.set(0, 0.8, 0); g.add(top);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, rc = S(G.cone, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd23a : col }), 0.13, 0.45, 0.13, Math.cos(a) * 0.72, Math.sin(a) * 0.72, -0.05); rc.rotation.z = a - Math.PI / 2; top.add(rc); }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd060, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(2.6); glow.position.y = 0.8; g.add(glow);
  for (const x of [-0.15, 0.15]) { g.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.11, 0.13, 0.05, x, 0.9, 0.44)); g.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0x2a1a00 }), 0.055, 0.065, 0.03, x, 0.9, 0.48)); }
  g.add(mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0xc85a00 }), 0, 0.7, 0.46).rotateZ(Math.PI));
  g.userData.top = top; g.userData.body = body; return g;
}
const SUN_KID_LINES = ['Mes – spinduliai! Kiekvieną rytą skrendam šviesti į visus pasaulius.', 'Vaiduokliai mus užpuolė! Jie bijo tik Saulės kardo…', 'Čia, prie Saulės Dievės, saugu. Toliau – pilna vaiduoklių!', 'Vaiduoklių pilis – toli, už tų ugnies arkų. Ten sėdi Vaiduoklių Karalius.', 'Mano broliukas pasiklydo tarp vaiduoklių… Prašau, padėk mums!', 'Tu žalias! O mes – geltoni ir šviesūs.', 'Kai vaiduokliai išnyks, mes vėl galėsim šviesti visur!'];
function buildSun() {
  if (SUN.built) return; SUN.built = true;
  SUN.tex = sunGroundTex();
  const ground = mesh(new THREE.CircleGeometry(400, 64), new THREE.MeshBasicMaterial({ map: SUN.tex }), 0, 0, 0); ground.rotation.x = -Math.PI / 2; sunScene.add(ground);
  // stars and the dark sky
  { const sv = []; for (let i = 0; i < 1200; i++) { const v = randDir(); if (v.y < 0.1) v.y = -v.y + 0.1; v.normalize().multiplyScalar(rr(260, 340)); sv.push(v.x, v.y, v.z); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); sunScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.4, color: 0xfff0d0, fog: false }))); }
  // far away: our little bubble world and the sea world as tiny planets
  { const w = S(G.sph, mat(0x6cd85e, { emissive: 0x1a4a10 }), 8, 8, 8, -120, 90, -230); w.material.fog = false; sunScene.add(w); const s = S(G.sph, mat(0x2a8ad8, { emissive: 0x0a2a4a }), 6, 6, 6, 90, 70, -250); s.material.fog = false; sunScene.add(s); }
  // giant solar flares – glowing arcs
  for (const [x, z, r, ry] of [[-90, -120, 40, 0.4], [110, -90, 30, -0.6], [-140, 40, 34, 1.4], [60, 140, 46, 2.2], [150, 60, 26, 1.0]]) {
    const a = mesh(new THREE.TorusGeometry(r, r * 0.08, 10, 40, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: 0.85 }), x, 0, z); a.rotation.y = ry; sunScene.add(a); SUN.flares.push(a);
    const a2 = mesh(new THREE.TorusGeometry(r * 1.02, r * 0.16, 8, 40, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff5010, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }), x, 0, z); a2.rotation.y = ry; sunScene.add(a2);
  }
  // fire fountains
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + rr(-0.2, 0.2), r = rr(18, 70), x = Math.cos(a) * r, z = Math.sin(a) * r - 10;
    const g = new THREE.Group(); g.position.set(x, 0, z); sunScene.add(g);
    g.add(S(G.cyl, mat(0x7a1a04, { roughness: 0.9 }), 1.2, 0.5, 1.2, 0, 0.25, 0));
    const f = S(G.cone, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }), 0.8, 4, 0.8, 0, 2.4, 0); g.add(f);
    const f2 = S(G.cone, new THREE.MeshBasicMaterial({ color: 0xff5010, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }), 1.1, 3, 1.1, 0, 1.9, 0); g.add(f2);
    SUN.jets.push({ g, f, f2, ph: rr(0, 9), sp: rr(0.6, 1.4) }); SUN.boxes.push({ x, z, hx: 1.2, hz: 1.2, h: 0.5 });
  }
  // cooled sun-stone rocks you can climb
  for (let i = 0; i < 26; i++) {
    const x = rr(-80, 80), z = rr(-90, 70); if (Math.hypot(x, z - 22) < 10 || Math.hypot(x, z + 34) < 16) continue;
    const w = rr(1.5, 4), h = rr(0.6, 2.6), d = rr(1.5, 4);
    const rock = S(new THREE.DodecahedronGeometry(1, 0), mat(0x4a1408, { roughness: 0.95, emissive: 0x200400, flatShading: true }), w * 0.62, h * 0.55, d * 0.62, x, h * 0.5, z); rock.rotation.y = rr(0, 6); sunScene.add(rock);
    SUN.boxes.push({ x, z, hx: w / 2, hz: d / 2, h });
  }
  // the Sun God – a giant made of golden light
  { const g = new THREE.Group(); g.position.set(0, 0, -34); sunScene.add(g); SUN.god = g;
    const gold = mat(0xffc81a, { metalness: 0.6, roughness: 0.3, emissive: 0x7a4a00 }), robe = mat(0xff8a10, { roughness: 0.6, emissive: 0x5a2000 }), skin = mat(0xffe08a, { emissive: 0x6a4a10 });
    g.add(S(G.cyl, robe, 4.5, 12, 4.5, 0, 6, 0)); g.add(S(G.cyl, gold, 4.7, 1, 4.7, 0, 0.5, 0)); g.add(S(G.cyl, gold, 4.6, 0.6, 4.6, 0, 9, 0));
    for (const sx of [-1, 1]) { const arm = S(G.cyl, robe, 1, 7, 1, sx * 5.2, 9, 0.5); arm.rotation.z = sx * 0.7; g.add(arm); g.add(S(G.sph, skin, 1, 1, 1, sx * 7.6, 6.6, 0.6)); }
    const head = new THREE.Group(); head.position.set(0, 15.5, 0); g.add(head); SUN.head = head;
    head.add(S(G.sph, skin, 3.4, 3.4, 3.4));
    for (const x of [-1.2, 1.2]) { head.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.65, 0.75, 0.3, x, 0.6, 3.05)); head.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0x8a3a00 }), 0.35, 0.4, 0.2, x, 0.55, 3.3)); }
    head.add(mesh(new THREE.TorusGeometry(0.8, 0.16, 8, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff4a7a }), 0, -1.1, 3.05).rotateZ(Math.PI));
    for (const x of [-1.2, 1.2]) for (let k = 0; k < 3; k++) { const l = S(G.box, new THREE.MeshBasicMaterial({ color: 0x3a1a00 }), 0.08, 0.35, 0.05, x - 0.3 + k * 0.3, 1.5, 3.25); l.rotation.z = (k - 1) * 0.4; head.add(l); }
    // long golden hair down the back
    const hair = mat(0xffb020, { emissive: 0x6a3a00, roughness: 0.5 });
    head.add(S(G.sph, hair, 3.6, 3.2, 3.4, 0, 0.6, -0.5));
    for (let k = 0; k < 7; k++) { const a = (k - 3) * 0.35; g.add(S(G.sph, hair, 1.1, 5.5, 0.9, Math.sin(a) * 3.2, 12, -1.8 - Math.cos(a) * 0.6)); }
    for (const x of [-2, 2]) head.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0xff8a6a, transparent: true, opacity: 0.6 }), 0.6, 0.4, 0.1, x, -0.6, 2.85));
    const rays = new THREE.Group(); head.add(rays); SUN.rays = rays;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = S(G.cone, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd23a : 0xff8a10 }), 0.9, i % 2 ? 3.4 : 2.4, 0.4, Math.cos(a) * 4.6, Math.sin(a) * 4.6, -0.4); r.rotation.z = a - Math.PI / 2; rays.add(r); }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd060, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(26); head.add(halo);
    const sign = mesh(new THREE.PlaneGeometry(9, 1.5), new THREE.MeshBasicMaterial({ map: labelTex('SAULĖS DIEVĖ', '#5a1a00', '#ffe14d', 512, 96), side: THREE.DoubleSide }), 0, 1.2, 5); g.add(sign);
    SUN.boxes.push({ x: 0, z: -34, hx: 5, hz: 5, h: 30 });
  }
  // little flame people
  SUN.kids = [];
  for (let i = 0; i < 9; i++) { const m = makeFlameKid(pick([0xff8a10, 0xff5a10, 0xffb020])); const a = rr(0, 6.28), r = rr(8, 40); m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 6); m.scale.setScalar(rr(0.9, 1.2)); sunScene.add(m); SUN.kids.push({ m, fwd: new V3(Math.cos(a), 0, Math.sin(a)), t: rr(1, 4), ph: rr(0, 9), hop: 0, line: SUN_KID_LINES[i % SUN_KID_LINES.length] }); }
  // floating embers
  SUN.embers = [];
  for (let i = 0; i < 70; i++) { const e = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: pick([0xffd23a, 0xff8a10, 0xffffff]), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); e.scale.setScalar(rr(0.2, 0.6)); e.position.set(rr(-70, 70), rr(0, 25), rr(-90, 60)); sunScene.add(e); SUN.embers.push(e); }
  linearize(sunScene);
}
function enterSun() {
  buildSun(); mode = 'sun'; sunScene.add(player.mesh); player.mesh.visible = true; musicSet(1); setScope(false);
  try { localStorage.setItem('modly-insun', '1'); localStorage.removeItem('modly-pos'); } catch (_) { }
  player.pos.set(0, 0, 22); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.3; player.up.set(0, 1, 0); player.grounded = true;
  camera.position.set(0, 5, 30); camera.up.set(0, 1, 0);
  $('bName').textContent = 'Saulė'; $('bEn').textContent = 'Saulės Dievės namai'; $('bAtm').textContent = 'Karštas auksinis paviršius, ugnies fontanai, spinduliai… ir vaiduokliai, kurie juos užpuolė.'; document.documentElement.style.setProperty('--biome', '#ffb020');
  if (!SUN.welcomed) { SUN.welcomed = true; setTimeout(() => toast('Tu SAULĖJE!', 'Saulės Dievė tave apsaugo – nesudegsi. Nueik pas ją (E)', '#ffb020'), 600); }
}
function sunHand(side) {
  hands[side].hold = true; sfx.whoosh(0.06);
  const hp = player.pos.clone().add(new V3(0, 1.4, 0)).addScaledVector(player.fwd, 1.1);
  for (let i = 0; i < 6; i++) { const e = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: pick([0xffd23a, 0xff8a10]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); e.scale.setScalar(0.35); e.position.copy(hp); sunScene.add(e); const v = randDir().multiplyScalar(2.5).addScaledVector(player.fwd, 2); let tt = 0; fx.push(d2 => { tt += d2; e.position.addScaledVector(v, d2); e.material.opacity = Math.max(0, 1 - tt * 1.5); if (tt > 0.7) { sunScene.remove(e); return false; } return true; }); }
  const k = nearKid(); if (k && Math.random() < 0.6) { k.hop = 1; bubbleIn(sunScene, k.m.position, pick(['Pšš!', 'Labas!', 'Hi hi!', 'Šilta!']), 1.8); }
}
function nearKid() { let best = null, bd = 3; for (const k of SUN.kids) { const d = Math.hypot(k.m.position.x - player.pos.x, k.m.position.z - player.pos.z); if (d < bd) { bd = d; best = k; } } return best; }
const nearSunGod = () => Math.hypot(player.pos.x - SUN.god.position.x, player.pos.z - SUN.god.position.z) < 13;
function sunAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  const k = nearKid(); if (k) { k.hop = 1; startTalk('Spindulys', [k.line], '#ffb020'); return; }
  if (nearSunGod()) { talkSunGod(); return; }
}
function talkSunGod() {
  if (ghostTalk()) return;
  startTalk('Saulės Dievė', [pick(['Kaip tau patinka mano Saulė? Čia niekada nebūna naktis!', 'Spinduliai tave labai pamilo. Jie sako, kad tu juokingai žalias!', 'Kiekvieną rytą aš pakeliu saulę virš visų pasaulių. Ir tavo burbulo – irgi!'])], '#ffb020');
}
try { SUN.met = localStorage.getItem('modly-sunmet') === '1'; } catch (_) { }
function updateSunWorld(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 10 : 6; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded) { player.vr = 8; player.grounded = false; sfx.whoosh(0.05); }
  player.vr -= 20 * dt;
  player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0; const rad = 0.4;
  for (const b of SUN.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.5) { if (b.h > ground) ground = b.h; } else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.pos.x = clamp(player.pos.x, -150, 150); player.pos.z = clamp(player.pos.z, -235, 150);
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 6.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1)); if (_ct.y < 0.5) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0)));
  // the sun is alive
  SUN.tex.offset.x = t * 0.004; SUN.tex.offset.y = Math.sin(t * 0.1) * 0.01;
  for (const j of SUN.jets) { const k = 0.6 + 0.5 * Math.abs(Math.sin(t * j.sp + j.ph)) + Math.random() * 0.1; j.f.scale.set(0.8, 4 * k, 0.8); j.f.position.y = 2 * k + 0.4; j.f2.scale.set(1.1, 3 * k, 1.1); j.f2.position.y = 1.5 * k + 0.4; }
  SUN.flares.forEach((a, i) => a.material.opacity = 0.7 + 0.2 * Math.sin(t * 1.5 + i));
  for (const e of SUN.embers) { e.position.y += dt * 1.5; if (e.position.y > 26) e.position.y = 0; }
  SUN.rays.rotation.z = t * 0.2; SUN.god.rotation.y = Math.atan2(player.pos.x - SUN.god.position.x, player.pos.z - SUN.god.position.z) * 0.3; SUN.head.position.y = 15.5 + Math.sin(t) * 0.2;
  for (const k of SUN.kids) {
    k.m.userData.top.rotation.z = t * 1.5 + k.ph; k.m.userData.top.scale.setScalar(1 + 0.1 * Math.sin(t * 6 + k.ph));
    k.hop = Math.max(0, k.hop - dt); k.t -= dt; if (k.t < 0) { k.t = rr(2, 5); k.fwd.applyAxisAngle(UP, rr(-2, 2)); }
    const near = Math.hypot(k.m.position.x - player.pos.x, k.m.position.z - player.pos.z) < 3;
    if (!near) k.m.position.addScaledVector(k.fwd, dt * 1.4);
    if (Math.hypot(k.m.position.x, k.m.position.z + 6) > 45) k.fwd.set(-k.m.position.x, 0, -k.m.position.z - 6).normalize();
    for (const b of SUN.boxes) if (Math.abs(k.m.position.x - b.x) < b.hx + 0.4 && Math.abs(k.m.position.z - b.z) < b.hz + 0.4) { k.fwd.negate(); k.m.position.addScaledVector(k.fwd, 0.3); }
    k.m.position.y = Math.abs(Math.sin(t * 4 + k.ph)) * 0.15 + Math.sin(k.hop * Math.PI) * 1.2;
    k.m.rotation.y = near ? Math.atan2(player.pos.x - k.m.position.x, player.pos.z - k.m.position.z) : Math.atan2(k.fwd.x, k.fwd.z);
  }
  let txt = '';
  if (!card) { const k = nearKid(); if (k) txt = '<kbd>E</kbd> kalbėtis su spinduliu'; else if (nearSunGod()) txt = '<kbd>E</kbd> kalbėtis su Saulės Dieve'; else txt = '<kbd>Space</kbd> – pašokti · pelės mygtukai – mosuoti rankomis'; }
  setPrompt(txt);
  updateQuestHud();
}
