// ================= Command #11: "Dešimt auksinių katinų" =================
// ten golden waving lucky cats: 5 small ones you carry by hand (two at a time), 4 giant ones you tow with the tractor
// to the city gate, and the last one belongs to someone in the city – ask people around, then pay or dance for it.
// Put them all in the ring in the Creator's hall → a golden kitten pet + one golden cat for the museum.
const Q13 = { stage: 'none', got: [], placed: [], deal: 'none' };   // none | hunt | museum | done
try { const s = JSON.parse(localStorage.getItem('modly-quest13') || 'null'); if (s) Object.assign(Q13, s); if (Q13.deal === 'dance') Q13.deal = 'none'; } catch (_) { }
function saveQ13() { try { localStorage.setItem('modly-quest13', JSON.stringify(Q13)); } catch (_) { } }
const q13Active = () => Q13.stage !== 'none' && Q13.stage !== 'done';
const CAT_IDS = ['s0', 's1', 's2', 's3', 's4', 'g0', 'g1', 'g2', 'g3', 'last'];
const Q13_GIVE = [
  'Naujas įsakymas, mažasis: DEŠIMT AUKSINIŲ KATINŲ. Tokių, kurie visą laiką moja letenėle ir neša laimę.',
  'Demonas juos išmėtė po visą pasaulį. Penkis mažus parneši rankomis – po du vienu kartu. Keturi yra milžiniški – jiems reikės traktoriaus. Nutempk juos prie miesto vartų, o aš juos paimsiu.',
  'O paskutinis… jį turi kažkas iš miesto žmonių. Klausinėk praeivių. Gal reikės pasiūlyti pinigų – ar ką nors kita. Visus sudėk į ratą mano salėje.'
];
function Q13_LINES() {
  if (Q13.stage === 'hunt') return [`Rate jau ${Q13.placed.length} iš 10 auksinių katinų. Mažus nešk rankomis, milžiniškus tempk traktoriumi prie vartų, o paskutinio klausk žmonių mieste.`];
  if (Q13.stage === 'museum') return ['Vieną auksinį katiną nunešk į muziejų – tegul moja ten visiems lankytojams.'];
  if (Q13.stage === 'done') { const fin = ['Dešimt katinų moja mano salėje. Dabar čia laimės – per akis!']; return Q14.stage === 'none' ? fin.concat(Q14_GIVE) : (Q14_LINES() || fin); }
  return null;
}
function q13TalkEnd() {
  if (Q13.stage !== 'none' || Q12.stage !== 'done') return false;
  Q13.stage = 'hunt'; saveQ13(); refreshCats();
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
  toast('Įsakymas #11: Dešimt auksinių katinų', '5 nešk rankomis, 4 tempk traktoriumi, paskutinio klausk žmonių', '#ffd23a');
  return true;
}

// ---------- the golden waving cat ----------
const goldMat = () => mat(0xffc81a, { metalness: 0.85, roughness: 0.25, emissive: 0x3a2800 });
function makeLuckyCat() {
  const g = new THREE.Group(), gold = goldMat(), red = mat(0xe8262e), pink = mat(0xff9ab0), blk = bmat(0x111111);
  g.add(S(G.cyl, red, 0.5, 0.12, 0.45, 0, 0.06, 0));
  g.add(S(G.sph, gold, 0.45, 0.5, 0.4, 0, 0.55, 0));
  g.add(S(G.sph, gold, 0.42, 0.37, 0.37, 0, 1.15, 0.02));
  for (const x of [-1, 1]) { g.add(S(G.cone, gold, 0.13, 0.22, 0.09, x * 0.24, 1.48, 0)); g.add(S(G.cone, pink, 0.08, 0.14, 0.04, x * 0.24, 1.46, 0.05)); }
  for (const x of [-1, 1]) { const e = S(G.box, blk, 0.12, 0.025, 0.02, x * 0.14, 1.2, 0.36); e.rotation.z = x * 0.25; g.add(e); for (const k of [-1, 1]) { const w = S(G.box, blk, 0.2, 0.01, 0.01, x * 0.3, 1.08 + k * 0.03, 0.33); w.rotation.z = x * k * 0.15; g.add(w); } }
  g.add(S(G.sph, pink, 0.04, 0.03, 0.03, 0, 1.12, 0.38));
  g.add(mesh(new THREE.TorusGeometry(0.3, 0.04, 6, 20), red, 0, 0.88, 0.04).rotateX(Math.PI / 2.3)); g.add(S(G.sph, gold, 0.07, 0.07, 0.07, 0, 0.8, 0.34));
  const paw = new THREE.Group(); paw.position.set(0.3, 0.85, 0.12); g.add(paw);
  paw.add(S(G.cyl, gold, 0.09, 0.4, 0.09, 0, 0.2, 0)); paw.add(S(G.sph, gold, 0.12, 0.12, 0.12, 0, 0.42, 0)); paw.add(S(G.sph, pink, 0.05, 0.05, 0.02, 0, 0.43, 0.1));
  const coin = S(G.cyl, gold, 0.18, 0.04, 0.24, -0.22, 0.55, 0.36); coin.rotation.x = Math.PI / 2; g.add(coin); g.add(S(G.box, red, 0.04, 0.2, 0.02, -0.22, 0.55, 0.39));
  g.add(S(G.sph, gold, 0.13, 0.11, 0.13, -0.22, 0.45, 0.3));
  g.userData.paw = paw; return g;
}
const waving = [];   // every cat whose paw waves
function wave(t) { for (const c of waving.concat(handCats, museumCat ? [museumCat] : [])) c.userData.paw.rotation.z = -0.25 + Math.sin(t * 4 + (c.userData.ph || 0)) * 0.45; for (const pt of pets) if (pt.def.id === 'goldcat' && pt.mesh.userData.paw) pt.mesh.userData.paw.rotation.z = -0.3 + Math.sin(t * 5) * 0.5; }

// the little golden kitten pet
ANIMALS.push({ id: 'goldcat', secret: true, kind: 'Auksinis kačiukas', desc: 'Mažas auksinis kačiukas, kuris moja letenėle ir neša laimę.', speed: 5.5, rad: 0.4, say: ['Miau!', 'Mrr-mojuoju!', 'Miau miau!'], names: ['Laimiukas'],
  make() {
    const g = new THREE.Group(), b = new THREE.Group(), gold = goldMat(), pink = mat(0xff9ab0), blk = bmat(0x111111); g.add(b);
    b.add(S(G.sph, gold, 0.32, 0.28, 0.4, 0, 0.42, 0));
    const head = new THREE.Group(); head.position.set(0, 0.8, 0.25); b.add(head);
    head.add(S(G.sph, gold, 0.27, 0.24, 0.24)); for (const x of [-1, 1]) { head.add(S(G.cone, gold, 0.08, 0.16, 0.06, x * 0.15, 0.22, 0)); head.add(S(G.box, blk, 0.08, 0.02, 0.02, x * 0.09, 0.03, 0.23)); }
    head.add(S(G.sph, pink, 0.03, 0.025, 0.02, 0, -0.03, 0.24));
    b.add(mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 16), mat(0xe8262e), 0, 0.62, 0.18).rotateX(Math.PI / 2.4)); b.add(S(G.sph, gold, 0.05, 0.05, 0.05, 0, 0.56, 0.36));
    const legs = []; for (const [x, z] of [[0.15, 0.22], [-0.15, 0.22], [0.15, -0.2], [-0.15, -0.2]]) { const p = new THREE.Group(); p.position.set(x, 0.3, z); p.add(S(G.cyl, gold, 0.07, 0.3, 0.07, 0, -0.15, 0)); b.add(p); legs.push(p); }
    const paw = new THREE.Group(); paw.position.set(0.22, 0.6, 0.3); b.add(paw); paw.add(S(G.cyl, gold, 0.06, 0.28, 0.06, 0, 0.14, 0)); paw.add(S(G.sph, gold, 0.08, 0.08, 0.08, 0, 0.3, 0));
    const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.38); b.add(tail); tail.add(S(G.cyl, gold, 0.04, 0.4, 0.04, 0, 0.2, -0.05).rotateX(-0.4));
    g.userData = { body: b, legs, head, tail, paw }; return g;
  } });
SAYS.goldcat = () => { tone(1100, 0.12, { to: 1500, type: 'sine', vol: 0.04 }); tone(1600, 0.1, { type: 'sine', vol: 0.03, when: 0.12 }); };

// ---------- the cats in the world ----------
const CATS = {};   // id → { id, kind, g, d, inspect, solid }
// every cat keeps the same place forever: found once with a fixed random sequence, then remembered in the browser
let catSpots = {}; try { catSpots = JSON.parse(localStorage.getItem('modly-catspots') || '{}') || {}; } catch (_) { catSpots = {}; }
function saveCatSpots() { try { localStorage.setItem('modly-catspots', JSON.stringify(catSpots)); } catch (_) { } }
function catSpot(key, b, minW, cond) {
  if (Array.isArray(catSpots[key])) return new V3().fromArray(catSpots[key]).normalize();
  let s = 7331 + key.charCodeAt(0) * 101 + key.charCodeAt(1) * 7919; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let pass = 0; pass < 2; pass++) for (let k = 0; k < 4000; k++) {
    const u = r() * 2 - 1, t = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), d = new V3(q * Math.cos(t), u, q * Math.sin(t));
    weights(d.x, d.y, d.z, W); if (W[b] < minW || nearRoad(d, 3.5) || nearReserved(d) || (pass === 0 && !cond(d))) continue;
    catSpots[key] = d.toArray(); saveCatSpots(); return d;
  }
  return null;
}
function buildLuckyCats() {
  const biomes = [1, 2, 3, 4, 5];
  biomes.forEach((b, i) => {
    const d = catSpot('s' + i, b, 0.75, d => isLand(d, 0.4) && farFromOthers(d, 5)); if (!d) return; placedList.push(d);
    const g = new THREE.Group(); g.add(S(G.cyl, mat(0x7a1010), 0.6, 0.5, 0.6, 0, 0.25, 0)); const c = makeLuckyCat(); c.position.y = 0.5; c.userData.ph = i; g.add(c); waving.push(c); g.add(beamMesh(0xffd23a));
    place(g, d, i * 1.3); linearize(g); g.userData.noCollapse = true;
    const id = 's' + i; CATS[id] = { id, kind: 'small', g, d, inspect: addInspect(surf(d, 1), 'Auksinė katė', '', 0, { verb: 'paimti auksinę katę', onUse: () => pickSmallCat(id) }) };
  });
  [1, 2, 4, 6].forEach((b, i) => {
    const d = catSpot('g' + i, b, 0.8, d => isLand(d, 0.5) && farFromOthers(d, 10) && !nearRoad(d, 5)); if (!d) return; placedList.push(d);
    const g = new THREE.Group(); const c = makeLuckyCat(); c.scale.setScalar(3.6); c.userData.ph = i * 1.3; g.add(c); waving.push(c);
    const bm = beamMesh(0xffd23a); bm.scale.set(3, 1, 3); g.add(bm);
    place(g, d, i * 1.7, -0.1); linearize(g); g.userData.noCollapse = true;
    const id = 'g' + i, solid = addSolid(d, 1.9, 5.5);
    CATS[id] = { id, kind: 'giant', g, d, solid, inspect: addInspect(surf(d, 2), 'Milžiniška auksinė katė', 'Milžiniška auksinė katė moja tau letena. Ji per sunki rankomis – iškviesk traktorių (F), privažiuok ir spausk Space, kad prikabintum. Tada tempk ją prie miesto vartų.', 0) };
  });
  // people in the city who might own the last cat
  for (const c of critters) if (c.type === 'person') { const it = addInspect(c.pos, 'Praeivis', '', 0, { verb: 'paklausti apie auksinę katę', onUse: () => askPerson(c) }); c.catInspect = it; }
  // the ring in the Creator's hall
  buildCatRing();
  animators.push((dt, t) => wave(t));
  refreshCats();
}
function refreshCats() {
  const hunt = Q13.stage === 'hunt';
  for (const id in CATS) {
    const c = CATS[id], got = Q13.got.includes(id) || Q13.placed.includes(id);
    if (c.kind === 'small') { c.g.visible = hunt && !got; c.inspect.r = c.g.visible ? 3.2 : 0; }
    else if (c.kind === 'giant') {
      c.g.visible = hunt && !got; c.inspect.r = c.g.visible ? 7 : 0; c.g.children[1].visible = towCat !== c;
      const i = solids.indexOf(c.solid); if (c.g.visible && towCat !== c) { if (i < 0) solids.push(c.solid); } else if (i >= 0) solids.splice(i, 1);
    }
  }
  const askOn = hunt && !Q13.got.includes('last') && !Q13.placed.includes('last');
  for (const c of critters) if (c.catInspect) c.catInspect.r = askOn ? 2.6 : 0;
  refreshCarryCats(); refreshCatRing();
}

// ---------- carrying by hand ----------
const carried = () => Q13.got.filter(id => !Q13.placed.includes(id) && !id.startsWith('g'));
let handCats = [];
function refreshCarryCats() {
  for (const m of handCats) m.parent && m.parent.remove(m); handCats = [];
  const parts = player.mesh.userData.parts;
  carried().slice(0, 2).forEach((id, k) => { const m = makeLuckyCat(); m.scale.setScalar(0.32); m.position.set(0, -0.3, 0.12); m.userData.ph = k * 2; (k === 0 ? parts.handL : parts.handR).add(m); linearize(m); handCats.push(m); });
}
function pickSmallCat(id) {
  if (Q13.stage !== 'hunt' || Q13.got.includes(id)) return;
  if (carried().length >= 2) { toast('Abi rankos pilnos!', 'Pirma nunešk šias dvi kates pas Kūrėją (per miesto vartus)', '#ffb347'); return; }
  Q13.got.push(id); saveQ13(); refreshCats();
  [784, 988, 1175].forEach((f, k) => tone(f, 0.15, { type: 'triangle', vol: 0.06, when: k * 0.06 }));
  toast('Paėmei auksinę katę!', carried().length >= 2 ? 'Abi rankos pilnos – nešk pas Kūrėją' : 'Gali paimti dar vieną į kitą ranką', '#ffd23a');
}

// ---------- the giant cats and the tractor ----------
let towCat = null, catRope = null;
function q13Hook() {
  if (Q13.stage !== 'hunt' || !(player.inCar && ride === auto && auto.spec.id === 'tractor')) return false;
  if (towCat) { const c = towCat; towCat = null; c.solid.p = c.g.position.clone(); c.solid.up = c.g.position.clone().normalize(); c.solid.dir = c.solid.up.clone(); catSpots[c.id] = c.solid.dir.toArray(); saveCatSpots(); c.d = c.solid.dir.clone(); c.inspect.pos.copy(surf(c.d, 2)); c.solid.top = c.g.position.length() + 5.5; refreshCats(); tone(300, 0.15, { type: 'square', vol: 0.05 }); toast('Atkabinai katę', 'Space – prikabinti vėl', '#7dff6b'); return true; }
  let best = null, bd = 16; for (const id in CATS) { const c = CATS[id]; if (c.kind === 'giant' && c.g.visible) { const dd = c.g.position.distanceTo(auto.pos); if (dd < bd) { bd = dd; best = c; } } }
  if (!best) return false;
  towCat = best; refreshCats(); noiseHit(0.3, { f: 1200, vol: 0.12 }); tone(200, 0.2, { to: 400, type: 'square', vol: 0.05 });
  toast('Milžiniška katė prikabinta!', 'Tempk ją prie miesto vartų aikštėje', '#ffd23a'); return true;
}
function updateQ13(dt, t) {
  if (Q13.stage !== 'hunt') { if (catRope) catRope.visible = false; return; }
  const towing = towCat && player.inCar && ride === auto && auto.spec.id === 'tractor';
  if (towCat && !towing) { const c = towCat; towCat = null; c.solid.p = c.g.position.clone(); c.solid.up = c.g.position.clone().normalize(); c.solid.dir = c.solid.up.clone(); catSpots[c.id] = c.solid.dir.toArray(); saveCatSpots(); c.d = c.solid.dir.clone(); c.inspect.pos.copy(surf(c.d, 2)); refreshCats(); }
  if (towing) {
    const c = towCat, back = auto.pos.clone().addScaledVector(auto.fwd, -(auto.spec.len / 2 + 5.5)), bd = back.clone().normalize();
    c.g.position.lerp(bd.clone().multiplyScalar(R + groundH(bd)), Math.min(1, dt * 6)); orient(c.g, bd, auto.fwd);
    if (!catRope) { catRope = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), mat(0x30343e)); world.add(catRope); }
    const a = auto.pos.clone().addScaledVector(auto.fwd, -auto.spec.len / 2).addScaledVector(auto.up, 0.8), b = c.g.position.clone().addScaledVector(bd, 2.5);
    catRope.visible = true; catRope.position.copy(a).add(b).multiplyScalar(0.5); catRope.scale.y = a.distanceTo(b); catRope.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    if (gate.group && c.g.position.distanceTo(gate.group.position) < 17) deliverGiantCat(c);
  } else if (catRope) catRope.visible = false;
  // dancing for the last cat
  if (Q13.deal === 'dance' && catOwner) {
    if (catOwner.pos.distanceTo(player.pos) > 9) { if (!danceWarn) { danceWarn = true; toast('Per toli!', 'Šok prie žmogaus, kuris turi katę', '#ffb347'); } }
    else { danceWarn = false; if (lastGrounded && !player.grounded && player.vr > 7) { danceN++; tone(523 + danceN * 80, 0.15, { type: 'triangle', vol: 0.06 }); if (danceN >= 5) finishDance(); else toast(`Šoki! ${danceN} / 5`, 'Šok toliau!', '#ff8fd0'); } }
    catOwner.vel.set(0, 0, 0); catOwner.timer = 2;
  }
  lastGrounded = player.grounded;
}
function deliverGiantCat(c) {
  towCat = null; if (catRope) catRope.visible = false;
  Q13.placed.push(c.id); saveQ13(); refreshCats(); poof(c.g.position.clone(), 0xffd23a); sfx.magic();
  checkRingDone();
  toast('Kūrėjas paėmė milžinišką katę!', `Šviesos spindulys nunešė ją į ratą · rate ${Q13.placed.length} / 10`, '#ffd23a');
}

// ---------- asking people about the last cat ----------
let catOwner = null, askedN = 0, ownerAt = 0, danceN = 0, danceWarn = false, lastGrounded = true;
const NO_CAT = ['Auksinė katė? Ne, neturiu. Bet mačiau kažką blizgančio prie fontano… a, ne, tai buvo moneta.', 'Ne, aš turiu tik žuvytę akvariume.', 'Katė, kuri moja? Mano kaimynas turi! …Ai, ne, jis moja pats.', 'Nežinau. Paklausk ko nors kito!', 'Auksinė? Aš net sidabrinės neturiu.', 'Hmm… girdėjau, kad kažkas mieste ją slepia namie. Ne aš!'];
function askPerson(c) {
  if (Q13.stage !== 'hunt' || Q13.got.includes('last') || Q13.placed.includes('last')) return;
  if (!ownerAt) ownerAt = 3 + Math.floor(Math.random() * 3);
  if (catOwner === c) { ownerTalk(); return; }
  if (c.askedCat) { startTalk('Praeivis', ['Jau klausei manęs! Neturiu jokios auksinės katės.'], '#ffd23a'); return; }
  c.askedCat = true; askedN++;
  if (askedN >= ownerAt && !catOwner) { catOwner = c; ownerTalk(true); return; }
  startTalk('Praeivis', [pick(NO_CAT)], '#ffd23a');
}
function ownerTalk(first) {
  if (Q13.deal === 'dance') { startTalk('Katės savininkas', [`Šok šok! Dar ${5 - danceN} kartus! (Space)`], '#ff8fd0'); return; }
  startTalk('Katės savininkas', first ? ['Auksinė katė, kuri moja? Taip… turiu tokią. Ji kasdien man moja nuo palangės.', 'Atiduoti? Hmm… Ji man labai brangi. Ką gali man už ją pasiūlyti?'] : ['Tai ką, sugalvojai, ką man pasiūlysi už auksinę katę?'], '#ff8fd0', () => {
    askChoice('Ką pasiūlysi?', 'TAIP – pasiūlyti 300 €. NE – pasiūlyti ką nors kita.', '#ffd23a', yes => {
      if (yes) {
        if (money < 300) { startTalk('Katės savininkas', ['Tu neturi 300 €! Gal pasiūlyk ką nors kita?'], '#ff8fd0'); return; }
        addMoney(-300); startTalk('Katės savininkas', ['300 €? Sutarta! Imk ją. Tegul moja Kūrėjui.'], '#ff8fd0', getLastCat); return;
      }
      Q13.deal = 'dance'; danceN = 0; lastGrounded = true;
      startTalk('Katės savininkas', ['Ką nors kita? Hmm… Žinai ką? Aš labai mėgstu šokius!', 'Pašok man penkis kartus čia, šalia manęs (Space). Jei gražiai pašoksi – katė tavo!'], '#ff8fd0', () => toast('Šok! 0 / 5', 'Spausk Space prie katės savininko', '#ff8fd0'));
    });
  });
}
function finishDance() {
  Q13.deal = 'none'; startTalk('Katės savininkas', ['Bravo! Kaip gražiai šoki! Sutarta – auksinė katė tavo.'], '#ff8fd0', getLastCat);
}
function getLastCat() {
  if (carried().length >= 2) { Q13.got.push('last'); saveQ13(); refreshCats(); toast('Gavai paskutinę auksinę katę!', 'Ji tavo – bet rankos pilnos, ji keliaus kartu. Nešk pas Kūrėją', '#ffd23a'); return; }
  Q13.got.push('last'); Q13.deal = 'none'; saveQ13(); refreshCats(); [784, 988, 1175, 1568].forEach((f, k) => tone(f, 0.15, { type: 'triangle', vol: 0.06, when: k * 0.06 }));
  toast('Gavai paskutinę auksinę katę!', 'Nunešk ją pas Kūrėją', '#ffd23a');
}

// ---------- the ring in the Creator's hall ----------
const RING_C = new V3(9, 0, 13), RING_R = 4.6;
const ringCats = {};
function ringPos(i) { const a = i / 10 * Math.PI * 2; return new V3(RING_C.x + Math.cos(a) * RING_R, 0, RING_C.z + Math.sin(a) * RING_R); }
function buildCatRing() {
  const ring = mesh(new THREE.RingGeometry(RING_R - 0.25, RING_R + 0.25, 64), bmat(0xffd23a, { side: THREE.DoubleSide, transparent: true, opacity: 0.6 })); ring.rotation.x = -Math.PI / 2; ring.position.set(RING_C.x, 0.04, RING_C.z); sanc.add(ring); ringCats.ring = ring;
  CAT_IDS.forEach((id, i) => {
    const p = ringPos(i), g = new THREE.Group(); g.position.copy(p); g.rotation.y = Math.atan2(RING_C.x - p.x, RING_C.z - p.z) + Math.PI; sanc.add(g);
    if (!id.startsWith('g')) g.add(S(G.cyl, mat(0x7a1010), 0.5, 0.5, 0.5, 0, 0.25, 0));
    const c = makeLuckyCat(); c.position.y = id.startsWith('g') ? 0 : 0.5; if (id.startsWith('g')) c.scale.setScalar(1.7); c.userData.ph = i * 0.7; g.add(c); c.visible = false; linearize(g); ringCats[id] = c;
  });
  sancAnim.push((dt, t) => { for (const id of CAT_IDS) if (ringCats[id].visible) ringCats[id].userData.paw.rotation.z = -0.25 + Math.sin(t * 4 + ringCats[id].userData.ph) * 0.45; ringCats.ring.material.opacity = 0.35 + 0.25 * Math.sin(t * 2); });
}
function refreshCatRing() { for (const id of CAT_IDS) if (ringCats[id]) ringCats[id].visible = Q13.placed.includes(id); }
const q13SanctumNear = () => Q13.stage === 'hunt' && carried().length > 0 && Math.hypot(player.pos.x - RING_C.x, player.pos.z - RING_C.z) < RING_R + 2.5;
function q13PlaceCats() {
  const c = carried(); Q13.placed.push(...c); saveQ13(); refreshCats();
  [523, 659, 784].forEach((f, k) => tone(f, 0.2, { type: 'triangle', vol: 0.06, when: k * 0.08 })); sfx.chime();
  if (!checkRingDone()) toast(c.length > 1 ? 'Sudėjai auksines kates į ratą!' : 'Auksinė katė rate!', `Rate ${Q13.placed.length} / 10`, '#ffd23a');
}
function checkRingDone() {
  if (Q13.placed.length < 10 || Q13.stage !== 'hunt') return false;
  const finish = () => {
    Q13.stage = 'museum'; saveQ13();
    if (!petBook.some(r => r.t === 'goldcat')) { petBook.push({ uid: petUid++, t: 'goldcat', n: 'Laimiukas', active: false, pt: null }); savePets(); }
    attachMuseumCat(true); SAYS.goldcat(); [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
    toast('Gavai auksinį kačiuką Laimiuką!', 'Jis laukia tavo gyvūnų kolekcijoje (I). O auksinę katę rankoje nunešk į muziejų', '#ffd23a');
  };
  if (mode === 'sanctum') startTalk('Kūrėjas', ['Dešimt auksinių katinų! Visi moja kartu – jauti, kiek čia dabar laimės?', 'Štai tau dovana – mažas auksinis kačiukas. Jis vardu Laimiukas ir visur seks paskui tave.', 'O šitą vieną auksinę katę nunešk į muziejų. Tegul moja visiems lankytojams.'], '#ffe98a', finish);
  else finish();
  return true;
}
let museumCat = null;
function attachMuseumCat(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !museumCat) { museumCat = makeLuckyCat(); museumCat.scale.setScalar(0.32); museumCat.position.set(0, -0.3, 0.12); hand.add(museumCat); linearize(museumCat); }
  if (!on && museumCat) { hand.remove(museumCat); museumCat = null; }
}
function deliverMuseumCat() {
  attachMuseumCat(false); Q13.stage = 'done'; saveQ13(); addMoney(1500); refreshMuseumExtras();
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xffd23a);
  toast('Įsakymas #11 įvykdytas!', 'Auksinė mojuojanti katė – muziejuje. Apdovanojimas: 1500 €', '#ffe98a');
}

// ---------- HUD ----------
function updateQ13Hud(el) {
  if (!q13Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  const p = player.inCar ? ride.pos : player.pos, n = Q13.placed.length, carry = carried().length;
  const nearestOfKind = kind => { let best = null, bd = 1e9; for (const id in CATS) { const c = CATS[id]; if (c.kind === kind && c.g.visible) { const d = c.g.position.distanceTo(p); if (d < bd) { bd = d; best = c; } } } return best; };
  if (Q13.stage === 'museum') { step = 'Nunešk auksinę katę į muziejų'; target = museum && museum.g.position; }
  else if (mode === 'sanctum') step = carry ? 'Sudėk kates į auksinį ratą (E prie rato)' : `Rate ${n} / 10 · ieškok kitų katinų pasaulyje`;
  else if (towCat) { step = 'Tempk milžinišką katę prie miesto vartų'; target = gate.group && gate.group.position; }
  else if (Q13.deal === 'dance') { step = `Šok prie katės savininko: <b>${danceN} / 5</b> (Space)`; target = catOwner && catOwner.pos; }
  else if (carry >= 2) { step = 'Abi rankos pilnos – nešk kates pas Kūrėją per vartus'; target = gate.center; }
  else if (nearestOfKind('small')) { const c = nearestOfKind('small'); step = `Paimk auksinę katę rankomis${carry ? ' (dar viena ranka laisva)' : ''}`; target = c.g.position; }
  else if (carry) { step = 'Nunešk kates pas Kūrėją per miesto vartus'; target = gate.center; }
  else if (nearestOfKind('giant')) { const c = nearestOfKind('giant'); step = player.inCar && auto.spec && auto.spec.id === 'tractor' ? 'Privažiuok prie milžiniškos katės ir spausk Space' : 'F – iškviesk traktorių ir važiuok prie milžiniškos katės'; target = c.g.position; }
  else if (!Q13.got.includes('last')) { step = catOwner ? 'Grįžk pas katės savininką' : 'Paskutinė katė – pas kažką mieste. Klausinėk praeivių (E)'; target = catOwner ? catOwner.pos : gate.center; }
  step += ` · rate <b>${n}/10</b>`;
  if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(p))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #11: Dešimt auksinių katinų</div><div class="qs">${step}${dist}</div></div>`;
}
