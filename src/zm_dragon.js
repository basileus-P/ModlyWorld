// ================= Secret: get thrown out by the dragon mother 3 times → her DRAGON WINGS =================
// During command #2 on Mars: if the dragon mother wakes up and throws you out three times, she feels sorry
// for you and gives you – not a dragon costume – but a pair of real dragon wings (they fly like the feather wings).
let dragonBurns = 0; try { dragonBurns = +(localStorage.getItem('modly-dragonburns') || 0); } catch (_) { }
BACKS.push({ id: 'dragonwings', name: 'Drakono sparnai', desc: 'Violetiniai drakono sparnai su auksiniais nagučiais. Ore spausk Space – skrisi, laikyk – sklandysi. Slapta drakono mamos dovana.' });
{
  const _bb = buildBack; buildBack = id => {
    if (id !== 'dragonwings') return _bb(id);
    const g = new THREE.Group(); g.position.set(0, 1.4, -0.2);
    const skin = new THREE.MeshStandardMaterial({ color: 0x8a5ac8, roughness: 0.6, side: THREE.DoubleSide }), bone = mat(0x6a3aa8, { roughness: 0.5 }), gold = mat(0xffd23a, { metalness: 0.5, roughness: 0.3 });
    for (const sx of [-1, 1]) {
      const w = new THREE.Group(); w.position.set(sx * 0.12, 0, -0.05); g.add(w);
      // bat-like membrane between the finger bones
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.55, 0.45); sh.lineTo(1.05, 0.25); sh.quadraticCurveTo(0.95, 0.0, 1.0, -0.2); sh.quadraticCurveTo(0.8, -0.2, 0.75, -0.45); sh.quadraticCurveTo(0.5, -0.35, 0.4, -0.6); sh.quadraticCurveTo(0.25, -0.3, 0, -0.1); sh.lineTo(0, 0);
      const mem = new THREE.Mesh(new THREE.ShapeGeometry(sh, 8), skin); mem.scale.set(sx, 1, 1); mem.rotation.y = -sx * 0.25; w.add(mem);
      // bones and golden claws
      for (const [x, y, len, rz] of [[0.28, 0.23, 0.7, 0.75], [0.52, 0.12, 1.05, 1.35], [0.38, -0.2, 0.75, 2.0]]) { const b = S(G.cyl, bone, 0.025, len, 0.025, sx * x, y, -sx * 0.05); b.rotation.z = -sx * rz; w.add(b); }
      const cl = S(G.cone, gold, 0.05, 0.16, 0.05, sx * 0.57, 0.5, -sx * 0.1); cl.rotation.z = -sx * 0.6; w.add(cl);
      g.userData[sx < 0 ? 'wl' : 'wr'] = w;
    }
    return g;
  };
  const _svg = backSvg; backSvg = id => id !== 'dragonwings' ? _svg(id) : '<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="56" width="100" height="4" fill="#d6c6ff"/><path d="M46 30 L28 10 L4 18 Q12 26 8 34 Q18 32 20 42 Q30 36 46 40 Z" fill="#8a5ac8"/><path d="M54 30 L72 10 L96 18 Q88 26 92 34 Q82 32 80 42 Q70 36 54 40 Z" fill="#8a5ac8"/><circle cx="28" cy="10" r="2.5" fill="#ffd23a"/><circle cx="72" cy="10" r="2.5" fill="#ffd23a"/><rect x="44" y="26" width="12" height="20" rx="5" fill="#6ff05a"/></svg>';
}
{
  const _wake = wakeDragon; wakeDragon = () => {
    _wake();
    if (Q2.stage !== 'rocket' || Q8.owned.includes('dragonwings')) return;
    dragonBurns++; try { localStorage.setItem('modly-dragonburns', String(dragonBurns)); } catch (_) { }
    if (dragonBurns < 3) return;
    setTimeout(() => {
      if (mode !== 'mars') return;
      Q8.owned.push('dragonwings'); saveQ8(); wearBack('dragonwings');
      [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.12 }));
      startTalk('Drakono mama', [
        'Grrr… VĖL tu?! Jau TREČIĄ kartą mane pažadini!',
        '…Na gerai. Tu toks mažas ir toks užsispyręs. Man tavęs net gaila pasidarė.',
        'Štai, imk mano senus sparnus – aš jau per didelė, kad jais skraidyčiau. Tik NEPASAKOK mano vaikams!',
        'O dabar – tyliau. Aš miegu. Grrr…'
      ], '#b07aff');
      toast('SLAPTA DOVANA: DRAKONO SPARNAI!', 'Ore spausk Space – skrisi. Juos rasi ir kostiumų kioske („Ant nugaros“)', '#b07aff');
    }, 1600);
  };
}
// test world: straight to Mars, little dinos already beaten, the dragon room is open
function marsTest() {
  Q2.stage = 'rocket'; Q2.dinosDone = true; saveQ2(); dragonBurns = 0; try { localStorage.setItem('modly-dragonburns', '0'); } catch (_) { }
  Q8.owned = Q8.owned.filter(x => x !== 'dragonwings'); if (Q8.back === 'dragonwings') wearBack(null); saveQ8();
  if (mode !== 'planet' || player.inCar) { toast('Išeik į pasaulį pėsčiomis', 'Ir tada vėl įvesk „marsas“', '#ff7a4a'); return; }
  cancelPlace(true); dropAll(); hideCard();
  fadeTo(() => { enterMars(); if (M2.gate) { M2.gate.position.y = 5.2; M2.boxes = M2.boxes.filter(b => b !== M2.gateBox); } player.pos.set(0, 0, CASTLE.zInner + 3); player.fwd.set(0, 0, -1); toast('Bandymų pasaulis: Marsas', 'Drakono kambarys atidarytas. Pažadink drakono mamą 3 kartus (bėk ar šok jos kambaryje)', '#ff7a4a'); });
}
