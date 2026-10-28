// ================= Secret: place the LAST golden cat standing in the very MIDDLE of the ring → golden cat costume =================
// The golden cat costume: gold all over, cat ears, whiskers, a red collar with a bell – and you wave your paw ALL THE TIME.
SKINS.push({ id: 'goldcat', name: 'Auksinė katė', desc: 'Visas auksinis, su katės ausytėmis, ūsais ir raudonu antkakliu su varpeliu. Ir visada moji letenėle – nešk laimę!', price: -1, body: '#ffc81a', hat: '#ffc81a', secret: true, hint: 'Sako, jį gauna tas, kas paskutinę auksinę katę padeda stovėdamas pačiame rato viduryje…' });
HATS.add('goldcat');
{
  const _eq = equipSkin; equipSkin = (id, quiet) => { _eq(id, quiet); if (skinNow === 'goldcat') tintPlayer(0xffc81a, 0xd8a010, { metalness: 0.75, roughness: 0.3, emissive: 0x3a2800 }); };
  const _bs = buildSkin; buildSkin = (id, g) => {
    _bs(id, g); if (id !== 'goldcat') return;
    const gold = mat(0xffc81a, { metalness: 0.75, roughness: 0.3, emissive: 0x3a2800 }), pink = mat(0xff9ab0), red = mat(0xe8262e), blk = bmat(0x111111);
    for (const x of [-1, 1]) { const e = S(G.cone, gold, 0.12, 0.24, 0.08, x * 0.2, 2.12, 0); e.rotation.z = -x * 0.25; g.add(e); const e2 = S(G.cone, pink, 0.07, 0.15, 0.03, x * 0.2, 2.1, 0.04); e2.rotation.z = -x * 0.25; g.add(e2); }
    for (const x of [-1, 1]) for (const k of [-1, 1]) { const w = S(G.box, blk, 0.22, 0.012, 0.012, x * 0.26, 1.76 + k * 0.03, 0.27); w.rotation.z = x * k * 0.15; g.add(w); }
    g.add(S(G.sph, pink, 0.045, 0.035, 0.03, 0, 1.78, 0.31));
    g.add(mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 18), red, 0, 1.52, 0).rotateX(Math.PI / 2)); g.add(S(G.sph, mat(0xffd23a, { metalness: 0.8, roughness: 0.2 }), 0.06, 0.06, 0.06, 0, 1.45, 0.2));
    const coin = S(G.cyl, gold, 0.12, 0.03, 0.16, -0.05, 1.15, 0.24); coin.rotation.x = Math.PI / 2; g.add(coin);
    for (let i = 0; i < 5; i++) g.add(S(G.sph, gold, 0.06, 0.06, 0.06, 0, 0.95 + i * 0.03, -0.24 - i * 0.07));
  };
  // always waving the right paw (unless you are using that hand)
  const _am = animateMan; animateMan = (dt, moving, sp) => {
    _am(dt, moving, sp);
    if (skinNow !== 'goldcat' || hands.R.hold || hands.R.item) return;
    const p = player.mesh.userData.parts; p.armR.rotation.x = 0; p.armR.rotation.y = 0; p.armR.rotation.z = -2.75 + Math.sin(T * 6) * 0.35;
  };
}
// a golden paw print in the middle of the ring – it shines only while you carry the very last cat(s)
let catMid = null;
{ const _bcr = buildCatRing; buildCatRing = () => {
    _bcr();
    const g = new THREE.Group(); g.position.set(RING_C.x, 0.05, RING_C.z); sanc.add(g); catMid = g;
    const m = bmat(0xffd23a, { transparent: true, opacity: 0.7 });
    g.add(mesh(new THREE.CircleGeometry(0.45, 24), m).rotateX(-Math.PI / 2)); for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; g.add(mesh(new THREE.CircleGeometry(0.17, 16), m, Math.sin(a) * 0.62, 0, -Math.cos(a) * 0.62).rotateX(-Math.PI / 2)); }
    sancAnim.push((dt, t) => { const last = Q13.stage === 'hunt' && carried().length > 0 && Q13.placed.length + carried().length >= 10; g.visible = last; if (last) m.opacity = 0.4 + 0.35 * Math.sin(t * 4); });
  }; }
const inRingMiddle = () => Math.hypot(player.pos.x - RING_C.x, player.pos.z - RING_C.z) < 1.4;
{ const _pc = q13PlaceCats; q13PlaceCats = () => {
    const last = Q13.placed.length + carried().length >= 10, mid = inRingMiddle();
    _pc();
    if (!last || !mid || skinOwned.includes('goldcat')) return;
    unlockSkin('goldcat'); equipSkin('goldcat', true);
    [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: 0.3 + i * 0.09 }));
    setTimeout(() => toast('SLAPTAS AUKSINĖS KATĖS KOSTIUMAS!', 'Padėjai paskutinę katę pačiame rato viduryje – dabar ir tu visada moji letenėle!', '#ffd23a'), 400);
  }; }
function catSkinTest() {
  skinOwned = skinOwned.filter(s => s !== 'goldcat'); if (skinNow === 'goldcat') equipSkin('classic', true); saveSkins();
  Q13.stage = 'hunt'; Q13.got = CAT_IDS.slice(); Q13.placed = CAT_IDS.slice(0, 9); saveQ13(); refreshCats(); if (typeof refreshCatRing === 'function') refreshCatRing();
  toast('Bandymų pasaulis: paskutinė auksinė katė', 'Ji tavo rankose. Kūrėjo Salėje stok į rato vidurį (švyti letenėlė) ir spausk E', '#ffd23a');
}
