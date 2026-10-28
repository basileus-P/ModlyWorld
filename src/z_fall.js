// ================= falling from too high: you fall flat and can only get up with Space =================
const FALL_KILL = -21;   // landing faster than this (≈ a fall of 10 m) knocks you out
let dizzy = null;
function fallCheck(vr0, inWater) {
  if (vr0 < FALL_KILL && !player.down && !player.inCar && !inWater) knockDown();
}
function knockDown() {
  player.down = true; player.vel.set(0, 0, 0); dropAll(); if (typeof stopClimb === 'function') stopClimb(); if (typeof setScope === 'function' && scoped) setScope(false);
  shake = Math.max(shake, 0.6); noiseHit(0.4, { f: 220, vol: 0.2 }); tone(300, 0.6, { to: 80, type: 'triangle', vol: 0.07 });
  setTimeout(() => { tone(880, 0.12, { type: 'sine', vol: 0.04 }); tone(660, 0.12, { type: 'sine', vol: 0.04, when: 0.15 }); tone(990, 0.12, { type: 'sine', vol: 0.04, when: 0.3 }); }, 300);
  toast('Oi! Nukritai iš per aukštai…', 'Guli ant žemės ir matai žvaigždutes. Spausk Space, kad atsistotum', '#ff6b6b');
  if (!dizzy) {
    dizzy = new THREE.Group();
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.28); s.position.set(Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45); dizzy.add(s); }
  }
  player.mesh.add(dizzy); dizzy.position.set(0, 0.85, -1.85); dizzy.visible = true;
}
function standUp() {
  if (!player.down) return;
  player.down = false;
  const p = player.mesh.userData.parts; p.body.rotation.set(0, 0, 0); p.body.position.y = 0;
  if (dizzy) dizzy.visible = false;
  sfx.jump(); toast('Atsikėlei!', 'Kitą kartą leiskis atsargiau', '#7dff6b');
}
function downPose(dt, t) {
  const p = player.mesh.userData.parts;
  p.body.rotation.set(-Math.PI / 2, 0, Math.sin(t * 2) * 0.05); p.body.position.y = 0.32;
  p.armL.rotation.set(0.2, 0, 1.3); p.armR.rotation.set(0.2, 0, -1.3); p.legL.rotation.set(0, 0, 0.35); p.legR.rotation.set(0, 0, -0.35);
  if (dizzy) dizzy.rotation.y += dt * 3;
}

// ================= test world: own every car, pet, costume and back item =================
function grantEverything(quiet) {
  for (const c of CARS) if (!garage.includes(c.id)) garage.push(c.id);
  saveGarage();
  for (const a of ANIMALS) if (a.id !== 'aliendog' && a.id !== 'goldcat' && !petBook.some(r => r.t === a.id)) petBook.push({ uid: petUid++, t: a.id, n: pick(a.names), active: false, pt: null });
  savePets();
  for (const s of SKINS) if (s.id !== 'alien' && s.id !== 'gold' && s.id !== 'bird' && s.id !== 'spider' && s.id !== 'caveman' && s.id !== 'goldcat' && !skinOwned.includes(s.id)) skinOwned.push(s.id);
  saveSkins();
  for (const b of BACKS) if (b.id !== 'dragonwings' && b.id !== 'jetpack' && !Q8.owned.includes(b.id)) Q8.owned.push(b.id);
  saveQ8();
  if (!quiet) { sfx.chime(); toast('Bandymų pasaulis: turi VISKĄ!', `${CARS.length} mašinų (F), ${ANIMALS.length} gyvūnų (I), ${SKINS.length} kostiumų ir sparnai su kuprine (kostiumų kioskas)`, '#ffd23a'); }
}

// test world: unlock the secret "little pistol" mission right away (alien saucer in the museum + Cloud Prince home)
function unlockSecretTest(quiet) {
  if (Q7.stage !== 'done') { Q7.stage = 'done'; saveQ7(); }
  if (Q8.stage !== 'done') { Q8.stage = 'done'; saveQ8(); }
  for (const b of BACKS) if (b.id !== 'dragonwings' && b.id !== 'jetpack' && !Q8.owned.includes(b.id)) Q8.owned.push(b.id); saveQ8();
  if (!garage.includes('tractor')) { garage.push('tractor'); saveGarage(); }
  if (S9.stage === 'done') { S9.stage = 'none'; S9.hits = 0; S9.suit = false; S9.dog = false; saveS9(); }
  if (!quiet) { sfx.chime(); toast('Slapta misija paruošta!', 'Nueik į muziejų Pradžios Mieste…', '#7dff6b'); }
}
