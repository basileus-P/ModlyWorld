// ================= Command #12 (the last one): "Demono ritualas" =================
// buy a ritual sticker, 10 candles and a gun in the city's Ritual Shop → in the Crimson Wastes stick the sticker in the
// old ritual circle and set the candles → the demon appears: 350 HP vs your 30. Shooting does 1/3/5/10/15, the demon's
// fireballs 1/2/3. Lose → "Try again" / "Not now". Win → carry its body to the big lake that appears in the Pixel
// Realm → "Pagaliau demonas mirė!" + a huge spirit explosion → no more chaos, ever → the demon's staff goes to the museum
// (the explosion blew up six empty museum stands).
const Q14 = { stage: 'none', sticker: false, candles: 0, gun: false, stuck: false, set: false, carry: false };   // none | shop | ritual | fight | body | staff | museum | done
try { const s = JSON.parse(localStorage.getItem('modly-quest14') || 'null'); if (s) Object.assign(Q14, s); if (Q14.stage === 'fight') Q14.stage = 'ritual'; } catch (_) { }
function saveQ14() { try { localStorage.setItem('modly-quest14', JSON.stringify(Q14)); } catch (_) { } }
const q14Active = () => Q14.stage !== 'none' && Q14.stage !== 'done';
const demonDead = () => ['staff', 'museum', 'done'].includes(Q14.stage);
const Q14_GIVE = [
  'Mažasis… atėjo laikas. Paskutinis mano įsakymas: DEMONO RITUALAS.',
  'Mieste atsidarė Ritualų parduotuvė. Nusipirk ritualo lipduką, dešimt žvakučių ir šautuvą.',
  'Kai viską turėsi – grįžk čia, pas mane. Ritualą darysime mano salėje, prieš mane: užklijuok lipduką rato viduryje, sustatyk žvakutes – ir demonas pasirodys. Jis turi 350 gyvybių, o tu – tik 30. Bet tu turi šautuvą. Ir drąsą. O aš būsiu šalia.',
  'Kai jį nugalėsi – jo kūną nunešk į Pikselių Pasaulį. Ten atsiras didelis ežeras. Tik ten demonas pagaliau dings visiems laikams.'
];
function Q14_LINES() {
  if (Q14.stage === 'shop') return ['Ritualų parduotuvė – miesto aikštėje. Lipdukas, dešimt žvakučių ir šautuvas.'];
  if (Q14.stage === 'ritual' || Q14.stage === 'fight') return ['Ritualo ratas – čia, mano salėje, priešais mane. Būk drąsus. Jei pralaimėsi – visada galėsi bandyti dar kartą.'];
  if (Q14.stage === 'body') return ['Demonas nugalėtas! Dabar jo kūną nunešk į Pikselių Pasaulį – į didįjį ežerą.'];
  if (Q14.stage === 'staff' || Q14.stage === 'museum') return ['Jauti? Pasaulis nurimo. Jokio chaoso. Demono lazdą nunešk į muziejų.'];
  if (Q14.stage === 'done') return S15.stage === 'done' ? ['Žvaigždė iš kosmoso – muziejuje? Tu tikrai viską atradai. Neliko nė vienos paslapties… na, beveik.'] : ['Tu išgelbėjai pasaulį, mažasis žaliasis. Demonas dingo, chaosas baigėsi. Dabar čia – tik ramybė, draugai ir… tavo nuotykiai. Ačiū tau.', 'Psst… Sako, kad prie miesto atsirado keistas tramplinas. Jei užvažiuotum ant jo labai greitai… kas žino, kur nuskristum.'];
  return null;
}
function q14TalkEnd() {
  if (Q14.stage !== 'none' || Q13.stage !== 'done') return false;
  Q14.stage = 'shop'; saveQ14(); refreshDemonQuest();
  [196, 233, 262, 311, 392].forEach((f, i) => tone(f, 0.6, { type: 'sawtooth', vol: 0.04, lp: 900, when: i * 0.15 }));
  toast('Įsakymas #12: Demono ritualas', 'Ritualų parduotuvėje mieste nusipirk lipduką, 10 žvakučių ir šautuvą', '#ff4a3a');
  return true;
}

// ---------- models ----------
function makeDemon() {
  // a dark, smoky demon with glowing lava cracks, curled horns (one broken off – it's in the museum), fiery hair,
  // a burning heart-gem, ragged bat wings and a ghostly tail instead of legs
  const g = new THREE.Group(), skin = mat(0x2a1630, { roughness: 0.55, emissive: 0x1a0410 }), dark = mat(0x140a18, { roughness: 0.7 }), horn = mat(0xd8c8a8, { roughness: 0.45 });
  const lava = mat(0xff5a1a, { emissive: 0xff3a00, emissiveIntensity: 1.2 }), fire = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85 });
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.sph, skin, 0.85, 1.0, 0.6, 0, 2.0, 0)); body.add(S(G.sph, skin, 0.6, 0.45, 0.45, 0, 1.25, 0));
  for (const [x, y, rz] of [[-0.35, 2.2, 0.4], [0.3, 1.8, -0.5], [-0.15, 1.5, 0.1], [0.4, 2.45, 0.2], [0, 2.7, 0.8]]) { const c = S(G.box, lava, 0.05, 0.45, 0.03, x, y, 0.55); c.rotation.z = rz; body.add(c); }
  body.add(S(G.ico, mat(0xff2a4a, { emissive: 0xff0030, emissiveIntensity: 1.3 }), 0.2, 0.26, 0.12, 0, 2.15, 0.6));
  // ghost tail of smoke
  const tail = new THREE.Group(); tail.position.set(0, 0.9, 0); body.add(tail);
  for (let i = 0; i < 5; i++) tail.add(S(G.sph, dark, 0.5 - i * 0.08, 0.35, 0.5 - i * 0.08, Math.sin(i) * 0.15, -i * 0.28, -i * 0.12));
  // head
  const head = new THREE.Group(); head.position.set(0, 3.15, 0.05); body.add(head);
  head.add(S(G.sph, skin, 0.5, 0.52, 0.48)); head.add(S(G.box, dark, 0.7, 0.12, 0.2, 0, 0.12, 0.38));
  for (const x of [-0.2, 0.2]) { const e = S(G.sph, mat(0x9aff3a, { emissive: 0x6aff00, emissiveIntensity: 1.4 }), 0.12, 0.07, 0.05, x, 0.02, 0.44); e.rotation.z = x > 0 ? -0.35 : 0.35; head.add(e); }
  head.add(S(G.box, lava, 0.34, 0.06, 0.03, 0, -0.24, 0.45)); for (let k = 0; k < 4; k++) head.add(S(G.cone, horn, 0.03, 0.08, 0.03, -0.12 + k * 0.08, -0.2, 0.47).rotateX(Math.PI));
  // curled horns: the left one whole, the right one snapped off
  { const L = new THREE.Group(); L.position.set(-0.32, 0.35, 0); head.add(L); for (let i = 0; i < 7; i++) { const a = i * 0.32; L.add(S(G.sph, horn, 0.13 - i * 0.012, 0.13 - i * 0.012, 0.13 - i * 0.012, -Math.sin(a) * 0.45, Math.cos(a) * 0.5 - 0.1 + i * 0.05, -i * 0.04)); } }
  head.add(S(G.cyl, horn, 0.12, 0.2, 0.12, 0.34, 0.42, 0).rotateZ(-0.6)); head.add(S(G.cyl, mat(0x8a7a60), 0.1, 0.02, 0.1, 0.4, 0.5, 0).rotateZ(-0.6));
  // fiery hair
  const flames = []; for (let i = 0; i < 7; i++) { const f = S(G.cone, fire([0xff3a1a, 0xff8a1a, 0xffd23a][i % 3]), 0.12, 0.5, 0.12, -0.3 + i * 0.1, 0.55, -0.15 - (i % 2) * 0.1); head.add(f); flames.push(f); }
  // ragged wings
  const wings = [];
  for (const sx of [-1, 1]) { const w = new THREE.Group(); w.position.set(sx * 0.4, 2.5, -0.4); body.add(w); const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(sx * 2.6, 1.5); sh.lineTo(sx * 2.2, 0.4); sh.lineTo(sx * 2.8, -0.2); sh.lineTo(sx * 1.8, -0.3); sh.lineTo(sx * 2.0, -1.2); sh.lineTo(sx * 0.9, -0.6); sh.lineTo(sx * 0.6, -1.3); sh.lineTo(0, -0.5);
    w.add(mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0x4a1030, emissive: 0x200008, side: THREE.DoubleSide, roughness: 0.8 })));
    for (const [x, y] of [[2.6, 1.5], [2.8, -0.2], [2.0, -1.2], [0.6, -1.3]]) { const v = new V3(sx * x, y, 0), b = S(G.cyl6, dark, 0.04, v.length(), 0.04, v.x / 2, v.y / 2, 0.01); b.quaternion.setFromUnitVectors(UP, v.clone().normalize()); w.add(b); }
    wings.push(w); }
  // long arms with glowing claws
  const arms = [];
  for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.85, 2.5, 0); body.add(a); a.add(S(G.cyl, skin, 0.16, 1.2, 0.16, 0, -0.6, 0)); a.add(S(G.sph, dark, 0.22, 0.22, 0.22, 0, -1.25, 0)); for (let k = 0; k < 3; k++) a.add(S(G.cone, lava, 0.035, 0.2, 0.035, -0.09 + k * 0.09, -1.45, 0.08).rotateX(Math.PI)); arms.push(a); }
  for (const sx of [-1, 1]) body.add(S(G.sph, dark, 0.32, 0.22, 0.3, sx * 0.85, 2.85, 0));
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9a2aff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); aura.scale.setScalar(7); aura.position.y = 2.2; g.add(aura);
  g.userData = { body, wings, arms, aura, skin, flames, tail }; return g;
}
function makeDemonGun() {
  const g = new THREE.Group(), dark = mat(0x3a2a5a, { metalness: 0.6, roughness: 0.35 }), glow = mat(0x6ff7ff, { emissive: 0x3ad8ff, emissiveIntensity: 1 });
  g.add(S(G.box, dark, 0.14, 0.18, 0.7, 0, 0, 0.1)); g.add(S(G.cyl, mat(0x30343e, { metalness: 0.8 }), 0.05, 0.6, 0.05, 0, 0.03, 0.7).rotateX(Math.PI / 2));
  g.add(S(G.box, glow, 0.15, 0.03, 0.5, 0, 0.1, 0.1)); g.add(S(G.box, dark, 0.08, 0.22, 0.1, 0, -0.17, -0.05)); g.add(S(G.sph, glow, 0.06, 0.06, 0.06, 0, 0.03, 1.0));
  return g;
}
function makeDemonStaff() {
  const g = new THREE.Group(), wood = mat(0x2a1418, { roughness: 0.5 }), orb = mat(0xb04aff, { emissive: 0x8a20ff, emissiveIntensity: 1 });
  g.add(S(G.cyl6, wood, 0.06, 2.2, 0.06, 0, 1.1, 0));
  for (const sx of [-1, 1]) { const h = S(G.cone, mat(0x1a1010), 0.07, 0.4, 0.07, sx * 0.16, 2.35, 0); h.rotation.z = -sx * 0.6; g.add(h); }
  g.add(S(G.sph, orb, 0.17, 0.17, 0.17, 0, 2.38, 0)); g.add(mesh(new THREE.TorusGeometry(0.14, 0.025, 6, 16), mat(0xffd23a, { metalness: 0.8 }), 0, 2.2, 0).rotateX(Math.PI / 2));
  return g;
}
function makeCandle(lit) { const g = new THREE.Group(); g.add(S(G.cyl, mat(0xf0e8d8), 0.07, 0.35, 0.07, 0, 0.17, 0)); const f = S(G.cone, new THREE.MeshBasicMaterial({ color: 0xffb030 }), 0.05, 0.14, 0.05, 0, 0.42, 0); f.visible = lit; g.add(f); g.userData.flame = f; return g; }

// ---------- the Ritual Shop in the city ----------
let ritShop = null;
function buildDemonQuest() {
  // a free spot around the plaza
  let best = null;
  for (let k = 0; k < 24 && !best; k++) { const a = 0.4 + k * 0.26, d = cityDir(Math.cos(a) * 15.5, Math.sin(a) * 15.5); if (nearRoad(d, 3)) continue; if (inspectables.every(it => it.pos.distanceTo(surf(d)) > 7)) best = d; }
  if (!best) best = cityDir(-15.5, 4);
  { const d = best, g = new THREE.Group(); g.position.copy(surf(d)); orient(g, d, tangentToward(d, UP)); world.add(g);
    const pur = mat(0x3a1a4a), red = mat(0x8a1418);
    g.add(S(G.box, pur, 3.2, 2.6, 1.2, 0, 1.3, -0.8)); for (const sx of [-1.5, 1.5]) g.add(S(G.box, pur, 0.2, 2.9, 2.3, sx, 1.45, -0.05));
    g.add(S(G.box, red, 3.4, 0.25, 2.5, 0, 3.0, -0.05)); g.add(S(G.box, mat(0x2a1418), 3.3, 1.0, 0.5, 0, 0.5, 1.1));
    for (let i = 0; i < 6; i++) { const c = makeCandle(true); c.position.set(-1.2 + i * 0.48, 1.0, 1.1); g.add(c); }
    g.add(mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('RITUALŲ PARDUOTUVĖ', '#1a0a20', '#ff6b4a', 512, 96) }), 0, 3.5, 0.6));
    { const l = new THREE.PointLight(0xff6030, 0.9, 7); l.position.set(0, 2, 1.2); g.add(l); }
    linearize(g); addBox(g, 1.7, 1.4, 3, 0, -0.3); ritShop = g;
    ritShop.inspect = addInspect(surf(d, 1).addScaledVector(tangentToward(d, UP), 1.8), 'Ritualų parduotuvė', '', 0, { verb: 'atidaryti Ritualų parduotuvę', onUse: openRitShop });
  }
  // the ritual circle in the Creator's hall, in front of the Creator
  { const g = new THREE.Group(); g.position.set(RIT.c.x, 0.03, RIT.c.z); sanc.add(g); RIT.g = g;
    g.add(mesh(new THREE.RingGeometry(5.6, 6.0, 64), bmat(0x5a0a3a, { side: THREE.DoubleSide }), 0, 0.02, 0).rotateX(-Math.PI / 2));
    g.add(mesh(new THREE.RingGeometry(3.4, 3.6, 64), bmat(0x5a0a3a, { side: THREE.DoubleSide }), 0, 0.02, 0).rotateX(-Math.PI / 2));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(S(G.dodec, mat(0x3a2a4a), 0.4, 0.55, 0.4, Math.cos(a) * 6.6, 0.25, Math.sin(a) * 6.6)); }
    const st = mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshBasicMaterial({ map: stickerTex(), transparent: true, side: THREE.DoubleSide }), 0, 0.04, 0); st.rotation.x = -Math.PI / 2; g.add(st); RIT.sticker = st;
    RIT.candles = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, c = makeCandle(false); c.position.set(Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6); g.add(c); RIT.candles.push(c); }
    RIT.beam = new THREE.Group(); g.add(RIT.beam);
    linearize(g);
    sancAnim.push((dt, t) => { if (g.visible) RIT.candles.forEach((c, i) => { if (c.userData.flame.visible) c.userData.flame.scale.y = 0.14 * (0.8 + 0.4 * Math.sin(t * 12 + i)); }); });
  }
  // the lake in the Pixel Realm (appears when the demon is beaten)
  { const d = catSpot('lq', 6, 0.7, d => isLand(d, 0.3) && flatSpread(d, LAKE.R + 2) < 1.2 && farFromOthers(d, 12) && !nearRoad(d, 12)) || BC[6]; placedList.push(d); LAKE.d = d;
    // the pool sits level on the highest ground under it, with a stone rim down to the lowest
    let hi = -9, lo = 9; { const t1 = tangentToward(d, UP), t2 = new V3().crossVectors(d, t1); for (let rr2 = 0; rr2 <= LAKE.R + 1.5; rr2 += 1.5) for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, q = moveAlong(d, t1.clone().multiplyScalar(Math.cos(a)).addScaledVector(t2, Math.sin(a)).normalize(), rr2), h = TH(q); hi = Math.max(hi, h); lo = Math.min(lo, h); } }
    const g = new THREE.Group(); place(g, d, 0, hi - TH(d) + 0.3); LAKE.g = g; g.userData.noCollapse = true;
    g.add(mesh(new THREE.CylinderGeometry(LAKE.R + 1.4, LAKE.R + 2.2, hi - lo + 0.8, 40, 1, true), mat(0x5a4a6a, { side: THREE.DoubleSide }), 0, -(hi - lo + 0.8) / 2 + 0.2, 0));
    addSolid(d, LAKE.R + 1.6, 0.25, false, hi - TH(d) + 0.05);
    const water = mesh(new THREE.CircleGeometry(LAKE.R, 48), new THREE.MeshStandardMaterial({ color: 0x3a1a6a, emissive: 0x2a0a5a, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.92 }), 0, 0.1, 0); water.rotation.x = -Math.PI / 2; g.add(water); LAKE.water = water;
    g.add(mesh(new THREE.RingGeometry(LAKE.R - 0.2, LAKE.R + 1.4, 48), mat(0x5a4a6a), 0, 0.05, 0).rotateX(-Math.PI / 2));
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.add(S(G.box, mat(pick(PIX)), 0.9, rr(0.3, 1.2), 0.9, Math.cos(a) * (LAKE.R + 1.6), 0.3, Math.sin(a) * (LAKE.R + 1.6))); }
    const sign = makeSign('Demonų ežeras'); sign.position.set(LAKE.R + 2.6, 0, 0); g.add(sign);
    const staff = makeDemonStaff(); staff.position.y = 2; g.add(staff); LAKE.staff = staff;
    linearize(g);
    LAKE.inspect = addInspect(g.position.clone(), 'Demonų ežeras', '', 0, { verb: 'paimti demono lazdą', onUse: takeStaff });
  }
  BODY_IT = addInspect(new V3(), 'Demono kūnas', '', 0, { verb: 'paimti demono kūną ant pečių', onUse: () => { carryBody(true); toast('Neši demono kūną!', 'Keliauk į Pikselių Pasaulį – į didįjį ežerą', '#b04aff'); } });
  animators.push((dt, t) => {
    if (LAKE.staff && LAKE.staff.visible) { LAKE.staff.position.y = 2.2 + Math.sin(t * 1.5) * 0.25; LAKE.staff.rotation.y = t * 0.7; }
    if (LAKE.water && Q14.stage === 'body') LAKE.water.material.emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 3);
  });
  refreshDemonQuest();
}
const RIT = { c: new V3(0, 0, 3) }, LAKE = { R: 11 }; let BODY_IT = null;
function flatSpread(d, r) { let hi = -9, lo = 9; const t1 = tangentToward(d, Math.abs(d.y) > 0.9 ? new V3(1, 0, 0) : UP), t2 = new V3().crossVectors(d, t1); for (let r2 = 0; r2 <= r; r2 += 1.5) for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, h = TH(moveAlong(d, t1.clone().multiplyScalar(Math.cos(a)).addScaledVector(t2, Math.sin(a)).normalize(), r2)); hi = Math.max(hi, h); lo = Math.min(lo, h); } return lo < 0.3 ? 99 : hi - lo; }
function landAround(d, r) { const t1 = tangentToward(d, Math.abs(d.y) > 0.9 ? new V3(1, 0, 0) : UP), t2 = new V3().crossVectors(d, t1); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; if (TH(moveAlong(d, t1.clone().multiplyScalar(Math.cos(a)).addScaledVector(t2, Math.sin(a)).normalize(), r)) < 0.25) return false; } return true; }
function stickerTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#ffe9d0'; x.beginPath(); x.arc(128, 128, 124, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#a01010'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 108, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(128, 128, 70, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#a01010'; x.font = "bold 34px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.save(); x.translate(128 + Math.cos(a) * 89, 128 + Math.sin(a) * 89); x.rotate(a + Math.PI / 2); x.fillText(['ᚱ', 'ᛟ', 'ᚦ', 'ᛉ', 'ᚨ', 'ᛞ', 'ᛗ', 'ᛃ'][i], 0, 0); x.restore(); }
  x.font = "bold 46px 'Lilita One', sans-serif"; x.fillText('✶', 128, 130);
  return new THREE.CanvasTexture(c);
}
function refreshDemonQuest() {
  if (!RIT.g) return;
  const act = q14Active() || Q14.stage === 'done';
  ritShop.inspect.r = Q14.stage === 'shop' || (q14Active() && !(Q14.sticker && Q14.candles >= 10 && Q14.gun)) ? 5.5 : 0;
  RIT.g.visible = act; RIT.sticker.visible = Q14.stuck; RIT.candles.forEach((c, i) => { c.visible = Q14.set; c.userData.flame.visible = Q14.set; });
  LAKE.g.visible = ['body', 'staff', 'museum', 'done'].includes(Q14.stage);
  LAKE.staff.visible = Q14.stage === 'staff'; LAKE.inspect.r = Q14.stage === 'staff' ? LAKE.R + 6 : 0;
  if (demonDead()) { LAKE.water.material.color.setHex(0x5fd0ff).convertSRGBToLinear(); LAKE.water.material.emissive.setHex(0x0a3050).convertSRGBToLinear(); }
  attachDemonGun(Q14.gun && ['shop', 'ritual', 'fight'].includes(Q14.stage));
  attachStaff(Q14.stage === 'museum');
  if (Q14.stage === 'body') { if (!DEM.m) spawnDemonBody(); }
}

// ---------- buying ----------
let ritShopOpen = false;
const RIT_ITEMS = [
  { id: 'sticker', name: 'Ritualo lipdukas', desc: 'Apvalus lipdukas su senoviniais ženklais. Klijuojamas į ritualo rato vidurį.', price: 150 },
  { id: 'candle', name: 'Žvakutė', desc: 'Reikia dešimties. Jos sustatomos ratu aplink lipduką.', price: 15 },
  { id: 'gun', name: 'Šautuvas', desc: 'Šviečiantis ritualo šautuvas. Kai turi – jis visada tavo rankoje.', price: 300 }
];
function openRitShop() {
  let el = $('ritShop');
  if (!el) {
    el = document.createElement('div'); el.id = 'ritShop'; el.className = 'chip';
    el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;background:rgba(26,10,32,.97);border:2px solid #ff6b4a;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;width:min(520px,calc(100vw - 32px));box-sizing:border-box;max-height:calc(100vh - 32px);overflow:auto';
    document.body.appendChild(el);
  }
  ritShopOpen = true; el.hidden = false; $('paused').hidden = true; for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  renderRitShop();
}
function renderRitShop() {
  const el = $('ritShop'); if (!el) return;
  const owned = it => it.id === 'sticker' ? Q14.sticker : it.id === 'gun' ? Q14.gun : Q14.candles >= 10;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div style="font-size:12px;letter-spacing:.08em;color:#c8a0a0">PRADŽIOS MIESTAS</div><div style="font-family:var(--display);font-size:30px;color:#ff6b4a">Ritualų parduotuvė</div></div><div style="font-weight:800">${fmtMoney(money)}</div></div>` +
    RIT_ITEMS.map(it => `<div style="display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.06);border-radius:12px;padding:10px 12px"><div style="flex:1;min-width:0"><div style="font-weight:800;font-size:16px">${it.name}${it.id === 'candle' ? ` <span style="color:#ffd23a">${Q14.candles} / 10</span>` : ''}</div><div style="font-size:13px;color:#c8c0d0">${it.desc}</div></div>` +
      (owned(it) ? '<div style="color:#7dff6b;font-weight:800">✓ Turi</div>' : `<button data-buy="${it.id}" style="font:inherit;font-weight:800;border:none;border-radius:10px;padding:8px 14px;background:#ffd23a;color:#3a2a00;cursor:pointer">${it.price} €</button>` + (it.id === 'candle' && Q14.candles < 9 ? `<button data-buy="candles" style="font:inherit;font-weight:800;border:none;border-radius:10px;padding:8px 10px;background:#ff9a3a;color:#3a1a00;cursor:pointer">Visas (${(10 - Q14.candles) * it.price} €)</button>` : '')) + '</div>').join('') +
    `<button id="ritClose" style="font:inherit;background:none;border:1px solid #888;color:#ddd;border-radius:10px;padding:6px 14px;cursor:pointer;align-self:flex-start">Uždaryti (Esc)</button>`;
  el.querySelectorAll('[data-buy]').forEach(b => b.onclick = e => { e.stopPropagation(); buyRit(b.dataset.buy); });
  $('ritClose').onclick = e => { e.stopPropagation(); closeRitShop(); };
}
function buyRit(id) {
  const n = id === 'candles' ? 10 - Q14.candles : 1, price = id === 'sticker' ? 150 : id === 'gun' ? 300 : 15 * n;
  if (!canPay(price)) { tooPoor(price); return; }
  pay(price);
  if (id === 'sticker') Q14.sticker = true; else if (id === 'gun') Q14.gun = true; else Q14.candles = Math.min(10, Q14.candles + n);
  if (Q14.stage === 'shop' && Q14.sticker && Q14.candles >= 10 && Q14.gun) { Q14.stage = 'ritual'; toast('Viskas nupirkta!', 'Eik pas Kūrėją – ritualas bus jo salėje', '#ff4a3a'); }
  saveQ14(); refreshDemonQuest(); renderRitShop(); sfx.chime();
}
function closeRitShop() { ritShopOpen = false; const el = $('ritShop'); if (el) el.hidden = true; if (!lockFailed) requestLock(); }
let heldDemonGun = null, heldStaff = null;
function attachDemonGun(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !heldDemonGun) { heldDemonGun = makeDemonGun(); heldDemonGun.position.set(0, 0, 0.18); hand.add(heldDemonGun); linearize(heldDemonGun); }
  if (!on && heldDemonGun) { hand.remove(heldDemonGun); heldDemonGun = null; }
}
function attachStaff(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !heldStaff) { heldStaff = makeDemonStaff(); heldStaff.scale.setScalar(0.55); heldStaff.position.set(0, -0.6, 0.1); hand.add(heldStaff); linearize(heldStaff); }
  if (!on && heldStaff) { hand.remove(heldStaff); heldStaff = null; }
}

// ---------- the ritual ----------
function ritualAction() {
  if (Q14.stage !== 'ritual') return;
  if (!Q14.stuck) { Q14.stuck = true; saveQ14(); refreshDemonQuest(); tone(400, 0.15, { type: 'triangle', vol: 0.05 }); toast('Lipdukas užklijuotas!', 'Dabar sustatyk 10 žvakučių (E)', '#ff6b4a'); return; }
  if (!Q14.set) {
    Q14.set = true; saveQ14(); RIT.candles.forEach(c => { c.visible = false; c.userData.flame.visible = false; });
    RIT.candles.forEach((c, i) => setTimeout(() => { c.visible = true; c.userData.flame.visible = true; tone(600 + i * 60, 0.1, { type: 'sine', vol: 0.04 }); if (i === 9) toast('Visos 10 žvakučių dega', 'E – pradėti ritualą. Demonas ateis…', '#ff6b4a'); }, i * 160));
    return;
  }
  startFight();
}

// ---------- the fight (in the Creator's hall) ----------
const DEM = { m: null, hp: 350, php: 30, ang: 0, atk: 2, shot: 0, balls: [], dead: false, over: false, carried: false };
let demonDialog = false;
function bossBar(show) {
  let el = $('bossBar');
  if (!el) { el = document.createElement('div'); el.id = 'bossBar'; el.style.cssText = 'position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:3;width:min(520px,calc(100vw - 32px));display:flex;flex-direction:column;gap:6px;pointer-events:none;font-weight:800;text-shadow:0 2px 4px #000'; el.innerHTML = '<div style="display:flex;justify-content:space-between;color:#ff6b4a"><span>DEMONAS</span><span id="bbDemN"></span></div><div style="height:14px;background:rgba(0,0,0,.5);border-radius:8px;overflow:hidden"><div id="bbDem" style="height:100%;background:linear-gradient(90deg,#ff2a1a,#ff8a3a)"></div></div><div style="display:flex;justify-content:space-between;color:#7dff6b;margin-top:4px"><span>TU</span><span id="bbMeN"></span></div><div style="height:10px;background:rgba(0,0,0,.5);border-radius:6px;overflow:hidden;width:60%"><div id="bbMe" style="height:100%;background:#7dff6b"></div></div>'; document.body.appendChild(el); }
  el.hidden = !show; if (!show) return;
  $('bbDem').style.width = (DEM.hp / 350 * 100) + '%'; $('bbDemN').textContent = `${Math.max(0, DEM.hp)} / 350`;
  $('bbMe').style.width = (DEM.php / 30 * 100) + '%'; $('bbMeN').textContent = `${Math.max(0, DEM.php)} / 30`;
}
function redFlash(col = 'rgba(255,0,0,.35)', dur = 300) {
  let el = $('hurtFlash'); if (!el) { el = document.createElement('div'); el.id = 'hurtFlash'; el.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;transition:opacity .3s;opacity:0'; document.body.appendChild(el); }
  el.style.background = col; el.style.transition = 'none'; el.style.opacity = 1; void el.offsetWidth; el.style.transition = `opacity ${dur}ms`; el.style.opacity = 0;
}
function sancPuff(p, col) {
  const parts = []; for (let i = 0; i < 8; i++) { const m = S(G.ico, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 }), 0.4, 0.4, 0.4); m.position.copy(p).add(randDir().multiplyScalar(0.8)); sanc.add(m); parts.push(m); }
  let t = 0; fx.push(dt => { t += dt; for (const m of parts) { m.scale.multiplyScalar(1 + dt * 2); m.material.opacity = Math.max(0, 0.85 - t * 1.4); m.position.y += dt; } if (t > 0.65) { parts.forEach(m => sanc.remove(m)); return false; } return true; });
}
function demonPosAt(ang, r, lift) { return new V3(RIT.c.x + Math.cos(ang) * r, lift, RIT.c.z + Math.sin(ang) * r); }
const q14SanctumNear = () => (Q14.stage === 'ritual' && Math.hypot(player.pos.x - RIT.c.x, player.pos.z - RIT.c.z) < 6.5) || (Q14.stage === 'body' && !Q14.carry && DEM.m && DEM.dead && DEM.m.position.distanceTo(player.pos) < 5.5);
function q14SanctumPrompt() {
  if (Q14.stage === 'body') return '<kbd>E</kbd> užsidėti demono kūną ant pečių';
  return !Q14.stuck ? '<kbd>E</kbd> užklijuoti ritualo lipduką' : !Q14.set ? '<kbd>E</kbd> sustatyti 10 žvakučių' : '<kbd>E</kbd> pradėti ritualą – iškviesti demoną!';
}
function q14SanctumAction() {
  if (Q14.stage === 'body') { carryBody(true); toast('Neši demono kūną!', 'Išeik pro vartus ir keliauk į Pikselių Pasaulį – į didįjį ežerą', '#b04aff'); return; }
  ritualAction();
}
function startFight() {
  if (!DEM.m) { DEM.m = makeDemon(); DEM.m.scale.setScalar(1.5); sanc.add(DEM.m); linearize(DEM.m); }
  if (DEM.m.parent !== sanc) sanc.add(DEM.m);
  DEM.hp = 350; DEM.php = 30; DEM.ang = Math.atan2(player.pos.z - RIT.c.z, player.pos.x - RIT.c.x) + Math.PI; DEM.atk = 2.5; DEM.dead = false; DEM.over = false; DEM.rise = 0; DEM.m.visible = true; DEM.m.userData.aura.visible = true; DEM.m.userData.body.rotation.set(0, 0, 0); DEM.m.scale.setScalar(1.5);
  Q14.stage = 'fight'; refreshDemonQuest(); bossBar(true);
  shake = Math.max(shake, 0.8); [110, 98, 82, 73].forEach((f, i) => tone(f, 0.8, { type: 'sawtooth', vol: 0.08, lp: 600, when: i * 0.25 })); noiseHit(1.2, { f: 200, vol: 0.2 });
  sancPuff(new V3(RIT.c.x, 0.5, RIT.c.z), 0x6a1a8a); redFlash('rgba(120,0,160,.4)', 800);
  toast('DEMONAS PASIRODĖ!', 'Šauk pele (taikyk į jį). Bėgiok, kad išvengtum ugnies kamuolių!', '#ff4a3a');
}
function fightDamageNum(pos, n, col) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.font = "bold 48px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 6; x.strokeStyle = '#000'; x.strokeText(n, 64, 34); x.fillStyle = col; x.fillText(n, 64, 34);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.set(1.6, 0.8, 1); sanc.add(s);
  let t = 0; fx.push(dt => { t += dt; s.position.copy(pos).add(new V3(0, t * 1.5, 0)); s.material.opacity = Math.max(0, 1 - t); if (t > 1) { sanc.remove(s); return false; } return true; });
}
function q14HandDown(side) {
  if (Q14.stage !== 'fight' || mode !== 'sanctum' || !DEM.m || DEM.dead || DEM.over) return false;
  if (DEM.shot > 0) return true;
  DEM.shot = 0.28;
  player.mesh.updateMatrixWorld(true);
  const gunTip = heldDemonGun ? heldDemonGun.localToWorld(new V3(0, 0.03, 1.0)) : player.pos.clone().add(new V3(0, 1.4, 0));
  const center = DEM.m.position.clone().add(new V3(0, 3.2, 0));
  const cf = new V3(); camera.getWorldDirection(cf); const toD = center.clone().sub(camera.position), dist = toD.length();
  const hit = toD.normalize().dot(cf) > Math.cos(Math.atan(2.8 / dist) + 0.1) && dist < 60;
  const end = hit ? center : camera.position.clone().addScaledVector(cf, 40);
  const v = end.clone().sub(gunTip), tr = S(G.cyl6, new THREE.MeshBasicMaterial({ color: 0x6ff7ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), 0.05, v.length(), 0.05); tr.position.copy(gunTip).addScaledVector(v, 0.5); tr.quaternion.setFromUnitVectors(UP, v.normalize()); sanc.add(tr);
  let tt = 0; fx.push(dt => { tt += dt; tr.material.opacity = Math.max(0, 0.9 - tt * 6); if (tt > 0.15) { sanc.remove(tr); return false; } return true; });
  tone(900, 0.08, { to: 300, type: 'square', vol: 0.05, lp: 3000 }); noiseHit(0.06, { f: 3000, vol: 0.06 });
  if (hit) {
    const dmg = pick([1, 3, 5, 10, 15]); DEM.hp -= dmg; fightDamageNum(center.clone().add(new V3(0, 1.2, 0)), '-' + dmg, dmg >= 10 ? '#ffd23a' : '#ffffff');
    DEM.flash = 0.12; tone(180, 0.1, { type: 'sawtooth', vol: 0.05, lp: 900 });
    if (DEM.hp <= 0) winFight();
  }
  if (Q14.stage === 'fight') bossBar(true);
  return true;
}
function updateFight(dt, t) {
  if (Q14.stage !== 'fight' || !DEM.m || DEM.over) return;
  if (mode !== 'sanctum') { toast('Pabėgai nuo demono…', 'Jis grįžo į savo pasaulį. Ritualą Kūrėjo Salėje gali kartoti bet kada', '#ff6b4a'); notNow(); return; }
  DEM.shot = Math.max(0, DEM.shot - dt);
  const m = DEM.m, ud = m.userData;
  if (DEM.dead) return;
  DEM.rise = Math.min(1, (DEM.rise || 0) + dt * 0.6);
  DEM.ang += dt * 0.35; const r = 9 + Math.sin(t * 0.6) * 2.5;
  m.position.copy(demonPosAt(DEM.ang, r, -6 * (1 - DEM.rise) + 1.4 + Math.sin(t * 2) * 0.4));
  m.rotation.set(0, Math.atan2(player.pos.x - m.position.x, player.pos.z - m.position.z), 0);
  ud.wings.forEach((w, i) => w.rotation.y = (i ? -1 : 1) * (0.3 + Math.sin(t * 6) * 0.35)); ud.aura.material.opacity = 0.35 + 0.15 * Math.sin(t * 5);
  ud.flames.forEach((f, i) => f.scale.y = 0.5 * (0.8 + 0.4 * Math.sin(t * 14 + i * 1.7))); ud.tail.rotation.z = Math.sin(t * 3) * 0.25;
  ud.skin.emissive.setHex(DEM.flash > 0 ? 0xffffff : 0x1a0410); DEM.flash = Math.max(0, (DEM.flash || 0) - dt);
  // fireballs
  DEM.atk -= dt;
  if (DEM.atk <= 0 && DEM.rise >= 1) {
    DEM.atk = rr(1.2, 2.1);
    m.updateMatrixWorld(true); const arm = ud.arms[Math.random() < 0.5 ? 0 : 1], start = arm.localToWorld(new V3(0, -1.3, 0)), tgt = player.pos.clone().add(new V3(0, 1, 0)).addScaledVector(player.vel, 0.35);
    const b = new THREE.Group(); b.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0xc04aff }), 0.42, 0.42, 0.42)); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff3a1a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.4); b.add(gl);
    b.position.copy(start); sanc.add(b); DEM.balls.push({ b, v: tgt.sub(start).normalize().multiplyScalar(16), life: 4 });
    tone(220, 0.3, { to: 120, type: 'sawtooth', vol: 0.05, lp: 1200 });
  }
  const chest = player.pos.clone().add(new V3(0, 1, 0));
  for (let i = DEM.balls.length - 1; i >= 0; i--) {
    const f = DEM.balls[i]; f.life -= dt; f.b.position.addScaledVector(f.v, dt);
    if (f.b.position.distanceTo(chest) < 1.25) {
      const dmg = pick([1, 2, 3]); DEM.php -= dmg; redFlash(); shake = Math.max(shake, 0.35); noiseHit(0.2, { f: 400, vol: 0.12 }); fightDamageNum(chest.clone().add(new V3(0, 1.2, 0)), '-' + dmg, '#ff5a5a');
      sanc.remove(f.b); DEM.balls.splice(i, 1); bossBar(true); if (DEM.php <= 0) { loseFight(); return; } continue;
    }
    if (f.b.position.y < 0.1 || f.life <= 0 || Math.hypot(f.b.position.x, f.b.position.z) > 30) { sancPuff(f.b.position.clone(), 0xb04aff); sanc.remove(f.b); DEM.balls.splice(i, 1); }
  }
}
function clearBalls() { for (const f of DEM.balls) sanc.remove(f.b); DEM.balls.length = 0; }
function loseFight() {
  DEM.over = true; clearBalls(); demonDialog = true; for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  [392, 330, 262, 196].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.2 }));
  let el = $('loseBox');
  if (!el) {
    el = document.createElement('div'); el.id = 'loseBox'; el.className = 'chip';
    el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;background:rgba(40,8,10,.96);border:2px solid #ff4a3a;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center;width:min(420px,calc(100vw - 32px));box-sizing:border-box';
    el.innerHTML = '<div style="font-family:var(--display);font-size:38px;color:#ff6b4a">Pralaimėjai…</div><div style="color:#e8d0d0">Demonas buvo stipresnis. Šį kartą.</div><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><button id="loseTry" class="btn">Try again</button><button id="loseNot" class="btn" style="background:#c8c0d0;box-shadow:0 5px 0 #7a7480">Not now</button></div>';
    document.body.appendChild(el);
    $('loseTry').onclick = e => { e.stopPropagation(); closeLose(); tryAgain(); };
    $('loseNot').onclick = e => { e.stopPropagation(); closeLose(); notNow(); };
  }
  el.hidden = false; $('paused').hidden = true;
}
function closeLose() { demonDialog = false; $('loseBox').hidden = true; if (!lockFailed) requestLock(); }
function tryAgain() {
  player.pos.set(RIT.c.x, 0, RIT.c.z + 7); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0;
  startFight(); toast('Bandai dar kartą!', 'Bėgiok ir šauk – tu gali!', '#7dff6b');
}
function notNow() {
  DEM.over = true; clearBalls(); if (DEM.m) { if (DEM.m.parent === sanc) sancPuff(DEM.m.position.clone().add(new V3(0, 2, 0)), 0x5a0a5a); DEM.m.visible = false; }
  Q14.stage = 'ritual'; saveQ14(); refreshDemonQuest(); bossBar(false);
}
function winFight() {
  DEM.dead = true; clearBalls(); bossBar(false);
  Q14.stage = 'body'; Q14.carry = false; saveQ14();
  const m = DEM.m, p0 = m.position.clone(), ground = new V3(p0.x, 0.35, p0.z); let t = 0;
  shake = Math.max(shake, 1); [523, 392, 330, 262, 196, 131].forEach((f, i) => tone(f, 0.5, { type: 'sawtooth', vol: 0.05, lp: 900, when: i * 0.12 })); sancPuff(p0.clone().add(new V3(0, 2, 0)), 0xff6a1a);
  fx.push(dt => { t += dt; const k = Math.min(1, t / 1.2); m.position.lerpVectors(p0, ground, k); m.userData.body.rotation.x = -k * Math.PI / 2; m.userData.aura.material.opacity = 0.4 * (1 - k); return k < 1; });
  refreshDemonQuest();
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: 1.2 + i * 0.1 }));
  toast('TU NUGALĖJAI DEMONĄ!', 'Užsidėk jo kūną ant pečių (E) ir nunešk į Pikselių Pasaulį – ten atsirado didelis ežeras', '#ffd23a');
}
function spawnDemonBody() {   // after a reload: the beaten demon lies in the ritual circle (or is on your back)
  DEM.m = makeDemon(); DEM.m.scale.setScalar(1.5); sanc.add(DEM.m); linearize(DEM.m); DEM.dead = true; DEM.m.userData.aura.visible = false;
  DEM.m.position.set(RIT.c.x + 3, 0.35, RIT.c.z); DEM.m.userData.body.rotation.x = -Math.PI / 2;
  if (Q14.carry) carryBody(true);
}
function carryBody(on) {
  const m = DEM.m; if (!m) return;
  if (on) { player.mesh.add(m); m.position.set(0, 2.3, 0); m.quaternion.identity(); m.rotation.set(0, 0, 0); m.scale.setScalar(0.3); m.userData.body.rotation.set(-Math.PI / 2, 0, Math.PI / 2); m.userData.aura.visible = false; Q14.carry = true; saveQ14(); }
}

// ---------- the lake ----------
let lakeSeq = false;
function updateDemonQuest(dt, t) {
  updateFight(dt, t);
  if (BODY_IT) { const on = Q14.stage === 'body' && !Q14.carry && DEM.m && DEM.dead && DEM.m.parent === world; BODY_IT.r = on ? 6 : 0; if (on) BODY_IT.pos.copy(DEM.m.position); }
  if (Q14.stage === 'body' && Q14.carry && !lakeSeq && LAKE.g) { const p = player.inCar ? ride.pos : player.pos; if (p.clone().normalize().angleTo(LAKE.d) * R < LAKE.R + 4) lakeSequence(); }
}
function bigBanner(text, sub) {
  let el = $('bigBanner'); if (!el) { el = document.createElement('div'); el.id = 'bigBanner'; el.style.cssText = 'position:fixed;left:0;right:0;top:32%;z-index:5;text-align:center;pointer-events:none;transition:opacity .8s;opacity:0;padding:0 16px'; document.body.appendChild(el); }
  el.innerHTML = `<div style="font-family:var(--display);font-size:clamp(34px,7vw,72px);color:#fff;text-shadow:0 0 30px #b04aff,0 4px 0 #3a0a5a">${text}</div><div style="font-size:18px;color:#e8d8ff;margin-top:8px;text-shadow:0 2px 6px #000">${sub || ''}</div>`;
  el.style.opacity = 1; setTimeout(() => { el.style.opacity = 0; }, 4200);
}
function lakeSequence() {
  lakeSeq = true; const m = DEM.m, c = LAKE.g.position.clone(), up = c.clone().normalize();
  player.mesh.updateMatrixWorld(true); const start = m.getWorldPosition(new V3()); world.add(m); m.position.copy(start); m.scale.setScalar(1.5); m.rotation.set(0, 0, 0); orient(m, up, tangentToward(up, UP)); m.userData.body.rotation.set(-Math.PI / 2, 0, 0); Q14.carry = false;
  let t = 0, boom = false;
  [262, 233, 196, 175].forEach((f, i) => tone(f, 0.8, { type: 'sine', vol: 0.06, when: i * 0.3 }));
  fx.push(dt => {
    t += dt;
    if (t < 1.6) { const k = t / 1.6; m.position.lerpVectors(start, c.clone().addScaledVector(up, 3 - k * 2), k); }
    else if (t < 3.2) { const k = (t - 1.6) / 1.6; m.position.copy(c).addScaledVector(up, 1 - k * 4); if (Math.random() < 0.3) poof(c.clone().addScaledVector(up, 0.5).add(randDir().multiplyScalar(2)), 0xb04aff); }
    else if (!boom) { boom = true; world.remove(m); DEM.m = null; bigBanner('PAGALIAU DEMONAS MIRĖ!', 'Pasaulis išgelbėtas'); spiritExplosion(c); }
    return t < 3.3;
  });
}
function spiritExplosion(c) {
  const up = c.clone().normalize(), ball = new THREE.Group(); ball.position.copy(c); world.add(ball);
  const s1 = mesh(G.sph, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })), s2 = mesh(G.sph, new THREE.MeshBasicMaterial({ color: 0xb04aff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, fog: false }));
  ball.add(s1, s2); const light = new THREE.PointLight(0xe0c0ff, 6, 300); ball.add(light);
  shake = Math.max(shake, 1.6); redFlash('rgba(255,255,255,.95)', 1600);
  [55, 65, 82, 110].forEach((f, i) => tone(f, 2.5, { type: 'sawtooth', vol: 0.09, lp: 500, when: i * 0.05 })); noiseHit(2.5, { f: 300, fto: 60, vol: 0.3 });
  setTimeout(() => [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.9, { type: 'triangle', vol: 0.06, when: i * 0.14 })), 1500);
  let t = 0;
  fx.push(dt => {
    t += dt; const k = Math.min(1, t / 3);
    s1.scale.setScalar(2 + k * 90); s2.scale.setScalar(4 + k * 160); s1.material.opacity = 0.9 * (1 - k); s2.material.opacity = 0.6 * (1 - k); light.intensity = 6 * (1 - k);
    if (k >= 1) { world.remove(ball); return false; }
    return true;
  });
  Q14.stage = 'staff'; saveQ14(); lakeSeq = false; refreshDemonQuest();
  for (const g of (typeof giants !== 'undefined' ? giants : [])) if (g && g.mesh) g.mesh.visible = false;
  setTimeout(() => toast('Chaosas baigėsi!', 'Daugiau nebekris meteoritai, nebeateis milžinai. Virš ežero kyla demono lazda – paimk ją (E)', '#e8d8ff'), 4500);
}
function takeStaff() {
  if (Q14.stage !== 'staff') return;
  Q14.stage = 'museum'; saveQ14(); refreshDemonQuest(); sfx.magic();
  toast('Paėmei demono lazdą!', 'Nunešk ją į muziejų', '#b04aff');
}
function deliverStaff() {
  attachStaff(false); Q14.stage = 'done'; saveQ14(); addMoney(3000); refreshMuseumExtras(); refreshDemonQuest(); refreshSpaceRamp(); refreshGodPhone();
  [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.7, { type: 'triangle', vol: 0.07, when: i * 0.12 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xb04aff);
  toast('PASKUTINIS ĮSAKYMAS ĮVYKDYTAS!', 'Demono lazda – muziejuje. Apdovanojimas: 3000 €. Tu išgelbėjai pasaulį!', '#ffe98a');
}

// ---------- HUD ----------
function updateQ14Hud(el) {
  if (!q14Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  const p = player.inCar ? ride.pos : player.pos;
  if (Q14.stage === 'shop') { const miss = [!Q14.sticker && 'lipdukas', Q14.candles < 10 && `žvakutės ${Q14.candles}/10`, !Q14.gun && 'šautuvas'].filter(Boolean).join(', '); step = `Ritualų parduotuvėje nusipirk: ${miss}`; target = ritShop && ritShop.inspect.pos; }
  else if (Q14.stage === 'ritual') { step = mode !== 'sanctum' ? 'Eik pas Kūrėją – ritualas bus jo salėje' : !Q14.stuck ? 'Užklijuok lipduką ritualo rato viduryje (E)' : !Q14.set ? 'Sustatyk 10 žvakučių ritualo rate (E)' : 'E – pradėti ritualą. Demonas ateis!'; target = mode === 'planet' ? gate.center : null; }
  else if (Q14.stage === 'fight') step = `<b>Nugalėk demoną!</b> Taikyk ir šauk pele · demonas ${Math.max(0, DEM.hp)} · tu ${Math.max(0, DEM.php)}`;
  else if (Q14.stage === 'body' && lakeSeq) step = 'Demonas grimzta į ežerą…';
  else if (Q14.stage === 'body') { if (Q14.carry) { step = 'Nunešk demono kūną į didįjį ežerą Pikselių Pasaulyje'; target = LAKE.g && LAKE.g.position; } else step = 'Kūrėjo Salėje užsidėk demono kūną ant pečių (E)'; }
  else if (Q14.stage === 'staff') { step = 'Paimk demono lazdą virš ežero (E)'; target = LAKE.g && LAKE.g.position; }
  else if (Q14.stage === 'museum') { step = 'Nunešk demono lazdą į muziejų'; target = museum && museum.g.position; }
  if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(p))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #12: Demono ritualas</div><div class="qs">${step}${dist}</div></div>`;
}
