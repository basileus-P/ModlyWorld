// ================= sound: everything is synthesized with Web Audio =================
const SND = { ctx: null, master: null, music: null, sfx: null, amb: null, muted: false, noise: null, wind: null, windF: null, biome: -1, step: 0, nextT: 0, timer: 0, bar: 0, lead: 0 };
try { if (localStorage.getItem('modly-sound142') !== '1') { localStorage.setItem('modly-muted', '0'); localStorage.setItem('modly-sound142', '1'); } SND.muted = localStorage.getItem('modly-muted') === '1'; } catch (_) { }
// browsers keep sound asleep until you click – wake it up on every click / key (also after switching tabs)
for (const ev of ['pointerdown', 'keydown', 'touchstart']) addEventListener(ev, () => { try { if (SND.ctx) { if (SND.ctx.state !== 'running') SND.ctx.resume(); } else if (typeof started !== 'undefined' && started) sndInit(); } catch (_) { } }, true);
document.addEventListener('visibilitychange', () => { try { if (!document.hidden && SND.ctx && SND.ctx.state !== 'running') SND.ctx.resume(); } catch (_) { } });
function sndInit() {
  if (SND.ctx) { if (SND.ctx.state === 'suspended') SND.ctx.resume(); return SND.ctx; }
  let a; try { a = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; }
  SND.ctx = a;
  const comp = a.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(a.destination);
  SND.master = a.createGain(); SND.master.gain.value = SND.muted ? 0 : 1; SND.master.connect(comp);
  SND.music = a.createGain(); SND.music.gain.value = 0.32; SND.music.connect(SND.master);
  SND.sfx = a.createGain(); SND.sfx.gain.value = 0.9; SND.sfx.connect(SND.master);
  SND.amb = a.createGain(); SND.amb.gain.value = 0.6; SND.amb.connect(SND.master);
  // simple echo for the music
  const dl = a.createDelay(1), fb = a.createGain(), wet = a.createGain();
  dl.delayTime.value = 0.33; fb.gain.value = 0.28; wet.gain.value = 0.22;
  SND.music.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(SND.master);
  // noise buffer
  const nb = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), ch = nb.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  SND.noise = nb;
  // wind bed
  const ws = a.createBufferSource(); ws.buffer = nb; ws.loop = true;
  SND.windF = a.createBiquadFilter(); SND.windF.type = 'bandpass'; SND.windF.frequency.value = 500; SND.windF.Q.value = 0.8;
  SND.wind = a.createGain(); SND.wind.gain.value = 0;
  ws.connect(SND.windF); SND.windF.connect(SND.wind); SND.wind.connect(SND.amb); ws.start();
  SND.nextT = a.currentTime + 0.1;
  SND.timer = setInterval(musicTick, 90);
  return a;
}
function audio() { return sndInit(); }
function setMuted(m) {
  SND.muted = m; try { localStorage.setItem('modly-muted', m ? '1' : '0'); } catch (_) { }
  if (SND.master) SND.master.gain.setTargetAtTime(m ? 0 : 1, SND.ctx.currentTime, 0.05);
  const b = document.getElementById('muteBtn'); if (b) { b.textContent = m ? 'Garsas: išj. (M)' : 'Garsas: įj. (M)'; b.setAttribute('aria-pressed', String(!m)); }
}
const distVol = p => p ? clamp(1 - p.distanceTo(camera.position) / 60, 0, 1) : 1;

// ---------- voices ----------
function tone(freq, dur, o = {}) {
  const a = SND.ctx; if (!a || SND.muted) return;
  const t = a.currentTime + (o.when || 0), osc = a.createOscillator(), g = a.createGain();
  osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.slide || dur));
  if (o.detune) osc.detune.value = o.detune;
  const vol = o.vol == null ? 0.2 : o.vol, at = o.attack || 0.005;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = osc;
  if (o.lp) { const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || 1; osc.connect(f); node = f; }
  if (o.vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = o.vib; lg.gain.value = freq * 0.03; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
  node.connect(g); g.connect(o.bus || SND.sfx); osc.start(t); osc.stop(t + dur + 0.05);
}
function noiseHit(dur, o = {}) {
  const a = SND.ctx; if (!a || SND.muted) return;
  const t = a.currentTime + (o.when || 0), s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = SND.noise; s.playbackRate.value = o.rate || 1;
  f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1000, t); f.Q.value = o.q || 1;
  if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + dur);
  const vol = o.vol == null ? 0.2 : o.vol;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.attack || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(o.bus || SND.sfx); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
}
function grunt(f0, f1, dur, vol, when = 0) { tone(f0, dur, { type: 'sawtooth', to: f1, vol, when, lp: 900, q: 6, attack: 0.02 }); }

// ---------- sound effects ----------
const sfx = {
  step(biome, water) {
    if (water) { noiseHit(0.18, { ft: 'bandpass', f: 900, fto: 300, vol: 0.12, q: 2 }); return; }
    switch (biome) {
      case 0: noiseHit(0.05, { ft: 'highpass', f: 2500, vol: 0.06 }); tone(140, 0.05, { vol: 0.05 }); break;
      case 1: case 4: noiseHit(0.12, { ft: 'lowpass', f: 1200, vol: 0.08 }); break;
      case 2: noiseHit(0.1, { ft: 'bandpass', f: 3500, q: 1.5, vol: 0.12 }); break;
      case 3: tone(220, 0.12, { to: 110, vol: 0.08, type: 'sine' }); break;
      case 5: noiseHit(0.09, { ft: 'bandpass', f: 1800, vol: 0.07 }); break;
      case 6: tone(330 + Math.random() * 60, 0.05, { type: 'square', vol: 0.03 }); break;
      default: tone(880, 0.25, { vol: 0.025 }); tone(1320, 0.3, { vol: 0.015 });
    }
  },
  jump() { tone(260, 0.16, { to: 520, type: 'triangle', vol: 0.09 }); },
  land(force) { const v = clamp(force / 20, 0.05, 0.25); tone(90, 0.2, { to: 40, vol: v }); noiseHit(0.12, { f: 600, vol: v * 0.6 }); },
  whoosh(vol = 0.12) { noiseHit(0.22, { ft: 'bandpass', f: 600, fto: 2400, q: 2, vol }); },
  hit() { tone(120, 0.15, { to: 60, vol: 0.25 }); noiseHit(0.08, { f: 1800, vol: 0.18 }); },
  grab() { tone(500, 0.08, { to: 900, type: 'triangle', vol: 0.12 }); },
  ouch(c) {
    const v = distVol(c.pos) * 0.18; if (v < 0.01) return;
    if (c.type === 'slime') tone(200, 0.35, { to: 700, type: 'square', vol: v * 0.5, slide: 0.3 });
    else { const f = 380 + Math.random() * 200; tone(f, 0.12, { to: f * 1.4, type: 'square', vol: v * 0.5, lp: 1800 }); tone(f * 1.3, 0.22, { to: f * 0.8, type: 'square', vol: v * 0.5, lp: 1800, when: 0.12 }); }
  },
  thud(p) { const v = distVol(p) * 0.15; if (v > 0.01) { tone(110, 0.12, { to: 60, vol: v }); noiseHit(0.06, { f: 900, vol: v * 0.5 }); } },
  boom(p, size = 1) {
    const v = clamp(distVol(p) * 0.6 + 0.12, 0, 0.7) * Math.min(1.3, size);
    noiseHit(1.6 * size, { f: 3000, fto: 120, vol: v, attack: 0.01 });
    tone(70, 1.2, { to: 28, vol: v * 0.9 });
  },
  whistle(dur) { tone(1500, dur, { to: 260, type: 'sine', vol: 0.06, slide: dur, attack: 0.3 }); },
  stomp(p) { const v = clamp(distVol(p) * 0.5 + 0.08, 0, 0.5); tone(55, 0.6, { to: 30, vol: v }); noiseHit(0.4, { f: 400, vol: v * 0.6 }); },
  alarm() { for (let i = 0; i < 2; i++) { tone(660, 0.18, { type: 'square', vol: 0.05, lp: 2000, when: i * 0.36 }); tone(520, 0.18, { type: 'square', vol: 0.05, lp: 2000, when: i * 0.36 + 0.18 }); } },
  chime() { [0, 4, 7, 12].forEach((s, i) => tone(523.25 * Math.pow(2, s / 12), 0.9, { vol: 0.08, when: i * 0.09, type: 'triangle' })); },
  magic() { [0, 7, 12, 16, 19, 24].forEach((s, i) => tone(392 * Math.pow(2, s / 12), 1.4, { vol: 0.06, when: i * 0.11 })); },
  blip() { tone(880, 0.07, { type: 'triangle', vol: 0.06 }); tone(1320, 0.08, { type: 'triangle', vol: 0.05, when: 0.06 }); },
  poof() { noiseHit(0.35, { ft: 'bandpass', f: 1200, fto: 300, vol: 0.18 }); tone(400, 0.2, { to: 800, type: 'triangle', vol: 0.06 }); },
  hoof() { tone(150, 0.06, { to: 90, vol: 0.09 }); noiseHit(0.04, { f: 1200, vol: 0.06 }); },
  horn(p) { const v = distVol(p) * 0.12; if (v > 0.01) { tone(392, 0.25, { type: 'square', vol: v, lp: 1500 }); tone(494, 0.25, { type: 'square', vol: v * 0.8, lp: 1500 }); } },
  boing(p) { const v = distVol(p) * 0.08; if (v > 0.01) tone(180, 0.2, { to: 420, type: 'sine', vol: v }); }
};

// ---------- generative music, one mood per biome ----------
const MUSIC = [
  { name: 'city', root: 261.63, scale: [0, 2, 4, 7, 9], prog: [0, 7, 9, 5], tempo: 108, lead: 'triangle', dens: 0.45, pad: 'triangle', bass: 'sine', perc: 'pop', oct: 1 },
  { name: 'desert', root: 220, scale: [0, 1, 4, 5, 7, 8, 10], prog: [0, 0, 1, 0], tempo: 84, lead: 'sawtooth', dens: 0.28, pad: 'sawtooth', bass: 'triangle', perc: 'hand', oct: 1, lp: 1400 },
  { name: 'ice', root: 293.66, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 5, 9, 4], tempo: 62, lead: 'bell', dens: 0.22, pad: 'sine', bass: 'sine', perc: null, oct: 2 },
  { name: 'mushroom', root: 246.94, scale: [0, 2, 4, 6, 8, 10], prog: [0, 2, 4, 2], tempo: 96, lead: 'square', dens: 0.38, pad: 'triangle', bass: 'sine', perc: 'bubble', oct: 1, vib: 6, lp: 1600 },
  { name: 'crimson', root: 196, scale: [0, 3, 5, 7, 10], prog: [0, 0, 3, 5], tempo: 72, lead: 'sawtooth', dens: 0.2, pad: 'sawtooth', bass: 'sawtooth', perc: 'tom', oct: 1, lp: 900 },
  { name: 'jungle', root: 220, scale: [0, 2, 4, 7, 9], prog: [0, 5, 7, 5], tempo: 120, lead: 'marimba', dens: 0.5, pad: 'sine', bass: 'triangle', perc: 'shaker', oct: 1 },
  { name: 'pixel', root: 261.63, scale: [0, 4, 7, 12, 16], prog: [0, 9, 5, 7], tempo: 140, lead: 'square', dens: 0.7, pad: 'square', bass: 'square', perc: 'chip', oct: 1, arp: true, lp: 3000 },
  { name: 'sanctum', root: 130.81, scale: [0, 4, 7, 11, 14], prog: [0, 9, 5, 7], tempo: 54, lead: 'bell', dens: 0.18, pad: 'choir', bass: 'sine', perc: null, oct: 3 },
  { name: 'home', root: 261.63, scale: [0, 2, 4, 7, 9, 11], prog: [0, 5, 9, 7], tempo: 72, lead: 'bell', dens: 0.3, pad: 'sine', bass: 'sine', perc: null, oct: 2 }
];
function musicSet(i) {
  if (!SND.ctx || SND.biome === i) return;
  const g = SND.music.gain, t = SND.ctx.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.0001, t + 0.5);
  setTimeout(() => { SND.biome = i; SND.step = 0; SND.bar = 0; SND.nextT = SND.ctx.currentTime + 0.05; const tt = SND.ctx.currentTime; g.cancelScheduledValues(tt); g.setValueAtTime(0.0001, tt); g.linearRampToValueAtTime(0.32, tt + 1.2); }, 520);
}
function mnote(m, semis, dur, when, vol, kind) {
  const f = m.root * Math.pow(2, semis / 12), bus = SND.music;
  const t0 = when - SND.ctx.currentTime;
  if (kind === 'bell') { tone(f, dur * 2.5, { vol, when: t0, bus }); tone(f * 2.76, dur * 1.2, { vol: vol * 0.35, when: t0, bus }); return; }
  if (kind === 'marimba') { tone(f, 0.35, { vol, when: t0, bus }); tone(f * 4, 0.08, { vol: vol * 0.3, when: t0, bus }); return; }
  if (kind === 'choir') { for (const d of [-8, 0, 8]) tone(f, dur, { type: 'sawtooth', vol: vol * 0.4, when: t0, bus, attack: dur * 0.4, lp: 900, detune: d }); return; }
  tone(f, dur, { type: kind, vol, when: t0, bus, lp: m.lp, vib: m.vib, attack: kind === 'sawtooth' ? 0.03 : 0.006 });
}
function musicTick() {
  const a = SND.ctx; if (!a || SND.muted || SND.biome < 0) return;
  const m = MUSIC[SND.biome]; if (!m) return;
  const sixteenth = 60 / m.tempo / 4;
  if (SND.nextT < a.currentTime - 0.1) SND.nextT = a.currentTime + 0.05;
  while (SND.nextT < a.currentTime + 0.25) {
    const s = SND.step, t = SND.nextT, chord = m.prog[SND.bar % m.prog.length];
    if (s % 16 === 0) { // pad chord for the bar
      for (const k of [0, 4, 7]) { const st = chord + (m.name === 'desert' || m.name === 'crimson' ? [0, 7, 12][[0, 4, 7].indexOf(k)] : k) - 12; mnote(m, st, sixteenth * 16, t, 0.03, m.pad === 'choir' ? 'choir' : m.pad); }
    }
    if (s % 8 === 0 || (m.name === 'pixel' && s % 4 === 0)) mnote(m, chord - 24, sixteenth * (m.name === 'pixel' ? 3 : 6), t, 0.09, m.bass);
    if (m.arp) { const ar = [0, 4, 7, 12]; mnote(m, chord + ar[s % 4], sixteenth * 0.9, t, 0.035, 'square'); }
    if (Math.random() < m.dens && s % 2 === 0) {
      SND.lead = clamp(SND.lead + Math.floor(Math.random() * 5) - 2, 0, m.scale.length * 2 - 1);
      const deg = m.scale[SND.lead % m.scale.length] + 12 * Math.floor(SND.lead / m.scale.length) + 12 * (m.oct - 1);
      mnote(m, deg, sixteenth * (2 + Math.floor(Math.random() * 3)), t, 0.06, m.lead);
    }
    // percussion
    const T0 = t - a.currentTime;
    switch (m.perc) {
      case 'pop': if (s % 4 === 0) tone(110, 0.15, { to: 50, vol: 0.12, when: T0, bus: SND.music }); if (s % 4 === 2) noiseHit(0.04, { ft: 'highpass', f: 6000, vol: 0.04, when: T0, bus: SND.music }); break;
      case 'hand': if (s % 8 === 0 || s % 8 === 3) tone(180, 0.12, { to: 120, vol: 0.08, when: T0, bus: SND.music }); if (s % 8 === 6) noiseHit(0.05, { ft: 'bandpass', f: 1500, vol: 0.05, when: T0, bus: SND.music }); break;
      case 'bubble': if (s % 6 === 0) tone(300 + Math.random() * 300, 0.1, { to: 900, vol: 0.04, when: T0, bus: SND.music }); break;
      case 'tom': if (s % 16 === 0 || s % 16 === 10) tone(90, 0.4, { to: 55, vol: 0.14, when: T0, bus: SND.music }); break;
      case 'shaker': if (s % 2 === 0) noiseHit(0.05, { ft: 'highpass', f: 5000, vol: s % 4 === 0 ? 0.03 : 0.05, when: T0, bus: SND.music }); if (s % 8 === 0) tone(160, 0.12, { to: 90, vol: 0.08, when: T0, bus: SND.music }); break;
      case 'chip': if (s % 4 === 0) tone(150, 0.08, { to: 40, type: 'square', vol: 0.05, when: T0, bus: SND.music }); if (s % 8 === 4) noiseHit(0.06, { ft: 'highpass', f: 3000, vol: 0.05, when: T0, bus: SND.music }); break;
    }
    SND.step = (s + 1) % 16; if (SND.step === 0) SND.bar++;
    SND.nextT += sixteenth;
  }
}

// ---------- ambience, driven every frame by where the traveller is ----------
let ambT = 0;
function ambience(dt, w, inSanctum) {
  const a = SND.ctx; if (!a || SND.muted) return;
  const windAmt = inSanctum ? 0 : (w[1] * 0.25 + w[4] * 0.45 + w[2] * 0.3 + w[3] * 0.05 + w[0] * 0.04);
  SND.wind.gain.setTargetAtTime(windAmt * 0.35, a.currentTime, 0.4);
  SND.windF.frequency.setTargetAtTime(400 + 300 * Math.sin(T * 0.3) + w[2] * 900, a.currentTime, 0.5);
  ambT -= dt; if (ambT > 0) return; ambT = 0.25;
  if (inSanctum) { if (Math.random() < 0.15) tone(1200 + Math.random() * 1600, 1.5, { vol: 0.015, bus: SND.amb, attack: 0.4 }); return; }
  const r = Math.random();
  if (r < w[5] * 0.5) { const f = 2000 + Math.random() * 1800; for (let i = 0; i < 3; i++) tone(f * (1 + i * 0.06), 0.07, { to: f * 1.3, vol: 0.025, when: i * 0.09, bus: SND.amb }); }   // jungle birds
  else if (r < w[0] * 0.25) { const f = 2600 + Math.random() * 900; tone(f, 0.08, { to: f * 0.8, vol: 0.015, bus: SND.amb }); tone(f, 0.08, { to: f * 1.2, vol: 0.015, when: 0.12, bus: SND.amb }); } // city sparrows
  if (Math.random() < w[2] * 0.06) noiseHit(0.8, { ft: 'lowpass', f: 300, vol: 0.05, bus: SND.amb });          // ice creak
  if (Math.random() < w[3] * 0.3) tone(400 + Math.random() * 500, 0.12, { to: 1200, vol: 0.02, bus: SND.amb });   // spore bubbles
  if (Math.random() < w[6] * 0.25) tone(600 + Math.floor(Math.random() * 8) * 110, 0.06, { type: 'square', vol: 0.015, bus: SND.amb }); // pixel bleeps
  if (Math.random() < w[1] * 0.04) tone(140, 2, { to: 120, type: 'sawtooth', vol: 0.012, lp: 500, attack: 0.8, bus: SND.amb });      // desert hum
}
