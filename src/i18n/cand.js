const fs=require('fs'),acorn=require('./node_modules/acorn'),walk=require('./node_modules/acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');const ast=acorn.parse(src,{ecmaVersion:'latest'});
const ex=[];const KN=new Set(JSON.parse(fs.readFileSync('/tmp/known.json','utf8')));walk.simple(ast,{ConditionalExpression(n){if(n.test.type==='Identifier'&&n.test.name==='EN')ex.push([n.start,n.end])},VariableDeclarator(n){if(n.id.name==='HTML_EN')ex.push([n.start,n.end])}});
const inEx=n=>ex.some(([s,e])=>n.start>=s&&n.end<=e);
const out=[];walk.fullAncestor(ast,(n,anc)=>{ if(inEx(n))return; const p=anc[anc.length-2];
 if(n.type==='Literal'&&typeof n.value==='string'&&/[a-z]{3}/i.test(n.value)){ if(p&&p.type==='CallExpression'&&p.callee.type==='MemberExpression'&&/^(getItem|setItem|removeItem|getElementById|querySelector|querySelectorAll|includes|startsWith|indexOf)$/.test(p.callee.property.name||''))return; if(p&&p.type==='BinaryExpression'&&[p.left,p.right].some(x=>x.type==='Identifier'&&x.name==='cmd'))return; if(!KN.has('s:'+n.value))out.push({k:'s',t:n.value}); }
 if(n.type==='TemplateLiteral'&&n.quasis.some(q=>/[a-z]{3}/i.test(q.value.cooked||''))) {const tt=src.slice(n.start+1,n.end-1); if(!KN.has('t:'+tt))out.push({k:'t',t:tt});} });
fs.writeFileSync(process.argv[3],JSON.stringify(out));
