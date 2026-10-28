// ================= Skins: a costume kiosk in the middle of the city =================
// cheapest = simplest, most expensive = fanciest. The unicorn costume can't be bought – only earned.
const SKINS = [
  { id: 'classic', name: 'Žaliasis', desc: 'Toks, koks esi. Mažas, plonas ir žalias.', price: 0, body: '#6ff05a' },
  { id: 'cap', name: 'Kepuraitė', desc: 'Raudona kepurė su snapeliu. Nuo saulės ir nuo meteoritų (ne).', price: 20, body: '#6ff05a', hat: '#e8262e' },
  { id: 'cat', name: 'Katės ausytės', desc: 'Dvi ausytės ir ūsai. Šunys tave vaikysis.', price: 40, body: '#6ff05a', hat: '#ff9f40' },
  { id: 'chef', name: 'Virėjas', desc: 'Aukšta balta kepurė ir prijuostė – kaip „Skanus maistas“ virtuvėje.', price: 60, body: '#6ff05a', hat: '#ffffff' },
  { id: 'cowboy', name: 'Kaubojus', desc: 'Plati kepurė ir raudona skarelė. Ji-ha!', price: 90, body: '#6ff05a', hat: '#8a5a2b' },
  { id: 'pirate', name: 'Piratas', desc: 'Trikampė skrybėlė, akies raištis ir dryžuoti marškiniai. Arrr!', price: 130, body: '#6ff05a', hat: '#1a1a1a' },
  { id: 'ninja', name: 'Nindzė', desc: 'Visas juodas, su raudonu galvos raiščiu. Tavęs niekas nemato. Beveik.', price: 180, body: '#22242c', hat: '#e8262e' },
  { id: 'dino', name: 'Dinozauras', desc: 'Gobtuvas su spygliais ir uodega. Rrrr!', price: 250, body: '#3a9a3a', hat: '#2a7a2a' },
  { id: 'knight', name: 'Riteris', desc: 'Sidabrinis šalmas su plunksna ir šarvai.', price: 350, body: '#6ff05a', hat: '#c8ccd6' },
  { id: 'robot', name: 'Robotas', desc: 'Visas sidabrinis, su antena ir mirksinčia lempute. Bip bup.', price: 500, body: '#b8bec8', hat: '#ff3b3b' },
  { id: 'astronaut', name: 'Astronautas', desc: 'Baltas kostiumas ir stiklinis šalmas. Tinka Marsui.', price: 700, body: '#f2f2f4', hat: '#bfe8ff' },
  { id: 'king', name: 'Karalius', desc: 'Auksinė karūna ir raudonas apsiaustas. Visi turi nusilenkti.', price: 1000, body: '#6ff05a', hat: '#ffd23a' },
  { id: 'unicorn', name: 'Vienaragis', desc: 'Vaivorykštinis ragas, uodega ir maikė. Šio kostiumo nenupirksi – jį gali tik užsitarnauti.', price: -1, body: '#6ff05a', hat: '#ff9ee8', secret: true }
];
let skinOwned = ['classic'], skinNow = 'classic';
try { const s = JSON.parse(localStorage.getItem('modly-skins') || 'null'); if (s) { skinOwned = s.owned || skinOwned; skinNow = s.now || skinNow; } } catch (_) { }
function saveSkins() { try { localStorage.setItem('modly-skins', JSON.stringify({ owned: skinOwned, now: skinNow })); } catch (_) { } }

// ---------- dressing the little man ----------
const GREEN_M = () => mat(0x6ff05a, { emissive: 0x1d5a14 }), DARK_M = () => mat(0x3fb33a, { emissive: 0x123a0c });
function tintPlayer(bodyHex, darkHex, opt = {}) {
  const gm = GREEN_M(), dm = DARK_M();
  const nb = bodyHex == null ? null : mat(bodyHex, Object.assign({ roughness: 0.6 }, opt)), nd = darkHex == null ? null : mat(darkHex, Object.assign({ roughness: 0.6 }, opt));
  player.mesh.traverse(o => {
    if (!o.isMesh) return;
    const orig = o.userData.origMat || o.material;
    if (orig !== gm && orig !== dm) return;
    o.userData.origMat = orig;
    o.material = orig === gm ? (nb || gm) : (nd || dm);
  });
  linearize(player.mesh);
}
function buildSkin(id, g) {
  const M = (c, o) => mat(c, o), hatY = 2.0;
  switch (id) {
    case 'cap': g.add(S(G.dome, M(0xe8262e), 0.31, 0.2, 0.31, 0, 1.98, 0)); g.add(S(G.box, M(0xe8262e), 0.34, 0.03, 0.26, 0, 1.99, 0.3)); g.add(S(G.sph, M(0xffffff), 0.05, 0.04, 0.05, 0, 2.18, 0)); break;
    case 'cat':
      for (const x of [-0.17, 0.17]) { const e = S(G.cone, M(0xff9f40), 0.1, 0.22, 0.06, x, 2.12, 0); e.rotation.z = -x * 1.6; g.add(e); const i2 = S(G.cone, M(0xffb3c8), 0.06, 0.14, 0.03, x * 1.02, 2.1, 0.03); i2.rotation.z = -x * 1.6; g.add(i2); }
      for (const x of [-1, 1]) for (const k of [-1, 1]) { const w = S(G.box, bmat(0x222222), 0.22, 0.012, 0.012, x * 0.2, 1.77 + k * 0.03, 0.27); w.rotation.z = k * 0.15 * x; g.add(w); }
      g.add(S(G.sph, M(0xff7aa8), 0.04, 0.03, 0.03, 0, 1.79, 0.3)); break;
    case 'chef': g.add(S(G.cyl, M(0xffffff), 0.24, 0.3, 0.24, 0, 2.12, 0)); g.add(S(G.sph, M(0xffffff), 0.32, 0.18, 0.32, 0, 2.3, 0)); g.add(S(G.box, M(0xffffff), 0.3, 0.55, 0.05, 0, 1.08, 0.2)); break;
    case 'cowboy': g.add(S(G.cyl, M(0x8a5a2b), 0.52, 0.04, 0.52, 0, 2.02, 0)); g.add(S(G.cyl, M(0x8a5a2b), 0.25, 0.26, 0.25, 0, 2.16, 0)); g.add(S(G.cyl, M(0x3a2a1a), 0.26, 0.05, 0.26, 0, 2.06, 0)); g.add(S(G.cone, M(0xe8262e), 0.22, 0.2, 0.12, 0, 1.5, 0.12).rotateX(Math.PI)); break;
    case 'pirate': {
      g.add(S(G.cyl, M(0x1a1a1a), 0.42, 0.05, 0.42, 0, 2.02, 0)); g.add(S(G.cyl, M(0x1a1a1a), 0.26, 0.22, 0.26, 0, 2.14, 0)); g.add(S(G.sph, bmat(0xffffff), 0.06, 0.06, 0.02, 0, 2.15, 0.26));
      g.add(S(G.cyl, bmat(0x111111), 0.075, 0.02, 0.075, 0.11, 1.87, 0.29).rotateX(Math.PI / 2)); { const s2 = S(G.box, bmat(0x111111), 0.62, 0.02, 0.02, 0, 1.94, 0.18); s2.rotation.z = -0.25; g.add(s2); }
      const t = stripeTex(['#ffffff', '#e8262e'], 6, false); t.rotation = Math.PI / 2; t.center.set(0.5, 0.5);
      g.add(S(G.cyl, new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }), 0.215, 0.55, 0.215, 0, 1.3, 0)); break; }
    case 'ninja': g.add(S(G.cyl, M(0xe8262e), 0.31, 0.08, 0.31, 0, 1.94, 0)); for (const k of [-1, 1]) { const tl = S(G.box, M(0xe8262e), 0.05, 0.3, 0.02, k * 0.05, 1.8, -0.32); tl.rotation.z = k * 0.4; tl.rotation.x = -0.3; g.add(tl); } g.add(S(G.box, bmat(0x111111), 0.5, 0.18, 0.04, 0, 1.73, 0.27)); break;
    case 'dino': {
      g.add(S(G.dome, M(0x2a7a2a), 0.34, 0.36, 0.34, 0, 1.84, -0.03));
      for (let i = 0; i < 6; i++) { const sp = S(G.cone, M(0xffd23a), 0.07, 0.16, 0.07, 0, 2.18 - i * 0.18, -0.1 - i * 0.05); sp.rotation.x = -0.3 - i * 0.18; g.add(sp); }
      const tail = S(G.cone, M(0x2a7a2a), 0.16, 0.8, 0.16, 0, 0.85, -0.5); tail.rotation.x = -1.9; g.add(tail);
      for (const x of [-0.1, 0.1]) g.add(S(G.cone, bmat(0xffffff), 0.03, 0.07, 0.03, x, 1.82, 0.32).rotateX(Math.PI)); break; }
    case 'knight': {
      g.add(S(G.cyl, M(0xc8ccd6, { metalness: 0.8, roughness: 0.3 }), 0.34, 0.5, 0.34, 0, 1.86, 0)); g.add(S(G.dome, M(0xc8ccd6, { metalness: 0.8, roughness: 0.3 }), 0.34, 0.2, 0.34, 0, 2.1, 0));
      g.add(S(G.box, bmat(0x111111), 0.4, 0.05, 0.04, 0, 1.86, 0.33)); g.add(S(G.sph, M(0xe8262e), 0.08, 0.3, 0.2, 0, 2.38, -0.04));
      g.add(S(G.cyl, M(0xaeb4c0, { metalness: 0.8, roughness: 0.35 }), 0.24, 0.6, 0.24, 0, 1.25, 0)); g.add(S(G.sph, M(0xffd23a, { metalness: 0.7 }), 0.08, 0.08, 0.03, 0, 1.35, 0.24)); break; }
    case 'robot': {
      g.add(S(G.box, M(0x9aa0aa, { metalness: 0.8, roughness: 0.3 }), 0.66, 0.6, 0.62, 0, 1.84, 0)); g.add(S(G.box, bmat(0x1a2a3a), 0.5, 0.26, 0.02, 0, 1.86, 0.31));
      for (const x of [-0.11, 0.11]) g.add(S(G.sph, bmat(0x6ff7ff), 0.06, 0.06, 0.02, x, 1.88, 0.33));
      g.add(S(G.cyl, M(0x60646e, { metalness: 0.8 }), 0.025, 0.3, 0.025, 0, 2.28, 0)); const l = S(G.sph, M(0xff3b3b, { emissive: 0xff2020, emissiveIntensity: 1 }), 0.07, 0.07, 0.07, 0, 2.45, 0); g.add(l); g.userData.blink = l;
      g.add(S(G.box, M(0x60646e, { metalness: 0.8 }), 0.24, 0.16, 0.03, 0, 1.3, 0.21)); break; }
    case 'astronaut': {
      g.add(S(G.sph, new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.4, depthWrite: false }), 0.42, 0.42, 0.42, 0, 1.84, 0));
      g.add(S(G.cyl, M(0xd8d8dc), 0.3, 0.08, 0.3, 0, 1.48, 0)); g.add(S(G.box, M(0xd8d8dc), 0.38, 0.5, 0.2, 0, 1.25, -0.27));
      g.add(S(G.box, M(0x3a7bff), 0.12, 0.08, 0.02, -0.07, 1.33, 0.21)); g.add(S(G.box, M(0xe8262e), 0.06, 0.08, 0.02, 0.07, 1.33, 0.21)); break; }
    case 'king': {
      const gold = M(0xffd23a, { metalness: 0.85, roughness: 0.25 });
      g.add(S(G.cyl, gold, 0.24, 0.12, 0.24, 0, 2.08, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.add(S(G.cone, gold, 0.06, 0.16, 0.06, Math.cos(a) * 0.21, 2.2, Math.sin(a) * 0.21)); g.add(S(G.sph, M(0xe8203c), 0.03, 0.03, 0.03, Math.cos(a) * 0.24, 2.08, Math.sin(a) * 0.24)); }
      const cape = S(G.box, M(0xb0122a), 0.6, 1.0, 0.04, 0, 1.0, -0.26); cape.rotation.x = 0.12; g.add(cape);
      g.add(mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 20), M(0xffffff), 0, 1.53, 0).rotateX(Math.PI / 2)); break; }
    case 'unicorn': {
      const horn = makeUniHorn(); horn.scale.setScalar(0.42); horn.position.set(0, 2.02, 0.2); horn.rotation.x = 0.55; g.add(horn);
      const t = stripeTex(RAINBOW, 7, false); t.rotation = Math.PI / 2; t.center.set(0.5, 0.5);
      g.add(S(G.cyl, new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }), 0.225, 0.5, 0.225, 0, 1.3, 0));
      g.add(S(G.sph, M(0xffffff, { roughness: 0.5 }), 0.07, 0.07, 0.03, 0, 1.38, 0.22));
      RAINBOW.forEach((c, i) => g.add(S(G.sph, M(new THREE.Color(c).getHex(), { roughness: 0.6 }), 0.1 - i * 0.008, 0.1 - i * 0.008, 0.1 - i * 0.008, 0, 0.95 - i * 0.07, -0.24 - i * 0.07)));
      break; }
  }
}
const HATS = new Set(['cap', 'chef', 'cowboy', 'pirate', 'knight', 'robot', 'astronaut', 'king', 'dino']);
function equipSkin(id, quiet) {
  const sk = SKINS.find(s => s.id === id) || SKINS[0];
  const body = player.mesh.userData.parts.body;
  if (body.userData.skinGroup) { body.remove(body.userData.skinGroup); body.userData.skinGroup = null; }
  // the antenna hides under hats
  body.children.forEach(o => { if (o.isMesh && o.position.y > 2.1) o.visible = !HATS.has(sk.id); });
  if (sk.id === 'ninja') tintPlayer(0x22242c, 0x111216);
  else if (sk.id === 'dino') tintPlayer(0x3a9a3a, 0x2a7a2a);
  else if (sk.id === 'robot') tintPlayer(0xb8bec8, 0x7a808a, { metalness: 0.7, roughness: 0.3 });
  else if (sk.id === 'astronaut') tintPlayer(0xf2f2f4, 0xd8d8dc);
  else tintPlayer(null, null);
  const g = new THREE.Group(); buildSkin(sk.id, g); body.add(g); body.userData.skinGroup = g; linearize(g);
  skinNow = sk.id; saveSkins();
  if (!quiet) { poof(player.pos.clone().addScaledVector(player.up, 1), 0xffffff); sfx.chime(); toast(`Persirengei: ${sk.name}`, 'Kostiumą pakeisti gali bet kada kostiumų kioske aikštėje', '#ff9ee8'); }
}
animators.push((dt, t) => { const g = player.mesh.userData.parts.body.userData.skinGroup; if (g && g.userData.blink) g.userData.blink.visible = Math.floor(t * 2) % 2 === 0; });
function unlockSkin(id) { if (!skinOwned.includes(id)) { skinOwned.push(id); saveSkins(); } }

// ---------- the kiosk ----------
let skinShopOpen = false;
function buildSkinKiosk() {
  const a = 3.97, d = cityDir(Math.cos(a) * 14, Math.sin(a) * 14);
  const g = new THREE.Group(); g.position.copy(surf(d)); orient(g, d, tangentToward(d, UP)); world.add(g);
  g.add(S(G.box, mat(0xb05aff), 3.4, 2.6, 1.2, 0, 1.3, -0.8));
  for (const sx of [-1.6, 1.6]) g.add(S(G.box, mat(0xb05aff), 0.2, 2.9, 2.3, sx, 1.45, -0.05));
  g.add(S(G.box, mat(0xffd1f0), 3.5, 1.0, 0.5, 0, 0.5, 1.15));
  g.add(S(G.box, mat(0xffffff), 3.6, 0.1, 0.7, 0, 1.05, 1.15));
  for (let i = 0; i < 6; i++) { const st = S(G.box, mat(i % 2 ? 0xffffff : 0xff5fae), 0.62, 0.1, 1.8, -1.55 + i * 0.62, 3.0, 0.95); st.rotation.x = 0.35; g.add(st); }
  g.add(mesh(new THREE.PlaneGeometry(3.6, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('KOSTIUMŲ KIOSKAS', '#b05aff', '#ffffff', 640, 128), side: THREE.DoubleSide }), 0, 3.75, 0.6));
  // a mannequin wearing a crown, a mirror and a rack of hats
  const man = makeMan(); man.scale.setScalar(0.55); man.position.set(-1.05, 1.1, 1.0); g.add(man);
  { const gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.3 }); man.userData.parts.body.add(S(G.cyl, gold, 0.24, 0.12, 0.24, 0, 2.08, 0)); for (let i = 0; i < 5; i++) { const aa = i / 5 * Math.PI * 2; man.userData.parts.body.add(S(G.cone, gold, 0.06, 0.16, 0.06, Math.cos(aa) * 0.21, 2.2, Math.sin(aa) * 0.21)); } }
  g.add(S(G.box, new THREE.MeshStandardMaterial({ color: 0xdff4ff, metalness: 0.9, roughness: 0.05 }), 0.7, 1.1, 0.05, 1.0, 1.65, 0.95)); g.add(S(G.box, mat(0xffd23a), 0.8, 1.2, 0.03, 1.0, 1.65, 0.92));
  for (let i = 0; i < 3; i++) g.add(S(G.dome, mat([0xe8262e, 0x8a5a2b, 0x1a1a1a][i]), 0.22, 0.14, 0.22, -0.3 + i * 0.35, 1.12, 1.25));
  const seller = makePerson(); seller.position.set(0, 0, 0.35); g.add(seller);
  seller.add(S(G.cyl, mat(0xffd23a, { metalness: 0.8 }), 0.24, 0.12, 0.24, 0, 2.0, 0));
  animators.push((dt, t) => { seller.userData.body.rotation.y = Math.sin(t * 1.0) * 0.5; man.rotation.y = Math.sin(t * 0.7) * 0.6; });
  addBox(g, 1.8, 1.5, 2.8, 0, 0.1);
  $('skinClose').addEventListener('click', () => closeSkinShop(true));
  addInspect(surf(d, 1).addScaledVector(tangentToward(d, UP), 1.5), 'Kostiumų kioskas', '', 5.5, { verb: 'persirengti – kostiumų kioskas', onUse: openSkinShop });
  linearize(g);
}
function skinSvg(sk) {
  const acc = {
    cap: '<path d="M38 14 Q50 2 62 14 Z" fill="#e8262e"/><rect x="56" y="12" width="14" height="3" fill="#e8262e"/>',
    cat: '<path d="M40 10 L42 0 L47 8 Z M53 8 L58 0 L60 10 Z" fill="#ff9f40"/>',
    chef: '<rect x="42" y="0" width="16" height="12" fill="#fff"/><circle cx="50" cy="1" r="9" fill="#fff"/>',
    cowboy: '<rect x="32" y="11" width="36" height="3" rx="1" fill="#8a5a2b"/><rect x="42" y="2" width="16" height="10" rx="3" fill="#8a5a2b"/>',
    pirate: '<path d="M34 12 Q50 -2 66 12 Z" fill="#1a1a1a"/><circle cx="54" cy="19" r="3" fill="#111"/><rect x="42" y="34" width="16" height="3" fill="#e8262e"/><rect x="42" y="40" width="16" height="3" fill="#e8262e"/>',
    ninja: '<rect x="39" y="13" width="22" height="4" fill="#e8262e"/><path d="M39 15 L32 22" stroke="#e8262e" stroke-width="3"/>',
    dino: '<path d="M38 12 Q50 2 62 12 Z" fill="#2a7a2a"/><path d="M42 8 L45 2 L48 7 L51 1 L54 7 L57 2 L59 9 Z" fill="#1f5a1f"/><path d="M42 46 L24 54 L42 50 Z" fill="#2a7a2a"/>',
    knight: '<rect x="38" y="6" width="24" height="22" rx="8" fill="#c8ccd6"/><rect x="42" y="16" width="16" height="3" fill="#111"/><ellipse cx="50" cy="4" rx="4" ry="6" fill="#e8262e"/>',
    robot: '<rect x="38" y="8" width="24" height="20" rx="2" fill="#9aa0aa"/><rect x="42" y="13" width="16" height="7" fill="#1a2a3a"/><circle cx="46" cy="16" r="2" fill="#6ff7ff"/><circle cx="54" cy="16" r="2" fill="#6ff7ff"/><line x1="50" y1="8" x2="50" y2="1" stroke="#60646e" stroke-width="2"/><circle cx="50" cy="1" r="2.5" fill="#ff3b3b"/>',
    astronaut: '<circle cx="50" cy="18" r="13" fill="#bfe8ff" opacity=".55" stroke="#fff" stroke-width="2"/>',
    king: '<path d="M40 12 L42 3 L46 9 L50 2 L54 9 L58 3 L60 12 Z" fill="#ffd23a"/><path d="M40 30 L34 56 L66 56 L60 30 Z" fill="#b0122a"/>',
    unicorn: '<path d="M48 9 L52 -2 L54 10 Z" fill="#ff9ee8"/><rect x="42" y="32" width="16" height="3" fill="#ff4f6d"/><rect x="42" y="35" width="16" height="3" fill="#ffe14d"/><rect x="42" y="38" width="16" height="3" fill="#5fe37a"/><rect x="42" y="41" width="16" height="3" fill="#3cc6ff"/><circle cx="38" cy="48" r="3" fill="#ff4f6d"/><circle cx="35" cy="51" r="2.5" fill="#3cc6ff"/>'
  };
  return `<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="56" width="100" height="4" fill="#d6c6ff"/>${sk.id === 'king' ? '<path d="M40 30 L34 56 L66 56 L60 30 Z" fill="#b0122a"/>' : ''}<rect x="44" y="28" width="12" height="20" rx="5" fill="${sk.body}"/><circle cx="50" cy="18" r="10" fill="${sk.body}"/><circle cx="46" cy="18" r="1.8" fill="#111"/><circle cx="54" cy="18" r="1.8" fill="#111"/><rect x="45" y="47" width="3" height="9" fill="${sk.body}"/><rect x="52" y="47" width="3" height="9" fill="${sk.body}"/>${sk.id === 'king' ? acc.king.split('<path d="M40 30')[0] : (acc[sk.id] || '')}</svg>`;
}
function renderSkinShop() {
  $('skinGrid').innerHTML = SKINS.map((s, i) => {
    const own = skinOwned.includes(s.id), now = skinNow === s.id;
    const price = now ? 'Dėvi' : own ? 'Persirengti' : s.secret ? 'Paslaptis' : `${s.price} €`;
    return `<button class="hcard${now ? ' active' : ''}${!own && !s.secret && money < s.price ? ' poor' : ''}${s.secret && !own ? ' locked' : ''}" data-i="${i}"><div class="hpic">${skinSvg(s)}</div><div class="hname">${s.name}</div><div class="hdesc">${s.desc}</div><div class="hfoot"><span class="hsize">${own ? 'Turi' : ''}</span><span class="hprice">${price}</span></div>${i < 9 ? `<kbd class="hkey">${i + 1}</kbd>` : ''}</button>`;
  }).join('');
  $('skinGrid').innerHTML += '<div class="backHead">Ant nugaros</div>' + backCardsHtml();
  $('skinGrid').querySelectorAll('.hcard').forEach(b => b.addEventListener('click', () => b.dataset.b != null ? pickBack(+b.dataset.b) : pickSkin(+b.dataset.i)));
  $('skinNow').textContent = `Dabar dėvi: ${(SKINS.find(s => s.id === skinNow) || SKINS[0]).name} · turi ${skinOwned.length} iš ${SKINS.length}`;
}
function openSkinShop() {
  if (skinShopOpen) return;
  skinShopOpen = true; cancelPlace(true); for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  renderSkinShop(); $('skinShop').hidden = false; $('paused').hidden = true;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip(); const f = document.querySelector('#skinGrid .hcard'); if (f) f.focus();
}
function closeSkinShop(relock) {
  if (!skinShopOpen) return;
  skinShopOpen = false; $('skinShop').hidden = true;
  if (relock) requestLock();
}
function skinKey(e) {
  if (e.code === 'Escape' || e.code === 'KeyE') { e.preventDefault(); closeSkinShop(e.code === 'KeyE'); return; }
  const m = /^Digit([1-9])$/.exec(e.code); if (m) pickSkin(+m[1] - 1);
}
function pickSkin(i) {
  const s = SKINS[i]; if (!s) return;
  if (!skinOwned.includes(s.id)) {
    if (s.secret) { toast('Šis kostiumas – paslaptis', s.hint || 'Jo nenupirksi. Sako, jį duoda kažkokia karalienė labai spalvotame pasaulyje…', '#ff9ee8'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); return; }
    if (!canPay(s.price)) { tooPoor(s.price); return; }
    pay(s.price); unlockSkin(s.id);
  }
  equipSkin(s.id); renderSkinShop();
}
