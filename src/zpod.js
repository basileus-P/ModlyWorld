// ================= Teleportation – step 7: the TELEPORT POD (even harder!) =================
// The POD BOWER TOWER: 40 small floating stones spiral up into the sky. Inside the tower you CANNOT fly (or use a jet-pack) –
// only jump. Some stones move, some blink away. 7 seeds (orange and yellow) lie on the stones; collect ALL 7 in ONE climb.
// Fall down to the ground – and all the seeds fly back to their stones! At the very top waits the empty pod.
Q26.pod = !!Q26.pod;
{ const _c = teleCount; teleCount = () => _c() + (Q26.pod ? 1 : 0); }
const POD_C = (() => { const [x, z] = armDir(2); return new V3(x * 100, 0, z * 100); })(), POD_N = 40, POD_R = 18;
const PD = { g: null, plats: [], seeds: [], run: 0, shell: null, top: null, on: null, falls: 0 };
const SEED_AT = [5, 10, 15, 20, 26, 31, 36], SEED_COL = [0xff7a1a, 0xffe14d, 0xff7a1a, 0xff7a1a, 0xffe14d, 0xff7a1a, 0xffe14d];
function makePod(full) {
  const g = new THREE.Group(), shellM = mat(0xc8b8ea, { transparent: true, opacity: full ? 0.45 : 0.9, roughness: 0.5, depthWrite: !full, side: full ? THREE.BackSide : THREE.FrontSide });
  g.add(S(G.sph, shellM, 1.25, 0.32, 0.32, 0, 0.5, 0)); const tail = S(G.cone, shellM, 0.3, 0.5, 0.3, -1.35, 0.5, 0); tail.rotation.z = -Math.PI / 2; g.add(tail);
  for (const s of [1, -1]) { const f = S(G.cone, shellM, 0.16, 0.35, 0.06, -1.6, 0.5 + s * 0.16, 0); f.rotation.z = -Math.PI / 2 + s * 0.6; g.add(f); }
  if (full) {
    const xs = [-0.9, -0.55, -0.15, 0.3, 0.72, 1.0], cols = [0xff7a1a, 0xffe14d, 0xff7a1a, 0xff7a1a, 0xffe14d, 0xff7a1a], sz = [0.13, 0.17, 0.16, 0.2, 0.15, 0.08];
    xs.forEach((x, i) => g.add(S(G.sph, bmat(cols[i]), sz[i] * 1.2, sz[i], sz[i] * 0.8, x, 0.48 + (i % 2) * 0.04, 0)));
    const pts = []; for (let i = 0; i <= 12; i++) { const x = -1.1 + i * 0.19; pts.push(new V3(x, 0.5 + Math.sin(i * 1.3) * 0.1, Math.cos(i * 0.9) * 0.06)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.02, 5, false), bmat(0x2a9a5a)));
  }
  return g;
}
function makeSeed(col) { const g = new THREE.Group(); g.add(S(G.sph, mat(col, { emissive: col, emissiveIntensity: 0.6 }), 0.35, 0.28, 0.25, 0, 0.6, 0)); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(1.8); gl.position.y = 0.6; g.add(gl); return g; }
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildPodTower(); }; }
function buildPodTower() {
  const g = new THREE.Group(); g.position.copy(POD_C); stScene.add(g); PD.g = g;
  g.add(S(G.cyl, mat(0x6a5aaa, { emissive: 0x2a1a5a }), 4, 0.2, 4, 0, 0.1, 0));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(POD_R, 0.12, 6, 64), bmat(0xc8b8ea, { transparent: true, opacity: 0.6 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.2; g.add(ring);
  { const s = makeSign('Ankščių bokštas'); s.position.set(-5, 0, 0); s.scale.setScalar(2); g.add(s); }
  // the "no flying" column
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(POD_R, POD_R, 70, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xc8b8ea, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false })).translateY(35));
  const stone = mat(0x7a6aaa, { roughness: 0.9 }), moveM = mat(0x5a8ae8, { emissive: 0x1a2a6a }), blinkM = mat(0xe85ab0, { emissive: 0x5a1a3a });
  let a = 0, y = 0;
  for (let i = 0; i < POD_N; i++) {
    const r = 8 + (i % 2) * 0.8, type = i < 3 ? 0 : i % 7 === 4 ? 1 : i % 5 === 3 ? 2 : 0;   // 0 still, 1 moving, 2 blinking
    a += 0.4; y += i < 2 ? 1.1 : 1.3;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, sz = type === 1 ? 1.5 : 1.3;
    const m = S(G.box, type === 1 ? moveM : type === 2 ? blinkM : stone, sz * 2, 0.5, sz * 2, x, y - 0.25, z); g.add(m);
    const box = { x: POD_C.x + x, z: POD_C.z + z, hx: sz, hz: sz, h: y, top: true };
    ST.boxes.push(box); PD.plats.push({ m, box, x, y, z, type, ph: i * 1.3, dx: 0, dz: 0 });
  }
  PD.top = PD.plats[POD_N - 1];
  // the top: a wider stone with the empty pod
  { const t = PD.top; t.type = 0; t.m.scale.set(2, 1, 2); t.box.hx = t.box.hz = 2.2; const sh = makePod(false); sh.position.set(t.x, t.y, t.z); g.add(sh); PD.shell = sh; }
  SEED_AT.forEach((pi, k) => { const p = PD.plats[pi], s = makeSeed(SEED_COL[k]); s.position.set(p.x, p.y, p.z); g.add(s); PD.seeds.push({ m: s, p, got: false }); });
  linearize(g); refreshPod();
}
function refreshPod() { if (!PD.g) return; const on = Q26.stage === 'steps' && !Q26.pod; PD.seeds.forEach(s => s.m.visible = on && !s.got); PD.shell.visible = !Q26.pod; }
{ const _r = refreshTeleCorner; refreshTeleCorner = () => { _r(); if (Q26.pod && TP.slots) { const p = makePod(true); p.scale.setScalar(0.8); p.position.y = 0.3; TP.slots[6].add(p); } }; }
const inPodTower = () => PD.g && !isUnder() && Math.hypot(player.pos.x - POD_C.x, player.pos.z - POD_C.z) < POD_R;
function noFlyHere() { return mode === 'star' && Q26.stage === 'steps' && !Q26.pod && (inPodTower() || (typeof inZone === 'function' && !Q26.card && inZone())); }
const nearPodTop = () => PD.top && inPodTower() && Math.hypot(player.pos.x - (POD_C.x + PD.top.x), player.pos.z - (POD_C.z + PD.top.z)) < 2.6 && Math.abs(player.pos.y - PD.top.y) < 1.5;
function podSeedsBack() { if (!PD.run) return; PD.run = 0; PD.seeds.forEach(s => s.got = false); refreshPod(); PD.falls++; redFlash('rgba(200,184,234,.6)', 400); toast('Nukritai! Sėklos sugrįžo atgal…', 'Visas 7 sėklas reikia surinkti vienu kopimu. Bandyk dar kartą!', '#c8b8ea'); tone(400, 0.4, { to: 150, type: 'triangle', vol: 0.05 }); }
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (Q26.stage === 'steps' && !Q26.pod) {
      if (nearPodTop()) {
        if (PD.run < 7) { startTalk('Tuščia ankštis', [`Čia – tuščia Teleporto ankštis. Jai reikia 7 sėklų, o tu turi ${PD.run}.`, 'Sėklas reikia surinkti VIENU kopimu – nukritus jos grįžta atgal ant akmenų.'], '#c8b8ea'); return; }
        Q26.pod = true; saveQ26(); refreshPod(); refreshTeleCorner(); bigBanner('TELEPORTO ANKŠTIS!', 'Visos 7 sėklos ankštyje, sujungtos žaliu vijokliu');
        [392, 523, 659, 784, 1047].forEach((f, k) => tone(f, 0.25, { type: 'triangle', vol: 0.06, when: k * 0.09 }));
        setTimeout(() => toast('Teleporto ankštis', `Ji atsirado Teleportacijos kampe. Žingsnis ${Q26.step} iš ${TP_STEPS}`, '#c8b8ea'), 2600); return;
      }
      if (Math.hypot(player.pos.x - POD_C.x, player.pos.z - POD_C.z) < 6 && player.pos.y < 2) { startTalk('Ankščių bokštas', ['Aukštai danguje, ant pačio viršutinio akmens, laukia tuščia TELEPORTO ANKŠTIS.', 'Bokšte SKRAIDYTI NEGALIMA – net su kuprine. Tik šokinėti nuo akmens ant akmens (Space, Shift – toliau).', 'Mėlyni akmenys juda, rožiniai – dingsta ir atsiranda. Ant 7 akmenų guli sėklos – surink VISAS vienu kopimu.', 'Nukrisi ant žemės – ir visos sėklos sugrįš atgal. Sėkmės… tau jos prireiks!'], '#c8b8ea'); return; }
    }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => {
    if (!PD.g) return _u(dt, t);
    // ride along with the moving stone you stand on
    if (PD.on && player.grounded) { player.pos.x += PD.on.dx; player.pos.z += PD.on.dz; }
    const tower = inPodTower() && Q26.stage === 'steps' && !Q26.pod, back = Q8.back; if (tower && back === 'jetpack') Q8.back = null;
    _u(dt, t); Q8.back = back;
    // move / blink the stones
    for (const p of PD.plats) {
      let x = p.x, z = p.z; if (p.type === 1) { const o = Math.sin(t * 0.9 + p.ph) * 2.2; x = p.x + Math.cos(p.ph) * o; z = p.z + Math.sin(p.ph) * o; }
      p.dx = POD_C.x + x - p.box.x; p.dz = POD_C.z + z - p.box.z; p.box.x = POD_C.x + x; p.box.z = POD_C.z + z; p.m.position.x = x; p.m.position.z = z;
      if (p.type === 2) { const vis = ((t + p.ph) % 3.2) < 2.1; p.m.visible = vis; p.box.h = vis ? p.y : -999; if (vis) { const k = ((t + p.ph) % 3.2); p.m.scale.setScalar(k > 1.7 ? 1 - (k - 1.7) * 1.5 : 1); } }
    }
    PD.seeds.forEach(s => { if (s.m.visible) { s.m.position.set(s.p.m.position.x, s.p.y + Math.sin(t * 3) * 0.1, s.p.m.position.z); s.m.rotation.y += dt * 2; } });
    if (PD.shell.visible) { PD.shell.rotation.y += dt * 0.5; PD.shell.position.y = PD.top.y + 0.2 + Math.sin(t * 1.5) * 0.1; }
    // which stone am I on?
    PD.on = null; if (player.grounded) for (const p of PD.plats) { if (Math.abs(player.pos.y - p.box.h) < 0.05 && Math.abs(player.pos.x - p.box.x) < p.box.hx + 0.4 && Math.abs(player.pos.z - p.box.z) < p.box.hz + 0.4) { PD.on = p; break; } }
    if (PD.run && player.pos.y < -2) podSeedsBack();
    if (!tower) return;
    PD.seeds.forEach((s, k) => { if (!s.got && s.m.visible && player.pos.distanceTo(new V3(s.p.box.x, s.p.y + 0.5, s.p.box.z)) < 1.6) { s.got = true; s.m.visible = false; PD.run++; tone(988 + k * 90, 0.15, { type: 'triangle', vol: 0.06 }); toast(`Sėkla ${PD.run}/7!`, PD.run >= 7 ? 'Visos sėklos! Lipk į pačią viršūnę!' : 'Nenukrisk…', '#' + SEED_COL[k].toString(16).padStart(6, '0')); } });
    if (player.grounded && player.pos.y < 0.5) podSeedsBack();
    if (!card) setPrompt(nearPodTop() ? (PD.run >= 7 ? '<kbd>E</kbd> sudėti sėklas į ankštį' : `Tuščia ankštis – reikia 7 sėklų (turi ${PD.run})`) : player.pos.y < 2 ? '<kbd>E</kbd> apžiūrėti · bokšte skraidyti negalima – tik šokinėti!' : `🌱 Sėklos: ${PD.run}/7 · aukštis ${Math.floor(player.pos.y)} m / ${Math.floor(PD.top.y)} m`);
  }; }
function podTest(n) { tubeTest(0); Q26.tubeHave = true; Q26.tube = true; Q26.pod = false; saveQ26(); refreshTube(); refreshTele(); refreshPod(); PD.run = 0; PD.seeds.forEach(s => s.got = false); refreshPod(); player.pos.set(POD_C.x + 3, 0, POD_C.z + 3); player.fwd.set(0, 0, -1); if (n) { const p = PD.plats[n]; player.pos.set(POD_C.x + p.x, p.y + 0.05, POD_C.z + p.z); } toast('Bandymų pasaulis: Ankščių bokštas', 'Šokinėk aukštyn ir rink sėklas', '#c8b8ea'); }
