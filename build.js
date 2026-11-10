// 組出 index.html：讀 src/bank_*.json（每題都附學測出處 refs），轉成遊戲格式塞進 template
const fs=require("fs"),p=require("path");const d=p.join(__dirname,"src");
const SUBJ={phy:"物理",chem:"化學",bio:"生物",earth:"地科"};
const rows=[],QY={},QR={},QC={},seen=new Set();let drop=0;
// bank_<科>.json：課本知識點；bank_<科>_v2.json：另一版本課本才有的知識點（ch＝「・另版CHn」）；bank_<科>_extra.json：學測考過但課本沒有的（ch＝「・學測補充」）
for(const k of Object.keys(SUBJ))for(const f of [`bank_${k}.json`,`bank_${k}_v2.json`,`bank_${k}_extra.json`].map(x=>p.join(d,x))){if(!fs.existsSync(f))continue;
  for(const o of JSON.parse(fs.readFileSync(f,"utf8"))){
    const refs=(o.refs||[]).filter(r=>/^1(1[1-9]|[2-9]\d)-\d+$/.test(r));
    if(!refs.length||seen.has(o.q)||o.cls==="C"){drop++;continue}seen.add(o.q);   // 沒考過、重複或盤點判為刪除就不收
    if(o.cls)QC[o.q]=o.cls;   // A＝直接得分，B＝判讀基礎
    const src=`${SUBJ[k]}${o.ch||""}`;
    rows.push(o.t==="tf"?[o.u,o.q,o.tf?1:0,o.exp,src]:[o.u,o.q,o.a,...o.w.slice(0,3),o.exp,src]);
    QY[o.q]=[...new Set(refs.map(r=>+r.split("-")[0]))].sort();QR[o.q]=refs.map(r=>{const[y,n]=r.split("-");return y+"-"+n.padStart(2,"0")}).sort();}}
let bank="QB.push(\n"+rows.map(r=>JSON.stringify(r)).join(",\n")+"\n);\nconst QY="+JSON.stringify(QY)+";\nconst QREF="+JSON.stringify(QR)+";\nconst QCLS="+JSON.stringify(QC)+";";
const imgDir=p.join(__dirname,"img");
const imgs=fs.existsSync(imgDir)?fs.readdirSync(imgDir).filter(f=>f.endsWith(".webp")).map(f=>f.replace(".webp","")):[];
bank+="\nconst IMG=new Set("+JSON.stringify(imgs)+");";
const html=fs.readFileSync(p.join(d,"template.html"),"utf8").replace("/*__BANK__*/",()=>bank);
fs.writeFileSync(p.join(__dirname,"index.html"),html);
console.log("built",html.length,"bytes; questions:",rows.length,"dropped:",drop,"images:",imgs.length);
