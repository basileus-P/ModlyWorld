const fs = require('fs'), acorn = require('./node_modules/acorn'), walk = require('./node_modules/acorn-walk');
const [, , inF, outF] = process.argv; const src = fs.readFileSync(inF, 'utf8');
const map = new Map();
for (let i = 0; i < 14; i++) { const p = String(i).padStart(2, '0'); const ins = require(`./in_${p}.json`), outs = require(`./out_${p}.json`);
  for (const it of ins) if (outs[it.id] != null && it.kind !== 'h') map.set(it.kind + ':' + it.text, outs[it.id]); }
try { const extra = require('./extra.json'); for (const k in extra) map.set(k, extra[k]); } catch (_) { }
const NAMES = require('./names.json'); for (const k in NAMES) map.set('s:' + k, NAMES[k]);
const ast = acorn.parse(src, { ecmaVersion: 'latest', ranges: true });
const LT = /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]|\b(ir|tu|su|kad|yra|ne|labas|kur|kas|mano|tavo|dar|jau|čia|bet|arba|iš|į|per|po|prie|kaip|gali|reikia|spausk|paimti|eik|kalbėtis)\b/i;
const nodes = [];
const qual = v => (LT.test(v) && /[a-zA-Ząčęėįšųūž]{2}/.test(v)) || map.has('s:' + v);
walk.fullAncestor(ast, (n, anc) => {
  if (n.type === 'Literal' && typeof n.value === 'string' && qual(n.value)) nodes.push({ n, anc: anc.slice(0, -1) });
  else if (n.type === 'TemplateLiteral' && (n.quasis.some(q => LT.test(q.value.cooked || '')) || map.has('t:' + src.slice(n.start + 1, n.end - 1)))) nodes.push({ n, anc: anc.slice(0, -1) });
});
const outer = nodes.filter(a => !nodes.some(b => b !== a && b.n.start <= a.n.start && b.n.end >= a.n.end && (b.n.end - b.n.start) > (a.n.end - a.n.start)));
const exprsOf = t => { try { const a = acorn.parseExpressionAt('`' + t + '`', 0, { ecmaVersion: 'latest' }); return a.expressions.map(e => ('`' + t + '`').slice(e.start, e.end).replace(/'[^']*'|"[^"]*"/g, "''")).sort().join('\u0001'); } catch (e) { return null; } };
const reps = []; let miss = 0, bad = 0, skip = 0; const missList = [];
for (const { n, anc } of outer) {
  const p = anc[anc.length - 1]; let asKey = false;
  if (anc.some(a => a.type === 'VariableDeclarator' && a.id.name === 'HTML_EN')) { skip++; continue; }
  if (p && p.type === 'Property' && p.key === n && !p.computed) { if (p.shorthand || p.method || p.kind !== 'init') { skip++; continue; } asKey = true; }
  if (p && p.type === 'CallExpression' && p.callee.type === 'MemberExpression' && /^(getItem|setItem|removeItem|getElementById|querySelector|querySelectorAll|includes|startsWith|indexOf)$/.test(p.callee.property.name || '')) { skip++; continue; }
  if (p && p.type === 'BinaryExpression' && [p.left, p.right].some(x => x.type === 'Identifier' && x.name === 'cmd')) { skip++; continue; }
  const raw = src.slice(n.start, n.end); const kind = n.type === 'Literal' ? 's' : 't';
  const text = kind === 's' ? n.value : raw.slice(1, -1);
  const en = map.get(kind + ':' + text);
  if (en == null) { if (!asKey) { miss++; missList.push(kind + ':' + text); } continue; }
  let enSrc;
  if (kind === 's') enSrc = JSON.stringify(en);
  else { if (exprsOf(en) !== exprsOf(text)) { bad++; missList.push('BAD ' + text + ' => ' + en); continue; } enSrc = '`' + en + '`'; }
  reps.push([n.start, n.end, asKey ? `[(EN?${enSrc}:${raw})]` : `(EN?${enSrc}:${raw})`]);
}
reps.sort((a, b) => b[0] - a[0]); let out = src;
for (const [s, e, r] of reps) out = out.slice(0, s) + r + out.slice(e);
out = "const NAME_EN = " + JSON.stringify(NAMES) + ", NAME_LT = Object.fromEntries(Object.entries(NAME_EN).map(([a, b]) => [b, a])), petNameL = n => EN ? (NAME_EN[n] || n) : (NAME_LT[n] || n);\n" + out;
out = "const EN = (() => { try { return localStorage.getItem('modly-lang') === 'en'; } catch (_) { return false; } })();\n" + out;
fs.writeFileSync(outF, out); fs.writeFileSync(__dirname + '/missing.txt', missList.join('\n'));
console.log('replaced', reps.length, 'missing', miss, 'bad', bad, 'skipped', skip);
// ---- pass 2: Lithuanian bits left inside the English branches
{ const inner = require('./inner.json'); const src2 = fs.readFileSync(outF, 'utf8'); const a2 = acorn.parse(src2, { ecmaVersion: 'latest' }); const r2 = [];
  walk.simple(a2, { ConditionalExpression(n) { if (n.test.type !== 'Identifier' || n.test.name !== 'EN') return;
    walk.full(n.consequent, m => {
      if (m.type === 'Literal' && typeof m.value === 'string' && inner[m.value] != null) r2.push([m.start, m.end, JSON.stringify(inner[m.value])]);
      if (m.type === 'TemplateElement' && inner[m.value.cooked] != null && m.value.raw === m.value.cooked) r2.push([m.start, m.end, inner[m.value.cooked].replace(/`/g, '\\`').replace(/\$\{/g, '\\${')]);
    }); } });
  const uniq = [...new Map(r2.map(r => [r[0], r])).values()].sort((a, b) => b[0] - a[0]); let o2 = src2; for (const [s, e, r] of uniq) o2 = o2.slice(0, s) + r + o2.slice(e);
  fs.writeFileSync(outF, o2); console.log('inner', uniq.length); }

// ---- pass 3: personal names inside the English texts become English names
{ const src3 = fs.readFileSync(outF, 'utf8'); const a3 = acorn.parse(src3, { ecmaVersion: 'latest' }); const r3 = [];
  const keys = Object.keys(NAMES).sort((a, b) => b.length - a.length);
  const re = new RegExp('(?<![\\p{L}])(' + keys.join('|') + ')(?![\\p{L}])', 'gu');
  const seen = new Set();
  walk.simple(a3, { ConditionalExpression(n) { if (n.test.type !== 'Identifier' || n.test.name !== 'EN') return;
    walk.full(n.consequent, m => { if (seen.has(m.start)) return;
      if (m.type === 'Literal' && typeof m.value === 'string' && re.test(m.value)) { re.lastIndex = 0; seen.add(m.start); r3.push([m.start, m.end, JSON.stringify(m.value.replace(re, x => NAMES[x]))]); }
      re.lastIndex = 0;
      if (m.type === 'TemplateElement' && re.test(m.value.raw)) { re.lastIndex = 0; seen.add(m.start); r3.push([m.start, m.end, m.value.raw.replace(re, x => NAMES[x])]); }
      re.lastIndex = 0; }); } });
  r3.sort((a, b) => b[0] - a[0]); let o3 = src3; for (const [s, e, r] of r3) o3 = o3.slice(0, s) + r + o3.slice(e);
  fs.writeFileSync(outF, o3); console.log('names', r3.length); }
