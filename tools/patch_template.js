// 一次性：把國中版 template 改成學測版文字（已執行過就不用再跑）
const fs=require("fs"),p=require("path");const f=p.join(__dirname,"..","src","template.html");
let h=fs.readFileSync(f,"utf8");const R=(a,b)=>{if(!h.includes(a))throw "miss:"+a;h=h.split(a).join(b)};
R("自然戰力覺醒｜國中會考自然知識挑戰遊戲","自然戰力覺醒｜學測自然知識挑戰遊戲");
R("國中會考自然科歷屆考點計時挑戰遊戲","學測自然歷屆考點計時挑戰遊戲");
R("國中會考自然｜知識挑戰遊戲","學測自然｜知識挑戰遊戲");
R('src:r[7]||"會考考點"','src:r[7]||"課本"');R('src:r[4]||"會考考點"','src:r[4]||"課本"');
R("歷屆會考考過的年份","歷屆學測考過的年份");
R("年會考考過`","年學測考過`");
R('Q.forEach(q=>q.vol=q.src==="會考考點"?"會考":q.src.replace(/^南一(\\S+).*$/,"$1"));',"");
R('const VOLS=["會考","7上","7下","8上","8下","9上","9下"].filter(v=>Q.some(q=>q.vol===v));',"const VOLS=[...new Set(ALLY)].sort().map(String);");
R('const VOLNAME=v=>v==="會考"?"會考考點地圖":"南一 "+v;','const VOLNAME=v=>v+" 年";');
R("vs.includes(q.vol)","q.yrs.some(y=>vs.includes(String(y)))");
R(">題目來源</span>",">考過年份</span>");
R('"capgame_"','"gsatgame_"');
h=h.replace(/<div class="foot">考點整理自.*?紀錄只存在這台裝置<\/div>/,'<div class="foot">考點整理自 115 學年度高中物理、化學、生物、地科（全）課本，<br>並逐題比對 ${YR} 年學測自然試題（108 課綱），只保留學測考過的考點；歷屆題解析見 <a href="https://bgjd315-cloud.github.io/gsat-science-map/" target="_blank" rel="noopener">自然考點導航</a>・紀錄只存在這台裝置</div>');
fs.writeFileSync(f,h);console.log("patched");
