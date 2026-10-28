// ================= Secret: a barely visible door by the Old Spider → the SPIDER costume (command #3) =================
let spiderDoorOpen = false; try { spiderDoorOpen = localStorage.getItem('modly-spiderdoor') === '1'; } catch (_) { }
const SPD = { door: null, box: null, stand: null, x: 7.5, z: -11, t: 0 };
SKINS.push({ id: 'spider', name: 'Voras', desc: 'Tamsiai violetinis, su aštuoniomis raudonomis akimis, iltimis ir aštuoniomis kojomis. Rastas už slaptų durų Senojo Voro urve.', price: -1, body: '#3a2a5a', hat: '#e8262e', secret: true, hint: 'Sako, jis paslėptas po žeme – už durų, kurių beveik nesimato, netoli Senojo Voro…' });
{
  const _eq = equipSkin; equipSkin = (id, quiet) => { _eq(id, quiet); if (skinNow === 'spider') tintPlayer(0x3a2a5a, 0x2a1a44); };
  const _bs = buildSkin; buildSkin = (id, g) => { _bs(id, g); if (id === 'spider') addSpiderBits(g); };
}
function addSpiderBits(g) {
  const red = mat(0xff2a3a, { emissive: 0x8a0010, roughness: 0.3 }), leg = mat(0x2a1a44, { roughness: 0.7 }), fang = mat(0xf4f0e8), stripe = mat(0xb05a9a);
  // eight red eyes: two big, six small
  for (const x of [-0.08, 0.08]) g.add(S(G.sph, red, 0.06, 0.06, 0.03, x, 1.92, 0.3));
  for (const [x, y] of [[-0.17, 1.95], [0.17, 1.95], [-0.04, 2.04], [0.04, 2.04], [-0.14, 1.84], [0.14, 1.84]]) g.add(S(G.sph, red, 0.035, 0.035, 0.02, x, y, 0.29 - Math.abs(x) * 0.25));
  // fangs
  for (const x of [-0.05, 0.05]) { const f = S(G.cone, fang, 0.03, 0.1, 0.03, x, 1.68, 0.29); f.rotation.x = Math.PI; g.add(f); }
  // four legs on each side
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
    const L = new THREE.Group(); L.position.set(sx * 0.2, 1.42 - i * 0.1, 0.12 - i * 0.1); L.rotation.y = sx * (i - 1.5) * 0.35; g.add(L);
    const up = S(G.cyl, leg, 0.03, 0.42, 0.03, sx * 0.17, 0.12, 0); up.rotation.z = -sx * 1.0; L.add(up);
    const dn = S(G.cyl, leg, 0.025, 0.5, 0.025, sx * 0.36, -0.05, 0); dn.rotation.z = sx * 0.35; L.add(dn);
    L.add(S(G.sph, leg, 0.045, 0.045, 0.045, sx * 0.34, 0.2, 0));
  }
  // stripes on the back
  for (let i = 0; i < 3; i++) g.add(S(G.box, stripe, 0.3, 0.05, 0.02, 0, 1.45 - i * 0.12, -0.225));
}
// called from buildCave instead of one solid wall behind the Old Spider
function buildSpiderDoor(rock) {
  const x0 = 6, x1 = 9, z0 = -14, z1 = -11, H = CV.H, dh = 3.4;
  const add = (w, h, d, x, y, z, m = rock) => { const o = S(G.box, m, w, h, d, x, y, z); caveScene.add(o); return o; };
  // the little room inside the wall: back wall + lintel above the door
  add(x1 - x0, H, 0.4, (x0 + x1) / 2, H / 2, z0 + 0.2); CV.boxes.push({ x: (x0 + x1) / 2, z: z0 + 0.2, hx: (x1 - x0) / 2, hz: 0.2 });
  add(x1 - x0, H - dh, z1 - z0, (x0 + x1) / 2, dh + (H - dh) / 2, (z0 + z1) / 2);
  const glow = new THREE.PointLight(0xc77dff, 0.9, 5); glow.position.set(7.5, 2.4, -12.6); caveScene.add(glow);
  // a stand with the spider costume
  const st = new THREE.Group(); st.position.set(7.5, 0, -12.6); caveScene.add(st); SPD.stand = st;
  st.add(S(G.cyl, mat(0x4a3a5a, { roughness: 0.6 }), 0.55, 0.2, 0.55, 0, 0.1, 0));
  const man = makeMan(); man.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.material = mat(0x3a2a5a, { roughness: 0.6 }); });
  man.position.y = 0.2; man.scale.setScalar(0.95); addSpiderBits(man.userData.parts.body); st.add(man); SPD.man = man;
  let taken = false; try { taken = !!localStorage.getItem('modly-spidertaken'); } catch (_) { } st.visible = !taken;
  // the door: same rock as the wall, only a thin dark crack shows where it is
  const door = new THREE.Group(); door.position.set(7.5, 0, z1 + 0.02); caveScene.add(door); SPD.door = door;
  door.add(S(G.box, rock, x1 - x0 - 0.06, dh, 0.3, 0, dh / 2, -0.15));
  const crack = mat(0x2c2438, { roughness: 1 });
  door.add(S(G.box, crack, 0.04, dh, 0.02, -(x1 - x0) / 2 + 0.03, dh / 2, 0.01)); door.add(S(G.box, crack, 0.04, dh, 0.02, (x1 - x0) / 2 - 0.03, dh / 2, 0.01)); door.add(S(G.box, crack, x1 - x0, 0.04, 0.02, 0, dh - 0.02, 0.01));
  door.add(S(G.sph, mat(0x332a44), 0.08, 0.08, 0.04, 0.95, 1.2, 0.02));   // a tiny round knob-stone
  const w = webMesh(1.2); w.position.set(-1.1, 2.9, 0.06); door.add(w);
  SPD.box = { x: 7.5, z: z1 - 0.15, hx: (x1 - x0) / 2, hz: 0.2 };
  if (spiderDoorOpen) door.position.y = -dh; else CV.boxes.push(SPD.box);
}
const nearSpiderDoor = () => !spiderDoorOpen && SPD.door && Math.abs(player.pos.x - SPD.x) < 1.6 && player.pos.z > SPD.z && player.pos.z - SPD.z < 1.6;
const nearSpiderStand = () => SPD.stand && SPD.stand.visible && Math.hypot(player.pos.x - 7.5, player.pos.z + 12.6) < 1.8;
function spiderDoorAction() {
  if (nearSpiderDoor()) {
    spiderDoorOpen = true; try { localStorage.setItem('modly-spiderdoor', '1'); } catch (_) { }
    CV.boxes = CV.boxes.filter(b => b !== SPD.box);
    tone(60, 1.4, { to: 40, type: 'sawtooth', vol: 0.08, lp: 400, attack: 0.1 }); noiseHit(1.2, { f: 300, fto: 120, vol: 0.15 });
    let t = 0; fx.push(dt => { t += dt; SPD.door.position.y = -Math.min(1, t / 1.2) * 3.4; shake = Math.max(shake, 0.1); return t < 1.2; });
    toast('Slaptos durys!', 'Akmuo nusileido į žemę… Viduje kažkas šviečia', '#c77dff'); return true;
  }
  if (nearSpiderStand()) {
    unlockSkin('spider'); equipSkin('spider', true); SPD.stand.visible = false; try { localStorage.setItem('modly-spidertaken', '1'); } catch (_) { }
    [392, 466, 587, 698, 932].forEach((f, i) => tone(f, 0.45, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
    toast('Radai slaptą VORO KOSTIUMĄ!', 'Aštuonios akys ir aštuonios kojos – jis tavo visam laikui (ir kostiumų kioske)', '#c77dff');
    setTimeout(() => startTalk('Senasis Voras', ['Cha! Radai mano slaptą sandėliuką! Tas kostiumas – iš mano jaunystės.', 'Dabar tu beveik voras. Tik ne-pink voratinklių mano urve!'], '#c77dff'), 900);
    return true;
  }
  return false;
}
function spiderDoorPrompt(txt) {
  if (card) return txt;
  if (nearSpiderDoor()) return '<kbd>E</kbd> paliesti keistą plyšį sienoje';
  if (nearSpiderStand()) return '<kbd>E</kbd> paimti VORO KOSTIUMĄ';
  if (SPD.door && !spiderDoorOpen && Math.hypot(player.pos.x - SPD.x, player.pos.z - SPD.z) < 9 && Math.random() < 0.002) tone(1800, 0.08, { type: 'sine', vol: 0.01 });   // a faint whistle of air from the crack
  return txt;
}
function spiderTest() {
  spiderDoorOpen = false; try { localStorage.removeItem('modly-spiderdoor'); localStorage.removeItem('modly-spidertaken'); } catch (_) { }
  skinOwned = skinOwned.filter(s => s !== 'spider'); if (skinNow === 'spider') equipSkin('classic', true); saveSkins();
  if (CV.built) { SPD.door.position.y = 0; if (!CV.boxes.includes(SPD.box)) CV.boxes.push(SPD.box); SPD.stand.visible = true; }
  if (mode !== 'planet' || player.inCar) { toast('Išeik į pasaulį pėsčiomis', 'Ir tada vėl įvesk „voras“', '#c77dff'); return; }
  if (Q3.stage === 'none') { Q3.stage = 'go'; saveQ3(); }
  cancelPlace(true); dropAll(); hideCard();
  fadeTo(() => { enterCave(); player.pos.set(7.5, 0, -6); player.fwd.set(0, 0, -1); toast('Bandymų pasaulis: Voro urvas', 'Slaptos durys – kažkur prie Senojo Voro…', '#c77dff'); });
}
