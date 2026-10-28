// ================= Write in the gods' group: "BUM BUM" → the THUNDER GOD (a dragon made of lightning) takes you =================
const Q20 = { called: false, chat: [] };
try { const s = JSON.parse(localStorage.getItem('modly-quest20') || 'null'); if (s) Object.assign(Q20, s); } catch (_) { }
function saveQ20() { try { localStorage.setItem('modly-quest20', JSON.stringify(Q20)); } catch (_) { } }
const inThunder = () => { try { return localStorage.getItem('modly-inthunder') === '1'; } catch (_) { return false; } };
const GOD_COL = { 'Kūrėjas': '#ffe98a', 'Laiko Dievas': '#b0ff9a', 'Saulės Dievė': '#ffb86a', 'Jūrų Dievas': '#8fd8ff', 'Griaustinio Dievas': '#c8b0ff' };
function godAnswer(txt) {
  const t = txt.toLowerCase().replace(/[!.,?]/g, ' ').replace(/\s+/g, ' ').trim();
  if (/(bum|boom)\s*(bum|boom)/.test(t)) return [['Griaustinio Dievas', 'BUM BUM!!! TAIP! Tai mano slaptas žodis! ATSKRENDU TAVĘS PASIIMTI! ⚡'], ['Kūrėjas', 'Laikykis tvirtai, žaliasis!']];
  if (/^(bum|boom)$|^(bum|boom) /.test(t)) return [['Griaustinio Dievas', 'Tik vienas BUM? Griaustinis visada griaudžia DU kartus…']];
  if (/griaustin|perkūn|žaib|zaib|drakon|thunder|lightning/.test(t)) return [['Griaustinio Dievas', 'Kas mane šaukia? Jei nori pas mane – parašyk mano slaptą žodį. Jis skamba kaip griaustinis… du kartus!']];
  if (/labas|sveik|hey|hi|hello/.test(t)) return [[pick(['Kūrėjas', 'Saulės Dievė', 'Jūrų Dievas', 'Laiko Dievas']), pick(['Labas, didvyri!', 'Sveikas grupėje!', 'Labas labas!'])]];
  if (/ačiū|aciu|thank/.test(t)) return [['Saulės Dievė', 'Tai MES tau dėkojame! ☀']];
  if (/kaip|ką|ka |kodėl|kodel|how|what|why|\?/.test(txt)) return [['Laiko Dievas', 'Tik tak… geras klausimas. Paklausk Griaustinio Dievo – jis tavęs laukia.']];
  return [[pick(Object.keys(GOD_COL)), pick(['Cha cha!', 'Įdomu…', 'BUM! …atsiprašau, tai ne aš.', 'Blub!', 'Tik tak.', 'Gerai pasakyta!'])]];
}
mpGods = b => {
  Q19.seenGods = true; saveQ19(); mpNotif = '';
  const base = [['Kūrėjas', 'Ei, dievai! Žaliasis žmogeliukas dabar irgi mūsų grupėje!'], ['Laiko Dievas', 'Tik tak! Jis pakvietė 10 meistrų, ir jie pataisė mano Praeities Laikrodį!'], ['Saulės Dievė', 'Sveikas atvykęs į grupę, didvyri! ☀'], ['Jūrų Dievas', 'Blub blub! Sveikas!'], ['Griaustinio Dievas', 'BUM! Pagaliau! Žaliasi, TAVĘS man reikia. Mano audrų pasaulyje didelė bėda…'], ['Griaustinio Dievas', 'Kai būsi pasiruošęs – parašyk man mano slaptą žodį. BUM BUM!']];
  if (typeof Q21 !== 'undefined' && Q21.stage === 'done') base.push(['Griaustinio Dievas', 'BUM BUM BUM! Žaliasis nukasė iki pat dugno ir susprogdino visus 100 kamščių! Pas mane vėl lyja visą dieną!'], ['Vėjo Dievas', 'Fiuuu… Kas? Kažkas išgelbėjo Griaustinio planetą? Jei tai tu – parašyk čia, ką padarei.']);
  if (typeof Q23 !== 'undefined' && Q23.stage === 'done') base.push(['Vėjo Dievas', 'Fiuuu! Žaliasis sustabdė mano pasaulio sukimąsi! Dabar tik 3 km/h!'], ['Žvaigždžių Dievė', 'Hmm… Visiems dievams padėjai. Visiems… na, beveik visiems. ✨']);
  const all = base.concat(Q20.chat);
  b.innerHTML = `<div class="mpH">⚡ Dievų grupė</div><div id="mpLog" style="display:flex;flex-direction:column;padding-bottom:6px">${all.map(([w, t]) => w === 'me' ? `<div class="mpMsg me">${t.replace(/</g, '&lt;')}</div>` : `<div style="padding:2px 12px;font-size:12px;font-weight:800;color:${GOD_COL[w] || '#fff'}">${w}</div><div class="mpMsg them" style="margin-top:0">${t.replace(/</g, '&lt;')}</div>`).join('')}</div>
  <div style="position:sticky;bottom:0;display:flex;gap:6px;padding:8px;background:#0c0c14"><input id="mpIn" placeholder="Rašyk dievams…" maxlength="120"><button class="mpBtn go" id="mpSend">➤</button></div>`;
  const send = () => {
    const v = $('mpIn').value.trim(); if (!v) return; Q20.chat.push(['me', v]); saveQ20(); mpShow('gods', true); tone(1200, 0.05, { type: 'triangle', vol: 0.03 });
    const ans = godAnswer(v); let d = 900;
    ans.forEach(a => { setTimeout(() => { Q20.chat.push(a); saveQ20(); if (mPhoneOpen && mpScreen === 'gods') mpShow('gods', true); tone(a[0] === 'Griaustinio Dievas' ? 180 : 900, 0.12, { type: a[0] === 'Griaustinio Dievas' ? 'sawtooth' : 'triangle', vol: 0.05, lp: 1500 }); }, d); d += 1100; });
    if (/bum\s*bum/i.test(v.replace(/[!.,?]/g, ' ')) && !inThunder()) { Q20.called = true; saveQ20(); setTimeout(() => { if (mPhoneOpen) closeMPhone(); }, d + 900); }
    if (starCallOk(v)) { Q24.called = true; saveQ24(); setTimeout(() => { if (mPhoneOpen) closeMPhone(); }, d + 900); }
    if (windCallOk(v)) { Q22.called = true; saveQ22(); setTimeout(() => { if (mPhoneOpen) closeMPhone(); }, d + 900); }
  };
  $('mpSend').onclick = send; $('mpIn').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') send(); if (e.key === 'Escape') closeMPhone(); };
  setTimeout(() => { try { $('mpIn').focus(); } catch (_) { } $('mpBody').scrollTop = 1e6; }, 30);
};

// ---------- the Thunder God: a dragon made of lightning ----------
function makeThunderDragon(scale = 1) {
  const g = new THREE.Group(); g.scale.setScalar(scale);
  const core = new THREE.MeshStandardMaterial({ color: 0x9ad8ff, emissive: 0x4a8aff, emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.2 }), bright = new THREE.MeshBasicMaterial({ color: 0xffffff }), yellow = new THREE.MeshBasicMaterial({ color: 0xffe14d });
  const segs = [];
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Group(); g.add(s); const r = 1.3 - i * 0.055;
    s.add(S(G.sph, core, r, r, r)); s.add(S(G.sph, bright, r * 0.45, r * 0.45, r * 0.45));
    if (i % 2 === 0 && i < 16) { const sp = S(G.cone, yellow, 0.25 * r, 1.1 * r, 0.12, 0, r * 0.95, 0); sp.rotation.z = 0.25; s.add(sp); }
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x6ab8ff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(r * 4); s.add(gl);
    segs.push(s);
  }
  // the head
  const head = segs[0];
  head.add(S(G.box, core, 1.1, 0.7, 1.8, 0, -0.1, 1.2)); head.add(S(G.box, core, 0.9, 0.3, 1.3, 0, -0.55, 1.2));
  for (const x of [-0.45, 0.45]) { head.add(S(G.sph, yellow, 0.22, 0.16, 0.16, x, 0.25, 1.5)); head.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0x1a1a40 }), 0.08, 0.12, 0.05, x, 0.25, 1.64)); }
  for (const x of [-0.5, 0.5]) { const h = S(G.cone, yellow, 0.18, 1.6, 0.18, x, 0.9, -0.3); h.rotation.x = -0.9; h.rotation.z = -x * 0.6; head.add(h); }
  for (const x of [-0.3, 0.3]) head.add(S(G.cone, bright, 0.06, 0.3, 0.06, x, -0.45, 1.9).rotateX(Math.PI));
  // lightning-bolt wings
  const wings = []; for (const sx of [-1, 1]) { const w = new THREE.Group(); w.position.set(sx * 0.9, 0.4, 0); segs[4].add(w); const shp = new THREE.Shape(); shp.moveTo(0, 0); shp.lineTo(sx * 1.5, 1.2); shp.lineTo(sx * 1.1, 1.3); shp.lineTo(sx * 2.8, 2.6); shp.lineTo(sx * 2.2, 2.6); shp.lineTo(sx * 4.2, 4); shp.lineTo(sx * 1.8, 1.9); shp.lineTo(sx * 2.3, 1.85); shp.lineTo(0, 0.4); const m = new THREE.Mesh(new THREE.ShapeGeometry(shp), new THREE.MeshBasicMaterial({ color: 0xffe14d, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })); m.rotation.x = -Math.PI / 2 + 0.3; w.add(m); wings.push(w); }
  g.userData = { segs, head, wings }; return g;
}
// lay the body along a wavy path behind the head (head at 0, direction -z of the group, body trailing to +z)
function poseDragon(d, t, coil = 0) {
  const { segs, wings } = d.userData;
  if (coil) segs.forEach((s, i) => {   // reared up like a cobra: neck and head high, body coiled on the cloud
    if (i < 7) s.position.set(Math.sin(t * 1.5 - i * 0.5) * 0.3 * i / 7, (7 - i) * 0.95 + Math.sin(t * 2) * 0.2 * (7 - i) / 7, i * 0.45);
    else { const a = (i - 7) * 0.62 + t * 0.2; s.position.set(Math.sin(a) * coil, Math.max(0, 0.6 - (i - 7) * 0.05), 3 + Math.cos(a) * coil * 0.9 - coil * 0.9); }
  });
  else segs.forEach((s, i) => { const k = i * 1.05; s.position.set(Math.sin(t * 3 - i * 0.6) * (0.6 + i * 0.05), Math.sin(t * 2 - i * 0.5) * 0.5, k); });
  segs[0].rotation.y = Math.PI; segs[0].rotation.x = Math.sin(t * 2) * 0.15;
  wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * Math.sin(t * 6) * 0.5);
}
function zapLine(scene, a, b, col = 0xdff0ff, life = 0.25) {
  const pts = [a.clone()]; for (let i = 1; i < 8; i++) { const p = a.clone().lerp(b, i / 8); p.x += rr(-0.6, 0.6) * a.distanceTo(b) / 10; p.y += rr(-0.6, 0.6) * a.distanceTo(b) / 10; p.z += rr(-0.6, 0.6) * a.distanceTo(b) / 10; pts.push(p); } pts.push(b.clone());
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col, transparent: true })); scene.add(l);
  let k = 0; fx.push(dt => { k += dt; l.material.opacity = Math.max(0, 1 - k / life); if (k > life) { scene.remove(l); l.geometry.dispose(); return false; } return true; });
}
// ---------- the pickup: he swoops down into the Time world and carries you away ----------
let thunderPicking = false;
{ const _u = updateTimeWorld; updateTimeWorld = (dt, t) => { _u(dt, t); if (Q20.called && !inThunder() && !thunderPicking && !mPhoneOpen && !card && !cinema && !transitioning) thunderPickup(); }; }
function thunderPickup() {
  thunderPicking = true; hideCard(); for (const k in keys) keys[k] = false;
  const d = makeThunderDragon(1.2); twScene.add(d); linearize(d);
  const pp = player.pos.clone(); let t = 0, grabbed = false;
  toast('BUM BUM! Atskrenda Griaustinio Dievas!', 'Jis – drakonas iš žaibo!', '#c8b0ff');
  noiseHit(1.2, { f: 300, fto: 60, vol: 0.3 }); setTimeout(() => noiseHit(1.2, { f: 300, fto: 60, vol: 0.3 }), 500); shake = Math.max(shake, 1); redFlash('rgba(200,220,255,.8)', 400);
  cinema = dt => {
    t += dt; poseDragon(d, t);
    if (t < 3) { const a = t * 1.6, r = 30 - t * 9; d.position.set(pp.x + Math.cos(a) * r, 25 - t * 7, pp.z + Math.sin(a) * r); d.lookAt(pp.x, d.position.y - 2, pp.z); d.rotateY(Math.PI); }
    else { if (!grabbed) { grabbed = true; noiseHit(0.6, { f: 2000, fto: 200, vol: 0.25 }); redFlash('rgba(255,255,255,.7)', 300); bubbleIn(twScene, pp.clone().add(new V3(0, 3, 0)), 'BUM BUM!', 2.6); }
      d.position.y += dt * (6 + (t - 3) * 10); d.rotation.y += dt * 0.8; player.pos.copy(d.position).add(new V3(0, 1.4, 0)); player.mesh.position.copy(player.pos); }
    if (Math.random() < dt * 4) zapLine(twScene, d.position.clone().add(new V3(0, 30, 0)), d.position.clone(), 0xdff0ff, 0.2);
    camera.position.lerp(_ct.set(pp.x + 16, pp.y + 8 + Math.max(0, t - 3) * 8, pp.z + 16), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(t < 3 ? d.position : player.pos);
    if (t > 5.5 && !transitioning) { transitioning = true; fadeTo(() => { transitioning = false; cinema = null; thunderPicking = false; twScene.remove(d); enterThunder(); }); }
  };
}

// ---------- the Thunder God's storm world ----------
const thScene = new THREE.Scene(); thScene.background = new THREE.Color(0x1a1830); thScene.fog = new THREE.Fog(0x22203a, 30, 160);
thScene.add(new THREE.AmbientLight(0xb0b8ff, 0.5)); thScene.add(new THREE.HemisphereLight(0x8a90d0, 0x2a2840, 0.6));
const thFlash = new THREE.DirectionalLight(0xdfe8ff, 0); thFlash.position.set(10, 60, 10); thScene.add(thFlash);
const THW = { built: false, boxes: [], rain: null, dragon: null, flashT: 2, met: false };
try { THW.met = localStorage.getItem('modly-thundermet') === '1'; } catch (_) { }
function stormCloud(g, x, y, z, w, d, col = 0x5a5a72) { const m = mat(col, { roughness: 1 }); for (let i = 0; i < Math.ceil(w * d / 6) + 3; i++) { const s = rr(1.4, 2.6); g.add(S(G.sph, m, s, s * 0.55, s, x + rr(-w / 2, w / 2), y + rr(-0.3, 0.2), z + rr(-d / 2, d / 2))); } }
function buildThunder() {
  if (THW.built) return; THW.built = true;
  const g = new THREE.Group(); thScene.add(g);
  // the big cloud floor
  const floor = mesh(new THREE.CircleGeometry(70, 48), mat(0x4a4a62, { roughness: 1 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2; g.add(floor);
  for (let i = 0; i < 70; i++) { const a = rr(0, 6.28), r = Math.sqrt(rnd()) * 66, s = rr(1.5, 3.2); g.add(S(G.sph, mat(pick([0x5a5a72, 0x4a4a62, 0x6a6a82]), { roughness: 1 }), s, s * 0.45, s, Math.cos(a) * r, 0, Math.sin(a) * r)); }
  // floating storm clouds to jump on
  for (const [x, y, z, w] of [[14, 2.5, 8, 6], [22, 5, -2, 5], [30, 8, -14, 6], [-16, 3, 4, 6], [-26, 6, -8, 5], [-34, 9.5, -20, 7], [8, 4, 30, 6], [-6, 7, 40, 5]]) { stormCloud(g, x, y, z, w, w); THW.boxes.push({ x, z, hx: w / 2, hz: w / 2, h: y + 0.4, top: true }); }
  // stars, dark sky glow
  { const sv = []; for (let i = 0; i < 600; i++) { const v = randDir(); v.y = Math.abs(v.y) + 0.1; v.normalize().multiplyScalar(rr(120, 160)); sv.push(v.x, v.y, v.z); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); thScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1, color: 0x9a9ac8, fog: false }))); }
  // rain
  { const N = 900, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = rr(-60, 60); pos[i * 3 + 1] = rr(0, 40); pos[i * 3 + 2] = rr(-60, 60); } const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); THW.rain = new THREE.Points(rg, new THREE.PointsMaterial({ size: 0.25, color: 0x9ab8ff, transparent: true, opacity: 0.7 })); thScene.add(THW.rain); }
  // the Thunder God himself, coiled on his throne-cloud
  stormCloud(g, 0, 1, -28, 14, 10, 0x3a3a52);
  const d = makeThunderDragon(2.6); d.position.set(0, 2, -26); thScene.add(d); THW.dragon = d; THW.boxes.push({ x: 0, z: -28, hx: 8, hz: 6, h: 99 });
  { const sign = mesh(new THREE.PlaneGeometry(8, 1.4), new THREE.MeshBasicMaterial({ map: labelTex('GRIAUSTINIO DIEVAS', '#2a2850', '#ffe14d', 640, 110), side: THREE.DoubleSide }), 0, 1.6, -18); thScene.add(sign); }
  buildBoltKids();
  linearize(thScene);
}
// ---------- the little lightning people (žaibukai) ----------
const BOLT_LINES = ['Bzzzt! Labas! Aš – žaibukas!', 'Mes gimstame audros debesyse ir lakstome greičiau už garsą!', 'Griaustinio Dievas – mūsų tėtis. Kai jis supyksta, mes visi išskrendam žaibuoti!', 'Nelieski manęs – nupurtysiu! …Cha, juokauju. Truputį.', 'Ar žinai, kad griaustinis – tai mūsų juokas? BUM BUM!', 'Bzzz… Pas mus kažkas negerai. Tėtis labai susirūpinęs.', 'Aš moku apibėgti visą debesį per vieną sekundę!', 'Lietus mums patinka – tada mes blizgam dar labiau!'];
function makeBoltKid() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const sh = new THREE.Shape(); sh.moveTo(0.1, 1.6); sh.lineTo(-0.35, 0.8); sh.lineTo(-0.02, 0.8); sh.lineTo(-0.3, 0); sh.lineTo(0.38, 1.0); sh.lineTo(0.05, 1.0); sh.lineTo(0.4, 1.6); sh.lineTo(0.1, 1.6);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: false }); geo.translate(-0.05, 0, -0.09);
  body.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffe14d })));
  const inner = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff })); inner.scale.set(0.55, 0.8, 1.2); inner.position.set(0.02, 0.15, 0); body.add(inner);
  for (const x of [-0.05, 0.13]) { body.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.07, 0.09, 0.04, x, 1.22, 0.12)); body.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0x1a1a40 }), 0.035, 0.045, 0.03, x, 1.22, 0.15)); }
  body.add(mesh(new THREE.TorusGeometry(0.07, 0.02, 5, 10, Math.PI), new THREE.MeshBasicMaterial({ color: 0x8a5a00 }), 0.04, 1.08, 0.13).rotateZ(Math.PI));
  for (const sx of [-1, 1]) { const a = S(G.cyl, new THREE.MeshBasicMaterial({ color: 0xffe14d }), 0.03, 0.35, 0.03, sx * 0.32, 0.95, 0); a.rotation.z = sx * 0.9; body.add(a); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe880, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.2); gl.position.y = 0.9; g.add(gl);
  g.userData.body = body; g.userData.glow = gl; return g;
}
function buildBoltKids() {
  THW.kids = [];
  for (let i = 0; i < 14; i++) { const m = makeBoltKid(); const a = rr(0, 6.28), rad = rr(6, 45); m.position.set(Math.cos(a) * rad, 0, Math.sin(a) * rad); thScene.add(m); THW.kids.push({ m, tgt: m.position.clone(), t: rr(0.5, 2), hop: 0, ph: rr(0, 9), line: BOLT_LINES[i % BOLT_LINES.length] }); }
}
function nearBolt() { let best = null, bd = 2.6; for (const k of THW.kids || []) { const d = Math.hypot(k.m.position.x - player.pos.x, k.m.position.z - player.pos.z); if (d < bd) { bd = d; best = k; } } return best; }
function updateBoltKids(dt, t) {
  for (const k of THW.kids || []) {
    const near = Math.hypot(k.m.position.x - player.pos.x, k.m.position.z - player.pos.z) < 3;
    k.t -= dt; k.hop = Math.max(0, k.hop - dt * 1.5);
    if (k.t < 0 && !near) { k.t = rr(0.6, 2.2); const a = rr(0, 6.28), r = rr(3, 9); k.tgt.set(clamp(k.m.position.x + Math.cos(a) * r, -55, 55), 0, clamp(k.m.position.z + Math.sin(a) * r, -55, 55)); if (Math.hypot(k.tgt.x, k.tgt.z + 27) < 9) k.tgt.z += 12; if (rnd() < 0.25) { zapLine(thScene, k.m.position.clone().add(new V3(0, 0.8, 0)), k.tgt.clone().add(new V3(0, 0.8, 0)), 0xffe14d, 0.15); k.m.position.copy(k.tgt); tone(2400, 0.04, { type: 'square', vol: 0.015, lp: 5000 }); } }
    const d = k.tgt.clone().sub(k.m.position); d.y = 0;
    if (!near && d.length() > 0.2) { k.m.position.addScaledVector(d.normalize(), Math.min(d.length(), dt * 9)); k.m.rotation.y = Math.atan2(d.x, d.z); }
    else if (near) k.m.rotation.y = Math.atan2(player.pos.x - k.m.position.x, player.pos.z - k.m.position.z);
    k.m.position.y = Math.abs(Math.sin(t * 7 + k.ph)) * 0.2 + Math.sin(k.hop * Math.PI) * 1.2;
    k.m.userData.body.rotation.z = Math.sin(t * 12 + k.ph) * 0.12; k.m.userData.glow.material.opacity = 0.35 + 0.25 * Math.abs(Math.sin(t * 15 + k.ph));
  }
}
function enterThunder() {
  buildThunder(); mode = 'thunder'; thScene.add(player.mesh); player.mesh.visible = true; musicSet(4); setScope(false);
  try { localStorage.setItem('modly-inthunder', '1'); localStorage.removeItem('modly-pos'); } catch (_) { }
  player.pos.set(0, 0, 14); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.3; player.up.set(0, 1, 0); player.grounded = true;
  camera.position.set(0, 5, 22); camera.up.set(0, 1, 0);
  $('bName').textContent = 'Audrų pasaulis'; $('bEn').textContent = 'Griaustinio Dievo namai'; $('bAtm').textContent = 'Tamsūs debesys, lietus, žaibai, maži žaibukai – ir drakonas iš žaibo.'; document.documentElement.style.setProperty('--biome', '#c8b0ff');
  setTimeout(() => toast('Tu AUDRŲ PASAULYJE!', 'Griaustinio Dievas laukia ant didžiojo debesies (E)', '#c8b0ff'), 600);
}
const nearThunderGod = () => Math.hypot(player.pos.x, player.pos.z + 26) < 16;
function thunderHand(side) { hands[side].hold = true; { const k = nearBolt(); if (k) { k.hop = 1; bubbleIn(thScene, k.m.position, pick(['Bzzt!', 'Cha!', 'Zzzap!']), 2.4); } } const p = player.pos.clone().add(new V3(0, 1.4, 0)).addScaledVector(player.fwd, 1); zapLine(thScene, p, p.clone().add(randDir().multiplyScalar(1.5)), 0xffe14d, 0.15); tone(1800, 0.05, { type: 'square', vol: 0.02, lp: 4000 }); }
function thunderAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  { const k = nearBolt(); if (k) { k.hop = 1; startTalk('Žaibukas', [k.line], '#ffe14d'); return; } }
  if (nearThunderGod()) {
    if (THW.met) { startTalk('Griaustinio Dievas', [pick(['BUM! Patinka mano audros?', 'Mano žaibai – greičiausi visuose pasauliuose. BUM BUM!', 'Bėda didelė… Kai būsi pasiruošęs – papasakosiu viską. BUM.'])], '#c8b0ff'); return; }
    startTalk('Griaustinio Dievas', ['BUM BUM! Sveikas mano AUDRŲ PASAULYJE, žaliasis!', 'Taip, taip – aš atrodau kaip drakonas. Tik ne iš žvynų, o iš ŽAIBO! Mano kūnas – griaustinis, mano sparnai – žaibai.', 'Aš girdėjau apie tave viską: demonas, vandenynas, vaiduokliai, laikrodis… Tu – tikras didvyris.', 'O pas mane… didelė bėda. Bet pirma apsižvalgyk – pašokinėk ant audros debesų. BUM!'], '#c8b0ff', () => { THW.met = true; try { localStorage.setItem('modly-thundermet', '1'); } catch (_) { } });
  }
}
function updateThunder(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 10 : 6; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 9; player.grounded = false; sfx.jump(); }
  if (!player.down) flatJetpack(dt);
  player.vr -= 20 * dt; player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0; const rad = 0.4;
  for (const b of THW.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.6) { if (b.h > ground) ground = b.h; } else if (!b.top) { if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; } }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.pos.x = clamp(player.pos.x, -65, 65); player.pos.z = clamp(player.pos.z, -65, 65); if (player.pos.y > 40) { player.pos.y = 40; player.vr = Math.min(0, player.vr); }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 6.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1)); if (_ct.y < 0.5) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0))); applyShake(dt);
  // the storm
  { const p = THW.rain.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * 30; if (y < 0) { y = 40; p.setX(i, player.pos.x + rr(-50, 50)); p.setZ(i, player.pos.z + rr(-50, 50)); } p.setY(i, y); } p.needsUpdate = true; }
  THW.flashT -= dt; thFlash.intensity = Math.max(0, thFlash.intensity - dt * 4);
  if (THW.flashT < 0) { THW.flashT = rr(1.5, 4.5); const x = player.pos.x + rr(-40, 40), z = player.pos.z + rr(-40, 40); zapLine(thScene, new V3(x, 45, z), new V3(x + rr(-3, 3), 0, z + rr(-3, 3)), 0xffffff, 0.35); thFlash.intensity = 2.2; setTimeout(() => noiseHit(1.4, { f: 220, fto: 50, vol: 0.18 }), 300 + Math.random() * 600); }
  poseDragon(THW.dragon, t * 0.5, 3); THW.dragon.rotation.y = Math.PI + Math.atan2(player.pos.x - THW.dragon.position.x, player.pos.z - THW.dragon.position.z) * 0.3; THW.dragon.position.y = 2 + Math.sin(t) * 0.3;
  if (Math.random() < dt * 3) { const segs = THW.dragon.userData.segs, a = segs[Math.floor(rr(0, 17))].getWorldPosition(new V3()), b = segs[Math.floor(rr(0, 17))].getWorldPosition(new V3()); zapLine(thScene, a, b, 0xffe14d, 0.12); }
  updateBoltKids(dt, t);
  let txt = ''; if (!card) txt = nearBolt() ? '<kbd>E</kbd> kalbėtis su žaibuku' : nearThunderGod() ? '<kbd>E</kbd> kalbėtis su Griaustinio Dievu' : '<kbd>Space</kbd> – šokinėk ant audros debesų';
  setPrompt(txt);
}
function thunderTest() { if (!TW.built) buildTimeWorld(); if (mode !== 'time') { hideCard(); enterTime(); } Q19.has = true; Q19.stage = 'fixed'; if (!Q19.num) Q19.num = '-123 4242'; saveQ19(); toast('Bandymų pasaulis: Dievų grupė', 'Spausk P → Dievų grupė → parašyk „bum bum“', '#c8b0ff'); }
