// ================= Secret mission: the chicks' dad on a little farm in the Mushroom Kingdom =================
// While you are saving the chicks (command #1), there is a small farm with a cow, a few chicks and a rooster –
// the chicks' DAD. Bring all the chicks to him so he can see they are safe → the secret BIRD costume (with a beak!).
const FARM = { seen: [], done: false, d: null, g: null, rooster: null, cow: null, kids: [], bubbleT: 0, greeted: false };
try { const s = JSON.parse(localStorage.getItem('modly-farm') || 'null'); if (s) { FARM.seen = s.seen || []; FARM.done = !!s.done; } } catch (_) { }
function saveFarm() { try { localStorage.setItem('modly-farm', JSON.stringify({ seen: FARM.seen, done: FARM.done })); } catch (_) { } }

// ---------- the bird costume ----------
SKINS.push({ id: 'bird', name: 'Paukštis', desc: 'Geltonos plunksnos, oranžinis snapas, raudona skiauterė ir uodegėlė. Slapta viščiukų tėčio dovana.', price: -1, body: '#ffd84a', hat: '#e8262e', secret: true, hint: 'Sako, jį duoda viščiukų tėtis – gaidys mažame ūkyje Grybų Karalystėje…' });
HATS.add('bird');
{
  const _eq = equipSkin; equipSkin = (id, quiet) => { _eq(id, quiet); if (skinNow === 'bird') tintPlayer(0xffd84a, 0xf0b020); };
  const _bs = buildSkin; buildSkin = (id, g) => {
    _bs(id, g); if (id !== 'bird') return;
    const beak = mat(0xff9f1c, { roughness: 0.5 }), red = mat(0xe8262e, { roughness: 0.6 }), feather = mat(0xffe680, { roughness: 0.9 }), dark = mat(0xe0a020, { roughness: 0.9 });
    // the beak: top and bottom
    const b1 = S(G.cone, beak, 0.13, 0.32, 0.13, 0, 1.8, 0.42); b1.rotation.x = Math.PI / 2; g.add(b1);
    const b2 = S(G.cone, beak, 0.09, 0.2, 0.08, 0, 1.7, 0.36); b2.rotation.x = Math.PI / 2 + 0.25; g.add(b2);
    // red comb on top and a wattle under the beak
    for (let i = 0; i < 3; i++) g.add(S(G.sph, red, 0.08, 0.12, 0.08, 0, 2.14 + (i === 1 ? 0.04 : 0), 0.12 - i * 0.12));
    g.add(S(G.sph, red, 0.05, 0.08, 0.04, 0, 1.6, 0.34));
    // wings on the sides
    for (const sx of [-1, 1]) { const w = S(G.sph, feather, 0.07, 0.3, 0.2, sx * 0.29, 1.25, -0.03); w.rotation.z = sx * 0.25; g.add(w); }
    // tail feathers
    for (let i = 0; i < 3; i++) { const t = S(G.sph, i === 1 ? dark : feather, 0.08, 0.3, 0.06, (i - 1) * 0.1, 1.05, -0.32); t.rotation.x = -0.7; t.rotation.z = (i - 1) * 0.4; g.add(t); }
    // fluffy chest
    g.add(S(G.sph, feather, 0.2, 0.22, 0.08, 0, 1.3, 0.2));
  };
}

// ---------- the rooster dad ----------
function makeRooster() {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const body = mat(0xc8541a, { roughness: 0.85 }), neck = mat(0xf0a030, { roughness: 0.8 }), red = mat(0xe8202c), yel = mat(0xffc020), tailC = [0x1a5a3a, 0x0a2a2a, 0x2a7a4a];
  b.add(S(G.sph, body, 0.34, 0.34, 0.44, 0, 0.6, 0));
  b.add(S(G.sph, neck, 0.2, 0.3, 0.2, 0, 0.92, 0.22));
  const head = new THREE.Group(); head.position.set(0, 1.18, 0.28); b.add(head);
  head.add(S(G.sph, neck, 0.16, 0.17, 0.17));
  for (let i = 0; i < 4; i++) head.add(S(G.sph, red, 0.05, 0.1 + (i % 2) * 0.03, 0.06, 0, 0.17, 0.09 - i * 0.07));
  const bk = S(G.cone, yel, 0.05, 0.14, 0.05, 0, -0.01, 0.2); bk.rotation.x = Math.PI / 2; head.add(bk);
  head.add(S(G.sph, red, 0.04, 0.08, 0.03, 0, -0.12, 0.13));
  for (const x of [-0.09, 0.09]) { head.add(S(G.sph, bmat(0xffffff), 0.04, 0.045, 0.02, x, 0.04, 0.13)); head.add(S(G.sph, bmat(0x111111), 0.022, 0.025, 0.02, x, 0.04, 0.15)); }
  const tail = new THREE.Group(); tail.position.set(0, 0.75, -0.35); b.add(tail);
  for (let i = 0; i < 5; i++) { const f = S(G.sph, mat(tailC[i % 3], { roughness: 0.5, metalness: 0.3 }), 0.06, 0.42, 0.1, (i - 2) * 0.07, 0.25, 0); f.rotation.x = -0.5; f.rotation.z = (i - 2) * 0.28; tail.add(f); }
  for (const x of [-1, 1]) { const w = S(G.sph, mat(0x9a3a10), 0.08, 0.24, 0.32, x * 0.33, 0.62, -0.02); w.rotation.z = x * 0.15; b.add(w); }
  for (const x of [-0.12, 0.12]) { b.add(S(G.cyl, yel, 0.03, 0.32, 0.03, x, 0.16, 0)); b.add(S(G.box, yel, 0.12, 0.03, 0.16, x, 0.02, 0.05)); }
  g.userData = { body: b, head, tail };
  return g;
}
function makeFarmChick() { const m = makeChick(); m.userData.glow.visible = false; m.userData.beam.visible = false; m.scale.setScalar(0.75); return m; }

function farmSpot() {
  if (Array.isArray(catSpots.fm)) return new V3().fromArray(catSpots.fm).normalize();
  // try strict rules first, then a bit looser – but never on top of houses or roads
  for (const [flat, gap, minW, far] of [[1.2, 6.5, 0.6, 10], [1.6, 5.5, 0.5, 9], [2.4, 5, 0.45, 8]]) {
    let sd = 4242; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 5000; k++) {
      const u = r() * 2 - 1, t = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), d = new V3(q * Math.cos(t), u, q * Math.sin(t));
      weights(d.x, d.y, d.z, W); if (W[3] < minW || !isLand(d, 0.4) || nearRoad(d, 6) || nearReserved(d) || !farFromOthers(d, far)) continue;
      if (solids.some(o => o.dir.angleTo(d) * R < gap + (o.r || 0))) continue;
      if (flatSpread(d, 6) > flat) continue;
      catSpots.fm = d.toArray(); saveCatSpots(); return d;
    }
  }
  return null;
}
function buildFarm() {
  const d = farmSpot() || BC[3];
  placedList.push(d); FARM.d = d;
  const g0 = new THREE.Group(); place(g0, d, 0.7, 0.05); FARM.g = g0; g0.userData.noCollapse = true; const K = 0.68;
  const g = new THREE.Group(); g.scale.setScalar(K); g0.add(g);
  const wood = mat(0x8a5a2b, { roughness: 0.95 }), red = mat(0xc8302a, { roughness: 0.8 }), white = mat(0xfff6e0), roof = mat(0x5a3a2a, { roughness: 0.9 });
  // grass yard
  g.add(mesh(new THREE.CircleGeometry(8.5, 32), mat(0x8fd06a, { roughness: 1 }), 0, 0.04, 0).rotateX(-Math.PI / 2));
  // fence with an opening at the front
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * Math.PI * 2; if (Math.cos(a) > 0.95) continue;   // gate opening facing +x
    g.add(S(G.box, wood, 0.15, 1.1, 0.15, Math.cos(a) * 8, 0.55, Math.sin(a) * 8));
  }
  for (let i = 0; i < 28; i++) {
    const a = (i + 0.5) / 28 * Math.PI * 2; if (Math.cos(a) > 0.93) continue;
    for (const y of [0.45, 0.85]) { const r = S(G.box, wood, 0.08, 0.1, 1.85, Math.cos(a) * 8, y, Math.sin(a) * 8); r.rotation.y = -a; g.add(r); }
  }
  // the little red barn at the back
  { const bx = -4.2, bz = 0;
    g.add(S(G.box, red, 4, 2.8, 3.4, bx, 1.4, bz));
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 3.8, 3, 1), roof); rf.rotation.z = Math.PI / 2; rf.rotation.y = Math.PI / 2; rf.position.set(bx, 3.2, bz); rf.scale.set(1, 1, 0.55); g.add(rf);
    g.add(S(G.box, white, 0.06, 1.9, 1.7, bx + 2.02, 0.95, bz)); g.add(S(G.box, red, 0.07, 1.7, 1.5, bx + 2.04, 0.9, bz));
    for (const s of [-1, 1]) { const x1 = S(G.box, white, 0.08, 0.08, 2.1, bx + 2.06, 0.9, bz); x1.rotation.x = s * 0.85; g.add(x1); }
    g.add(S(G.box, white, 0.06, 0.6, 0.6, bx + 2.02, 2.3, bz));
    addBox(g0, 2.1 * K, 1.8 * K, 3 * K, bx * K, bz * K);
  }
  // hay bales, a water trough and a sign
  for (const [x, z] of [[-1.5, -4.5], [-0.3, -5], [-1, -3.6]]) { const h = S(G.cyl, mat(0xe8c860, { roughness: 1 }), 0.55, 0.9, 0.55, x, 0.45, z); h.rotation.x = Math.PI / 2; g.add(h); }
  g.add(S(G.box, mat(0x6a6a72, { metalness: 0.4 }), 1.6, 0.45, 0.6, 1.5, 0.23, 4.4)); g.add(S(G.box, mat(0x4ab0e8, { emissive: 0x0a3a5a }), 1.45, 0.05, 0.48, 1.5, 0.43, 4.4));
  // a little feeding bowl with grains
  g.add(S(G.cyl, mat(0xc8a070), 0.6, 0.15, 0.6, 2, 0.08, -2)); for (let i = 0; i < 10; i++) g.add(S(G.sph, mat(0xffe08a), 0.05, 0.05, 0.05, 2 + rr(-0.4, 0.4), 0.17, -2 + rr(-0.4, 0.4)));
  const sign = makeSign('Ūkis'); sign.position.set(8.6, 0, 1.6); sign.rotation.y = Math.PI / 2; g.add(sign);
  // the cow
  { const cow = ANIMALS.find(a => a.id === 'cow').make(); cow.position.set(-0.5, 0, 3.5); cow.rotation.y = 1.2; g.add(cow); FARM.cow = cow; addLocal(g0, -0.5 * K, 3.5 * K, 0.7, 1.2); }
  // the rooster dad on a little stump
  { g.add(S(G.cyl, wood, 0.5, 0.5, 0.5, 1.2, 0.25, 0)); const r = makeRooster(); r.position.set(1.2, 0.5, 0); r.rotation.y = Math.PI / 2; r.scale.setScalar(1.4); g.add(r); FARM.rooster = r;
    const ex = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('!', '#ffd23a', '#3a2a00', 64, 64), transparent: true })); ex.scale.setScalar(0.6); ex.position.set(1.2, 3, 0); g.add(ex); FARM.ex = ex; }
  // farm chicks (the chicks' cousins) pecking in the yard
  for (let i = 0; i < 4; i++) { const m = makeFarmChick(); const a = i * 1.6; m.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3 - 1); g.add(m); FARM.kids.push({ m, a, r: rr(2.2, 4.5), sp: rr(0.25, 0.5) * (i % 2 ? 1 : -1), ph: rr(0, 6) }); }
  // the dad's own chicks that have visited sit in a row by him
  FARM.visitors = [];
  linearize(g0); g0.updateMatrixWorld(true);
  FARM.center = g0.position.clone();
  FARM.inspect = addInspect(g.localToWorld(new V3(1.2, 1, 0)), 'Gaidys tėtis', '', 4.5, { verb: 'kalbėtis su gaidžiu (viščiukų tėčiu)', onUse: talkRooster });
  refreshFarm();
}
function refreshFarm() { if (FARM.ex) FARM.ex.visible = QUEST.stage === 'active' && !FARM.done; }
function farmCount() { const s = new Set(FARM.seen.concat(QUEST.delivered)); return s.size; }
function talkRooster() {
  if (FARM.done) { startTalk('Gaidys tėtis', [pick(['Kakariekū! Mano vaikai sveiki ir laimingi. Ačiū tau, didvyri!', 'Kaip tau tinka paukščio kostiumas? Atrodai beveik kaip aš! Kakariekū!', 'Karvė Margė sako labas. Mūū – taip ji sako.'])], '#ffb020'); return; }
  if (QUEST.stage === 'none') { startTalk('Gaidys tėtis', ['Kakariekū… Demono chaosas išblaškė mano septynis vaikus po visą pasaulį.', 'Jų mama išbėgo jų ieškoti ir dingo. O aš turiu saugoti ūkį… Gal Kūrėjas žino, kur jie?'], '#ffb020'); return; }
  if (QUEST.stage === 'done') { startTalk('Gaidys tėtis', ['Mano vaikai jau saugūs pas mamą Kūrėjo Salėje. Ačiū tau! Gaila tik, kad nespėjau jų pamatyti…'], '#ffb020'); return; }
  const n = farmCount(), fol = followers().length;
  startTalk('Gaidys tėtis', [
    'Kakariekū! Aš – tų septynių viščiukų TĖTIS! Girdėjau, kad tu juos gelbsti.',
    'Prašau, atvesk juos visus čia, pas mane į ūkį – noriu pamatyti, kad jie sveiki. Paskui galėsi nuvesti juos pas mamą.',
    n ? `Jau mačiau ${n} iš 7.${fol ? '' : ' Atvesk likusius!'}` : 'Kai atvesi visus – gausi slaptą dovaną!'
  ], '#ffb020');
}
function farmReward() {
  FARM.done = true; saveFarm(); refreshFarm();
  unlockSkin('bird'); equipSkin('bird', true); addMoney(300);
  poof(player.pos.clone().addScaledVector(player.up, 1), 0xffd84a);
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  setTimeout(() => startTalk('Gaidys tėtis', [
    'KAKARIEKŪŪŪ! Visi septyni mano vaikai sveiki! Matau juos visus!',
    'Tu – tikras paukščių draugas. Štai tau mano slapta dovana: PAUKŠČIO KOSTIUMAS su snapu, skiaute ir plunksnomis! Ir 300 €.',
    QUEST.stage === 'active' ? 'O dabar nuvesk vaikus pas mamą į Kūrėjo Salę – ji labai laukia!' : 'Ačiū tau!'
  ], '#ffb020'), 300);
  toast('SLAPTA MISIJA ĮVYKDYTA!', 'Gavai PAUKŠČIO KOSTIUMĄ su snapu (ir 300 €)', '#ffd84a');
}
function updateFarm(dt, t) {
  if (!FARM.g) return;
  const r = FARM.rooster, ud = r.userData;
  ud.head.rotation.x = Math.max(0, Math.sin(t * 2.2)) * 0.3; ud.tail.rotation.x = Math.sin(t * 1.5) * 0.08;
  if (FARM.ex.visible) FARM.ex.position.y = 3 + Math.sin(t * 3) * 0.12;
  if (FARM.cow && FARM.cow.userData.head) FARM.cow.userData.head.rotation.x = 0.3 + Math.sin(t * 0.8) * 0.25;
  for (const k of FARM.kids) { k.a += k.sp * dt; const x = Math.cos(k.a) * k.r, z = Math.sin(k.a) * k.r - 1; k.m.position.set(x, Math.abs(Math.sin(t * 6 + k.ph)) * 0.06, z); k.m.rotation.y = -k.a + (k.sp > 0 ? 0 : Math.PI); k.m.userData.body.rotation.x = Math.max(0, Math.sin(t * 3 + k.ph)) * 0.5; }
  const dist = player.pos.distanceTo(FARM.center);
  if (dist > 60) return;
  FARM.bubbleT -= dt;
  if (QUEST.stage !== 'active' || FARM.done || dist > 8) { if (dist > 12) FARM.greeted = false; return; }
  const fol = followers();
  if (!fol.length) {
    if (!FARM.greeted && dist < 7.5) { FARM.greeted = true; petBubble({ pos: r.getWorldPosition(new V3()), up: player.up, def: { id: 'chick' } }, 'Kur mano vaikai?!'); toast('Gaidys šaukia: „Kur mano vaikai?!“', 'Pakalbink jį (E) – jis viščiukų tėtis', '#ffb020'); }
    return;
  }
  // chicks arrive with you – dad sees them
  let fresh = 0;
  for (const c of fol) if (!FARM.seen.includes(c.i)) { FARM.seen.push(c.i); fresh++; }
  if (!fresh) return;
  saveFarm(); peep(player.pos, true);
  tone(600, 0.15, { to: 1200, type: 'square', vol: 0.04, lp: 2400 }); tone(900, 0.4, { to: 700, type: 'sawtooth', vol: 0.04, lp: 2000, when: 0.15 });
  petBubble({ pos: r.getWorldPosition(new V3()), up: player.up, def: { id: 'chick' } }, 'Kakariekū!');
  if (farmCount() >= 7) farmReward();
  else toast(`Tėtis mato savo vaikus: ${farmCount()} iš 7!`, fol.length + farmCount() - fresh >= 7 ? '' : 'Atvesk likusius viščiukus į ūkį, paskui – pas mamą', '#ffb020');
}
// a hint: the chick in the Mushroom Kingdom wants to see its dad
{ const _pk = pickChick; pickChick = c => { _pk(c); if (!FARM.done && (c.i === 3 || !FARM.hinted)) { FARM.hinted = true; setTimeout(() => petBubble({ pos: c.pos, up: c.up, def: { id: 'chick' } }, c.i === 3 ? 'Tėtis ūkyje!' : 'Noriu pas tėtį!'), 1200); if (c.i === 3) setTimeout(() => toast('Viščiukas cypia: „Mano tėtis – ūkyje netoliese!“', 'Gal nuvesti juos visus pas tėtį gaidį?', '#ffb020'), 1800); } }; }
// test world: start the chicks mission again near the farm
function farmTest() {
  QUEST.stage = 'active'; QUEST.delivered = []; saveQuest(); FARM.seen = []; FARM.done = false; saveFarm();
  for (const m of hen.chicks) sanc.remove(m); hen.chicks.length = 0; hen.g.visible = hen.nest.visible = true;
  for (const c of chicks) { c.state = 'waiting'; c.mesh.visible = true; c.mesh.userData.glow.visible = true; if (c.mesh.userData.beam) c.mesh.userData.beam.visible = true; }
  refreshFarm();
  if (mode === 'planet' && !player.inCar) {
    const t = tangentToward(FARM.d, UP), d = moveAlong(FARM.d, t, 11);
    player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.4); player.up.copy(d); player.fwd.copy(tangentToward(d, FARM.center)); player.vel.set(0, 0, 0);
    camera.position.copy(player.pos).addScaledVector(d, 4).addScaledVector(player.fwd, -6);
  }
  toast('Bandymų pasaulis: viščiukų misija iš naujo', 'Ūkis – čia pat, Grybų Karalystėje. Surink 7 viščiukus ir atvesk pas tėtį!', '#ffd23a');
}
{ const _sq = startQuest; startQuest = () => { _sq(); refreshFarm(); }; }
