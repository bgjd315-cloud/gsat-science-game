const fs=require('fs');const path=require('path');
const {P,C}=require('./chem_points.js');
const root='C:/Claude 系統及作品/gsat-science-game';
const units=JSON.parse(fs.readFileSync(root+'/src/gsat_ref/units.json'));
// valid refs
const valid=new Set();
for(const y of [111,112,113,114,115]) for(const q of JSON.parse(fs.readFileSync(root+'/src/gsat_ref/data/N'+y+'.json'))) valid.add(y+'-'+String(q.no).padStart(2,'0'));
const bank=[];const errs=[];const seen=new Set();const keys=new Set(P.map(p=>p.key));
for(const p of P){
 if(!/^C(0[1-9]|1[0-2])$/.test(p.u)) errs.push('unit '+p.key);
 for(const r of p.refs) if(!valid.has(r)) errs.push('bad ref '+r+' '+p.key);
 for(const q of p.qs){
  const o={u:p.u,t:q.t,q:q.q};
  if(q.t==='mc'){o.a=q.a;o.w=q.w; if(q.w.length!==3) errs.push('w3 '+q.q);
   for(const x of [q.a,...q.w]) if(x.length>20) errs.push('optlen '+x);
   if(new Set([q.a,...q.w]).size!==4) errs.push('dupopt '+q.q);}
  else o.tf=q.tf;
  o.exp=q.exp;o.ch=p.ch;o.refs=p.refs;
  if(q.q.length>48) errs.push('qlen '+q.q.length+' '+q.q);
  if(/\$|\\/.test(JSON.stringify(o).replace(/\\"/g,''))) errs.push('latex '+q.q);
  if(seen.has(q.q)) errs.push('dup '+q.q); seen.add(q.q);
  bank.push(o);
 }
}
for(const c of C) if(c[2]&&!keys.has(c[2])) errs.push('cand key '+c[2]);
const usedKeys=new Set(C.filter(c=>c[2]).map(c=>c[2]));
for(const k of keys) if(!usedKeys.has(k)) errs.push('point not in candidates '+k);
if(errs.length){console.log(errs.join('\n'));process.exit(1);}
fs.writeFileSync(root+'/src/bank_chem.json',JSON.stringify(bank,null,1));
// stats
const mc=bank.filter(b=>b.t==='mc').length, tf=bank.length-mc, tff=bank.filter(b=>b.t==='tf'&&!b.tf).length;
const per={};bank.forEach(b=>per[b.u]=(per[b.u]||0)+1);
// report
const chs=['CH1','CH2','CH3','CH4','實驗'];
let r='# 化學題庫篩選報告（115學年度 高中化學（全）部定必修 × 學測自然 111–115）\n\n';
r+='## 方法\n逐章列出課本中要背誦的知識點（候選），再逐題比對 111–115 學測自然 289 題（含題幹、選項判斷、詳解）。只有「解題必須用到，或是被判斷的選項內容」才保留並記錄題號；其餘刪除。\n\n';
r+=`## 總計\n- 候選知識點：${C.length}\n- 保留（考過）：${C.filter(c=>c[2]).length} 條候選，合併為 ${P.length} 個考點\n- 刪除（未考）：${C.filter(c=>!c[2]).length}\n- 題目：${bank.length} 題（選擇 ${mc}、是非 ${tf}，是非題中錯誤敘述 ${tff}）\n- 各單元題數：${Object.keys(per).sort().map(k=>k+' '+units[k]+' '+per[k]).join('；')}\n\n`;
r+='## 各章候選與保留數\n| 章 | 候選 | 保留 | 刪除 |\n|---|---|---|---|\n';
for(const ch of chs){const a=C.filter(c=>c[0]===ch);r+=`| ${ch} | ${a.length} | ${a.filter(c=>c[2]).length} | ${a.filter(c=>!c[2]).length} |\n`;}
r+='\n## 保留的考點與出處\n';
for(const p of P) r+=`- [${p.ch}｜${p.u}] ${p.name}：${p.refs.join('、')}（${p.qs.length} 題）\n`;
r+='\n## 刪除的知識點（未見於 111–115 學測）\n';
for(const ch of chs){r+=`\n### ${ch}\n`;for(const c of C.filter(c=>c[0]===ch&&!c[2])) r+=`- ${c[1]}\n`;}
r+=fs.readFileSync(path.join(__dirname,'untied.md'),'utf8');
fs.writeFileSync(root+'/work/report_chem.md',r);
console.log(JSON.stringify({cand:C.length,keptCand:C.filter(c=>c[2]).length,points:P.length,total:bank.length,mc,tf,tff,per}));
