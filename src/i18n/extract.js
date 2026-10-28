const fs = require('fs'), acorn = require('./node_modules/acorn'), walk = require('./node_modules/acorn-walk');
const src = fs.readFileSync(process.argv[2], 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', ranges: true });
const LT = /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]|\b(ir|tu|su|kad|yra|ne|labas|kur|kas|mano|tavo|dar|jau|čia|bet|arba|iš|į|per|po|prie|kaip|gali|reikia|spausk|paimti|eik|kalbėtis)\b/i;
const nodes = [];
walk.fullAncestor(ast, (n, anc) => {
  if (n.type === 'Literal' && typeof n.value === 'string' && LT.test(n.value) && /[a-zA-Ząčęėįšųūž]{2}/.test(n.value)) nodes.push({ n, anc: anc.slice(0, -1) });
  else if (n.type === 'TemplateLiteral' && n.quasis.some(q => LT.test(q.value.cooked || ''))) nodes.push({ n, anc: anc.slice(0, -1) });
});
// outermost only
const outer = nodes.filter(a => !nodes.some(b => b !== a && b.n.start <= a.n.start && b.n.end >= a.n.end && (b.n.end - b.n.start) > (a.n.end - a.n.start)));
const items = []; const seen = new Map();
for (const { n, anc } of outer) {
  const p = anc[anc.length - 1];
  if (p && p.type === 'Property' && p.key === n && !p.computed) continue;      // object keys stay
  if (p && (p.type === 'ImportDeclaration' || p.type === 'ExportNamedDeclaration')) continue;
  const raw = src.slice(n.start, n.end);
  const kind = n.type === 'Literal' ? 's' : 't';
  const text = kind === 's' ? n.value : raw.slice(1, -1);
  const key = kind + ':' + text;
  if (!seen.has(key)) { seen.set(key, items.length); items.push({ id: items.length, kind, text }); }
}
fs.writeFileSync(process.argv[3], JSON.stringify(items, null, 0));
console.log(items.length, items.reduce((a, b) => a + b.text.length, 0));
