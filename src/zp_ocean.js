// ================= the Sea God's mission: help the 18 poor fish families =================
// in the ruined city live 18 fish families. Each needs something: food (from the market in the Fish City),
// 2 shells to rebuild their home, a pearl for light (clams sit on tall rocks – swim up!), or their lost baby.
// Helped families turn colourful and get a new home. When all 18 are happy the Sea God tells all the other gods
// on the Creator's phone that the little green man saved his ocean.
const Q16 = { stage: 'none', helped: [], shells: [], clams: [], babies: [], bag: { food: 0, shell: 0, pearl: 0, baby: [] } };   // none | help | done
try { const s = JSON.parse(localStorage.getItem('modly-quest16') || 'null'); if (s) { Object.assign(Q16, s); Q16.bag = Object.assign({ food: 0, shell: 0, pearl: 0, baby: [] }, s.bag || {}); } } catch (_) { }
function saveQ16() { try { localStorage.setItem('modly-quest16', JSON.stringify(Q16)); } catch (_) { } }
let phoneRead2 = false; try { phoneRead2 = localStorage.getItem('modly-phone-read2') === '1'; } catch (_) { }
const phoneUnread = () => !phoneRead || (Q16.stage === 'done' && !phoneRead2);
const OC = { fams: [], shells: [], clams: [], babies: [], stall: null };
const FAM_NAMES = ['Burbuliukai', 'Pelekai', 'Žvynai', 'Kriauklinai', 'Bangučiai', 'Dugniai', 'Srovėnai', 'Perliukai', 'Jūrželiai', 'Smėliukai', 'Koraliai', 'Putiukai', 'Gelmiai', 'Rifiukai', 'Ikriukai', 'Dumbliai', 'Uodegiai', 'Žiaunaičiai', 'Lašiukai', 'Banguoliai'];
const FAM_SKIP = [3, 14];   // Kriauklinai and Ikriukai (both lost-baby families) were removed – 18 families now
const FAM_N = 18, helpedN = () => Q16.helped.filter(i => !FAM_SKIP.includes(i)).length;
const BABY_NAMES = ['Blubis', 'Pūkis', 'Žvynutė', 'Taškiukas'];
const FAM_TYPES = ['food', 'repair', 'pearl', 'baby', 'food', 'repair', 'food', 'pearl', 'repair', 'baby', 'food', 'repair', 'pearl', 'food', 'baby', 'repair', 'food', 'pearl', 'repair', 'baby'];
let ocSeed = 4242; const orr = (a, b) => { ocSeed = (ocSeed * 16807) % 2147483647; return a + (b - a) * (ocSeed / 2147483647); };
function oMark(text, bg) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(text, bg, '#ffffff', 96, 96), transparent: true, depthWrite: false })); s.scale.setScalar(1.1); return s; }
function buildFamilies(ruin) {
  ocSeed = 4242; let bi = 0;
  for (let i = 0; i < 20; i++) {
    if (FAM_SKIP.includes(i)) { if (FAM_TYPES[i] === 'baby') bi++; continue; }
    const inner = i < 8, a = inner ? i / 8 * Math.PI * 2 + 0.2 : (i - 8) / 12 * Math.PI * 2, r = inner ? 13 : 27;
    const lx = Math.cos(a) * r, lz = Math.sin(a) * r, type = FAM_TYPES[i];
    const w = orr(4.5, 6), d = orr(4.5, 6), h = orr(4, 6.5);
    const bad = new THREE.Group(), good = new THREE.Group();
    { const tmp = { x: ruin.x, z: ruin.z, g: bad }; seaHouse(tmp, 0, 0, w, d, h, 0, 0, true); SEA.boxes.pop(); }
    { const tmp = { x: ruin.x, z: ruin.z, g: good }; seaHouse(tmp, 0, 0, w, d, h, pick([0xff9a8a, 0xffd88a, 0x8ad8ff, 0xb8ff9a, 0xd8a8ff]), pick([0xff8ab8, 0xffd23a, 0x6ad8ff])); SEA.boxes.pop(); }
    const home = new THREE.Group(); home.position.set(lx, 0, lz); home.rotation.y = -a + Math.PI / 2; ruin.g.add(home); home.add(bad, good);
    SEA.boxes.push({ x: ruin.x + lx, z: ruin.z + lz, hx: Math.max(w, d) / 2 + 0.2, hz: Math.max(w, d) / 2 + 0.2, h: h + 2 });
    const front = new V3(ruin.x + Math.cos(a) * (r - (inner ? -5 : 5)), 0, ruin.z + Math.sin(a) * (r - (inner ? -5 : 5)));
    const fish = []; for (let k = 0; k < 3; k++) { const m = makeFishPerson(0x8a8478, true); m.scale.setScalar(k === 2 ? 0.55 : 0.9); m.position.set(front.x + (k - 1) * 1.3, 0.6 + k * 0.1, front.z); seaScene.add(m); fish.push(m); }
    const mark = oMark('!', '#ffd23a'), ok = oMark('✓', '#3cc86a'); mark.position.set(front.x, 3.3, front.z); ok.position.copy(mark.position); seaScene.add(mark, ok);
    const fam = { i, name: FAM_NAMES[i], type, front, bad, good, fish, mark, ok, baby: type === 'baby' ? bi++ : -1 };
    OC.fams.push(fam);
  }
  // the market stall in the Fish City
  { const city = SEA.isl[0], g = new THREE.Group(); g.position.set(city.x + 12, 0, city.z + 8); seaScene.add(g);
    g.add(S(G.box, mat(0xd8a86a), 3.4, 1.1, 1.4, 0, 0.55, 0)); g.add(S(G.box, mat(0xff8ab8), 3.8, 0.15, 2, 0, 2.6, 0)); for (const x of [-1.6, 1.6]) g.add(S(G.cyl, mat(0x8a5a2b), 0.08, 2.6, 0.08, x, 1.3, -0.6));
    for (let k = 0; k < 6; k++) g.add(S(G.sph, mat(pick([0x8aff6a, 0xffd23a, 0xff8a3a])), 0.22, 0.18, 0.22, -1.2 + k * 0.48, 1.2, 0.2));
    g.add(mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('MAISTO TURGUS', '#8a5a2b', '#fff6e0', 384, 80), side: THREE.DoubleSide }), 0, 3.2, 0));
    const seller = makeFishPerson(0xffa04a, false); seller.position.set(0, 1.7, -1); g.add(seller);
    OC.stall = g; SEA.boxes.push({ x: g.position.x, z: g.position.z, hx: 1.8, hz: 0.8, h: 1.1 }); }
  // shells on the sea floor
  const freeSpot = (x, z, m) => SEA.boxes.every(b => Math.abs(x - b.x) > b.hx + m || Math.abs(z - b.z) > b.hz + m);
  for (let i = 0; i < 20; i++) { let a = orr(0, 6.28), r = orr(20, 110), x = Math.cos(a) * r + 20, z = Math.sin(a) * r - 20; for (let k = 0; k < 30 && !freeSpot(x, z, 1.5); k++) { a = orr(0, 6.28); r = orr(20, 110); x = Math.cos(a) * r + 20; z = Math.sin(a) * r - 20; } const m = makeShellMesh(i); m.scale.setScalar(1.3); m.position.set(x, 0.1, z); addGlow(m, 0xff9ad0); seaScene.add(m); OC.shells.push({ i, m }); }
  // clams with pearls on tall rocks
  for (let i = 0; i < 8; i++) {
    let a = orr(0, 6.28), r = orr(30, 100), x = Math.cos(a) * r + 20, z = Math.sin(a) * r - 20; const h = orr(6, 13); for (let k = 0; k < 30 && !freeSpot(x, z, 3); k++) { a = orr(0, 6.28); r = orr(30, 100); x = Math.cos(a) * r + 20; z = Math.sin(a) * r - 20; }
    const rock = new THREE.Group(); rock.position.set(x, 0, z); seaScene.add(rock);
    rock.add(S(G.cyl6, mat(0x6a6a5e), 1.4, h, 1.6, 0, h / 2, 0)); rock.add(S(G.dodec, mat(0x7a7a6a), 2, 1, 2, 0, h, 0));
    const clam = new THREE.Group(); clam.position.set(0, h + 0.8, 0); rock.add(clam);
    clam.add(S(G.dome, mat(0x9a8aaa), 0.6, 0.3, 0.5)); const lid = S(G.dome, mat(0xb8a8c8), 0.6, 0.3, 0.5); lid.rotation.x = Math.PI; lid.position.y = 0.02; clam.add(lid);
    const pearl = S(G.sph, mat(0xffffff, { emissive: 0xd8e8ff, emissiveIntensity: 0.6, roughness: 0.1 }), 0.18, 0.18, 0.18, 0, 0.12, 0); clam.add(pearl); addGlow(clam, 0xffffff);
    SEA.boxes.push({ x, z, hx: 1.3, hz: 1.3, h: h + 0.5 });
    OC.clams.push({ i, rock, clam, lid, pearl, top: new V3(x, h + 0.8, z) });
  }
  // the lost babies
  const babySpots = [[-60, 10, 2], [30, 60, 6], [-60, -150, 1.5], [140, -40, 4]];
  babySpots.forEach(([x, z, y], k) => { if (k === 0 || k === 2) return; const m = makeFishPerson(0xffd23a, false); m.scale.setScalar(0.45); m.position.set(x, y, z); addGlow(m, 0xffe14d); m.userData.glow.position.y = 0; seaScene.add(m); OC.babies.push({ k, m, home: new V3(x, y, z) }); });
  linearize(seaScene); refreshOcean();
}
function refreshOcean() {
  if (!OC.fams.length) return;
  const help = Q16.stage === 'help';
  for (const f of OC.fams) {
    const done = Q16.helped.includes(f.i);
    f.bad.visible = !done; f.good.visible = done; f.mark.visible = help && !done; f.ok.visible = done && help;
    if (done && !f.colored) { f.colored = true; f.fish.forEach(m => { const c = pick([0xff8a3a, 0x3ac8ff, 0xffd23a, 0xff6a9a, 0x8aff6a, 0xb08aff]); m.traverse(o => { if (o.isMesh && o.material && !o.material.isMeshBasicMaterial && o.geometry === G.sph && o.scale.x > 0.4) o.material = mat(c, { roughness: 0.45 }); }); linearize(m); }); }
  }
  OC.shells.forEach(s => s.m.visible = help && !Q16.shells.includes(s.i));
  OC.clams.forEach(c => { const open = Q16.clams.includes(c.i); c.pearl.visible = !open; c.lid.rotation.x = open ? Math.PI - 1.2 : Math.PI; c.clam.userData.glow.visible = help && !open; });
  OC.babies.forEach(b => { const fam = OC.fams.find(f => f.baby === b.k), home = fam && Q16.helped.includes(fam.i); if (home && !b.delivered) { b.delivered = true; b.m.position.set(fam.front.x + 0.6, 1, fam.front.z + 0.6); b.m.userData.glow.visible = false; } b.m.visible = home || Q16.bag.baby.includes(b.k) || (help && !Q16.babies.includes(b.k)); });
}
const famNeed = f => f.type === 'food' ? 'maisto' : f.type === 'repair' ? '2 kriauklių' : f.type === 'pearl' ? 'perlo' : `mažylio ${BABY_NAMES[f.baby]}`;
function nearFamily() { let best = null, bd = 4.2; for (const f of OC.fams) { const d = Math.hypot(player.pos.x - f.front.x, player.pos.z - f.front.z); if (d < bd && player.pos.y < 4) { bd = d; best = f; } } return best; }
const nearStall = () => OC.stall && Math.hypot(player.pos.x - OC.stall.position.x, player.pos.z - OC.stall.position.z) < 3.6 && player.pos.y < 4;
function oceanAction() {
  if (Q16.stage !== 'help') { const f = nearFamily(); if (f && Q16.stage === 'done') { startTalk(`Šeima ${f.name}`, [pick(['Blub blub! Ačiū tau, gelbėtojau!', 'Mūsų naujas namas toks gražus!', 'Dabar mes vėl spalvoti!'])], '#4ac8ff'); return true; } return false; }
  if (nearStall()) {
    if (Q16.bag.food >= 3) { startTalk('Turgaus žuvis', ['Tavo krepšys jau pilnas maisto! Nunešk jį vargšėms šeimoms.'], '#ffa04a'); return true; }
    Q16.bag.food = 3; saveQ16(); tone(660, 0.1, { type: 'triangle', vol: 0.05 }); tone(880, 0.1, { type: 'triangle', vol: 0.05, when: 0.08 });
    startTalk('Turgaus žuvis', ['Maisto vargšėms šeimoms? Imk, nemokamai! Štai trys maišeliai planktono.'], '#ffa04a'); return true;
  }
  const f = nearFamily(); if (!f) return false;
  if (Q16.helped.includes(f.i)) { startTalk(`Šeima ${f.name}`, ['Blub! Ačiū tau dar kartą! Mūsų namuose dabar taip gera.'], '#4ac8ff'); return true; }
  const b = Q16.bag;
  const can = f.type === 'food' ? b.food > 0 : f.type === 'repair' ? b.shell >= 2 : f.type === 'pearl' ? b.pearl > 0 : b.baby.includes(f.baby);
  if (can) {
    if (f.type === 'food') b.food--; else if (f.type === 'repair') b.shell -= 2; else if (f.type === 'pearl') b.pearl--; else b.baby.splice(b.baby.indexOf(f.baby), 1);
    if (f.type === 'baby') { const bb = OC.babies.find(q => q.k === f.baby); bb.m.position.set(f.front.x + 0.6, 1, f.front.z + 0.6); bb.m.userData.glow.visible = false; bb.delivered = true; }
    Q16.helped.push(f.i); saveQ16(); refreshOcean();
    poofSea(f.front.clone().add(new V3(0, 2, 0))); [523, 659, 784, 1047].forEach((fq, k) => tone(fq, 0.25, { type: 'triangle', vol: 0.06, when: k * 0.07 }));
    const n = helpedN();
    startTalk(`Šeima ${f.name}`, [f.type === 'food' ? 'Maistas! Pagaliau! Blub blub, ačiū tau!' : f.type === 'repair' ? 'Kriauklės! Mūsų namas vėl sveikas – žiūrėk, net stogas yra!' : f.type === 'pearl' ? 'Perlas! Dabar mūsų namuose šviesu kaip dieną!' : `${BABY_NAMES[f.baby]}! Tu jį suradai! Ačiū, ačiū, ačiū!`], '#4ac8ff', () => {
      if (n >= FAM_N) finishOcean(); else toast(`Padėjai šeimai ${f.name}!`, `Padėta šeimų: ${n} / ${FAM_N}`, '#4ac8ff');
    });
    return true;
  }
  startTalk(`Šeima ${f.name}`, [f.type === 'food' ? 'Blub… Mes labai alkani. Žuvų Mieste yra maisto turgus – gal atneštum mums maisto?' : f.type === 'repair' ? 'Mūsų namą sugriovė banga. Jei atneštum 2 kriaukles, galėtume jį atstatyti. Kriauklės švyti rožiškai jūros dugne.' : f.type === 'pearl' ? 'Mūsų namuose taip tamsu… Perlas šviestų kaip lempa. Perlų būna geldelėse ant aukštų uolų – plauk aukštyn!' : `Mūsų mažylis ${BABY_NAMES[f.baby]} nuplaukė ir pasiklydo! Jis geltonas ir mažytis, švyti. Prašau, surask jį!`], '#c8b8a0');
  return true;
}
function poofSea(p) { const parts = []; for (let i = 0; i < 10; i++) { const m = S(G.sph, new THREE.MeshBasicMaterial({ color: pick([0xff8ab8, 0xffd23a, 0x8fe0ff]), transparent: true, opacity: 0.9 }), 0.25, 0.25, 0.25); m.position.copy(p).add(randDir().multiplyScalar(0.6)); seaScene.add(m); parts.push(m); } let t = 0; fx.push(dt => { t += dt; parts.forEach(m => { m.position.y += dt * 2; m.material.opacity = Math.max(0, 0.9 - t); }); if (t > 1) { parts.forEach(m => seaScene.remove(m)); return false; } return true; }); }
function updateOcean(dt, t) {
  if (!OC.fams.length) return;
  // already enough families helped (e.g. 18 done while the game still asked for 20) → finish now
  if (Q16.stage === 'help' && helpedN() >= FAM_N && !card && !transitioning && mode === 'sea') { finishOcean(); return; }
  for (const f of OC.fams) { if (f.mark.visible) f.mark.position.y = 3.3 + Math.sin(t * 3 + f.i) * 0.2; f.fish.forEach((m, k) => { m.userData.tail.rotation.y = Math.sin(t * 4 + k + f.i) * 0.4; m.position.y = 0.6 + k * 0.1 + Math.sin(t * 1.5 + k) * 0.08; }); }
  if (Q16.stage !== 'help') return;
  const pp = player.pos;
  for (const s of OC.shells) if (s.m.visible) { s.m.rotation.y += dt; if (Math.hypot(pp.x - s.m.position.x, pp.z - s.m.position.z) < 1.8 && pp.y < 2.5) { Q16.shells.push(s.i); Q16.bag.shell++; saveQ16(); refreshOcean(); tone(880, 0.1, { type: 'triangle', vol: 0.05 }); toast(`Kriauklė! (krepšyje ${Q16.bag.shell})`, 'Šeimai namui atstatyti reikia 2 kriauklių', '#ff9ad0'); } }
  for (const c of OC.clams) if (!Q16.clams.includes(c.i) && pp.distanceTo(c.top) < 2.4) { Q16.clams.push(c.i); Q16.bag.pearl++; saveQ16(); refreshOcean(); [1047, 1319].forEach((fq, k) => tone(fq, 0.15, { type: 'sine', vol: 0.05, when: k * 0.08 })); toast(`Perlas! (krepšyje ${Q16.bag.pearl})`, 'Nunešk jį šeimai, kuriai tamsu', '#ffffff'); }
  OC.babies.forEach((b, k) => {
    if (b.delivered) { b.m.userData.tail.rotation.y = Math.sin(t * 8) * 0.5; return; }
    if (Q16.bag.baby.includes(b.k)) { const tgt = pp.clone().add(new V3(0, 1.6, 0)).addScaledVector(player.fwd, -1.2 - k * 0.6); b.m.position.lerp(tgt, Math.min(1, dt * 4)); b.m.rotation.y = Math.atan2(player.fwd.x, player.fwd.z); b.m.userData.tail.rotation.y = Math.sin(t * 10) * 0.5; return; }
    if (!b.m.visible) return;
    b.m.position.y = b.home.y + Math.sin(t * 2 + k) * 0.3; b.m.userData.tail.rotation.y = Math.sin(t * 8) * 0.5;
    if (pp.distanceTo(b.m.position) < 2.6 || Math.hypot(pp.x - b.m.position.x, pp.z - b.m.position.z) < 1.8 && Math.abs(pp.y + 1 - b.m.position.y) < 2.5) { Q16.babies.push(b.k); Q16.bag.baby.push(b.k); saveQ16(); bubbleIn(seaScene, b.m.position, 'Mama?', 1); toast(`Radai mažylį ${BABY_NAMES[b.k]}!`, 'Jis plaukia paskui tave. Nuvesk jį pas jo šeimą Sugriuvusiame Mieste', '#ffd23a'); }
  });
}
function finishOcean() {
  Q16.stage = 'done'; saveQ16(); refreshOcean(); addMoney(2500);
  [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  for (let i = 0; i < 12; i++) setTimeout(() => poofSea(new V3(SEA.isl[1].x + rr(-25, 25), rr(2, 8), SEA.isl[1].z + rr(-25, 25))), i * 120);
  startTalk('Jūrų Dievas', ['VISOS AŠTUONIOLIKA ŠEIMŲ LAIMINGOS! Sugriuvęs Miestas vėl spalvotas ir gyvas!', 'Tu išgelbėjai mano vandenyną, mažasis žaliasis. Tuoj parašysiu apie tai visiems dievams!', 'Štai tau 2500 € ir ŽUVIES KOSTIUMAS – dabar tu tikra žuvis! Blub!', 'O dabar… kur mano telefonas? A, štai jis! Parašysiu visiems dievams!'], '#4ac8ff', () => {
    giveFishSkin(); if (SEA.phone) { SEA.phone.visible = true; poofSea(SEA.phone.getWorldPosition(new V3())); }
    setTimeout(() => { toast('Jūrų Dievas rašo kitiems dievams…', 'Jis parodo tau savo telefoną – žiūrėk!', '#4ac8ff'); }, 2600); setTimeout(() => { if (mode === 'sea' && !card) openGodPhone(); }, 3800);
  });
}
function oceanPhoneLines() {
  if (Q16.stage !== 'done') return [];
  return [
    ['—', '— nauja žinutė —', 'sep'],
    ['Jūrų Dievas', 'Dievai! Didelė naujiena iš mano vandenyno!', '#8fd8ff'],
    ['Jūrų Dievas', 'Tas pats žaliasis žmogeliukas atplaukė pas mane ir padėjo VISOMS 18 vargšų žuvų šeimų: atnešė maisto, kriauklių namams, perlų šviesai ir surado pasiklydusius mažylius!', '#8fd8ff'],
    ['Jūrų Dievas', 'Sugriuvęs Miestas vėl spalvotas. Žaliasis IŠGELBĖJO MANO VANDENYNĄ!', '#8fd8ff'],
    ['Kūrėjas', 'Žinojau! Tai mano didvyris. Jis gelbsti ne tik mano pasaulį.', 'me'],
    ['Jūrų Dievas', 'Ir dar daviau jam ŽUVIES KOSTIUMĄ – su pelekais ir uodega! Dabar jis tikra žuvis.', '#8fd8ff'],
    ['Griaustinio Dievas', 'BUM! …Tai yra – sveikinu!', '#c8b0ff'],
    ['Saulės Dievė', 'Kokia šauni žuvis! Jūrų Dieve, gal paskolinsi jį man? Man labai reikia pagalbos – mano spindulius užpuolė VAIDUOKLIAI!', '#ffb86a'],
    ['Jūrų Dievas', 'Gerai jau, gerai… Bet tik pasakyk, kad pas mane visada laukiamas! Blub.', '#8fd8ff'],
    ['Saulės Dievė', 'Žaliasi! Uždaryk telefoną – siunčiu tau savo auksinį spindulį. Pasiimu tave pas save į SAULĘ!', '#ffb86a'],
    ['Visi dievai', 'VALIO VANDENYNO GELBĖTOJUI!', 'all']
  ];
}
function updateQ16Hud(el) {
  if (Q16.stage !== 'help') { el.hidden = true; return; }
  el.hidden = false; let arrow = '', dist = '', target = null;
  const b = Q16.bag, n = helpedN();
  if (mode === 'sea' && OC.fams.length) {
    let best = null, bd = 1e9; for (const f of OC.fams) if (!Q16.helped.includes(f.i)) { const can = f.type === 'food' ? b.food > 0 : f.type === 'repair' ? b.shell >= 2 : f.type === 'pearl' ? b.pearl > 0 : b.baby.includes(f.baby); const d = f.front.distanceTo(player.pos) - (can ? 1000 : 0); if (d < bd) { bd = d; best = f; } }
    if (best) { target = best.front; arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.pos))} m`; }
  }
  const bagTxt = `maistas ${b.food} · kriauklės ${b.shell} · perlai ${b.pearl}${b.baby.length ? ' · mažyliai ' + b.baby.length : ''}`;
  el.innerHTML = `${arrow}<div><div class="qt">Jūrų Dievo prašymas: 18 šeimų</div><div class="qs">${mode === 'sea' ? `Padėta <b>${n}/18</b> · krepšyje: ${bagTxt}` : 'Įvažiuok pro Jūros vartus ir padėk vargšėms žuvims'}${dist}</div></div>`;
}
