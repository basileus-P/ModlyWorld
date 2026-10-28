// ================= THE VOID → YOU BECOME A GOD → BUILD YOUR OWN PLANET =================
// At the tea party something bad happens: the BLACK VOID opens outside the window and sucks the three plush toys
// away. Through the dark portal you go to the Void world: floating islands lead to the hole. Collect 5 CREATION LIGHTS
// (dark blobs push you off!), stand on the platform in front of the hole and press E – the Void closes, the toys come
// home and all the gods make you a GOD. Then you build YOUR OWN PLANET however you want.
const GOD = { stage: 'none', lights: [] };   // none | void | god
try { const s = JSON.parse(localStorage.getItem('modly-god') || 'null'); if (s) Object.assign(GOD, s); } catch (_) { }
function saveGod() { try { localStorage.setItem('modly-god', JSON.stringify(GOD)); } catch (_) { } }
const gL = (lt, en) => EN ? en : lt;
const GD = { evT: -1, portal: null, flying: [], halo: null };
// ---------- at the tea party ----------
const teaPlush = () => [TEA.chars[1], TEA.chars[3], TEA.chars[4]].filter(Boolean);
function godTeaRefresh() {
  if (!TEA.built) return;
  teaPlush().forEach(c => { c.obj.visible = GOD.stage !== 'void'; });
  if (GOD.stage === 'void' && !GD.portal) { const p = makeWorldPortal(); p.userData.ring.material = bmat(0x3a1a5a); p.userData.inner.material = new THREE.MeshBasicMaterial({ color: 0x0a0010, transparent: true, opacity: 0.85, side: THREE.DoubleSide }); p.position.set(-3, 0, -TEA_D + 1.2); teaScene.add(p); GD.portal = p; }
  if (GD.portal) GD.portal.visible = GOD.stage === 'void';
}
{ const _e = enterTea; enterTea = (...a) => { _e(...a); godTeaRefresh(); }; }
const nearVoidPortal = () => GD.portal && GD.portal.visible && Math.hypot(player.pos.x - GD.portal.position.x, player.pos.z - GD.portal.position.z) < 2;
{ const _a = teaAction; teaAction = () => { if (!card && nearVoidPortal()) { transitioning = true; tone(200, 0.8, { to: 60, type: 'sawtooth', vol: 0.05, lp: 600 }); fadeTo(() => { transitioning = false; enterVoid(); }); return; } _a(); }; }
{ const _u = updateTea; updateTea = (dt, t) => { _u(dt, t);
    if (GD.portal && GD.portal.visible) { const u = GD.portal.userData; u.sw.rotation.z -= dt * 2; u.ring.rotation.z += dt * 0.7; if (!card && nearVoidPortal()) setPrompt(gL('<kbd>E</kbd> į TUŠTUMĄ', '<kbd>E</kbd> into THE VOID')); }
    // the bad thing: a little after your first cup of tea
    if (GOD.stage === 'none' && TEA.sips >= 1 && GD.evT < 0) GD.evT = 5;
    if (GD.evT > 0 && !card) { GD.evT -= dt; if (GD.evT <= 0) godVoidEvent(); }
    for (let i = GD.flying.length - 1; i >= 0; i--) { const f = GD.flying[i]; f.t += dt; const k = Math.min(1, f.t / 1.4); f.obj.position.lerpVectors(f.from, f.to, k * k); f.obj.rotation.y += dt * 12; f.obj.scale.setScalar(1 - k * 0.8); if (k >= 1) { f.obj.visible = false; f.obj.scale.setScalar(1); f.obj.position.copy(f.from); GD.flying.splice(i, 1); } }
  }; }
function godVoidEvent() {
  GOD.stage = 'void'; GOD.lights = []; saveGod(); GD.evT = -2;
  shake = Math.max(shake, 1.2); redFlash('rgba(40,0,60,.7)', 600); noiseHit(1.5, { f: 200, fto: 40, vol: 0.3 });
  const win = new V3(-3, 3.2, -TEA_D + 0.3); teaPlush().forEach((c, i) => setTimeout(() => { GD.flying.push({ obj: c.obj, from: c.obj.position.clone(), to: win.clone(), t: 0 }); tone(600 - i * 100, 0.5, { to: 80, type: 'sine', vol: 0.05 }); }, 400 + i * 500));
  setTimeout(() => { godTeaRefresh(); teaPlush().forEach(c => c.obj.visible = false); startTalk(gL('Mama Dinozaurė', 'Mama Dinosaur'), [
    gL('O NE! Pažiūrėk pro langą! Tai JUODOJI TUŠTUMA – ji ryja viską, ką tik pasiekia!', 'OH NO! Look out of the window! It is THE BLACK VOID – it swallows everything it can reach!'),
    gL('Ji pagrobė mažylių pliušinius žaislus – Meškiuką, Zuikutę ir Drambliuką! Rexiukas ir Trikė verkia…', 'It took the little ones\' plush toys – Teddy, Bunny and Little Elephant! Rexy and Trixie are crying…'),
    gL('Sakoma, kad Tuštumą gali uždaryti tik tas, kuris turi 5 KŪRIMO ŠVIESAS. Jos plūduriuoja salose prie pat Tuštumos.', 'They say only someone with 5 CREATION LIGHTS can close the Void. They float on the islands right next to it.'),
    gL('Tas, kuris uždarys Tuštumą, taps tikru DIEVU. Prie lango atsivėrė tamsus portalas – E. Saugokis tamsiukų, jie stumdosi!', 'Whoever closes the Void becomes a real GOD. A dark portal opened by the window – E. Watch out for the dark blobs, they push!')], '#ff8ab8'); }, 2200);
}
// ---------- the Void world ----------
const voidScene = new THREE.Scene(); voidScene.background = new THREE.Color(0x0b0618); voidScene.fog = new THREE.Fog(0x0b0618, 40, 160);
voidScene.add(new THREE.AmbientLight(0x8a7aff, 0.55)); voidScene.add(new THREE.HemisphereLight(0xc8b0ff, 0x1a0a2a, 0.6));
const VD = { built: false, isl: [], lights: [], blobs: [], hole: null, last: 0, plat: null, toys: [] };
const VOID_HOLE = new V3(0, 25, -76), VOID_PLAT = new V3(0, 16.5, -63);
function buildVoid() {
  if (VD.built) return; VD.built = true; const g = new THREE.Group(); voidScene.add(g);
  { const pts = new Float32Array(1500 * 3); for (let i = 0; i < 1500; i++) { const d = randDir().multiplyScalar(rr(120, 260)); pts.set([d.x, d.y, d.z - 60], i * 3); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pts, 3)); g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, fog: false }))); }
  // the hole
  const h = new THREE.Group(); h.position.copy(VOID_HOLE); g.add(h); VD.hole = h;
  h.add(new THREE.Mesh(new THREE.SphereGeometry(7, 32, 20), new THREE.MeshBasicMaterial({ color: 0x000000 })));
  const disc = new THREE.Mesh(new THREE.TorusGeometry(11, 2.2, 10, 60), new THREE.MeshBasicMaterial({ color: 0x8a3aff, transparent: true, opacity: 0.7 })); disc.rotation.x = 1.3; h.add(disc); h.userData.disc = disc;
  const disc2 = new THREE.Mesh(new THREE.TorusGeometry(15, 1, 8, 60), new THREE.MeshBasicMaterial({ color: 0xff7a3a, transparent: true, opacity: 0.5 })); disc2.rotation.x = 1.3; h.add(disc2); h.userData.disc2 = disc2;
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x8a3aff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(45); h.add(gl);
  // the floating islands
  const rock = mat(0x5a4a6a, { roughness: 1 }), grass = mat(0x7a5ae8, { roughness: 0.8, emissive: 0x1a0a3a });
  for (let i = 0; i < 18; i++) { const x = Math.sin(i * 0.6) * 5, z = -i * 3.4, y = i * 0.9, r = i === 0 ? 3.5 : 1.6;
    const m = new THREE.Group(); m.position.set(x, y, z); m.add(S(G.cyl, grass, r, 0.35, r, 0, -0.18, 0)); m.add(S(G.cone, rock, r * 0.95, 2.2, r * 0.95, 0, -1.4, 0).rotateX(Math.PI)); g.add(m);
    VD.isl.push({ m, x, y, z, r, ph: i * 1.3 }); }
  { const m = new THREE.Group(); m.position.copy(VOID_PLAT); m.add(S(G.cyl, mat(0xfff4c8, { emissive: 0x3a2a00 }), 4.5, 0.4, 4.5, 0, -0.2, 0)); m.add(S(G.cone, rock, 4.2, 3, 4.2, 0, -1.9, 0).rotateX(Math.PI)); g.add(m); VD.plat = m;
    VD.isl.push({ m, x: VOID_PLAT.x, y: VOID_PLAT.y, z: VOID_PLAT.z, r: 4.5, ph: 0, still: true }); }
  // the 5 creation lights
  [3, 7, 10, 13, 16].forEach((ii, k) => { const L = new THREE.Group(); const col = [0xffe14d, 0x5ad8ff, 0xff5ab0, 0x7dff6b, 0xffffff][k]; L.add(S(G.sph, bmat(col), 0.35, 0.35, 0.35)); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(2.4); L.add(s); g.add(L); VD.lights.push({ L, isl: VD.isl[ii], k }); });
  // the plush toys float near the hole (they come home at the end)
  [makePlush('bear'), makePlush('bunny'), makePlush('elephant')].forEach((t, i) => { t.scale.setScalar(0.9); g.add(t); VD.toys.push({ t, a: i * 2.1 }); });
  // the dark blobs
  for (let i = 0; i < 5; i++) { const b = new THREE.Group(); b.add(S(G.sph, mat(0x1a0a2a, { roughness: 0.4, emissive: 0x0a0014 }), 0.9, 0.8, 0.9)); for (const x of [-0.3, 0.3]) b.add(S(G.sph, bmat(0xff3a3a), 0.12, 0.14, 0.08, x, 0.2, 0.8)); g.add(b); VD.blobs.push({ b, i: 3 + i * 3, ph: i * 1.7 }); }
  // the way back
  { const p = makeWorldPortal(); p.position.set(-2, 0, 2); g.add(p); VD.back = p; }
  linearize(g);
}
function enterVoid() {
  buildVoid(); if (typeof closeWorldPortal === 'function') closeWorldPortal(); setScope(false);
  mode = 'void'; voidScene.add(player.mesh); player.mesh.visible = true; player.up.set(0, 1, 0);
  VD.last = 0; voidSpawn(); player.pitch = 0.3; camera.position.set(0, 6, 10); camera.up.set(0, 1, 0); musicSet(5);
  VD.lights.forEach(l => { l.L.visible = !GOD.lights.includes(l.k); });
  $('bName').textContent = gL('Tuštuma', 'The Void'); $('bEn').textContent = '🕳'; $('bAtm').textContent = gL('Plūduriuojančios salos prie Juodosios Tuštumos. Surink 5 Kūrimo šviesas!', 'Floating islands next to the Black Void. Collect 5 Creation Lights!'); document.documentElement.style.setProperty('--biome', '#8a3aff');
  setTimeout(() => toast(gL('TUŠTUMA 🕳', 'THE VOID 🕳'), gL('Šokinėk per salas, rink 5 šviesas ir saugokis tamsiukų!', 'Jump across the islands, collect 5 lights and watch out for the dark blobs!'), '#8a3aff'), 600);
}
function voidSpawn() { const s = VD.isl[VD.last]; player.pos.set(s.m.position.x, s.m.position.y + 0.05, s.m.position.z + (VD.last === 0 ? 1 : 0)); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; player.fwd.set(0, 0, -1); }
function voidAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (VD.back && Math.hypot(player.pos.x - VD.back.position.x, player.pos.z - VD.back.position.z) < 2 && Math.abs(player.pos.y - VD.back.position.y) < 2) { transitioning = true; fadeTo(() => { transitioning = false; enterTea(); }); return; }
  if (Math.hypot(player.pos.x - VOID_PLAT.x, player.pos.z - VOID_PLAT.z) < 4.5 && Math.abs(player.pos.y - VOID_PLAT.y) < 2) {
    if (GOD.lights.length < 5) { startTalk(gL('Juodoji Tuštuma', 'The Black Void'), [gL(`…ŠŠŠŠŠ… Tau trūksta šviesų. Turi ${GOD.lights.length} iš 5.`, `…SHHHHH… You are missing lights. You have ${GOD.lights.length} of 5.`)], '#8a3aff'); return; }
    voidClose(); }
}
function voidClose() {
  hideCard(); for (const k in keys) keys[k] = false; let t = 0; const h = VD.hole; tone(100, 3, { to: 900, type: 'sine', vol: 0.06 });
  VD.lights.forEach((l, i) => { l.L.visible = true; l.L.position.copy(player.pos).add(new V3(Math.cos(i * 1.26) * 1.5, 2, Math.sin(i * 1.26) * 1.5)); });
  cinema = dt => { t += dt;
    VD.lights.forEach((l, i) => { l.L.position.lerp(VOID_HOLE, Math.min(1, dt * (t > 1 ? 1.5 : 0))); });
    if (t > 1.5) { const k = Math.max(0.01, 1 - (t - 1.5) / 2.5); h.scale.setScalar(k); h.userData.disc.rotation.z += dt * 8; }
    VD.toys.forEach((ty, i) => { if (t > 2) ty.t.position.lerp(_ct.set(VOID_PLAT.x + Math.cos(i * 2.1) * 2, VOID_PLAT.y + 0.1, VOID_PLAT.z + Math.sin(i * 2.1) * 2), Math.min(1, dt * 2)); });
    camera.position.lerp(_ct.set(VOID_PLAT.x + 10, VOID_PLAT.y + 6, VOID_PLAT.z + 12), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(VOID_HOLE);
    if (t > 4.4 && !transitioning) { transitioning = true; redFlash('rgba(255,255,255,1)', 900); h.visible = false; VD.lights.forEach(l => l.L.visible = false);
      fadeTo(() => { transitioning = false; cinema = null; GOD.stage = 'god'; saveGod(); godHalo(); bigBanner(gL('TUŠTUMA UŽVERTA!', 'THE VOID IS CLOSED!'), gL('Tu tapai DIEVU! 👑', 'You became a GOD! 👑'));
        [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.12 }));
        setTimeout(() => startTalk(gL('Kūrėjas', 'The Creator'), [
          gL('Tu uždarei Juodąją Tuštumą. Tokią galią turi tik dievai…', 'You closed the Black Void. Only gods have such power…'),
          gL('Visi dievai sutinka: Saulės Dievė, Jūrų Dievas, Laiko Dievas, Griaustinio Dievas, Vėjo Dievas ir Žvaigždžių Dievė. Nuo šiandien TU – DIEVAS! 👑', 'All the gods agree: the Sun Goddess, the Sea God, the God of Time, the God of Thunder, the Wind God and the Star Goddess. From today YOU are a GOD! 👑'),
          gL('Meškiukas, Zuikutė ir Drambliukas jau grįžo pas Rexiuką ir Trikę. Mama Dinozaurė labai dėkoja!', 'Teddy, Bunny and Little Elephant are back with Rexy and Trixie. Mama Dinosaur says thank you!'),
          gL('O dabar – tavo dovana: TAVO PLANETA. Kurk ją, kaip tik nori! Ją visada rasi per portalą (5).', 'And now – your gift: YOUR OWN PLANET. Build it however you want! You can always find it through the portal (5).')], '#ffe98a', () => { transitioning = true; fadeTo(() => { transitioning = false; enterMine(); }); }), 1200); }); }
  };
}
function updateVoid(dt, t) {
  // islands bob, lights float, blobs patrol
  for (const s of VD.isl) { const oy = s.m.position.y; if (!s.still) s.m.position.y = s.y + Math.sin(t * 0.9 + s.ph) * 0.35; s.dy = s.m.position.y - oy; }
  VD.lights.forEach(l => { if (!l.L.visible) return; l.L.position.set(l.isl.m.position.x, l.isl.m.position.y + 1.2 + Math.sin(t * 2 + l.k) * 0.15, l.isl.m.position.z); });
  VD.toys.forEach((ty, i) => { if (GOD.stage === 'god') return; ty.a += dt * 0.6; ty.t.position.set(VOID_HOLE.x + Math.cos(ty.a) * 13, VOID_HOLE.y + Math.sin(ty.a * 1.3) * 3, VOID_HOLE.z + Math.sin(ty.a) * 4); ty.t.rotation.y += dt * 2; });
  if (VD.hole && VD.hole.visible) { VD.hole.userData.disc.rotation.z += dt * 0.8; VD.hole.userData.disc2.rotation.z -= dt * 0.4; }
  VD.blobs.forEach(b => { const a = VD.isl[Math.min(VD.isl.length - 2, b.i)], c = VD.isl[Math.min(VD.isl.length - 2, b.i + 1)], k = (Math.sin(t * 0.7 + b.ph) + 1) / 2; b.b.position.set(a.m.position.x + (c.m.position.x - a.m.position.x) * k + Math.sin(t * 1.3 + b.ph) * 1.2, (a.m.position.y + c.m.position.y) / 2 + 1, a.m.position.z + (c.m.position.z - a.m.position.z) * k); b.b.lookAt(player.pos);
    if (b.b.position.distanceTo(player.pos.clone().add(new V3(0, 1, 0))) < 1.5 && !(GD.hitT > T - 1)) { GD.hitT = T; const push = player.pos.clone().sub(b.b.position); push.y = 0; push.normalize().multiplyScalar(9); player.vel.copy(push); player.vr = 6; player.grounded = false; noiseHit(0.3, { f: 300, fto: 80, vol: 0.2 }); toast(gL('Tamsiukas tave stumtelėjo!', 'A dark blob pushed you!'), '', '#8a3aff'); } });
  // walking + jumping on the islands
  const on = VD.on; if (on && player.grounded && on.dy) player.pos.y += on.dy;
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 10 : 6.2; _mv.multiplyScalar(sp); player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 2.5) * dt));
  if (keys.Space && player.grounded) { player.vr = 9; player.grounded = false; sfx.jump(); }
  player.vr -= 20 * dt; player.vr = Math.max(player.vr, -25); const py = player.pos.y; player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = -1e9, gb = null;
  for (const s2 of VD.isl) { const top = s2.m.position.y, d = Math.hypot(player.pos.x - s2.m.position.x, player.pos.z - s2.m.position.z); if (d < s2.r + 0.2 && py >= top - 0.4 && player.pos.y <= top + 0.05 && top > ground) { ground = top; gb = s2; } }
  if (gb && player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; VD.on = gb; const idx = VD.isl.indexOf(gb); if (idx > VD.last && !gb.still) VD.last = idx; } else { player.grounded = false; VD.on = null; }
  if (player.pos.y < VD.isl[VD.last].m.position.y - 15 || !isFinite(player.pos.y)) { voidSpawn(); redFlash('rgba(138,58,255,.5)', 300); toast(gL('Nukritai į tamsą…', 'You fell into the dark…'), gL('Grįžai ant paskutinės salos', 'Back on the last island'), '#8a3aff'); }
  // collect lights
  VD.lights.forEach(l => { if (!l.L.visible || GOD.lights.includes(l.k)) return; if (l.L.position.distanceTo(player.pos.clone().add(new V3(0, 1, 0))) < 1.6) { l.L.visible = false; GOD.lights.push(l.k); saveGod(); [784, 1047, 1319].forEach((fq, i) => tone(fq, 0.15, { type: 'triangle', vol: 0.06, when: i * 0.07 })); toast(gL(`Kūrimo šviesa! ${GOD.lights.length}/5 ✨`, `Creation Light! ${GOD.lights.length}/5 ✨`), GOD.lights.length >= 5 ? gL('Dabar – ant auksinės platformos prie Tuštumos ir spausk E!', 'Now – onto the golden platform by the Void and press E!') : '', '#ffe14d'); } });
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd); animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 7, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0))); applyShake(dt);
  if (VD.back) { VD.back.userData.sw.rotation.z -= dt * 3; }
  if (!card) { const onPlat = Math.hypot(player.pos.x - VOID_PLAT.x, player.pos.z - VOID_PLAT.z) < 4.5 && Math.abs(player.pos.y - VOID_PLAT.y) < 2;
    setPrompt(onPlat ? gL(`<kbd>E</kbd> uždaryti Tuštumą (${GOD.lights.length}/5 šviesų)`, `<kbd>E</kbd> close the Void (${GOD.lights.length}/5 lights)`) : VD.back && Math.hypot(player.pos.x - VD.back.position.x, player.pos.z - VD.back.position.z) < 2 ? gL('<kbd>E</kbd> atgal pas Mamą Dinozaurę', '<kbd>E</kbd> back to Mama Dinosaur') : `✨ ${GOD.lights.length}/5`); }
}
// ---------- the god's halo ----------
function godHalo() { if (GD.halo || GOD.stage !== 'god') return; const h = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 28), new THREE.MeshBasicMaterial({ color: 0xffe14d })); h.rotation.x = Math.PI / 2; h.position.y = 2.35; player.mesh.add(h); GD.halo = h; }
setTimeout(godHalo, 0);
fx.push(dt => { if (GD.halo) GD.halo.rotation.z += dt * 1.5; return true; });
// ======================= YOUR OWN PLANET (the god's builder) =======================
const MN_TYPES = [
  { lt: 'Žolė', en: 'Grass', c: 0x5ac84a }, { lt: 'Akmuo', en: 'Stone', c: 0x9a9aa2 }, { lt: 'Mediena', en: 'Wood', c: 0xa06a3a }, { lt: 'Plyta', en: 'Brick', c: 0xc8503a },
  { lt: 'Stiklas', en: 'Glass', c: 0xbfe8ff, glass: true }, { lt: 'Smėlis', en: 'Sand', c: 0xf0d890 }, { lt: 'Vanduo', en: 'Water', c: 0x3a8aff, glass: true }, { lt: 'Medis', en: 'Tree', obj: 'tree' },
  { lt: 'Gėlė', en: 'Flower', obj: 'flower' }, { lt: 'Šviesa', en: 'Light', c: 0xfff4a0, glow: true }, { lt: 'Sniegas', en: 'Snow', c: 0xffffff }, { lt: 'Auksas', en: 'Gold', c: 0xffd23a, metal: true },
  { lt: 'Rožinė', en: 'Pink', c: 0xff8ab8 }, { lt: 'Violetinė', en: 'Purple', c: 0x9a5aff }, { lt: 'Juoda', en: 'Black', c: 0x2a2a30 }, { lt: 'Dinozauriukas', en: 'Little dino', obj: 'dino' },
  { lt: 'Trintukas', en: 'Eraser', erase: true }
];
const MN_SKY = [[0x8fd8ff, 'Diena', 'Day'], [0xff9a6a, 'Saulėlydis', 'Sunset'], [0x0a1430, 'Naktis', 'Night'], [0xc8a0ff, 'Stebuklinga', 'Magic'], [0x9affc8, 'Mėtinė', 'Mint']];
const MN = { built: false, cells: new Map(), sel: 0, sky: 0, hud: null, hl: null, ray: new THREE.Raycaster(), saveT: 0, home: null };
try { const s = JSON.parse(localStorage.getItem('modly-myplanet') || 'null'); if (s) { MN.saved = s.b || []; MN.sky = s.sky || 0; } } catch (_) { }
const mineScene = new THREE.Scene(); mineScene.background = new THREE.Color(0x8fd8ff);
mineScene.add(new THREE.AmbientLight(0xffffff, 0.6)); mineScene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a5a, 0.6)); { const s = new THREE.DirectionalLight(0xffffff, 0.7); s.position.set(30, 60, 20); mineScene.add(s); }
const MN_BOX = new THREE.BoxGeometry(1, 1, 1), MN_MATS = {};
function mnMat(t) { const T = MN_TYPES[t]; if (MN_MATS[t]) return MN_MATS[t]; const m = T.glow ? new THREE.MeshBasicMaterial({ color: T.c }) : new THREE.MeshStandardMaterial({ color: T.c, roughness: T.metal ? 0.3 : 0.8, metalness: T.metal ? 0.6 : 0, transparent: !!T.glass, opacity: T.glass ? 0.55 : 1 }); m.color.convertSRGBToLinear(); return MN_MATS[t] = m; }
function mnMake(t) {
  const T = MN_TYPES[t];
  if (!T.obj) { const m = new THREE.Mesh(MN_BOX, mnMat(t)); m.position.y = 0.5; const g = new THREE.Group(); g.add(m); return g; }
  const g = new THREE.Group();
  if (T.obj === 'tree') { g.add(S(G.cyl, mat(0x8a5a2b), 0.18, 1.2, 0.18, 0, 0.6, 0)); g.add(S(G.sph, mat(0x3ac84a), 0.6, 0.6, 0.6, 0, 1.4, 0)); }
  if (T.obj === 'flower') { g.add(S(G.cyl, mat(0x3ac84a), 0.04, 0.5, 0.04, 0, 0.25, 0)); const c = pick([0xff4a6a, 0xffd23a, 0xff8ab8, 0x8a5aff]); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.add(S(G.sph, mat(c), 0.12, 0.05, 0.12, Math.cos(a) * 0.12, 0.55, Math.sin(a) * 0.12)); } g.add(S(G.sph, mat(0xffd23a), 0.07, 0.07, 0.07, 0, 0.56, 0)); }
  if (T.obj === 'dino') { const d = makeTeaDino(pick([0x5ac85a, 0x4ab0ff, 0xff8ab8, 0xffa23a]), 0xfff4d8, 0.35, false); g.add(d); }
  linearize(g); return g;
}
const mnKey = (x, y, z) => x + ',' + y + ',' + z;
function mnPut(x, y, z, t, quiet) {
  const k = mnKey(x, y, z); if (MN.cells.has(k) || MN.cells.size >= 5000) return false;
  const g = mnMake(t); g.position.set(x, y, z); g.userData.cell = [x, y, z, t]; g.traverse(o => { o.userData.cellRoot = g; }); mineScene.add(g); MN.cells.set(k, g);
  if (!quiet) { tone(400 + t * 30, 0.06, { type: 'triangle', vol: 0.04 }); MN.saveT = 1; } return true;
}
function mnDel(g) { const [x, y, z] = g.userData.cell; mineScene.remove(g); MN.cells.delete(mnKey(x, y, z)); tone(200, 0.08, { to: 120, type: 'square', vol: 0.03, lp: 900 }); MN.saveT = 1; }
function mnSave() { try { localStorage.setItem('modly-myplanet', JSON.stringify({ sky: MN.sky, b: [...MN.cells.values()].map(g => g.userData.cell) })); } catch (_) { } }
function buildMine() {
  if (MN.built) return; MN.built = true; const g = new THREE.Group(); mineScene.add(g);
  const ground = S(G.box, mat(0x6ac85a), 81, 1, 81, 0, -0.5, 0); g.add(ground); MN.ground = ground;
  g.add(S(G.box, mat(0x8a5a3a), 79, 4, 79, 0, -3, 0)); g.add(S(G.cone, mat(0x6a4a3a), 40, 22, 40, 0, -16, 0).rotateX(Math.PI));
  for (let i = 0; i < 40; i++) g.add(S(G.sph, mat(0xffffff, { roughness: 1 }), rr(5, 10), rr(2, 3), rr(5, 9), rr(-150, 150), rr(25, 70), rr(-150, 150)));
  { const p = makeWorldPortal(); p.position.set(0, 0, 36); g.add(p); MN.home = p; const s = makeSign(gL('Namo', 'Home')); s.position.set(2.3, 0, 36); g.add(s); }
  { const s = makeSign(gL('Mano planeta', 'My planet')); s.position.set(-3, 0, 32); s.scale.setScalar(1.6); g.add(s); }
  linearize(g);
  MN.hl = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 })); mineScene.add(MN.hl);
  (MN.saved || []).forEach(([x, y, z, t]) => mnPut(x, y, z, t, true));
}
function enterMine() {
  if (GOD.stage !== 'god') { toast(gL('Dar ne! 🔒', 'Not yet! 🔒'), gL('Pirmiausia tapk DIEVU – uždaryk Juodąją Tuštumą', 'First become a GOD – close the Black Void'), '#ffe14d'); return; }
  buildMine(); if (typeof closeWorldPortal === 'function') closeWorldPortal(); setScope(false);
  mode = 'mine'; mineScene.add(player.mesh); player.mesh.visible = true; player.up.set(0, 1, 0); godHalo();
  player.pos.set(0, 2, 30); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.35; mnSky(MN.sky);
  camera.position.set(0, 8, 38); camera.up.set(0, 1, 0); musicSet(0);
  $('bName').textContent = gL('Mano planeta', 'My planet'); $('bEn').textContent = '👑'; $('bAtm').textContent = gL('Tu – dievas. Kurk, ką tik nori!', 'You are a god. Build whatever you want!'); document.documentElement.style.setProperty('--biome', '#ffe14d');
  setTimeout(() => toast(gL('TAVO PLANETA 👑', 'YOUR PLANET 👑'), gL('Kairysis pelės – dėti · dešinysis arba Trintukas – nuimti · 1–0 – pasirinkti · Q – kitas puslapis (sniegas, auksas, rožinė, violetinė, juoda, dinozauriukas, trintukas) · Space/Shift – aukštyn/žemyn · C – dangus', 'Left mouse – place · right or the Eraser – remove · 1–0 – choose · Q – next page (snow, gold, pink, purple, black, little dino, eraser) · Space/Shift – up/down · C – sky'), '#ffe14d'), 600);
}
function mnSky(i) { MN.sky = i; mineScene.background = new THREE.Color(MN_SKY[i][0]); MN.saveT = 1; }
function mnTarget() {
  if (!MN.ground) return null;
  MN.ray.setFromCamera({ x: 0, y: 0 }, camera); const list = [MN.ground, ...MN.cells.values()];
  const hit = MN.ray.intersectObjects(list, true).find(h => h.distance < 40); if (!hit) return null;
  const root = hit.object.userData.cellRoot;
  if (root) { const [x, y, z, t] = root.userData.cell; const n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new V3(0, 1, 0); const solidBlock = !MN_TYPES[t].obj;
    return { root, place: solidBlock ? [x + Math.round(n.x), y + Math.round(n.y), z + Math.round(n.z)] : null }; }
  const p = hit.point; return { root: null, place: [Math.round(p.x), 0, Math.round(p.z)] };
}
function mineHand(side) {
  hands[side].hold = true; setTimeout(() => { hands[side].hold = false; }, 150);
  const tg = mnTarget(); if (!tg) return;
  if (side === 'R' || MN_TYPES[MN.sel].erase) { if (tg.root) mnDel(tg.root); return; }
  if (!tg.place) return; const [x, y, z] = tg.place; if (Math.abs(x) > 40 || Math.abs(z) > 40 || y < 0 || y > 40) return;
  if (Math.abs(player.pos.x - x) < 0.8 && Math.abs(player.pos.z - z) < 0.8 && player.pos.y < y + 1 && player.pos.y + 2 > y) return;   // not inside yourself
  mnPut(x, y, z, MN.sel);
}
function mineAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (MN.home && player.pos.distanceTo(MN.home.position) < 3) { mnSave(); fadeTo(() => { portalToPlanet(); toast(gL('Grįžai namo', 'Back home'), gL('Savo planetą rasi per portalą (5)', 'Find your planet through the portal (5)'), '#ffe14d'); }); }
}
addEventListener('keydown', e => {
  if (mode !== 'mine' || !started || card) return;
  const m = /^Digit([0-9])$/.exec(e.code); if (m) { e.stopImmediatePropagation(); e.preventDefault(); const pg = Math.floor(MN.sel / 10), i = pg * 10 + (+m[1] + 9) % 10; if (i < MN_TYPES.length) MN.sel = i; return; }
  if (e.code === 'KeyQ') { e.stopImmediatePropagation(); const pg = Math.floor(MN.sel / 10) ? 0 : 1; MN.sel = Math.min(MN_TYPES.length - 1, pg * 10 + MN.sel % 10); tone(660, 0.06, { type: 'triangle', vol: 0.04 }); return; }
  if (e.code === 'KeyC') { e.stopImmediatePropagation(); mnSky((MN.sky + 1) % MN_SKY.length); toast(gL('Dangus: ', 'Sky: ') + gL(MN_SKY[MN.sky][1], MN_SKY[MN.sky][2]), '', '#ffe14d'); }
  if (['KeyF', 'KeyR', 'KeyT', 'KeyX', 'KeyB'].includes(e.code)) { e.stopImmediatePropagation(); }
}, true);
addEventListener('wheel', e => { if (mode !== 'mine' || !started) return; MN.sel = (MN.sel + (e.deltaY > 0 ? 1 : MN_TYPES.length - 1)) % MN_TYPES.length; }, { passive: true });
function updateMine(dt, t) {
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), v = (keys.Space ? 1 : 0) - (keys.ShiftLeft || keys.ShiftRight ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize(); _mv.multiplyScalar(10); _mv.y = v * 8;
  player.vel.lerp(_mv, Math.min(1, dt * 6)); player.pos.addScaledVector(player.vel, dt);
  player.pos.x = Math.max(-60, Math.min(60, player.pos.x)); player.pos.z = Math.max(-60, Math.min(60, player.pos.z)); player.pos.y = Math.max(0, Math.min(60, player.pos.y));
  player.mesh.position.copy(player.pos).add(new V3(0, Math.sin(t * 2) * 0.1, 0)); orient(player.mesh, UP, player.fwd); animateMan(dt, false, 0);
  const dist = 7, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0)));
  if (MN.home) { MN.home.userData.sw.rotation.z -= dt * 3; }
  // the target highlight
  const tg = mnTarget(), er = MN_TYPES[MN.sel].erase; MN.hl.material.color.setHex(er ? 0xff3a3a : 0xffffff);
  if (tg && !card && er && tg.root) { MN.hl.visible = true; const c = tg.root.userData.cell; MN.hl.position.set(c[0], c[1] + 0.5, c[2]); } else if (tg && tg.place && !card && !er) { MN.hl.visible = true; MN.hl.position.set(tg.place[0], tg.place[1] + 0.5, tg.place[2]); } else MN.hl.visible = false;
  if (MN.saveT > 0) { MN.saveT -= dt; if (MN.saveT <= 0) mnSave(); }
  // hotbar
  if (!MN.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:4px;z-index:6;pointer-events:none;flex-wrap:wrap;justify-content:center;max-width:96vw'; document.body.appendChild(d); MN.hud = d;
    const ch = document.createElement('div'); ch.style.cssText = 'position:fixed;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border:2px solid #fff;border-radius:50%;z-index:6;pointer-events:none;box-shadow:0 0 4px #000'; document.body.appendChild(ch); MN.cross = ch; }
  MN.hud.hidden = false; MN.cross.hidden = false;
  if (MN.hudSel !== MN.sel) { MN.hudSel = MN.sel; const pg = Math.floor(MN.sel / 10); MN.hud.innerHTML = `<div style="width:100%;text-align:center;font:800 12px system-ui;color:#fff;text-shadow:0 1px 3px #000">${gL(`${pg + 1} puslapis · Q – kitas puslapis · skaičiai – pasirinkti`, `Page ${pg + 1} · Q – next page · numbers – choose`)}</div>` + MN_TYPES.map((T, i) => { const cur = Math.floor(i / 10) === pg; return `<div style="background:${i === MN.sel ? 'rgba(255,225,77,.95)' : 'rgba(20,20,30,.75)'};color:${i === MN.sel ? '#1a1a1a' : '#fff'};opacity:${cur ? 1 : 0.45};border-radius:8px;padding:3px 6px;font:700 12px system-ui;display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${T.erase ? '#ff3a3a' : T.c != null ? '#' + T.c.toString(16).padStart(6, '0') : T.obj === 'tree' ? '#3ac84a' : T.obj === 'flower' ? '#ff4a6a' : '#5ac85a'}">${T.erase ? '✖' : ''}</span>${cur ? `<small>${(i % 10 + 1) % 10}</small>` : ''} ${gL(T.lt, T.en)}</div>`; }).join(''); }
  if (!card) setPrompt(MN.home && player.pos.distanceTo(MN.home.position) < 3 ? gL('<kbd>E</kbd> grįžti namo', '<kbd>E</kbd> go home') : '');
}
fx.push(() => { if (mode !== 'mine') { if (MN.hud) MN.hud.hidden = true; if (MN.cross) MN.cross.hidden = true; } return true; });
// world portal (5): your planet + the Void (while it is open)
setTimeout(() => { if (typeof PG_DEST !== 'undefined') PG_DEST.push({ name: gL('Mano planeta 👑', 'My planet 👑'), icon: '🌍', go: () => { if (GOD.stage === 'god') enterMine(); else { portalToPlanet(); toast(gL('Dar ne! 🔒', 'Not yet! 🔒'), gL('Pirmiausia tapk DIEVU – uždaryk Juodąją Tuštumą', 'First become a GOD – close the Black Void'), '#ffe14d'); } } }); }, 0);
{ const _d = doTeleport; doTeleport = (...a) => { if (mode === 'void' || mode === 'mine') return; return _d(...a); }; }
function godTest(n) { if (typeof Q29 !== 'undefined') { Q29.stage = 'done'; saveQ29(); } TEA.invited = true; try { localStorage.setItem('modly-teainv', '1'); } catch (_) { } GOD.stage = n >= 2 ? 'god' : n >= 1 ? 'void' : 'none'; GOD.lights = n >= 1.5 ? [0, 1, 2, 3, 4] : []; saveGod(); hideCard(); if (n >= 2) enterMine(); else if (n >= 1) enterVoid(); else enterTea(); }
// ---------- test world (one time, only on claude.ai – never in the public GitHub game): straight to Mama Dinosaur's tea ----------
{ let done = !!window.MODLY_PUBLIC; try { if (localStorage.getItem('modly-teajump') === '1') done = true; } catch (_) { }
  fx.push(() => {
    if (done || !started || mode === 'attract' || card || cinema || transitioning) return true;
    done = true; try { localStorage.setItem('modly-teajump', '1'); } catch (_) { }
    if (Date.now() > Date.UTC(2026, 10, 30)) return true;
    setTimeout(() => { try { hideCard(); if (typeof Q29 !== 'undefined' && Q29.stage !== 'done') { Q29.stage = 'done'; saveQ29(); } TEA.invited = true; localStorage.setItem('modly-teainv', '1'); if (GOD.stage === 'void') { GOD.stage = 'none'; GOD.lights = []; saveGod(); } transitioning = true; fadeTo(() => { transitioning = false; enterTea(); }); } catch (e) { console.error(e); } }, 700);
    return true; }); }
