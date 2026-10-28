import re,json,html
s=open('head.html').read()
body=s[s.find('<body'):] if '<body' in s else s
LT=re.compile(r'[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]|\b(ir|tu|su|kad|yra|ne|kur|kas|mano|tavo|dar|čia|bet|arba|iš|į|per|po|prie|kaip|gali|spausk)\b',re.I)
items=set()
# skip style/script
body=re.sub(r'<style[\s\S]*?</style>','',body); body=re.sub(r'<script[\s\S]*?</script>','',body)
for m in re.finditer(r'>([^<>]+)<',body):
    t=m.group(1).strip()
    if t and LT.search(t): items.add(t)
for m in re.finditer(r'(?:title|placeholder|aria-label|alt)="([^"]+)"',body):
    t=m.group(1).strip()
    if LT.search(t): items.add(t)
# css content: strings
for m in re.finditer(r"content:\s*'([^']+)'",s):
    if LT.search(m.group(1)): items.add(m.group(1))
items=sorted(items)
json.dump([{'id':i,'kind':'h','text':t} for i,t in enumerate(items)],open('i18n/html.json','w'),ensure_ascii=False)
print(len(items))
