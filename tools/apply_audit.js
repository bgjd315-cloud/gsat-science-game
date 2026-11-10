// 套用 2026-11 盤點結果：每題標 cls（A 直接得分／B 判讀基礎），C 刪除並記錄理由；refs 只留真正支撐的
// 輸入 work/audit/in_<科>.json、out_<科>.json（各科子代理的判定）＋下面老師規則下的人工覆核
const fs=require("fs"),p=require("path");const R=p.join(__dirname,"..");
const OVERRIDE={ // 只是把學測那題的數值計算重做一遍、或背某題配平答案：不是記憶知識點 → 刪除
  phy:{b48:"只是代數字算加速度",b49:"只是代數字算平均力",b54:"只是代數字算位移",b60:"重做考題的比例推算",b111:"只是代數字算速率",b112:"只是代數字算動能",b138:"只是代數字算核能",x10:"只是代數字算動量變化",x11:"只是代數字算平均力",x35:"只是代數字算電阻"},
  chem:{b63:"背某題的配平答案",b64:"背某題的配平答案",b65:"背某題的配平答案",b84:"只是比例計算"},
  earth:{b102:"只是代數字算潮差",x32:"只是代數字算混合鹽度"}};
const FIX={earth:{b84:{a:"偏北風（北或東北風）",w:["偏南風（南或西南風）","偏西風","幾乎無風"],exp:"颱風逆時針旋轉；從東方接近時，臺灣在中心西側，多吹偏北風；中心通過後轉為偏南風。"}}};
const report=[];let tot={A:0,B:0,C:0};
for(const k of ["phy","chem","bio","earth"]){
  const I=JSON.parse(fs.readFileSync(p.join(R,`work/audit/in_${k}.json`),"utf8")).items;
  const O=JSON.parse(fs.readFileSync(p.join(R,`work/audit/out_${k}.json`),"utf8"));const om={};O.forEach(o=>om[o.id]=o);
  for(const [file,pre] of [[`src/bank_${k}.json`,"b"],[`src/bank_${k}_extra.json`,"x"]]){
    const f=p.join(R,file);const arr=JSON.parse(fs.readFileSync(f,"utf8"));const keep=[];
    arr.forEach((o,i)=>{const id=pre+i,r=om[id];if(!r)throw `no audit for ${k} ${id}`;
      const it=I.find(x=>x.id===id);if(it.q!==o.q)throw `mismatch ${k} ${id}`;
      let cls=r.cls,why=r.why;if(OVERRIDE[k]&&OVERRIDE[k][id]){cls="C";why="老師規則覆核："+OVERRIDE[k][id]}
      if(FIX[k]&&FIX[k][id])Object.assign(o,FIX[k][id]);
      report.push({k,id,src:pre==="b"?"課本":"補充",u:o.u,q:o.q,a:o.t==="tf"?(o.tf?"O":"X"):o.a,cls,why,refs:cls==="C"?o.refs:r.refs});tot[cls]++;
      if(cls==="C")return;
      const refs=r.refs.filter(x=>o.refs.some(y=>{const[a,b]=y.split("-");return a+"-"+b.padStart(2,"0")===x}));
      if(!refs.length)throw `no refs ${k} ${id}`;
      keep.push({...o,cls,refs});});
    fs.writeFileSync(f,JSON.stringify(keep,null,1));}
}
fs.writeFileSync(p.join(R,"work/audit/report.json"),JSON.stringify(report,null,1));
fs.writeFileSync(p.join(R,"work/audit/deleted.json"),JSON.stringify(report.filter(x=>x.cls==="C"),null,1));
console.log(tot);
