// ================= everyone you saved comes to live with the Creator =================
const FR = { spiders: false, unis: false, list: [], kids: [] };
function addFriend(name, mesh3, lines, opt = {}) {
  sanc.add(mesh3); linearize(mesh3);
  const f = Object.assign({ name, m: mesh3, lines, r: 3.5 }, opt); FR.list.push(f); if (f.kid) FR.kids.push(f); return f;
}
function refreshSanctumFriends() {
  addSanctumCat(); addSanctumCow(); addSanctumClouds();
  if (Q3.stage === 'done' && !FR.spiders) {
    FR.spiders = true;
    const dad = makeSpider(0x3a2a5a, 2.6, false); dad.position.set(-19, 0, 7); dad.rotation.y = 1.9;
    addFriend('Senasis Voras', dad, ['Kūrėjas pakvietė mus gyventi čia, šviesoje. Aš vis tiek mezgu voratinklius – iš įpratimo.', 'Žiūrėk, kaip mano Voratinklė laksto su vienaragiukais. Seniai nemačiau jos tokios laimingos.'], { r: 7, spider: true });
    for (let i = 0; i < 3; i++) { const w = webMesh(6); w.position.set(-22 + i * 2, 4.5, 3 + i * 4); w.rotation.y = 1.2 + i * 0.3; sanc.add(w); }
    const girl = makeSpider(0xb05a9a, 1.25, true); girl.position.set(-6, 0, 4);
    addFriend('Voratinklė', girl, ['Žaidžiam gaudynes! Vienaragiai greiti, bet aš turiu aštuonias kojas!', 'Tėtis sako, kad tu – mano didvyris. Na… mažas didvyris.'], { kid: true, spider: true, phase: 0, r: 3.2 });
  }
  if (Q4.stage === 'done' && !FR.unis) {
    FR.unis = true;
    const byId = id => Object.assign({}, FAMILY.find(f => f.id === id), { lying: false });
    const dad = makeUnicorn(byId('tetis')); dad.position.set(18, 0, 3); dad.rotation.y = -1.6;
    if (dad.userData.horn && Q6.stage !== 'none' && Q6.stage !== 'done') dad.userData.horn.visible = false;
    addFriend('Tėtis Vaivorykštis', dad, ['Čia saugu – demonas čia neateina. Ačiū tau, mažasis žaliasi.', 'Kai mano berniukai pavargs lakstyti, vešiu juos pasivažinėti ant vaivorykštės.'], { uni: true, r: 4.5 });
    const mom = makeUnicorn(byId('mama')); mom.position.set(19, 0, 7.5); mom.rotation.y = -1.9;
    addFriend('Mama Saulutė', mom, ['Mano naujas ragas jau auga – matai tą mažą kauburėlį? Po truputį, po truputį.', 'Kūrėjo šviesa man grąžino jėgas. O senasis ragas tegul švyti tavo muziejuje.'], { uni: true, r: 4.5 });
    const b1 = makeUnicorn(byId('blizgutis')); addFriend('Blizgutis', b1, ['Ihaha! Gaudyk mane! …Nepagausi!', 'Aš jau visai nebijau. Na, gal tik truputį – tamsos.'], { uni: true, kid: true, phase: 2.1 });
    const b2 = makeUnicorn(byId('cukrinukas')); addFriend('Cukrinukas', b2, ['Ar Kūrėjas turi ledų? Paklausk jo, prašau!', 'Čia nėra Ledų Kalno… bet yra daug vietos lakstyti!'], { uni: true, kid: true, phase: 4.2 });
  }
}
const _frTmp = new V3();
function kidPath(f, t, out) {
  const a = t * 0.6 + f.phase, r = 8 + Math.sin(t * 0.35 + f.phase) * 1.6;
  return out.set(Math.cos(a) * r, 0, 3 + Math.sin(a) * r * 0.7);
}
function updateSanctumFriends(dt, t) {
  for (const f of FR.list) {
    if (f.kid) {
      kidPath(f, t, f.m.position); kidPath(f, t + 0.05, _frTmp);
      f.m.rotation.y = Math.atan2(_frTmp.x - f.m.position.x, _frTmp.z - f.m.position.z);
      if (f.uni) { animUnicorn(f.m, t * 1.3 + f.phase, true); f.m.position.y = Math.abs(Math.sin(t * 7 + f.phase)) * 0.15; }
      else animSpider(f.m, t, true, 1.6);
      f.laughT = (f.laughT || rr(2, 6)) - dt;
      if (f.laughT < 0) { f.laughT = rr(4, 9); if (player.pos.distanceTo(f.m.position) < 18) bubbleIn(sanc, f.m.position, f.uni ? pick(['Ihaha!', 'Gaudyk!', 'Hihi!']) : pick(['Pagavau!', 'Hihi!', 'Palauk!']), f.uni ? 2.6 : 3.2); }
    } else if (f.uni) animUnicorn(f.m, t + f.m.position.z, false);
    else if (f.spider) { animSpider(f.m, t, false); f.m.rotation.y = lerp(f.m.rotation.y, Math.atan2(player.pos.x - f.m.position.x, player.pos.z - f.m.position.z), Math.min(1, dt)); }
  }
  // the chicks scamper round their mother hen
  hen.chicks.forEach((m, k) => {
    const u = m.userData;
    if (!u.tgt || Math.hypot(u.tgt.x - m.position.x, u.tgt.z - m.position.z) < 0.15) { const a = rr(0, 6.3), r = rr(1.2, 3.8); u.tgt = new V3(hen.pos.x + Math.cos(a) * r, 0.2, hen.pos.z + Math.sin(a) * r); u.wait = rr(0, 1.2); }
    if (u.wait > 0) { u.wait -= dt; m.position.y = 0.2; return; }
    const dx = u.tgt.x - m.position.x, dz = u.tgt.z - m.position.z, d = Math.hypot(dx, dz), st = Math.min(d, 2.6 * dt);
    m.position.x += dx / d * st; m.position.z += dz / d * st; m.rotation.y = Math.atan2(dx, dz);
    m.position.y = 0.2 + Math.abs(Math.sin(t * 14 + k)) * 0.12;
  });
}
function nearFriend() {
  let best = null, bd = 1e9;
  for (const f of FR.list) { const d = Math.hypot(player.pos.x - f.m.position.x, player.pos.z - f.m.position.z); if (d < f.r && d < bd) { bd = d; best = f; } }
  return best;
}
function talkFriend(f) {
  if (f.name === 'Tėtis Vaivorykštis' && dadUnicornTalk(f)) return;
  f.li = ((f.li == null ? -1 : f.li) + 1) % f.lines.length;
  card = { kind: 'info' }; showCard(f.name, f.lines[f.li], 'E – uždaryti', f.uni ? '#ff7ac8' : '#c77dff'); sfx.blip();
}
