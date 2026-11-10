// 檢查題庫格式：化學式下標、LaTeX 殘留、是非比例、選項長度洩答
const fs=require("fs"),p=require("path");const d=p.join(__dirname,"..","src");
let all=[];for(const k of ["phy","chem","bio","earth"])for(const f of [`bank_${k}.json`,`bank_${k}_extra.json`])if(fs.existsSync(p.join(d,f)))all.push(...JSON.parse(fs.readFileSync(p.join(d,f),"utf8")).map(o=>({...o,k})));
const txt=o=>[o.q,o.a||"",...(o.w||[]),o.exp].join(" ");
const plain=all.filter(o=>/(CO2|H2O|[^A-Za-z]O2|CH4|C6H12O6|CH2O|SO2|NO2|O3)(?![0-9])|\$|\\[a-z]/.test(txt(o)));
console.log("ascii formula / latex:",plain.length);plain.slice(0,20).forEach(o=>console.log(" -",o.k,txt(o).slice(0,80)));
const tf=all.filter(o=>o.t==="tf");console.log("tf",tf.length,"true",tf.filter(o=>o.tf).length);
const give=all.filter(o=>o.t==="mc"&&o.a.length>Math.max(...o.w.map(w=>w.length))*1.8);
console.log("answer much longer than distractors:",give.length);give.forEach(o=>console.log(" -",o.k,o.a,"|",o.w.join("/")));
