// ================= Secret mission (not a command – you find it yourself): "The Little Pistol" =================
// once the alien saucer hangs in the museum AND the Cloud Prince is home, a tiny pistol floats down beside you in the
// museum. Shoot the saucer: its cables snap one by one until it dangles from a single one – and out fall an alien
// costume and a green alien dog with an antenna.
const S9 = { stage: 'none', hits: 0, suit: false, dog: false };   // none | pistol | loot | done
try { const s = JSON.parse(localStorage.getItem('modly-secret9') || 'null'); if (s) Object.assign(S9, s); if (S9.stage === 'pistol') S9.stage = 'none'; } catch (_) { }
function saveS9() { try { localStorage.setItem('modly-secret9', JSON.stringify(S9)); } catch (_) { } }

// ---------- rewards: alien costume + alien dog ----------
SKINS.push({ id: 'alien', name: 'Ateivis', desc: 'Sidabrinis skafandras, didžiulės juodos akys ir dvi antenos. Iškrito iš ateivių lėkštės.', price: -1, body: '#7dff6b', hat: '#c8ccd6', secret: true });
HATS.add('alien');
{ const _bs = buildSkin; buildSkin = (id, g) => {
  if (id !== 'alien') return _bs(id, g);
  const silver = mat(0xc8ccd6, { metalness: 0.75, roughness: 0.25 });
  g.add(S(G.cyl, silver, 0.225, 0.62, 0.225, 0, 1.24, 0)); g.add(mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 20), silver, 0, 1.56, 0).rotateX(Math.PI / 2));
  for (const x of [-0.13, 0.13]) { const e = S(G.sph, bmat(0x0a0a12), 0.11, 0.15, 0.06, x, 1.86, 0.27); e.rotation.z = x > 0 ? -0.5 : 0.5; g.add(e); g.add(S(G.sph, bmat(0xffffff), 0.025, 0.025, 0.02, x * 1.15, 1.9, 0.32)); }
  for (const x of [-0.12, 0.12]) { const a = S(G.cyl, silver, 0.015, 0.35, 0.015, x, 2.22, 0); a.rotation.z = -x * 2; g.add(a); g.add(S(G.sph, mat(0xff5fae, { emissive: 0xff2a8a, emissiveIntensity: 0.8 }), 0.06, 0.06, 0.06, x * 1.9, 2.38, 0)); }
  g.add(S(G.box, mat(0x7dff6b, { emissive: 0x2a8a2a }), 0.12, 0.12, 0.03, 0, 1.36, 0.23));
}; }
ANIMALS.push({ id: 'aliendog', secret: true, kind: 'Ateivių šuo', desc: 'Žalias šuo su antena. Kartais pagauna radijo bangas iš kosmoso.', speed: 6.5, rad: 0.45, say: ['Bip-au!', 'Vuf-bzz!', 'Au-bip-bip!'], names: ['Antenėlis'],
  make() {
    const g = ANIMALS.find(a => a.id === 'dog').make(), c = mat(0x9b5a2b), d = mat(0x6b3a1a), gc = mat(0x5fe37a, { roughness: 0.4 }), gd = mat(0x2fae4a, { roughness: 0.4 });
    g.traverse(o => { if (o.isMesh) { if (o.material === c) o.material = gc; else if (o.material === d) o.material = gd; } });
    const h = g.userData.head; h.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.7 }), 0.02, 0.35, 0.02, 0, 0.32, 0)); h.add(S(G.sph, mat(0xff5fae, { emissive: 0xff2a8a, emissiveIntensity: 0.8 }), 0.07, 0.07, 0.07, 0, 0.52, 0));
    return g;
  } });
SAYS.aliendog = () => { tone(900, 0.08, { to: 1400, type: 'square', vol: 0.04, lp: 2500 }); SAYS.dog(); };

// ---------- the pistol ----------
function makePistol() {
  const g = new THREE.Group(), body = mat(0xc8ccd6, { metalness: 0.75, roughness: 0.25 }), glow = mat(0x7dff6b, { emissive: 0x3aff3a, emissiveIntensity: 0.9 });
  g.add(S(G.box, body, 0.08, 0.1, 0.3, 0, 0, 0.05)); g.add(S(G.box, mat(0x30343e), 0.07, 0.18, 0.08, 0, -0.12, -0.05));
  g.add(S(G.cyl, body, 0.04, 0.16, 0.04, 0, 0.01, 0.26).rotateX(Math.PI / 2)); g.add(S(G.sph, glow, 0.045, 0.045, 0.045, 0, 0.01, 0.35));
  for (let i = 0; i < 3; i++) g.add(S(G.cyl, glow, 0.055, 0.015, 0.055, 0, 0.01, 0.1 + i * 0.06).rotateX(Math.PI / 2));
  return g;
}
let s9Pistol = null, s9Held = null, s9Loot = [];
function s9Ready() { return Q7.stage === 'done' && Q8.stage === 'done' && S9.stage === 'none' && museumUFO && !s9Held; }
function spawnFallingPistol() {
  S9.stage = 'pistol';
  const g = new THREE.Group(), p = makePistol(); p.scale.setScalar(2); g.add(p);
  const chute = new THREE.Group(); chute.position.y = 1.4; g.add(chute);
  chute.add(S(G.dome, mat(0xff5fae, { side: THREE.DoubleSide }), 0.7, 0.45, 0.7, 0, 0, 0));
  for (const [x, z] of [[-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.6]]) { const l = mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.5, 4), mat(0xffffff)); l.position.set(x / 2, -0.7, z / 2); l.lookAt(0, -1.4, 0); l.rotateX(Math.PI / 2); chute.add(l); }
  const at = player.pos.clone().addScaledVector(player.fwd, 1.6).add(new V3(player.fwd.z, 0, -player.fwd.x).multiplyScalar(0.8)); at.x = clamp(at.x, -MU.W / 2 + 1, MU.W / 2 - 1); at.z = clamp(at.z, -MU.D / 2 + 1, MU.D / 2 - 1);
  g.position.set(at.x, MU.H - 0.4, at.z); museumScene.add(g); linearize(g);
  s9Pistol = { g, chute, landed: false };
  tone(1320, 0.3, { to: 880, type: 'sine', vol: 0.05 }); tone(1760, 0.3, { to: 1100, type: 'sine', vol: 0.04, when: 0.2 });
  toast('Kas čia?! Iš lubų leidžiasi kažkas mažo…', 'Mažas pistoletas su parašiutu!', '#7dff6b');
}
function s9Near(v, r) { return Math.hypot(player.pos.x - v.x, player.pos.z - v.z) < r; }
function s9Prompt() {
  if (s9Pistol && s9Pistol.landed && s9Near(s9Pistol.g.position, 2)) return '<kbd>E</kbd> paimti mažą pistoletą';
  for (const l of s9Loot) if (l.landed && !l.taken && s9Near(l.g.position, 2.2)) return l.kind === 'suit' ? '<kbd>E</kbd> paimti ateivių rūbus' : '<kbd>E</kbd> paglostyti žalią šunį su antena';
  if (s9Held && museumUFO && S9.hits < 3) return '<kbd>LMB</kbd> šauti į ateivių lėkštę po lubomis';
  return null;
}
function s9MuseumAction() {
  if (s9Pistol && s9Pistol.landed && s9Near(s9Pistol.g.position, 2)) {
    museumScene.remove(s9Pistol.g); s9Pistol = null; attachS9Pistol(true);
    sfx.chime(); toast('Mažas ateivių pistoletas!', 'Pažiūrėk aukštyn… gal juo galima pašaudyti į lėkštę? (pelės mygtukas)', '#7dff6b');
    return true;
  }
  for (const l of s9Loot) if (l.landed && !l.taken && s9Near(l.g.position, 2.2)) {
    l.taken = true; museumScene.remove(l.g);
    if (l.kind === 'suit') { S9.suit = true; unlockSkin('alien'); equipSkin('alien', true); toast('Gavai ateivio kostiumą!', 'Jau apsirengei. Jį rasi ir kostiumų kioske', '#7dff6b'); }
    else { S9.dog = true; const rec = { uid: petUid++, t: 'aliendog', n: 'Antenėlis', active: false, pt: null }; if (!petBook.some(r => r.t === 'aliendog')) petBook.push(rec); savePets(); toast('Antenėlis – tavo naujas šuo!', 'Žalias ateivių šuo su antena laukia kolekcijoje (I)', '#7dff6b'); SAYS.aliendog(); }
    if (S9.suit && S9.dog) { S9.stage = 'done'; attachS9Pistol(false); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 })); setTimeout(() => toast('Slapta misija įvykdyta!', 'Mažas pistoletas grįžo atgal į lėkštę…', '#ffe98a'), 2200); }
    saveS9(); return true;
  }
  return false;
}
function attachS9Pistol(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !s9Held) { s9Held = makePistol(); s9Held.position.set(0, -0.05, 0.08); hand.add(s9Held); linearize(s9Held); }
  if (!on && s9Held) { hand.remove(s9Held); s9Held = null; }
}
function s9Shoot() {
  if (!s9Held || !museumUFO || S9.hits >= 3) return false;
  const from = player.pos.clone().add(new V3(0, 1.4, 0)).addScaledVector(player.fwd, 0.5), to = museumUFO.position.clone();
  const flat = to.clone().sub(player.pos).setY(0), ang = flat.length() > 0.1 ? Math.acos(clamp(flat.normalize().dot(player.fwd), -1, 1)) : 0;
  const hit = ang < 0.45 && player.pos.distanceTo(to) < 24;
  const end = hit ? to : from.clone().addScaledVector(player.fwd, 12).add(new V3(0, 1.5, 0));
  const tr = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, end]), new THREE.LineBasicMaterial({ color: 0x7dff6b, transparent: true })); museumScene.add(tr);
  let t = 0; fx.push(dt => { t += dt; tr.material.opacity = 1 - t / 0.3; if (t > 0.3) { museumScene.remove(tr); return false; } return true; });
  tone(1600, 0.15, { to: 400, type: 'square', vol: 0.05, lp: 3000 });
  if (!hit) return true;
  const cab = museumUFO.userData.cables; if (cab && cab[3 - S9.hits]) cab[3 - S9.hits].visible = false;
  S9.hits++; saveS9(); noiseHit(0.2, { ft: 'bandpass', f: 2500, vol: 0.12 });
  if (S9.hits < 3) { toast(`Spragt! Nutrūko lynas (${S9.hits} / 3)`, 'Lėkštė sūpuojasi…', '#7dff6b'); return true; }
  // the saucer swings down on its last cable and its hatch pops open
  S9.stage = 'loot'; saveS9(); noiseHit(0.5, { f: 600, vol: 0.15 });
  toast('Lėkštė kabo ant vieno lyno!', 'Iš jos kažkas iškrito…', '#7dff6b');
  dropS9Loot(false);
  return true;
}
function hangOnOneCable() {
  const u = museumUFO; if (!u) return; u.userData.hanging = true;
  if (u.userData.cables) u.userData.cables.forEach((c, i) => { c.visible = i === 0; if (i === 0) { c.scale.y = 1.9; c.position.y = MU.H - 1.25; } });
}
function dropS9Loot(quiet) {
  hangOnOneCable();
  const make = kind => {
    let m;
    if (kind === 'suit') { m = new THREE.Group(); m.add(S(G.box, mat(0xc8ccd6, { metalness: 0.7, roughness: 0.3 }), 0.8, 0.18, 0.6, 0, 0.09, 0)); m.add(S(G.sph, bmat(0x0a0a12), 0.12, 0.05, 0.16, -0.15, 0.2, 0)); m.add(S(G.sph, bmat(0x0a0a12), 0.12, 0.05, 0.16, 0.15, 0.2, 0)); m.add(S(G.cyl, mat(0xc8ccd6), 0.015, 0.3, 0.015, 0.25, 0.32, -0.2)); m.add(S(G.sph, mat(0xff5fae, { emissive: 0xff2a8a }), 0.05, 0.05, 0.05, 0.25, 0.48, -0.2)); }
    else { m = ANIMALS.find(a => a.id === 'aliendog').make(); m.scale.setScalar(1.2); }
    const x = kind === 'suit' ? -1.2 : 1.4, z = -8 + (kind === 'suit' ? 1 : 1.6);
    m.position.set(x, quiet ? 0 : MU.H - 1.5, z); museumScene.add(m); linearize(m);
    const l = { g: m, kind, landed: !!quiet, taken: kind === 'suit' ? S9.suit : S9.dog, vy: 0 };
    if (l.taken) museumScene.remove(m);
    s9Loot.push(l);
  };
  make('suit'); make('dog');
}
function refreshS9() {   // called when entering the museum
  if (!museumUFO) return;
  if (S9.stage === 'loot' || S9.stage === 'done') { if (!museumUFO.userData.hanging) { if (S9.stage === 'loot' && !s9Loot.length) dropS9Loot(true); else hangOnOneCable(); } }
  else if (museumUFO.userData.cables) museumUFO.userData.cables.forEach((c, i) => c.visible = i < 4 - S9.hits);
}
function updateS9(dt, t) {
  if (mode !== 'museum') return;
  if (s9Ready() && !s9Pistol) spawnFallingPistol();
  if (s9Pistol && !s9Pistol.landed) { s9Pistol.g.position.y -= dt * 2.4; s9Pistol.g.rotation.y += dt; s9Pistol.g.position.x += Math.sin(t * 2) * dt * 0.3; if (s9Pistol.g.position.y <= 0.15) { s9Pistol.g.position.y = 0.15; s9Pistol.landed = true; s9Pistol.chute.visible = false; tone(400, 0.1, { type: 'triangle', vol: 0.05 }); } }
  if (s9Pistol && s9Pistol.landed) s9Pistol.g.rotation.y += dt * 1.5;
  for (const l of s9Loot) {
    if (l.taken) continue;
    if (!l.landed) { l.vy -= GRAV * 0.6 * dt; l.g.position.y += l.vy * dt; if (l.g.position.y <= 0) { l.g.position.y = 0; if (l.vy < -3) { l.vy *= -0.35; noiseHit(0.1, { f: 500, vol: 0.06 }); } else { l.landed = true; if (l.kind === 'dog') SAYS.aliendog(); } } }
    else if (l.kind === 'dog') { const ud = l.g.userData; if (ud.tail) ud.tail.rotation.z = Math.sin(t * 16) * 0.7; l.g.rotation.y = Math.atan2(player.pos.x - l.g.position.x, player.pos.z - l.g.position.z); l.g.position.y = Math.abs(Math.sin(t * 5)) * 0.12; }
  }
  if (museumUFO && museumUFO.userData.hanging) { museumUFO.rotation.z = 0.95 + Math.sin(t * 1.3) * 0.12; museumUFO.position.x = -0.9 + Math.sin(t * 1.3) * 0.15; museumUFO.position.y = MU.H - 2.4; }
  const pr = card ? null : s9Prompt(); if (pr) setPrompt(pr);
}

// out in the world too: once both missions are done, the little pistol parachutes down right next to you
let s9World = null, s9WorldT = 2;
function dropPistolNearPlayer() {
  if (s9World || s9Held || mode !== 'planet') return false;
  const side = new V3().crossVectors(player.up, player.fwd).normalize();
  const d = moveAlong(moveAlong(player.up.clone(), player.fwd, 2.4), side, 0.8);
  const g = new THREE.Group(), p = makePistol(); p.scale.setScalar(2); p.position.y = 0.15; g.add(p);
  const chute = new THREE.Group(); chute.position.y = 1.5; g.add(chute);
  chute.add(S(G.dome, mat(0xff5fae, { side: THREE.DoubleSide }), 0.7, 0.45, 0.7, 0, 0, 0));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x7dff6b, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); glow.scale.setScalar(1.6); glow.position.y = 0.3; g.add(glow);
  world.add(g); linearize(g);
  const ground = R + groundH(d);
  s9World = { g, d, chute, h: 8, ground, landed: false, insp: null };
  tone(1320, 0.3, { to: 880, type: 'sine', vol: 0.05 }); tone(1760, 0.3, { to: 1100, type: 'sine', vol: 0.04, when: 0.2 });
  toast('Kas čia?! Iš dangaus leidžiasi kažkas mažo…', 'Pažiūrėk šalia savęs – mažas pistoletas su parašiutu!', '#7dff6b');
  return true;
}
function takeWorldPistol() {
  if (!s9World) return;
  world.remove(s9World.g); s9World.insp.r = 0; s9World = null; attachS9Pistol(true); S9.stage = 'none';
  sfx.chime(); toast('Mažas ateivių pistoletas!', 'Gal juo galima pašaudyti į ateivių lėkštę… muziejuje?', '#7dff6b');
}
function updateS9World(dt, t) {
  if (Q7.stage === 'done' && Q8.stage === 'done' && S9.stage === 'none' && !s9Held && !s9World) { s9WorldT -= dt; if (s9WorldT < 0) { s9WorldT = 2; dropPistolNearPlayer(); } }
  const w = s9World; if (!w) return;
  if (!w.landed) {
    w.h = Math.max(0, w.h - dt * 3); w.chute.rotation.y += dt;
    if (w.h <= 0) { w.landed = true; w.chute.visible = false; tone(400, 0.1, { type: 'triangle', vol: 0.05 }); w.insp = addInspect(w.d.clone().multiplyScalar(w.ground + 0.8), 'Mažas pistoletas', '', 2.6, { verb: 'paimti mažą pistoletą', onUse: takeWorldPistol }); }
  }
  w.g.position.copy(w.d).multiplyScalar(w.ground + w.h); orient(w.g, w.d, tangentToward(w.d, UP)); w.g.rotateY(t * 1.5);
}
