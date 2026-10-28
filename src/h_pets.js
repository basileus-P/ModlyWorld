// ================= animal kiosk: real animals that just look a bit silly =================
const pets = [];            // pets walking with you (max 5)
const petBook = [];         // every animal you own
const MAX_ACTIVE = 5;
let petBookOpen = false, petUid = 1;
let petShopOpen = false;
function pivotLeg(parent, x, y, z, len, r, m) { const p = new THREE.Group(); p.position.set(x, y, z); p.add(S(G.cyl, m, r, len, r, 0, -len / 2, 0)); parent.add(p); return p; }
const eye = (g, x, y, z, s = 0.06) => { g.add(S(G.sph, mat(0xffffff), s * 1.6, s * 1.6, s * 1.2, x, y, z)); g.add(S(G.sph, bmat(0x111111), s, s, s * 0.8, x, y, z + s * 0.9)); };
const ANIMALS = [
  { id: 'dog', kind: 'Taksas', desc: 'Šuo, kuris kažkodėl per ilgas.', speed: 6, rad: 0.45, say: ['Au!', 'Au au!', 'Vuf!'], names: ['Dešrelė', 'Bandelė', 'Kotletas'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), c = mat(0x9b5a2b), d = mat(0x6b3a1a); g.add(b);
      const body = S(G.cyl, c, 0.22, 1.7, 0.22, 0, 0.42, 0); body.rotation.x = Math.PI / 2; b.add(body);
      const head = new THREE.Group(); head.position.set(0, 0.62, 0.95); b.add(head);
      head.add(S(G.sph, c, 0.22, 0.2, 0.26)); head.add(S(G.sph, c, 0.12, 0.1, 0.18, 0, -0.05, 0.25)); head.add(S(G.sph, bmat(0x111111), 0.05, 0.05, 0.05, 0, -0.02, 0.42));
      eye(head, 0.09, 0.07, 0.17, 0.045); eye(head, -0.09, 0.07, 0.17, 0.045);
      for (const x of [-1, 1]) { const ear = S(G.sph, d, 0.07, 0.24, 0.13, x * 0.2, -0.08, 0); ear.rotation.z = x * 0.2; head.add(ear); }
      const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.85); tail.add(S(G.cyl, c, 0.04, 0.4, 0.04, 0, 0.2, 0)); tail.rotation.x = -0.6; b.add(tail);
      const legs = [[0.13, 0.55], [-0.13, 0.55], [0.13, -0.55], [-0.13, -0.55]].map(([x, z]) => pivotLeg(b, x, 0.28, z, 0.28, 0.06, d));
      g.userData = { body: b, head, tail, legs }; return g; } },
  { id: 'cat', kind: 'Katinas', desc: 'Labai apvalus katinas su labai mažomis kojytėmis.', speed: 5, rad: 0.5, say: ['Miau', 'Murrr', 'Miaaau?'], names: ['Pyragas', 'Kukulis', 'Murkis'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), c = mat(0xff9f40), w = mat(0xfff1e0); g.add(b);
      b.add(S(G.sph, c, 0.5, 0.45, 0.55, 0, 0.55, 0)); b.add(S(G.sph, w, 0.32, 0.3, 0.2, 0, 0.5, 0.42));
      const head = new THREE.Group(); head.position.set(0, 1.0, 0.3); b.add(head);
      head.add(S(G.sph, c, 0.3, 0.26, 0.26)); for (const x of [-1, 1]) head.add(S(G.cone, c, 0.09, 0.18, 0.06, x * 0.16, 0.25, 0));
      eye(head, 0.1, 0.04, 0.2, 0.06); eye(head, -0.1, 0.04, 0.2, 0.06); head.add(S(G.sph, mat(0xff7a9c), 0.04, 0.03, 0.03, 0, -0.05, 0.26));
      for (const x of [-1, 1]) for (const k of [0, 1]) { const wh = S(G.box, bmat(0x333333), 0.22, 0.01, 0.01, x * 0.25, -0.06 + k * 0.04, 0.22); wh.rotation.z = x * (k ? 0.15 : -0.15); head.add(wh); }
      const tail = new THREE.Group(); tail.position.set(0, 0.6, -0.5); tail.add(S(G.cyl, c, 0.06, 0.8, 0.06, 0, 0.4, 0)); tail.rotation.x = -0.4; b.add(tail);
      const legs = [[0.22, 0.25], [-0.22, 0.25], [0.22, -0.25], [-0.22, -0.25]].map(([x, z]) => pivotLeg(b, x, 0.14, z, 0.14, 0.07, c));
      g.userData = { body: b, head, tail, legs }; return g; } },
  { id: 'cow', kind: 'Karvė', desc: 'Tikra karvė, tik galva gerokai per didelė.', speed: 4, rad: 0.8, say: ['Mūūū', 'Mū?', 'Mūūūūū'], names: ['Pienė', 'Galvutė', 'Mūčia'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), w = mat(0xffffff), k = mat(0x1a1a1a); g.add(b);
      b.add(S(G.box, w, 0.9, 0.7, 1.4, 0, 0.85, 0));
      for (const [x, y, z] of [[0.46, 0.9, 0.2], [-0.46, 0.8, -0.3], [0.2, 1.21, -0.4], [-0.47, 1.0, 0.4]]) b.add(S(G.sph, k, 0.22, 0.18, 0.25, x, y, z));
      const head = new THREE.Group(); head.position.set(0, 1.25, 0.95); b.add(head);
      head.add(S(G.box, w, 0.95, 0.85, 0.75)); head.add(S(G.box, mat(0xffb3c6), 0.8, 0.38, 0.2, 0, -0.25, 0.42));
      head.add(S(G.sph, bmat(0x333333), 0.06, 0.06, 0.03, 0.18, -0.25, 0.53)); head.add(S(G.sph, bmat(0x333333), 0.06, 0.06, 0.03, -0.18, -0.25, 0.53));
      eye(head, 0.22, 0.15, 0.38, 0.09); eye(head, -0.22, 0.15, 0.38, 0.09);
      for (const x of [-1, 1]) { head.add(S(G.cone, mat(0xf2e3b3), 0.07, 0.3, 0.07, x * 0.42, 0.55, 0)); head.add(S(G.box, mat(0xffffff), 0.3, 0.12, 0.1, x * 0.6, 0.2, 0)); }
      const tail = new THREE.Group(); tail.position.set(0, 1.1, -0.7); tail.add(S(G.cyl, w, 0.03, 0.6, 0.03, 0, -0.3, 0)); tail.add(S(G.sph, k, 0.07, 0.1, 0.07, 0, -0.62, 0)); b.add(tail);
      const legs = [[0.3, 0.5], [-0.3, 0.5], [0.3, -0.5], [-0.3, -0.5]].map(([x, z]) => pivotLeg(b, x, 0.5, z, 0.5, 0.09, w));
      g.userData = { body: b, head, tail, legs }; return g; } },
  { id: 'sheep', kind: 'Avis', desc: 'Debesis su kojomis. Bet tikrai avis.', speed: 4.5, rad: 0.6, say: ['Bėėė', 'Bė?', 'Bėėėėė'], names: ['Debesėlis', 'Vatelė', 'Kamuoliukas'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), w = mat(0xfafafa), k = mat(0x2a2a2a); g.add(b);
      for (let i = 0; i < 9; i++) b.add(S(G.ico1, w, 0.35, 0.35, 0.35, Math.cos(i * 1.7) * 0.3, 0.85 + Math.sin(i * 2.3) * 0.2, Math.sin(i * 1.7) * 0.35));
      const head = new THREE.Group(); head.position.set(0, 0.9, 0.62); b.add(head);
      head.add(S(G.sph, k, 0.16, 0.2, 0.2)); eye(head, 0.07, 0.05, 0.15, 0.04); eye(head, -0.07, 0.05, 0.15, 0.04);
      for (const x of [-1, 1]) head.add(S(G.sph, k, 0.12, 0.05, 0.06, x * 0.2, 0.06, 0)); head.add(S(G.ico1, w, 0.13, 0.1, 0.13, 0, 0.2, 0));
      const legs = [[0.2, 0.25], [-0.2, 0.25], [0.2, -0.25], [-0.2, -0.25]].map(([x, z]) => pivotLeg(b, x, 0.55, z, 0.55, 0.04, k));
      g.userData = { body: b, head, legs }; return g; } },
  { id: 'giraffe', kind: 'Žirafa', desc: 'Kaklas toks ilgas, kad kartais pasiklysta debesyse.', speed: 5, rad: 0.7, say: ['Hmmm…', 'Mm?', '…'], names: ['Kaklas', 'Bokštas', 'Ilgšė'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), y = mat(0xf2c14e), s = mat(0x8a5a2b); g.add(b);
      b.add(S(G.sph, y, 0.45, 0.42, 0.7, 0, 1.5, 0));
      for (let i = 0; i < 6; i++) b.add(S(G.sph, s, 0.13, 0.1, 0.13, Math.cos(i * 2.1) * 0.38, 1.55 + Math.sin(i) * 0.15, Math.sin(i * 2.1) * 0.5));
      const neck = new THREE.Group(); neck.position.set(0, 1.7, 0.5); b.add(neck);
      neck.add(S(G.cyl, y, 0.12, 3.2, 0.12, 0, 1.6, 0)); for (let i = 0; i < 6; i++) neck.add(S(G.sph, s, 0.09, 0.12, 0.05, (i % 2 ? 0.1 : -0.1), 0.4 + i * 0.5, 0.1));
      neck.rotation.x = 0.25;
      const head = new THREE.Group(); head.position.set(0, 3.25, 0.1); neck.add(head);
      head.add(S(G.sph, y, 0.18, 0.18, 0.32, 0, 0, 0.1)); eye(head, 0.11, 0.06, 0.12, 0.04); eye(head, -0.11, 0.06, 0.12, 0.04);
      for (const x of [-1, 1]) { head.add(S(G.cyl, s, 0.025, 0.2, 0.025, x * 0.07, 0.25, -0.02)); head.add(S(G.sph, s, 0.05, 0.05, 0.05, x * 0.07, 0.36, -0.02)); }
      const tail = new THREE.Group(); tail.position.set(0, 1.6, -0.68); tail.add(S(G.cyl, y, 0.025, 0.6, 0.025, 0, -0.3, 0)); b.add(tail);
      const legs = [[0.22, 0.4], [-0.22, 0.4], [0.22, -0.4], [-0.22, -0.4]].map(([x, z]) => pivotLeg(b, x, 1.3, z, 1.3, 0.06, y));
      g.userData = { body: b, head: neck, tail, legs }; return g; } },
  { id: 'penguin', kind: 'Pingvinas', desc: 'Vaikšto lyg būtų apsirengęs per ankštą frakà.', speed: 3, rad: 0.4, say: ['Kvak!', 'Ark ark!', 'Krrr'], names: ['Frakas', 'Ledukas', 'Tipenis'], waddle: true,
    make() { const g = new THREE.Group(), b = new THREE.Group(), k = mat(0x1e2230), w = mat(0xffffff), o = mat(0xff9f1c); g.add(b);
      b.add(S(G.sph, k, 0.35, 0.55, 0.35, 0, 0.6, 0)); b.add(S(G.sph, w, 0.27, 0.45, 0.2, 0, 0.55, 0.18));
      const head = new THREE.Group(); head.position.set(0, 1.15, 0.02); b.add(head);
      head.add(S(G.sph, k, 0.24, 0.22, 0.24)); eye(head, 0.09, 0.03, 0.18, 0.05); eye(head, -0.09, 0.03, 0.18, 0.05);
      { const _o = S(G.cone, o, 0.07, 0.22, 0.05, 0, -0.04, 0.3); _o.rotation.x = Math.PI / 2; head.add(_o); }
      for (const x of [-1, 1]) { const f = S(G.sph, k, 0.06, 0.3, 0.15, x * 0.36, 0.65, 0); f.rotation.z = x * 0.3; b.add(f); }
      const legs = [0.12, -0.12].map(x => { const p = pivotLeg(b, x, 0.1, 0.05, 0.08, 0.04, o); p.add(S(G.sph, o, 0.1, 0.03, 0.14, 0, -0.08, 0.06)); return p; });
      g.userData = { body: b, head, legs }; return g; } },
  { id: 'frog', kind: 'Varlė', desc: 'Akys didesnės už visą likusią varlę.', speed: 5, rad: 0.45, say: ['Kva!', 'Kvarr', 'Kva kva'], names: ['Akutis', 'Kvakis', 'Šokinėlis'], hop: true,
    make() { const g = new THREE.Group(), b = new THREE.Group(), c = mat(0x4fc24a), d = mat(0x2f8f3a); g.add(b);
      b.add(S(G.sph, c, 0.42, 0.26, 0.45, 0, 0.3, 0)); b.add(S(G.sph, mat(0xd8f5b0), 0.32, 0.15, 0.3, 0, 0.22, 0.15));
      const head = new THREE.Group(); head.position.set(0, 0.45, 0.2); b.add(head);
      for (const x of [-1, 1]) { head.add(S(G.sph, c, 0.2, 0.2, 0.2, x * 0.2, 0.12, 0)); head.add(S(G.sph, mat(0xffffff), 0.16, 0.16, 0.12, x * 0.2, 0.14, 0.1)); head.add(S(G.sph, bmat(0x111111), 0.08, 0.1, 0.05, x * 0.2, 0.14, 0.21)); }
      head.add(S(G.box, bmat(0x1a3a1a), 0.4, 0.02, 0.02, 0, -0.06, 0.38));
      const legs = [[0.32, -0.2], [-0.32, -0.2]].map(([x, z]) => { const p = pivotLeg(b, x, 0.25, z, 0.22, 0.08, d); p.add(S(G.sph, d, 0.14, 0.04, 0.2, 0, -0.22, 0.1)); return p; });
      g.userData = { body: b, head, legs }; return g; } },
  { id: 'elephant', kind: 'Dramblys', desc: 'Mažytis dramblys su milžiniškomis ausimis.', speed: 3.5, rad: 0.6, say: ['Tru-tū!', 'Pfrrr', 'Tūūū!'], names: ['Ausylas', 'Mažylis', 'Trimitas'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), c = mat(0x9aa0ae); g.add(b);
      b.add(S(G.sph, c, 0.5, 0.45, 0.6, 0, 0.75, 0));
      const head = new THREE.Group(); head.position.set(0, 1.0, 0.55); b.add(head);
      head.add(S(G.sph, c, 0.33, 0.32, 0.3)); eye(head, 0.13, 0.08, 0.24, 0.045); eye(head, -0.13, 0.08, 0.24, 0.045);
      for (const x of [-1, 1]) { const ear = S(G.sph, mat(0xb8bdc8), 0.06, 0.5, 0.45, x * 0.4, 0.05, -0.1); ear.rotation.z = x * 0.2; head.add(ear); }
      const trunk = new THREE.Group(); trunk.position.set(0, -0.08, 0.28); head.add(trunk);
      for (let i = 0; i < 5; i++) trunk.add(S(G.cyl, c, 0.09 - i * 0.01, 0.15, 0.09 - i * 0.01, 0, -i * 0.13, i * 0.04));
      const tail = new THREE.Group(); tail.position.set(0, 0.8, -0.6); tail.add(S(G.cyl, c, 0.02, 0.35, 0.02, 0, -0.17, 0)); b.add(tail);
      const legs = [[0.25, 0.3], [-0.25, 0.3], [0.25, -0.3], [-0.25, -0.3]].map(([x, z]) => pivotLeg(b, x, 0.42, z, 0.42, 0.13, c));
      g.userData = { body: b, head, tail, legs, trunk }; return g; } },
  { id: 'chicken', kind: 'Višta', desc: 'Bėga labai greitai, bet niekada nežino kur.', speed: 8, rad: 0.35, say: ['Kud-kudak!', 'Ko ko ko', 'Kudakūū!'], names: ['Kudakė', 'Sparnelis', 'Turbo'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), w = mat(0xffffff), o = mat(0xffb020); g.add(b);
      b.add(S(G.sph, w, 0.3, 0.3, 0.38, 0, 0.55, -0.05)); b.add(S(G.sph, w, 0.25, 0.32, 0.2, 0, 0.62, -0.32));
      const head = new THREE.Group(); head.position.set(0, 0.9, 0.22); b.add(head);
      head.add(S(G.sph, w, 0.15, 0.17, 0.15)); eye(head, 0.07, 0.03, 0.11, 0.035); eye(head, -0.07, 0.03, 0.11, 0.035);
      { const _o = S(G.cone, o, 0.05, 0.12, 0.05, 0, -0.02, 0.18); _o.rotation.x = Math.PI / 2; head.add(_o); }
      for (let i = 0; i < 3; i++) head.add(S(G.sph, mat(0xff2a2a), 0.04, 0.06, 0.04, 0, 0.17, -0.04 + i * 0.05));
      head.add(S(G.sph, mat(0xff2a2a), 0.03, 0.06, 0.03, 0, -0.12, 0.12));
      const legs = [0.1, -0.1].map(x => pivotLeg(b, x, 0.32, 0, 0.32, 0.025, o));
      g.userData = { body: b, head, legs }; return g; } },
  { id: 'flamingo', kind: 'Flamingas', desc: 'Stovi ant vienos kojos ir labai tuo didžiuojasi.', speed: 5, rad: 0.4, say: ['Honk!', 'Hmonk', 'Honk honk!'], names: ['Vienkojis', 'Rožytė', 'Lankstukas'],
    make() { const g = new THREE.Group(), b = new THREE.Group(), p = mat(0xff7ab8), d = mat(0xff4f9a); g.add(b);
      b.add(S(G.sph, p, 0.28, 0.24, 0.42, 0, 1.25, 0)); b.add(S(G.sph, d, 0.22, 0.18, 0.2, 0, 1.3, -0.38));
      const neck = new THREE.Group(); neck.position.set(0, 1.35, 0.3); b.add(neck);
      const n1 = S(G.cyl, p, 0.05, 0.6, 0.05, 0, 0.3, 0); n1.rotation.x = 0.4; neck.add(n1);
      const n2 = S(G.cyl, p, 0.05, 0.5, 0.05, 0, 0.75, 0.0); n2.rotation.x = -0.5; neck.add(n2);
      const head = new THREE.Group(); head.position.set(0, 1.0, 0.15); neck.add(head);
      head.add(S(G.sph, p, 0.11, 0.1, 0.12)); eye(head, 0.06, 0.03, 0.08, 0.03); eye(head, -0.06, 0.03, 0.08, 0.03);
      const beak = S(G.cone, mat(0xffffff), 0.05, 0.2, 0.05, 0, -0.06, 0.16); beak.rotation.x = 2.1; head.add(beak); head.add(S(G.sph, bmat(0x111111), 0.035, 0.05, 0.035, 0, -0.12, 0.22));
      const legs = [0.08, -0.08].map(x => pivotLeg(b, x, 1.08, 0, 1.08, 0.025, p));
      g.userData = { body: b, head: neck, legs, oneLeg: true }; return g; } },
  { id: 'duck', kind: 'Antis', desc: 'Žalia galva, oranžinės kojos ir labai rimtas veidas.', speed: 3.5, rad: 0.35, say: ['Kvak!', 'Kvak kvak', 'Kvaaak'], names: ['Kvaksys', 'Pliuškis', 'Ančiukas'], waddle: true,
    make() { const g = new THREE.Group(), b = new THREE.Group(), br = mat(0x9b7a5a), gr = mat(0x1f8a4a), o = mat(0xff9f1c); g.add(b);
      b.add(S(G.sph, br, 0.3, 0.24, 0.42, 0, 0.38, 0)); b.add(S(G.sph, mat(0xd9d2c8), 0.24, 0.16, 0.3, 0, 0.32, 0.08)); { const _o = S(G.cone, br, 0.12, 0.2, 0.08, 0, 0.5, -0.45); _o.rotation.x = -1.2; b.add(_o); }
      const head = new THREE.Group(); head.position.set(0, 0.72, 0.3); b.add(head);
      head.add(S(G.sph, gr, 0.15, 0.15, 0.17)); head.add(S(G.cyl, mat(0xffffff), 0.13, 0.04, 0.13, 0, -0.15, -0.02));
      eye(head, 0.08, 0.04, 0.1, 0.03); eye(head, -0.08, 0.04, 0.1, 0.03);
      head.add(S(G.box, o, 0.14, 0.05, 0.2, 0, -0.03, 0.2));
      const legs = [0.1, -0.1].map(x => { const p = pivotLeg(b, x, 0.18, 0, 0.16, 0.025, o); p.add(S(G.box, o, 0.14, 0.02, 0.16, 0, -0.17, 0.06)); return p; });
      g.userData = { body: b, head, legs }; return g; } }
];
const SAYS = { // little synthesized voices
  dog() { noiseHit(0.08, { ft: 'bandpass', f: 900, vol: 0.12 }); tone(420, 0.12, { to: 260, type: 'sawtooth', vol: 0.07, lp: 1500 }); },
  cat() { tone(520, 0.45, { to: 760, type: 'sawtooth', vol: 0.05, lp: 1800, slide: 0.2 }); tone(760, 0.3, { to: 480, type: 'sawtooth', vol: 0.05, lp: 1800, when: 0.2 }); },
  cow() { tone(140, 1.0, { to: 110, type: 'sawtooth', vol: 0.09, lp: 600, attack: 0.15, vib: 4 }); },
  sheep() { tone(380, 0.7, { to: 360, type: 'sawtooth', vol: 0.06, lp: 1400, vib: 14 }); },
  giraffe() { tone(90, 0.8, { type: 'sine', vol: 0.06, attack: 0.2 }); },
  penguin() { tone(600, 0.15, { to: 900, type: 'square', vol: 0.04, lp: 2000 }); tone(500, 0.2, { to: 700, type: 'square', vol: 0.04, lp: 2000, when: 0.18 }); },
  frog() { for (let i = 0; i < 2; i++) { noiseHit(0.06, { ft: 'bandpass', f: 500, q: 4, vol: 0.12, when: i * 0.12 }); tone(180, 0.08, { to: 120, type: 'square', vol: 0.05, lp: 700, when: i * 0.12 }); } },
  elephant() { tone(500, 0.6, { to: 900, type: 'sawtooth', vol: 0.07, lp: 2500, vib: 7, attack: 0.05 }); },
  chicken() { for (let i = 0; i < 3; i++) tone(700 + i * 80, 0.09, { to: 500, type: 'square', vol: 0.04, lp: 2200, when: i * 0.11 }); },
  flamingo() { tone(330, 0.25, { to: 280, type: 'sawtooth', vol: 0.06, lp: 1200 }); },
  duck() { for (let i = 0; i < 2; i++) tone(350, 0.12, { to: 260, type: 'sawtooth', vol: 0.06, lp: 1100, q: 5, when: i * 0.16 }); }
};
const heartTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#ff4d6d'; x.beginPath(); x.moveTo(32, 56); x.bezierCurveTo(-8, 28, 14, 0, 32, 18); x.bezierCurveTo(50, 0, 72, 28, 32, 56); x.fill(); return new THREE.CanvasTexture(c); })();
function petBubble(pt, text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,255,255,.93)'; x.beginPath(); x.ellipse(128, 44, 118, 38, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(100, 76); x.lineTo(118, 96); x.lineTo(126, 76); x.fill();
  x.fillStyle = '#2a2a40'; x.font = "40px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 46);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.set(2.1, 0.8, 1); world.add(s);
  const h = pt.def.id === 'giraffe' ? 5 : pt.def.id === 'flamingo' ? 3 : 2.2; let t = 0;
  fx.push(dt => { t += dt; s.position.copy(pt.pos).addScaledVector(pt.up, h + t * 0.5); s.material.opacity = Math.max(0, 1 - Math.max(0, t - 0.9) / 0.5); if (t > 1.4) { world.remove(s); return false; } return true; });
}
function petSay(pt) { const v = distVol(pt.pos); if (v > 0.05 && SAYS[pt.def.id]) { const m = SND.sfx && SND.sfx.gain; SAYS[pt.def.id](); } petBubble(pt, pick(pt.def.say)); }

function spawnPet(id, name, d) {
  const def = ANIMALS.find(a => a.id === id); if (!def) return null;
  const mesh = def.make(); world.add(mesh);
  const pt = { def, name: name || pick(def.names), mesh, pos: d.clone().multiplyScalar(R + groundH(d) + 0.3), fwd: tangentToward(d, randDir()), vel: new V3(), vr: 0, up: d.clone(), grounded: false, state: 'idle', t: 1, sayT: rr(4, 9), knocked: 0, spin: new V3(), walk: rnd() * 6, rad: def.rad, ground: R, happy: 0 };
  pets.push(pt); return pt;
}
function knockPet(pt, dir, power) {
  if (pt.knocked <= 0) { petBubble(pt, 'Ai!'); if (SAYS[pt.def.id]) SAYS[pt.def.id](); }
  pt.vel.copy(dir).multiplyScalar(power); pt.vr = power * 0.6; pt.knocked = 2; pt.grounded = false; pt.spin.set(rr(-10, 10), 0, rr(-10, 10));
}
function knockPetsNear(p, radius, power) { for (const pt of pets) { const d = pt.pos.distanceTo(p); if (d < radius) knockPet(pt, tangentToward(pt.up, pt.pos.clone().sub(p)), power * (1 - d / radius) + 3); } }
function updatePets(dt, t) {
  for (const pt of pets) {
    const ud = pt.mesh.userData, def = pt.def;
    let toP = pt.pos.distanceTo(player.pos);
    if (toP > 60 && pt.knocked <= 0) { // came too far behind: catch up
      const back = moveAlong(player.up, tangentToward(player.up, player.pos.clone().add(player.fwd)), -3 - rnd() * 2);
      pt.pos.copy(back).multiplyScalar(R + groundH(back) + 0.5); pt.vel.set(0, 0, 0); toP = 3;
    }
    if (pt.knocked > 0) {
      pt.knocked -= dt; ud.body.rotation.x += pt.spin.x * dt; ud.body.rotation.z += pt.spin.z * dt;
      if (pt.grounded) { pt.vel.multiplyScalar(Math.max(0, 1 - 5 * dt)); pt.spin.multiplyScalar(Math.max(0, 1 - 6 * dt)); }
      if (pt.knocked <= 0) ud.body.rotation.set(0, 0, 0);
      stepPlanet(pt, dt, pt.rad);
    } else {
      pt.t -= dt;
      const toPlayer = tangentToward(pt.up, player.pos.clone().sub(pt.pos));
      if (toP > 7) pt.state = 'follow';
      else if (pt.t <= 0) { pt.t = rr(2, 5); const r = rnd(); pt.state = r < 0.35 ? 'wander' : r < 0.75 ? 'idle' : 'look'; if (pt.state === 'wander') pt.fwd.applyAxisAngle(pt.up, rr(-2, 2)); }
      if (pt.state === 'follow' && toP < 4) { pt.state = 'look'; pt.t = rr(1, 3); }
      let speed = 0;
      if (pt.state === 'follow') { speed = def.speed * (toP > 15 ? 1.5 : 1); pt.fwd.lerp(toPlayer, Math.min(1, dt * 4)).normalize(); }
      else if (pt.state === 'wander') speed = def.speed * 0.35;
      else if (pt.state === 'look') pt.fwd.lerp(toPlayer, Math.min(1, dt * 3)).normalize();
      if (pt.happy > 0) { pt.happy -= dt; speed = 0; }
      if (def.hop) { if (pt.grounded) { pt.vel.set(0, 0, 0); if (speed > 0 && (pt.hopT = (pt.hopT || 0) - dt) < 0) { pt.hopT = 0.5; pt.vr = 5.5; pt.vel.copy(pt.fwd).multiplyScalar(speed * 1.3); } } }
      else if (pt.grounded) pt.vel.copy(pt.fwd).multiplyScalar(speed);
      if (pt.happy > 0 && pt.grounded && pt.happy % 0.5 < dt * 1.5) pt.vr = 4;
      const moving = speed > 0.1;
      if (moving) pt.walk += dt * (speed * 2.2 + 2);
      stepPlanet(pt, dt, pt.rad);
      // animation
      const sw = moving ? Math.sin(pt.walk) : 0;
      ud.legs.forEach((l, i) => { l.rotation.x = (i % 2 === 0) === (i < 2) ? sw * 0.6 : -sw * 0.6; });
      if (ud.oneLeg && !moving) { ud.legs[1].rotation.x = -2.2; ud.legs[0].rotation.x = 0; }
      if (def.waddle) ud.body.rotation.z = moving ? Math.sin(pt.walk) * 0.25 : 0;
      ud.body.position.y = moving && !def.hop ? Math.abs(Math.sin(pt.walk)) * 0.06 : 0;
      if (ud.tail) ud.tail.rotation.z = Math.sin(t * (def.id === 'dog' ? 14 : 4)) * (def.id === 'dog' ? 0.7 : 0.3);
      if (ud.head) ud.head.rotation.y = pt.state === 'look' ? Math.sin(t * 0.8 + pt.walk) * 0.4 : 0;
      if (ud.trunk) ud.trunk.rotation.x = Math.sin(t * 1.5) * 0.3;
      if (def.id === 'chicken' && moving) ud.head.position.z = 0.22 + Math.sin(pt.walk * 2) * 0.06;
      if (def.id === 'giraffe') ud.head.rotation.x = 0.25 + Math.sin(t * 0.7) * 0.08;
      pt.sayT -= dt; if (pt.sayT < 0) { pt.sayT = rr(7, 16); if (toP < 30) petSay(pt); }
    }
    pt.mesh.position.copy(pt.pos); orient(pt.mesh, pt.up, pt.fwd);
  }
}
function nearestPet() { let best = null, bd = 2.6; for (const pt of pets) { const d = pt.pos.distanceTo(player.pos) - pt.rad; if (d < bd) { bd = d; best = pt; } } return best; }
function petPet(pt) {
  pt.happy = 1.5; pt.state = 'look'; petSay(pt);
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTex, transparent: true, depthWrite: false })); s.scale.setScalar(0.45); world.add(s);
    const off = randDir().multiplyScalar(0.6); let k = -i * 0.12;
    fx.push(dt => { k += dt; if (k < 0) { s.visible = false; return true; } s.visible = true; s.position.copy(pt.pos).addScaledVector(pt.up, 1.4 + k * 1.2).add(off); s.material.opacity = Math.max(0, 1 - k / 1.4); if (k > 1.4) { world.remove(s); return false; } return true; });
  }
  [784, 988, 1175].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.05, when: i * 0.08 }));
}
function despawnPet(pt, fx) { if (fx) { poof(pt.pos.clone(), 0xffffff); sfx.poof(); } world.remove(pt.mesh); const i = pets.indexOf(pt); if (i >= 0) pets.splice(i, 1); }
function activeCount() { return petBook.filter(r => r.active).length; }
function equipPet(rec, quiet) {
  if (rec.active) return true;
  if (activeCount() >= MAX_ACTIVE) { if (!quiet) toast('Daugiausia 5 gyvūnai kartu', 'Pirma palik kurį nors namie (I)', '#ffb347'); return false; }
  const base = mode === 'planet' ? player.up : cityDir(0, 9);
  const d = moveAlong(base, tangentToward(base, randDir()), 2 + rnd() * 2);
  rec.pt = spawnPet(rec.t, rec.n, d); rec.pt.rec = rec; rec.active = true;
  if (!quiet) { poof(rec.pt.pos.clone(), 0xffffff); setTimeout(() => rec.pt && petSay(rec.pt), 300); }
  return true;
}
function unequipPet(rec) { if (!rec.active) return; if (rec.pt) despawnPet(rec.pt, mode === 'planet'); rec.pt = null; rec.active = false; }
function releasePet(pt) {
  despawnPet(pt, true); const ri = petBook.findIndex(r => r.pt === pt); if (ri >= 0) petBook.splice(ri, 1); savePets();
  toast(`Paleidai ${pt.name}`, `${pt.def.kind} grįžo į laisvę. Kioske visada rasi naują draugą`, '#ffb347');
}
function savePets() { try { localStorage.setItem('modly-pets', JSON.stringify(petBook.map(r => ({ t: r.t, n: r.n, a: r.active ? 1 : 0 })))); } catch (_) { } }
function loadPets() {
  let list = []; try { list = JSON.parse(localStorage.getItem('modly-pets') || '[]'); } catch (_) { }
  list.forEach(p => { if (!ANIMALS.find(a => a.id === p.t)) return; const rec = { uid: petUid++, t: p.t, n: petNameL(p.n), active: false, pt: null }; petBook.push(rec); if (p.a !== 0) equipPet(rec, true); });
}

// ---------- the kiosk ----------
const petKiosk = {};
function buildPetKiosk() {
  const a = 0.82, d = cityDir(Math.cos(a) * 14, Math.sin(a) * 14);
  const g = new THREE.Group(); g.position.copy(surf(d)); orient(g, d, tangentToward(d, UP)); world.add(g);
  g.add(S(G.box, mat(0x2fae4a), 3.4, 2.6, 1.2, 0, 1.3, -0.8));
  for (const sx of [-1.6, 1.6]) g.add(S(G.box, mat(0x2fae4a), 0.2, 2.9, 2.3, sx, 1.45, -0.05));
  g.add(S(G.box, mat(0xfff1c8), 3.5, 1.0, 0.5, 0, 0.5, 1.15));
  g.add(S(G.box, mat(0x8a5a2b), 3.6, 0.1, 0.7, 0, 1.05, 1.15));
  for (let i = 0; i < 6; i++) { const st = S(G.box, mat(i % 2 ? 0xffffff : 0xffd23a), 0.62, 0.1, 1.8, -1.55 + i * 0.62, 3.0, 0.95); st.rotation.x = 0.35; g.add(st); }
  g.add(mesh(new THREE.PlaneGeometry(3.6, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('GYVŪNŲ KIOSKAS', '#2fae4a', '#ffffff', 640, 128), side: THREE.DoubleSide }), 0, 3.75, 0.6));
  // a sheep sits on the counter, a hen walks on the roof of the stall
  const sheep = ANIMALS[3].make(); sheep.scale.setScalar(0.45); sheep.position.set(-1.0, 1.1, 1.15); g.add(sheep);
  const hen = ANIMALS[8].make(); hen.scale.setScalar(0.7); hen.position.set(1.1, 1.1, 1.15); g.add(hen);
  const seller = makePerson(); seller.position.set(0, 0, 0.35); g.add(seller);
  seller.add(S(G.cyl, mat(0x7a5a2b), 0.35, 0.08, 0.35, 0, 2.02, 0)); seller.add(S(G.cyl, mat(0x7a5a2b), 0.22, 0.25, 0.22, 0, 2.15, 0));
  animators.push((dt, t) => { seller.userData.body.rotation.y = Math.sin(t * 0.9) * 0.5; hen.userData.head.position.z = 0.22 + Math.max(0, Math.sin(t * 6)) * 0.08; sheep.userData.body.rotation.y = Math.sin(t * 0.5) * 0.4; });
  addBox(g, 1.8, 1.5, 2.8, 0, 0.1);
  petKiosk.g = g;
  addInspect(surf(d, 1).addScaledVector(tangentToward(d, UP), 1.5), 'Gyvūnų kioskas', '', 5.5, { verb: 'atidaryti gyvūnų kioską', onUse: openPetShop });
}
function petSvg(id) {
  const A = {
    aliendog: '<ellipse cx="48" cy="40" rx="34" ry="9" fill="#5fe37a"/><circle cx="84" cy="34" r="9" fill="#5fe37a"/><ellipse cx="80" cy="40" rx="4" ry="8" fill="#2fae4a"/><circle cx="87" cy="32" r="2" fill="#111"/><rect x="22" y="46" width="4" height="8" fill="#2fae4a"/><rect x="34" y="46" width="4" height="8" fill="#2fae4a"/><rect x="62" y="46" width="4" height="8" fill="#2fae4a"/><rect x="72" y="46" width="4" height="8" fill="#2fae4a"/><path d="M14 38 L6 28" stroke="#5fe37a" stroke-width="3"/><line x1="84" y1="25" x2="84" y2="10" stroke="#c8ccd6" stroke-width="2"/><circle cx="84" cy="9" r="3.5" fill="#ff5fae"/>',
    dog: '<ellipse cx="48" cy="40" rx="34" ry="9" fill="#9b5a2b"/><circle cx="84" cy="34" r="9" fill="#9b5a2b"/><ellipse cx="80" cy="40" rx="4" ry="8" fill="#6b3a1a"/><circle cx="87" cy="32" r="2" fill="#111"/><rect x="22" y="46" width="4" height="8" fill="#6b3a1a"/><rect x="34" y="46" width="4" height="8" fill="#6b3a1a"/><rect x="62" y="46" width="4" height="8" fill="#6b3a1a"/><rect x="72" y="46" width="4" height="8" fill="#6b3a1a"/><path d="M14 38 L6 28" stroke="#9b5a2b" stroke-width="3"/>',
    goldcat: '<circle cx="50" cy="38" r="16" fill="#ffc81a"/><circle cx="50" cy="18" r="11" fill="#ffc81a"/><path d="M41 12 L43 3 L48 9 M52 9 L57 3 L59 12" fill="#ffc81a" stroke="#ffc81a" stroke-width="2"/><path d="M44 18 h4 M52 18 h4" stroke="#111" stroke-width="2"/><path d="M64 30 L72 14" stroke="#ffc81a" stroke-width="6" stroke-linecap="round"/><path d="M38 30 Q50 36 62 30" stroke="#e8262e" stroke-width="3" fill="none"/>',
    cat: '<circle cx="50" cy="36" r="18" fill="#ff9f40"/><circle cx="50" cy="16" r="10" fill="#ff9f40"/><path d="M42 10 L44 2 L48 8 M52 8 L56 2 L58 10" fill="#ff9f40" stroke="#ff9f40" stroke-width="2"/><circle cx="46" cy="15" r="2.5" fill="#111"/><circle cx="54" cy="15" r="2.5" fill="#111"/><path d="M68 40 Q80 30 74 18" stroke="#ff9f40" stroke-width="4" fill="none"/>',
    cow: '<rect x="18" y="26" width="44" height="22" rx="4" fill="#fff"/><circle cx="30" cy="32" r="5" fill="#1a1a1a"/><circle cx="50" cy="40" r="4" fill="#1a1a1a"/><rect x="56" y="12" width="32" height="28" rx="5" fill="#fff" stroke="#ddd"/><rect x="58" y="30" width="28" height="10" rx="4" fill="#ffb3c6"/><circle cx="66" cy="22" r="3" fill="#111"/><circle cx="78" cy="22" r="3" fill="#111"/><rect x="22" y="48" width="4" height="6" fill="#ddd"/><rect x="54" y="48" width="4" height="6" fill="#ddd"/>',
    sheep: '<circle cx="40" cy="32" r="12" fill="#fff"/><circle cx="54" cy="28" r="13" fill="#fff"/><circle cx="62" cy="36" r="10" fill="#fff"/><circle cx="46" cy="40" r="10" fill="#fff"/><ellipse cx="74" cy="32" rx="6" ry="7" fill="#2a2a2a"/><rect x="40" y="46" width="2" height="8" fill="#2a2a2a"/><rect x="58" y="46" width="2" height="8" fill="#2a2a2a"/>',
    giraffe: '<ellipse cx="40" cy="34" rx="14" ry="8" fill="#f2c14e"/><path d="M50 30 L66 4" stroke="#f2c14e" stroke-width="5"/><ellipse cx="68" cy="5" rx="6" ry="3" fill="#f2c14e"/><rect x="32" y="40" width="3" height="14" fill="#f2c14e"/><rect x="46" y="40" width="3" height="14" fill="#f2c14e"/><circle cx="38" cy="32" r="2.5" fill="#8a5a2b"/><circle cx="46" cy="36" r="2" fill="#8a5a2b"/>',
    penguin: '<ellipse cx="50" cy="34" rx="12" ry="18" fill="#1e2230"/><ellipse cx="50" cy="38" rx="8" ry="13" fill="#fff"/><circle cx="46" cy="22" r="2" fill="#fff"/><circle cx="54" cy="22" r="2" fill="#fff"/><path d="M47 27 L50 31 L53 27 Z" fill="#ff9f1c"/><ellipse cx="45" cy="53" rx="4" ry="2" fill="#ff9f1c"/><ellipse cx="55" cy="53" rx="4" ry="2" fill="#ff9f1c"/>',
    frog: '<ellipse cx="50" cy="42" rx="20" ry="10" fill="#4fc24a"/><circle cx="40" cy="28" r="9" fill="#fff" stroke="#4fc24a" stroke-width="3"/><circle cx="60" cy="28" r="9" fill="#fff" stroke="#4fc24a" stroke-width="3"/><circle cx="41" cy="29" r="4" fill="#111"/><circle cx="59" cy="29" r="4" fill="#111"/><path d="M38 44 Q50 50 62 44" stroke="#1a3a1a" stroke-width="2" fill="none"/>',
    elephant: '<ellipse cx="46" cy="36" rx="18" ry="13" fill="#9aa0ae"/><circle cx="66" cy="30" r="10" fill="#9aa0ae"/><ellipse cx="62" cy="28" rx="10" ry="14" fill="#b8bdc8"/><path d="M74 32 Q80 44 72 50" stroke="#9aa0ae" stroke-width="5" fill="none"/><circle cx="70" cy="27" r="2" fill="#111"/><rect x="34" y="44" width="6" height="10" fill="#9aa0ae"/><rect x="52" y="44" width="6" height="10" fill="#9aa0ae"/>',
    chicken: '<ellipse cx="46" cy="36" rx="14" ry="11" fill="#fff" stroke="#eee"/><circle cx="60" cy="22" r="7" fill="#fff" stroke="#eee"/><path d="M57 14 Q60 10 63 14" stroke="#ff2a2a" stroke-width="4" fill="none"/><path d="M66 22 L72 24 L66 26 Z" fill="#ffb020"/><circle cx="61" cy="21" r="1.6" fill="#111"/><rect x="42" y="46" width="2" height="8" fill="#ffb020"/><rect x="50" y="46" width="2" height="8" fill="#ffb020"/>',
    flamingo: '<ellipse cx="44" cy="22" rx="12" ry="8" fill="#ff7ab8"/><path d="M54 18 Q66 10 58 2 Q52 -2 62 -2" stroke="#ff7ab8" stroke-width="3" fill="none"/><rect x="43" y="28" width="2" height="26" fill="#ff7ab8"/><path d="M47 28 L52 38 L47 40" stroke="#ff7ab8" stroke-width="2" fill="none"/>',
    unicorn: '<ellipse cx="44" cy="34" rx="18" ry="10" fill="#fff" stroke="#eee"/><circle cx="66" cy="22" r="9" fill="#fff" stroke="#eee"/><path d="M68 14 L76 2 L72 15 Z" fill="#ffd23a"/><circle cx="68" cy="21" r="2.2" fill="#111"/><rect x="32" y="42" width="4" height="12" fill="#fff"/><rect x="52" y="42" width="4" height="12" fill="#fff"/><path d="M26 30 Q16 34 20 46" stroke="#ff7ac8" stroke-width="5" fill="none"/><path d="M58 16 Q56 26 50 28" stroke="#8fd8ff" stroke-width="5" fill="none"/>',
    duck: '<ellipse cx="46" cy="40" rx="16" ry="10" fill="#9b7a5a"/><circle cx="62" cy="26" r="8" fill="#1f8a4a"/><rect x="68" y="25" width="10" height="4" rx="2" fill="#ff9f1c"/><circle cx="64" cy="24" r="1.6" fill="#111"/><rect x="56" y="32" width="10" height="2" fill="#fff"/><rect x="42" y="50" width="2" height="4" fill="#ff9f1c"/><rect x="50" y="50" width="2" height="4" fill="#ff9f1c"/>'
  };
  return `<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="54" width="100" height="6" fill="#62c457"/>${A[id] || ''}</svg>`;
}
function buildPetUI() {
  $('petGrid').innerHTML = ANIMALS.map((a, i) => a.secret ? '' : `<button class="hcard" data-i="${i}"><div class="hpic">${petSvg(a.id)}</div><div class="hname">${a.kind}</div><div class="hdesc">${a.desc}</div><div class="hfoot"><span class="hsize">„${a.say[0]}“</span><span class="hprice">${PRICE.pet[a.id]} €</span></div>${i < 9 ? `<kbd class="hkey">${i + 1}</kbd>` : ''}</button>`).join('');
  $('petGrid').querySelectorAll('.hcard').forEach(b => b.addEventListener('click', () => adoptPet(+b.dataset.i)));
  $('petClose').addEventListener('click', () => closePetShop(true));
  $('bookClose').addEventListener('click', () => closePetBook(true));
}
function openPetShop() {
  markPrices('petGrid', 'pet', k => ANIMALS[k].id);
  if (petShopOpen) return;
  petShopOpen = true; cancelPlace(true); for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  $('petShop').hidden = false; $('paused').hidden = true;
  $('petCount').textContent = petBook.length ? `Tavo gyvūnų: ${petBook.length} · kartu su tavimi: ${activeCount()} / ${MAX_ACTIVE}` : 'Dar neturi nė vieno gyvūno';
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip(); const f = document.querySelector('#petGrid .hcard'); if (f) f.focus();
}
function closePetShop(relock) {
  if (!petShopOpen) return;
  petShopOpen = false; $('petShop').hidden = true;
  if (relock) requestLock();
}
function petKey(e) {
  if (e.code === 'Escape' || e.code === 'KeyE') { e.preventDefault(); closePetShop(e.code === 'KeyE'); return; }
  const m = /^Digit([1-9])$/.exec(e.code); if (m) adoptPet(+m[1] - 1);
}
function adoptPet(i) {
  const def = ANIMALS[i]; if (!def) return;
  if (!canPay(PRICE.pet[def.id])) { tooPoor(PRICE.pet[def.id]); return; }
  closePetShop(true);
  if (petBook.length >= 60) { toast('Kolekcija pilna', 'Daugiausia 60 gyvūnų. Paleisk kurį nors (I)', '#ffb347'); return; }
  pay(PRICE.pet[def.id]);
  const rec = { uid: petUid++, t: def.id, n: pick(def.names), active: false, pt: null }; petBook.push(rec);
  sfx.chime();
  if (activeCount() < MAX_ACTIVE) {
    equipPet(rec, true); const pt = rec.pt;
    const d = moveAlong(player.up, tangentToward(player.up, player.pos.clone().add(player.fwd)), 2.5);
    pt.pos.copy(d).multiplyScalar(R + groundH(d) + 0.3); pt.up.copy(d); pt.fwd.copy(tangentToward(d, player.pos)); pt.state = 'look'; pt.t = 2;
    poof(pt.pos.clone(), 0xffffff); setTimeout(() => petSay(pt), 400);
    toast(`Naujas draugas: ${rec.n}!`, `${def.kind} keliaus kartu su tavimi. I – visi tavo gyvūnai`, '#7dff6b');
  } else toast(`Naujas draugas: ${rec.n}!`, `Su tavimi jau 5 gyvūnai, tad ${def.kind.toLowerCase()} laukia kolekcijoje. Spausk I`, '#7dff6b');
  savePets();
}

// ---------- I: all your animals, up to 5 walk with you ----------
function renderPetBook() {
  const n = activeCount();
  $('bookCount').textContent = `Kartu su tavimi: ${n} / ${MAX_ACTIVE} · iš viso: ${petBook.length}`;
  $('bookSlots').innerHTML = Array.from({ length: MAX_ACTIVE }, (_, i) => `<span class="slot${i < n ? ' on' : ''}"></span>`).join('');
  if (!petBook.length) { $('bookGrid').innerHTML = '<p class="empty">Dar neturi gyvūnų. Nueik į gyvūnų kioską Pradžios Miesto aikštėje – ten jų yra nuo 10 €.</p>'; return; }
  const sorted = [...petBook].sort((a, b) => (b.active - a.active) || (a.uid - b.uid));
  $('bookGrid').innerHTML = sorted.map(r => { const def = ANIMALS.find(a => a.id === r.t);
    return `<div class="hcard pcard${r.active ? ' active' : ''}"><div class="hpic">${petSvg(r.t)}</div><div class="hname">${r.n}</div><div class="hdesc">${def.kind}</div>
      <div class="pstate">${r.active ? 'Su tavimi' : 'Laukia kolekcijoje'}</div>
      <div class="pbtns"><button class="pb main" data-u="${r.uid}" data-a="toggle"${!r.active && n >= MAX_ACTIVE ? ' disabled title="Jau 5 gyvūnai kartu"' : ''}>${r.active ? 'Palikti' : 'Pasiimti'}</button><button class="pb" data-u="${r.uid}" data-a="free">Paleisti</button></div></div>`; }).join('');
  $('bookGrid').querySelectorAll('.pb').forEach(b => b.addEventListener('click', () => {
    const rec = petBook.find(r => r.uid === +b.dataset.u); if (!rec) return;
    if (b.dataset.a === 'toggle') { if (rec.active) { unequipPet(rec); tone(440, 0.12, { type: 'triangle', vol: 0.05 }); } else if (equipPet(rec)) { [659, 880].forEach((f, i) => tone(f, 0.15, { type: 'triangle', vol: 0.05, when: i * 0.07 })); } }
    else { if (rec.confirm) { if (rec.pt) despawnPet(rec.pt, mode === 'planet'); petBook.splice(petBook.indexOf(rec), 1); sfx.poof(); } else { rec.confirm = true; b.textContent = 'Tikrai?'; setTimeout(() => { rec.confirm = false; }, 2500); return; } }
    savePets(); renderPetBook();
  }));
}
function openPetBook() {
  if (petBookOpen) return;
  petBookOpen = true; for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  renderPetBook(); $('petBook').hidden = false; $('paused').hidden = true;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip();
}
function closePetBook(relock) {
  if (!petBookOpen) return;
  petBookOpen = false; $('petBook').hidden = true;
  if (relock) requestLock();
}
function petBookKey(e) { if (e.code === 'Escape' || e.code === 'KeyI') { e.preventDefault(); closePetBook(e.code === 'KeyI'); } }
