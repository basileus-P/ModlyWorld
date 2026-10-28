// ================= Teleportation – step 3: the TANGLED PLUM =================
// It grows in the star forest on the old Tangle Tree, locked in a cage of black vines.
// Five black vine knots hold the cage – burn them with your FIREBALL (commandment 1!) and the plum falls down.
Q26.knots = Q26.knots || 0; Q26.plum = !!Q26.plum;
const PLUM_TREE = (() => { const [x, z] = armDir(1); return new V3(x * 112 + z * 4, 0, z * 112 - x * 4); })();
function makeTanglePlum() {
  const g = new THREE.Group();
  g.add(S(G.sph, mat(0x9a3ab0, { roughness: 0.4, emissive: 0x1a0420 }), 0.5, 0.5, 0.5, 0, 0.5, 0));
  // the black scribbly tangle on its skin
  const ink = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  for (let k = 0; k < 3; k++) { const pts = []; let v = randDir(); for (let i = 0; i < 7; i++) { v = v.clone().add(randDir().multiplyScalar(0.8)).normalize(); pts.push(v.clone().multiplyScalar(0.51).add(new V3(0, 0.5, 0))); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.022, 5, false), ink)); }
  g.add(S(G.cyl, mat(0x5a3a1a), 0.03, 0.15, 0.03, 0, 1.02, 0));
  const leaf = S(G.sph, mat(0x3ac83a), 0.2, 0.07, 0.14, 0.05, 1.1, 0); leaf.rotation.z = 0.3; g.add(leaf);
  for (const [x, z] of [[0.1, 0.05], [-0.02, -0.06], [0.14, -0.04]]) g.add(S(G.sph, mat(0xe8e83a), 0.035, 0.02, 0.035, x, 1.15, z));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xb05aff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.2); gl.position.y = 0.5; g.add(gl);
  return g;
}
const PL = { tree: null, knots: [], cage: null, plum: null, fall: 0 };
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildTangleTree(); }; }
function buildTangleTree() {
  const g = new THREE.Group(); g.position.copy(PLUM_TREE); stScene.add(g); PL.tree = g;
  const bark = mat(0x2a1a2e, { roughness: 1, emissive: 0x0a020e });
  g.add(S(G.cyl6, bark, 1.1, 7, 1.1, 0, 3.5, 0));
  for (const [a, h, L] of [[0.3, 6, 4], [2.4, 5.4, 3.6], [4.3, 6.4, 3.8], [1.4, 4.4, 3]]) { const br = new THREE.Group(); br.position.y = h; br.rotation.y = a; g.add(br); limb(br, bark, new V3(0, 0, 0), new V3(L, 1.4, 0), 0.32); limb(br, bark, new V3(L, 1.4, 0), new V3(L + 1.2, 2.4, 0.6), 0.18); }
  // black vines wrapped around the trunk
  const vine = mat(0x0a0a0c, { roughness: 0.8 });
  for (let k = 0; k < 4; k++) { const pts = []; for (let i = 0; i < 24; i++) { const a = i * 0.7 + k * 1.6; pts.push(new V3(Math.cos(a) * 1.18, i * 0.3, Math.sin(a) * 1.18)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.09, 5, false), vine)); }
  // the plum hangs from the first branch, inside a cage of black vines
  const hang = new V3(Math.cos(-0.3) * 3.2, 4.6, Math.sin(-0.3) * 3.2);
  g.add(S(G.cyl, vine, 0.04, 1.6, 0.04, hang.x, hang.y + 1.2, hang.z));
  const plum = makeTanglePlum(); plum.position.copy(hang).add(new V3(0, -0.5, 0)); g.add(plum); PL.plum = plum;
  const cage = new THREE.Group(); cage.position.copy(hang); g.add(cage); PL.cage = cage;
  for (let k = 0; k < 9; k++) { const pts = []; let v = randDir(); for (let i = 0; i < 6; i++) { v = v.clone().add(randDir().multiplyScalar(0.9)).normalize(); pts.push(v.clone().multiplyScalar(0.95)); } cage.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.05, 5, false), vine)); }
  // five black knots that hold the cage – burn them!
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.6, k = new THREE.Group(); k.position.set(Math.cos(a) * 1.75, 1.2 + (i % 3) * 0.7, Math.sin(a) * 1.75); g.add(k);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.42, 0.12, 48, 8), mat(0x101014, { emissive: 0x2a0a3a, roughness: 0.6 })); k.add(knot);
    for (const x of [-0.13, 0.13]) k.add(S(G.sph, bmat(0xff3a6a), 0.06, 0.06, 0.06, x, 0.1, 0.45).translateZ(0));
    k.lookAt(PLUM_TREE.x + Math.cos(a) * 10, k.position.y, PLUM_TREE.z + Math.sin(a) * 10); PL.knots.push(k); }
  { const s = makeSign('Painiavų medis'); s.position.set(-4, 0, 3); s.scale.setScalar(1.6); g.add(s); }
  ST.boxes.push({ x: PLUM_TREE.x, z: PLUM_TREE.z, hx: 1.1, hz: 1.1, h: 7 });
  linearize(g); refreshPlum();
}
function refreshPlum() {
  if (!PL.tree) return; const active = Q26.stage === 'steps' || Q26.stage === 'done';
  PL.knots.forEach((k, i) => k.visible = i >= Q26.knots); PL.cage.visible = Q26.knots < 5; PL.plum.visible = !Q26.plum;
  if (Q26.knots >= 5 && !Q26.plum && PL.fall === 0) { PL.plum.position.y = 0.05; PL.fall = 1; }
  void active;
}
const plumWorld = () => PL.plum.getWorldPosition(new V3());
const nearPlum = () => PL.plum && PL.plum.visible && Q26.knots >= 5 && Q26.stage === 'steps' && player.pos.distanceTo(plumWorld()) < 2.4;
const nearTangle = () => PL.tree && Math.hypot(player.pos.x - PLUM_TREE.x, player.pos.z - PLUM_TREE.z) < 9 && !isUnder();
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (nearPlum()) { Q26.plum = true; saveQ26(); refreshPlum(); refreshTeleCorner(); [523, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, { type: 'triangle', vol: 0.05, when: i * 0.07 })); redFlash('rgba(176,90,255,.5)', 300);
      startTalk('Susipainiojusi slyva', ['Paėmei SUSIPAINIOJUSIĄ SLYVĄ! Violetinė, o ant jos – juodos, susipainiojusios linijos, lyg kažkas būtų pamiršęs, kur eina keliai…', `Ji dingo iš tavo rankų ir atsirado Teleportacijos kampe. Žingsnis ${Q26.step} iš ${TP_STEPS}!`], '#b05aff'); return; }
    if (nearTangle() && Q26.stage === 'steps' && !Q26.plum && Q26.knots < 5) { startTalk('Painiavų medis', ['Ant šakos kabo violetinė slyva – bet ją laiko narvas iš JUODŲ VIJOKLIŲ.', `Narvą laiko 5 juodi mazgai aplink kamieną. Ranka jų neatrišsi… Bet ugnis juos sudegintų! Spausk ${keyLabel(Q25.key) || 'savo ugnies klavišą'} ir taikyk į mazgus. Sudeginta: ${Q26.knots}/5`], '#b05aff'); return; }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!PL.tree) return;
    PL.knots.forEach((k, i) => { if (k.visible) { k.children[0].rotation.z += dt * (1 + i * 0.2); k.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.06); } });
    if (PL.cage.visible) PL.cage.rotation.y += dt * 0.3;
    if (PL.plum.visible && Q26.knots < 5) PL.plum.rotation.y = Math.sin(t) * 0.3;
    if (PL.fall > 0 && PL.plum.visible) PL.plum.rotation.y += dt;
    // fireballs burn the knots
    if (Q26.stage === 'steps' && Q26.knots < 5) for (const f of FB.balls) { if (f.sc !== stScene || f.t > 5) continue; const k = PL.knots[Q26.knots]; let hitI = -1;
      PL.knots.forEach((kk, i) => { if (hitI < 0 && kk.visible && f.b.position.distanceTo(kk.getWorldPosition(new V3())) < 1.5) hitI = i; });
      if (hitI >= 0) { const kk = PL.knots[hitI]; f.t = 99; const wp = kk.getWorldPosition(new V3()); // swap so the burnt one is "used up"
        PL.knots.splice(hitI, 1); PL.knots.splice(Q26.knots, 0, kk); Q26.knots++; saveQ26(); fireBoom(stScene, wp); fireBoom(stScene, wp); kk.visible = false;
        tone(160, 0.5, { to: 80, type: 'sawtooth', vol: 0.06, lp: 800 }); toast(Q26.knots >= 5 ? 'Narvas sudegė! 🔥' : `Mazgas sudegintas! ${Q26.knots}/5`, Q26.knots >= 5 ? 'Slyva nukrito ant žemės – paimk ją (E)' : 'Degink kitus juodus mazgus', '#ff8a3a');
        if (Q26.knots >= 5) { PL.cage.visible = false; let ft = 0; const y0 = PL.plum.position.y; fx.push(d => { ft += d; PL.plum.position.y = Math.max(0.05, y0 - ft * ft * 9); return PL.plum.position.y > 0.05; }); PL.fall = 1; }
        void k; }
    }
    if (!card && Q26.stage === 'steps' && !Q26.plum) { if (nearPlum()) setPrompt('<kbd>E</kbd> paimti Susipainiojusią slyvą'); else if (nearTangle() && Q26.knots < 5) setPrompt(`Sudegink juodus mazgus! Spausk <kbd>${keyLabel(Q25.key) || '?'}</kbd> – ugnies kamuolys (${Q26.knots}/5) · <kbd>E</kbd> apžiūrėti`); }
  }; }
// fireballs that hit something explode right away (t was set to 99)
{ const tick = () => { for (const f of FB.balls) if (f.t >= 99) f.t = 1.7; return true; }; fx.unshift(tick); }
function plumTest() { teleTest(1); Q26.plant = true; Q26.knots = 0; Q26.plum = false; saveQ26(); refreshTele(); refreshPlum(); refreshTeleCorner(); if (!Q25.key) { Q25.key = 'Digit1'; saveQ25(); fireKeyRow(); } const d = new V3(-PLUM_TREE.x, 0, -PLUM_TREE.z).normalize(); player.pos.set(PLUM_TREE.x + d.x * 8, 0, PLUM_TREE.z + d.z * 8); player.fwd.copy(d).negate(); toast('Bandymų pasaulis: slyva', `Degink mazgus klavišu ${keyLabel(Q25.key)}`, '#b05aff'); }
