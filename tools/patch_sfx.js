// 一次性：把 template 的簡單 beep 換成對戰風合成音效，並接上各遊戲事件（已執行過就不用再跑）
const fs=require("fs"),p=require("path");const f=p.join(__dirname,"..","src","template.html");
let h=fs.readFileSync(f,"utf8");
const R=(a,b)=>{if(!h.includes(a))throw "miss: "+a.slice(0,60);h=h.split(a).join(b)};
// 1. 音效引擎
const s=h.indexOf("let AC;function beep(type)"),e=h.indexOf("catch(e){}}",s)+"catch(e){}}".length;
if(s<0)throw "no beep";
const ENGINE=`/* ========= 音效：WebAudio 即時合成的對戰風音效（不需要音檔） ========= */
let AC,MASTER,NOISE;
function sfxInit(){if(AC)return;AC=new (window.AudioContext||window.webkitAudioContext)();
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
  MASTER=AC.createGain();MASTER.gain.value=.55;MASTER.connect(comp);comp.connect(AC.destination);
  const len=AC.sampleRate;NOISE=AC.createBuffer(1,len,AC.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1}
function tone(f,dur,{type="square",f2=0,at=0,vol=.2,attack=.005}={}){const t=AC.currentTime+at,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+dur+.02)}
function noise(dur,{at=0,vol=.3,type="bandpass",f=2000,f2=0,q=1}={}){const t=AC.currentTime+at,src=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();
  src.buffer=NOISE;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(fl);fl.connect(g);g.connect(MASTER);src.start(t);src.stop(t+dur+.02)}
const kick=(at=0,vol=.6)=>tone(150,.25,{type:"sine",f2:40,at,vol});
const SFX={
  click(){tone(1400,.035,{type:"triangle",vol:.1});tone(2100,.03,{type:"triangle",vol:.05,at:.02})},          // 按鈕
  tick(){kick(0,.55);tone(1500,.05,{vol:.07})},                                                                 // 倒數 3、2、1
  go(){noise(.45,{f:400,f2:6000,vol:.16,q:.7});kick(.42,.85);noise(.35,{at:.42,type:"lowpass",f:3000,f2:200,vol:.45}); // FIGHT!
    [523,659,784,1047].forEach(f=>tone(f,.55,{type:"sawtooth",at:.42,vol:.06}))},
  ok(c=1){const up=Math.pow(2,Math.min(c-1,9)/6);                                                               // 揮劍命中，連對越多音越高
    noise(.12,{type:"highpass",f:2500,f2:9000,vol:.2});tone(880*up,.08,{at:.03,vol:.09});tone(1320*up,.2,{at:.1,vol:.08})},
  combo(){[0,4,7,12,16,19].forEach((st,i)=>tone(660*Math.pow(2,st/12),.12,{type:"sawtooth",at:i*.05,vol:.07}));      // 連擊升級
    noise(.45,{at:.28,type:"highpass",f:6000,vol:.08})},
  bad(){kick(0,.75);tone(190,.3,{type:"sawtooth",f2:70,vol:.16});noise(.2,{type:"lowpass",f:900,vol:.3})},       // 被擊中
  life(){kick(0,.85);noise(.35,{f:1800,f2:300,vol:.35,q:2});tone(392,.15,{at:.05,vol:.09});tone(311,.4,{at:.2,vol:.09})}, // 失去一條命
  timeup(){tone(1000,.5,{type:"triangle",f2:200,vol:.16});kick(.05,.5)},                                        // 時間到
  warn(){tone(110,.11,{type:"sine",vol:.55});tone(105,.12,{type:"sine",vol:.38,at:.15})},                       // 心跳警告
  lock(){tone(300,.12,{f2:150,vol:.14});noise(.08,{f:1200,vol:.2})},                                            // 對決答錯鎖住
  end(){[523,659,784].forEach((f,i)=>tone(f,.16,{at:i*.11,vol:.08}));kick(.36,.6);                              // 結算
    [523,659,784,1047].forEach(f=>tone(f,.9,{type:"sawtooth",at:.36,vol:.045}));noise(.8,{at:.36,type:"highpass",f:5000,vol:.06})},
  record(){SFX.end();[1047,1319,1568,2093].forEach((f,i)=>tone(f,.16,{at:1.05+i*.08,vol:.07}));noise(1,{at:1.05,type:"highpass",f:7000,vol:.07})} // 新紀錄、對決勝利
};
function beep(type,arg){if(!PREF.sound)return;try{sfxInit();if(AC.state==="suspended")AC.resume();(SFX[type]||SFX.click)(arg)}catch(e){}}
document.addEventListener("click",ev=>{const b=ev.target.closest("button,.chip,a.btn");if(b&&!b.classList.contains("opt")&&b.id!=="snd")beep("click")},true);`;
h=h.slice(0,s)+ENGINE+h.slice(e);
// 2. 開音效時給一聲確認
R('$("#snd").onclick=()=>{PREF.sound=!PREF.sound;save();home()};','$("#snd").onclick=()=>{PREF.sound=!PREF.sound;save();home();beep("combo")};');
// 3. 答對：音高隨連對上升，3/5/10/15/20 連對加升級音
R('G.score+=pts;beep("ok");','G.score+=pts;beep("ok",G.combo);if([3,5,10,15,20].includes(G.combo))setTimeout(()=>beep("combo"),170);');
// 4. 答錯：時間到／生存扣命／一般答錯
R('G.missed.push({q,picked});beep("bad");','G.missed.push({q,picked});beep(i<0?"timeup":G.mode==="survive"?"life":"bad");');
// 5. 極速最後 10 秒心跳
R('  const tb=$("#tval");if(tb)tb.textContent=Math.ceil(G.time);','  const tb=$("#tval");if(tb)tb.textContent=Math.ceil(G.time);\n  {const sec=Math.ceil(left/1000);if(left<10000&&left>0&&sec!==G.warnS){G.warnS=sec;beep("warn")}}');
// 6. 生存每題最後 3 秒心跳
R('bar.parentElement.classList.toggle("low",left<3000)}','bar.parentElement.classList.toggle("low",left<3000)}\n      {const sec=Math.ceil(left/1000);if(left<3000&&left>0&&sec!==G.warnQ){G.warnQ=sec;beep("warn")}}');
R('if(timed){G.qEnd=Date.now()+lim*1000;','if(timed){G.qEnd=Date.now()+lim*1000;G.warnQ=0;');
// 7. 結算：破紀錄放勝利號角
R('function finish(){clearTimers();if(!G||G.done)return;G.done=true;beep("end");','function finish(){clearTimers();if(!G||G.done)return;G.done=true;');
R('  const scopeName=PREF.units.length?','  beep(rec?"record":"end");\n  const scopeName=PREF.units.length?');
// 8. 對決：答錯鎖住、勝利
R('DUEL.lock[p]=true;beep("bad");','DUEL.lock[p]=true;beep("lock");');
R('if(quit||!d){home();return}beep("end");','if(quit||!d){home();return}beep("record");');
fs.writeFileSync(f,h);console.log("patched sfx");
