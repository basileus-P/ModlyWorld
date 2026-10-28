// ================= Teleportation – step 5: the TELEPORT ROUTE CARD (harder!) =================
// Behind the goddess's throne lies the DANGER ZONE: wavy laser wires (red, green, blue, orange) sweep across it.
// Touch a wire – BZZT – you are thrown back to the gate. Flying is impossible inside (only jumping over the wires).
// Collect the 4 coloured switches in the corners (every switch makes the wires faster!), then the cage in the
// middle opens and you can take the card.
Q26.zkeys = Q26.zkeys || []; Q26.card = !!Q26.card; Q26.zaps = Q26.zaps || 0;
{ const _c = teleCount; teleCount = () => _c() + (Q26.card ? 1 : 0); }
const ZONE = new V3(0, 0, -92), ZONE_H = 14, ZONE_COLS = [['red', 0xff3a3a, '#ff3a3a'], ['green', 0x3ae85a, '#3ae85a'], ['blue', 0x3aa8ff, '#3aa8ff'], ['orange', 0xff9a1a, '#ff9a1a']];
const ZONE_KEYS = [[-11, -11], [11, -11], [-11, 11], [11, 11]];
const ZN = { g: null, waves: [], keys: [], bars: [], card: null, fence: [] };
function routeCardTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 176; const x = c.getContext('2d');
  x.fillStyle = '#7a7a7a'; x.beginPath(); x.roundRect ? x.roundRect(4, 4, 248, 168, 30) : x.rect(4, 4, 248, 168); x.fill();
  x.fillStyle = '#ffe600'; x.beginPath(); x.moveTo(128, 30); x.lineTo(186, 140); x.lineTo(70, 140); x.closePath(); x.fill();
  x.fillStyle = '#111'; x.fillRect(122, 62, 9, 52); x.beginPath(); x.arc(126, 126, 7, 0, 7); x.fill();
  const wave = (col, y0, a, f, ph) => { x.strokeStyle = col; x.lineWidth = 5; x.beginPath(); for (let i = 0; i <= 256; i += 4) { const y = y0 + Math.sin(i * f + ph) * a + Math.sin(i * f * 2.3 + ph * 2) * a * 0.3; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); };
  wave('#ff2a2a', 62, 14, 0.035, 0.5); wave('#2ac83a', 90, 16, 0.028, 2.1); wave('#ff8a1a', 112, 22, 0.022, 4); wave('#1a9aff', 128, 18, 0.03, 1.2);
  return new THREE.CanvasTexture(c);
}
function makeRouteCard() {
  const g = new THREE.Group(), tex = routeCardTex();
  g.add(S(G.box, mat(0x6a6a6a), 1.5, 1.03, 0.05, 0, 0.9, 0));
  for (const s of [1, -1]) { const f = mesh(new THREE.PlaneGeometry(1.5, 1.03), new THREE.MeshBasicMaterial({ map: tex, transparent: true }), 0, 0.9, 0.03 * s); if (s < 0) f.rotation.y = Math.PI; g.add(f); }
  g.add(S(G.cyl, mat(0xc8a040), 0.04, 0.4, 0.04, 0, 0.2, 0)); return g;
}
function warnTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#ffe600'; x.strokeStyle = '#111'; x.lineWidth = 6; x.beginPath(); x.moveTo(64, 8); x.lineTo(122, 118); x.lineTo(6, 118); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#111'; x.fillRect(59, 40, 10, 48); x.beginPath(); x.arc(64, 102, 7, 0, 7); x.fill(); return new THREE.CanvasTexture(c); }
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildZone(); }; }
function buildZone() {
  const g = new THREE.Group(); g.position.copy(ZONE); stScene.add(g); ZN.g = g; const H = ZONE_H;
  g.add(S(G.box, mat(0x3a3a44, { roughness: 0.9 }), H * 2, 0.06, H * 2, 0, 0.03, 0));
  for (let i = -H; i <= H; i += 2) for (const [x, z] of [[i, -H], [i, H], [-H, i], [H, i]]) if (!(z === H && Math.abs(x) < 2.5)) { g.add(S(G.box, mat(0x2a2a2a), 0.06, 0.06, 0.06, x, 0.06, z)); }
  const fence = mat(0x4a4a5a, { metalness: 0.5 }), stripe = mat(0xffe600);
  for (const [x, z, w, d] of [[0, -H, H * 2, 0.3], [-H, 0, 0.3, H * 2], [H, 0, 0.3, H * 2], [-(H + 2.5) / 2, H, H - 2.5, 0.3], [(H + 2.5) / 2, H, H - 2.5, 0.3]]) { g.add(S(G.box, fence, w, 3, d, x, 1.5, z)); g.add(S(G.box, stripe, w + 0.02, 0.3, d + 0.02, x, 2.6, z)); ST.boxes.push({ x: ZONE.x + x, z: ZONE.z + z, hx: w / 2, hz: d / 2, h: 3 }); }
  const wt = warnTex(); for (const [x, z, ry] of [[-6, H + 0.2, 0], [6, H + 0.2, 0], [-H - 0.2, 0, -Math.PI / 2], [H + 0.2, 0, Math.PI / 2], [0, -H - 0.2, Math.PI]]) { const s = mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: wt, transparent: true, side: THREE.DoubleSide }), x, 1.6, z); s.rotation.y = ry; g.add(s); }
  const sign = mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: labelTex('⚠ PAVOJAUS ZONA ⚠', '#2a2a2a', '#ffe600', 640, 110), side: THREE.DoubleSide }), 0, 3.6, H + 0.2); g.add(sign);
  // the wavy laser wires (4 sweep along z, 2 more along x once you have 2 switches)
  const segN = 36;
  for (let i = 0; i < 6; i++) { const [, col] = ZONE_COLS[i % 4], w = { col, i, axis: i < 4 ? 'z' : 'x', segs: [], ph: i * 1.7, sp: 0.35 + i * 0.07 };
    for (let k = 0; k < segN; k++) { const m = S(G.box, bmat(col), 0.9, 0.12, 0.12); g.add(m); w.segs.push(m); }
    const gl = []; for (let k = 0; k < 6; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(2); g.add(s); gl.push(s); } w.glow = gl;
    ZN.waves.push(w); }
  // the 4 switches in the corners
  ZONE_KEYS.forEach(([x, z], i) => { const [, col] = ZONE_COLS[i]; const k = new THREE.Group(); k.position.set(x, 0, z); g.add(k); k.add(S(G.cyl, mat(0x3a3a44), 0.5, 0.6, 0.5, 0, 0.3, 0)); const c = S(G.box, mat(col, { emissive: col, emissiveIntensity: 0.8 }), 0.5, 0.5, 0.5, 0, 1.1, 0); k.add(c); k.userData.cube = c; ZN.keys.push(k); });
  // the cage in the middle with the card
  g.add(S(G.cyl, mat(0x5a5a6a), 1.4, 0.4, 1.4, 0, 0.2, 0));
  const card = makeRouteCard(); card.position.y = 0.4; g.add(card); ZN.card = card;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, [, col] = ZONE_COLS[i % 4]; const b = S(G.cyl, mat(col, { emissive: col, emissiveIntensity: 0.6 }), 0.06, 2.6, 0.06, Math.cos(a) * 1.2, 1.7, Math.sin(a) * 1.2); b.userData.c = i % 4; g.add(b); ZN.bars.push(b); }
  linearize(g); refreshZone();
}
function refreshZone() {
  if (!ZN.g) return; const active = Q26.stage === 'steps' && !Q26.card;
  ZN.keys.forEach((k, i) => k.userData.cube.visible = !Q26.zkeys.includes(i));
  ZN.bars.forEach(b => b.visible = !Q26.zkeys.includes(b.userData.c) && !Q26.card);
  ZN.card.visible = !Q26.card; ZN.waves.forEach(w => { const on = active && w.axis === 'z'; w.segs.forEach(s => s.visible = on); w.glow.forEach(s => s.visible = on); w.on = on; });
}
{ const _r = refreshTeleCorner; refreshTeleCorner = () => { _r(); if (Q26.card && TP.slots) { const p = makeRouteCard(); const a = 4 / TP_STEPS * Math.PI * 2; p.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); TP.slots[4].add(p); } }; }
const zLocal = () => new V3(player.pos.x - ZONE.x, player.pos.y, player.pos.z - ZONE.z);
const inZone = () => { const l = zLocal(); return !isUnder() && Math.abs(l.x) < ZONE_H && Math.abs(l.z) < ZONE_H; };
const nearZoneCard = () => inZone() && Q26.zkeys.length >= 4 && !Q26.card && Math.hypot(zLocal().x, zLocal().z) < 2.6;
function waveAt(w, u, t) {   // where the wire is (along its sweep axis) at position u along the other axis
  const fast = 0.7 + Q26.zkeys.length * 0.08, c = Math.sin(t * w.sp * fast + w.ph) * (ZONE_H - 2);
  return c + Math.sin(u * 0.42 + t * 2.2 * fast + w.i) * 1.6 + Math.sin(u * 0.9 - t * 1.3 + w.i * 2) * 0.7;
}
function zoneZap() {
  Q26.zaps++; saveQ26(); redFlash('rgba(120,200,255,.8)', 300); shake = Math.max(shake, 0.6); noiseHit(0.4, { ft: 'bandpass', f: 2400, vol: 0.2 }); tone(90, 0.4, { type: 'sawtooth', vol: 0.08, lp: 1500 });
  player.pos.set(ZONE.x, 0, ZONE.z + ZONE_H + 2.5); player.vel.set(0, 0, 0); player.vr = 0; player.fwd.set(0, 0, -1);
  toast('BZZZT! Palietei laidą!', `Atgal prie vartų… (bandymų: ${Q26.zaps}) Šokinėk per laidus su Space!`, '#3aa8ff');
}
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (nearZoneCard()) { Q26.card = true; saveQ26(); refreshZone(); refreshTeleCorner(); [523, 659, 784, 1047, 1319].forEach((f, k) => tone(f, 0.18, { type: 'triangle', vol: 0.05, when: k * 0.07 }));
      startTalk('Teleporto kelių kortelė', ['Paėmei TELEPORTO KELIŲ KORTELĘ! Pilka, su geltonu įspėjimo trikampiu ir spalvotais kelių laidais – raudonu, žaliu, mėlynu ir oranžiniu.', `Laidai nurimo. Kortelė atsirado Teleportacijos kampe. Žingsnis ${Q26.step} iš ${TP_STEPS}!`], '#ffe600'); return; }
    if (Q26.stage === 'steps' && !Q26.card && Math.hypot(player.pos.x - ZONE.x, player.pos.z - (ZONE.z + ZONE_H + 2)) < 5) { startTalk('Pavojaus zona', ['⚠ PAVOJINGA! Viduje šokinėja spalvoti laidai. Palietei – BZZZT – ir atgal prie vartų.', 'Skraidyti viduje NEGALIMA – tik šokinėti per laidus (Space).', 'Surink 4 spalvotus jungiklius kampuose – tada atsidarys narvas viduryje. Surinkti jungikliai išlieka, net jei tave trenkia!'], '#ffe600'); return; }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!ZN.g) return;
    // draw the wires
    for (const w of ZN.waves) { if (!w.on) continue; const n = w.segs.length, L = ZONE_H * 2;
      for (let k = 0; k < n; k++) { const u = -ZONE_H + (k + 0.5) * L / n, v = waveAt(w, u, t), v2 = waveAt(w, u + 0.3, t), m = w.segs[k]; if (w.axis === 'z') { m.position.set(u, 0.9, v); m.rotation.y = -Math.atan2(v2 - v, 0.3); } else { m.position.set(v, 0.9, u); m.rotation.y = Math.PI / 2 + Math.atan2(v2 - v, 0.3); } }
      w.glow.forEach((s, k) => { const u = -ZONE_H + (k + 0.5) * L / 6, v = waveAt(w, u, t); if (w.axis === 'z') s.position.set(u, 0.9, v); else s.position.set(v, 0.9, u); }); }
    ZN.keys.forEach((k, i) => { k.userData.cube.rotation.y += dt * 2; k.userData.cube.position.y = 1.1 + Math.sin(t * 3 + i) * 0.12; }); if (ZN.card.visible) ZN.card.rotation.y += dt * 0.8;
    if (!(Q26.stage === 'steps' && !Q26.card) || !inZone()) return;
    // no flying in here – only jumping
    if (player.pos.y > 2.1) { player.pos.y = 2.1; player.vr = Math.min(player.vr, 0); }
    const l = zLocal();
    for (const w of ZN.waves) { if (!w.on || card || cinema) continue; const along = w.axis === 'z' ? l.x : l.z, across = w.axis === 'z' ? l.z : l.x; if (Math.abs(across - waveAt(w, along, t)) < 0.35 && player.pos.y < 0.75) { zoneZap(); return; } }
    ZONE_KEYS.forEach(([x, z], i) => { if (!Q26.zkeys.includes(i) && Math.hypot(l.x - x, l.z - z) < 1.4) { Q26.zkeys.push(i); saveQ26(); refreshZone(); tone(880 + i * 220, 0.2, { type: 'triangle', vol: 0.06 }); toast(`Jungiklis ${Q26.zkeys.length}/4!`, Q26.zkeys.length >= 4 ? 'Narvas viduryje atsidarė! Paimk kortelę (E)' : 'Laidai truputį pagreitėjo!', ZONE_COLS[i][2]); } });
    if (!card) setPrompt(nearZoneCard() ? '<kbd>E</kbd> paimti Teleporto kelių kortelę' : `⚠ Šokinėk per laidus (<kbd>Space</kbd>) · jungikliai ${Q26.zkeys.length}/4`);
  }; }
function zoneTest() { permitTest(); Q26.exam = Q26.sign = Q26.permit = true; Q26.zkeys = []; Q26.card = false; Q26.zaps = 0; saveQ26(); refreshTele(); refreshZone(); player.pos.set(ZONE.x, 0, ZONE.z + ZONE_H + 5); player.fwd.set(0, 0, -1); toast('Bandymų pasaulis: Pavojaus zona', 'Surink 4 jungiklius ir paimk kortelę', '#ffe600'); }
