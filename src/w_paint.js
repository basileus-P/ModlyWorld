// ================= Job: wall painter (workshop in the Jungle) =================
// start at the workshop → a HUGE red arrow appears over some house anywhere in the world → get there and paint
// all four walls (hold the mouse button by a wall) → the faster you finish, the more you earn → next house
const PJ = { active: false, house: null, t: 0, limit: 60, color: 0xffffff, colorName: '', sides: null, jobs: 0, earned: 0, last: null };
const PAINTS = [[0xffd23a, 'geltonai'], [0x3cc6ff, 'mėlynai'], [0xff5fae, 'rožiškai'], [0x5fe37a, 'žaliai'], [0xff7a3d, 'oranžiškai'], [0xb05aff, 'violetiškai'], [0xff3b3b, 'raudonai'], [0x7ff0e0, 'turkio spalva']];
let paintShop = null, paintSpot = null;
function reservePaintSpot() {
  let best = null, bs = -1e9;
  for (const path of roadPaths) for (const x of path.s) { if (x.bridge) continue; weights(x.d.x, x.d.y, x.d.z, W); if (W[5] < 0.85) continue; const sc = -Math.abs(x.d.dot(BC[5]) - 0.96); if (sc > bs) { bs = sc; best = x; } }
  if (!best) return;
  let d = moveAlong(best.d, best.side, ROAD_HALF + 9); if (TH(d) < 0.3) d = moveAlong(best.d, best.side, -(ROAD_HALF + 9));
  paintSpot = { d, face: best.d.clone() };
  reserved.push({ d: d.clone(), r: 8 });
}
function buildPaintShop() {
  if (!paintSpot) return;
  const { d, face } = paintSpot, fwd = tangentToward(d, face).normalize();
  const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R + TH(d) - 0.1); orient(g, d, fwd); world.add(g);
  g.add(S(G.box, mat(0xf2efe6), 8, 4.2, 6, 0, 2.1, -1));
  // the walls are splashed in every colour
  const spl = [0xffd23a, 0x3cc6ff, 0xff5fae, 0x5fe37a, 0xff7a3d, 0xb05aff];
  for (let i = 0; i < 16; i++) { const s = rr(0.4, 1.1), m = mesh(new THREE.CircleGeometry(s, 10), mat(pick(spl)), rr(-3.5, 3.5), rr(0.5, 3.8), 2.02); g.add(m); }
  g.add(S(G.box, mat(0x3a7bff), 8.6, 0.4, 6.6, 0, 4.4, -1));
  g.add(S(G.box, mat(0x8a5a2b), 2, 2.8, 0.1, 0, 1.4, 2.03));
  g.add(mesh(new THREE.PlaneGeometry(5, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('SIENŲ DAŽYMAS', '#3a7bff', '#ffffff', 640, 120), side: THREE.DoubleSide }), 0, 5.2, 1.6));
  for (let i = 0; i < 5; i++) { const c = pick(spl); g.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.6 }), 0.32, 0.6, 0.32, -3.2 + i * 0.5, 0.3, 3)); g.add(S(G.cyl, mat(c), 0.3, 0.05, 0.3, -3.2 + i * 0.5, 0.62, 3)); }
  { const lad = new THREE.Group(); lad.position.set(3.4, 0, 2.4); lad.rotation.x = -0.25; g.add(lad); for (const x of [-0.3, 0.3]) lad.add(S(G.box, mat(0x8a5a2b), 0.08, 3.6, 0.08, x, 1.8, 0)); for (let k = 0; k < 6; k++) lad.add(S(G.box, mat(0x8a5a2b), 0.6, 0.06, 0.06, 0, 0.4 + k * 0.6, 0)); }
  const boss = makePerson(); boss.position.set(-1.8, 0, 2.6); g.add(boss); boss.add(S(G.cyl, mat(0xffffff), 0.32, 0.12, 0.32, 0, 2.02, 0));
  animators.push((dt, t) => { boss.userData.body.rotation.y = Math.sin(t * 0.8) * 0.5; });
  addBox(g, 4, 3, 4.4, 0, -1);
  paintShop = { g, d, fwd };
  paintShop.inspect = addInspect(g.position.clone().addScaledVector(fwd, 4).addScaledVector(d, 1), 'Sienų dažymo dirbtuvė', '', 5, { verb: 'pradėti sienų dažymo darbą', onUse: usePaintShop });
  linearize(g);
}
function usePaintShop() {
  if (PJ.active) { endPaintJob(); return; }
  PJ.active = true; PJ.jobs = 0; PJ.earned = 0; attachRoller(true); paintShop.inspect.verb = 'baigti dažymo darbą';
  sfx.chime();
  toast('Sienų dažytojas!', 'Seki didžiulę raudoną rodyklę ir nudažyk tą namą. Per vieną darbą – tik 3 namai. Kuo greičiau – tuo daugiau pinigų', '#3a7bff');
  nextPaintHouse();
}
function endPaintJob() {
  PJ.active = false; PJ.house = null; attachRoller(false); if (paintArrow) paintArrow.visible = false; paintShop.inspect.verb = 'pradėti sienų dažymo darbą';
  $('shiftChip').hidden = true;
  toast('Darbas baigtas', `Nudažei namų: ${PJ.jobs} · uždirbai ${PJ.earned} €`, '#3a7bff');
}
// ---------- the house to paint + the giant arrow ----------
let paintArrow = null;
function makePaintArrow() {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0xff1a1a, fog: false });
  g.add(S(G.cyl, m, 0.9, 6, 0.9, 0, 5.5, 0));
  { const c = S(G.cone, m, 2.4, 3.6, 2.4, 0, 1.8, 0); c.rotation.x = Math.PI; g.add(c); }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff4040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6, fog: false })); glow.scale.setScalar(14); glow.position.y = 4; g.add(glow);
  g.scale.setScalar(1.8); world.add(g); return g;
}
function paintable(v) { return v.spec.roof === 'pyramid' || v.spec.roof === 'cone' || v.spec.roof === 'flat'; }
function nextPaintHouse() {
  const list = villageHouses.filter(v => paintable(v) && v !== PJ.last);
  const v = pick(list); PJ.house = v; PJ.last = v;
  const [col, name] = pick(PAINTS); PJ.color = col; PJ.colorName = name;
  attachRoller(false); attachRoller(true);
  const { w, d: dp, h } = v.spec;
  // four walls: front (+z), back (−z), right (+x), left (−x) in the house's own frame
  const faces = [[0, dp / 2, 0, w], [0, -dp / 2, Math.PI, w], [w / 2, 0, Math.PI / 2, dp], [-w / 2, 0, -Math.PI / 2, dp]];
  if (v.paint) v.g.remove(v.paint);
  const pg = new THREE.Group(); v.g.add(pg); v.paint = pg;
  const m = mat(col, { roughness: 0.55 });
  PJ.sides = faces.map(([x, z, ry, width]) => {
    const pl = mesh(new THREE.PlaneGeometry(width - 0.05, 1), m);
    const nx = Math.sin(ry), nz = Math.cos(ry);
    pl.position.set(x + nx * 0.06, 0.01, z + nz * 0.06); pl.rotation.y = ry; pl.scale.y = 0.001; pg.add(pl);
    return { pl, p: 0, h, nx, nz, x, z };
  });
  linearize(pg);
  const dist = player.pos.distanceTo(v.g.position);
  PJ.limit = Math.round(45 + dist * 0.45); PJ.t = PJ.limit;
  if (!paintArrow) paintArrow = makePaintArrow();
  paintArrow.visible = true;
  const top = v.g.position.clone().addScaledVector(v.d, h + (v.spec.roofH || 2) + 3);
  paintArrow.position.copy(top); orient(paintArrow, v.d, v.fz); paintArrow.userData.base = top.clone();
  toast(`Naujas užsakymas: nudažyk namą ${PJ.colorName}!`, `Seki didžiulę raudoną rodyklę · ${Math.round(dist)} m · laikas ${mmss(PJ.limit)}`, '#ff3b3b');
}
function sideWorldPos(s, out) { const v = PJ.house; out.set(s.x, 1.4, s.z).applyQuaternion(v.g.quaternion).add(v.g.position); return out; }
const _pw2 = new V3(), _pn = new V3();
let paintNear = false;
function updatePaintJob(dt, t) {
  paintNear = false;
  if (!PJ.active || !PJ.house) return;
  const v = PJ.house;
  PJ.t -= dt;
  if (paintArrow && paintArrow.visible) { paintArrow.position.copy(paintArrow.userData.base).addScaledVector(v.d, Math.sin(t * 3) * 1.2); paintArrow.rotateY(dt * 1.5); }
  // painting: stand by a wall and hold a mouse button
  const holding = (hands.L.hold || hands.R.hold) && !player.inCar;
  let any = false;
  if (player.pos.distanceTo(v.g.position) < Math.max(v.spec.w, v.spec.d) + 3) {
    paintNear = true;
    for (const s of PJ.sides) {
      if (s.p >= 1) continue;
      sideWorldPos(s, _pw2);
      if (_pw2.distanceTo(player.pos.clone().addScaledVector(player.up, 1.4)) > 2.6 + Math.max(v.spec.w, v.spec.d) * 0.28) continue;
      _pn.set(s.nx, 0, s.nz).applyQuaternion(v.g.quaternion);
      if (player.pos.clone().sub(_pw2).dot(_pn) < 0) continue;   // stand on the outside of that wall
      if (holding) {
        s.p = Math.min(1, s.p + dt / 2.2); any = true;
        s.pl.scale.y = s.h * s.p; s.pl.position.y = s.h * s.p / 2;
        if (Math.random() < dt * 14) { tone(rr(180, 260), 0.06, { type: 'triangle', vol: 0.02, lp: 600 }); }
        if (s.p >= 1) { tone(880, 0.1, { type: 'triangle', vol: 0.05 }); tone(1320, 0.12, { type: 'triangle', vol: 0.05, when: 0.08 }); }
      }
      break;
    }
  }
  if (heldRoller) heldRoller.rotation.x = any ? Math.sin(t * 20) * 0.4 : 0;
  const done = PJ.sides.filter(s => s.p >= 1).length;
  if (done === 4) finishPaintHouse();
  // HUD
  const sc = $('shiftChip'); sc.hidden = false; sc.classList.toggle('late', PJ.t < 0);
  sc.innerHTML = (player.pos.distanceTo(v.g.position) > 12 ? arrowTo(v.g.position) + ' ' : '') + `Dažyk ${PJ.colorName} · liko <b>${PJ.t >= 0 ? mmss(PJ.t) : 'vėluoji!'}</b> · sienos ${done}/4 · uždirbta <b>${PJ.earned} €</b>`;
}
function finishPaintHouse() {
  const left = Math.max(0, PJ.t), pay = PJ.t > 0 ? Math.round(40 + 220 * left / PJ.limit) : 15;
  addMoney(pay); PJ.earned += pay; PJ.jobs++;
  poof(PJ.house.g.position.clone().addScaledVector(PJ.house.d, 2), PJ.color);
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
  toast(PJ.t > 0 ? `Nudažyta! +${pay} €` : `Nudažyta, bet per vėlai… +${pay} €`, PJ.t > 0 ? `Likęs laikas ${mmss(left)} – kuo greičiau, tuo daugiau. Rodyklė jau rodo kitą namą!` : 'Kitą kartą skubėk! Rodyklė rodo naują namą', '#ffd23a');
  PJ.house = null;
  if (PJ.jobs >= 3) { setTimeout(() => { if (PJ.active) { endPaintJob(); toast('Darbas baigtas – 3 namai nudažyti!', `Uždirbai ${PJ.earned} €. Norėsi dar – grįžk į dirbtuvę ir pradėk naują darbą`, '#3a7bff'); } }, 1500); return; }
  setTimeout(() => { if (PJ.active) nextPaintHouse(); }, 1500);
}
// ---------- the paint roller ----------
let heldRoller = null;
function attachRoller(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !heldRoller) {
    const g = new THREE.Group(); g.add(S(G.cyl, mat(0x8a5a2b), 0.03, 0.5, 0.03, 0, 0, 0.12).rotateX(Math.PI / 2)); g.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.6 }), 0.015, 0.25, 0.015, 0, 0.1, 0.38));
    const r = S(G.cyl, mat(PJ.color || 0xffffff, { roughness: 0.9 }), 0.08, 0.34, 0.08, 0, 0.2, 0.38); r.rotation.z = Math.PI / 2; g.add(r);
    g.position.set(0, -0.05, 0.05); hand.add(g); linearize(g); heldRoller = g;
  }
  if (!on && heldRoller) { hand.remove(heldRoller); heldRoller = null; }
}
