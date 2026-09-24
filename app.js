const DATA={
  "扭":{zhuyin:"ㄋㄧㄡˇ",radical:"手",strokes:7,parts:[["扌","color-1"],["丑","color-2"]],words:["扭毛巾","扭傷","扭動"],sentence:"我用力把毛巾扭乾。"},
  "抱":{zhuyin:"ㄅㄠˋ",radical:"手",strokes:8,parts:[["扌","color-1"],["包","color-2"]],words:["抱住","擁抱","抱歉"],sentence:"妹妹開心地抱住媽媽。"},
  "拍":{zhuyin:"ㄆㄞ",radical:"手",strokes:8,parts:[["扌","color-1"],["白","color-2"]],words:["拍手","拍照","拍球"],sentence:"大家一起拍手歡迎老師。"},
  "打":{zhuyin:"ㄉㄚˇ",radical:"手",strokes:5,parts:[["扌","color-1"],["丁","color-2"]],words:["打球","打開","打電話"],sentence:"下課時，我和同學一起打球。"},
  "推":{zhuyin:"ㄊㄨㄟ",radical:"手",strokes:11,parts:[["扌","color-1"],["隹","color-2"]],words:["推開","推車","推動"],sentence:"我和同學一起推開門。"},
  "拉":{zhuyin:"ㄌㄚ",radical:"手",strokes:8,parts:[["扌","color-1"],["立","color-2"]],words:["拉手","拉開","拉門"],sentence:"妹妹拉著媽媽的手。"},
  "找":{zhuyin:"ㄓㄠˇ",radical:"手",strokes:7,parts:[["扌","color-1"],["戈","color-2"]],words:["找到","找人","找錢"],sentence:"我在書包裡找到鉛筆。"},
  "拾":{zhuyin:"ㄕˊ",radical:"手",strokes:9,parts:[["扌","color-1"],["合","color-2"]],words:["拾起","拾回","拾荒"],sentence:"我把地上的紙屑拾起來。"}
};

const input=document.querySelector("#character");
const result=document.querySelector("#result");
let currentMode="single";
document.querySelector("#analyzeBtn").addEventListener("click",analyze);
document.querySelectorAll(".quick-btn").forEach(btn=>btn.addEventListener("click",()=>{input.value=btn.dataset.char;currentMode="single";analyze()}));
input.addEventListener("keydown",e=>{if(e.key==="Enter")analyze()});
document.querySelector("#componentBtn").addEventListener("click",showComponent);
document.querySelector("#lessonBtn").addEventListener("click",showLesson);
document.querySelector("#printBtn").addEventListener("click",()=>{if(currentMode!=="lesson")showLesson();setTimeout(()=>window.print(),50)});

function analyze(){
  currentMode="single";
  const char=input.value.trim().slice(0,1);
  if(!char){result.innerHTML='<div class="card">請先輸入一個生字喔！🌱</div>';return}
  const d=DATA[char];
  if(!d){
    result.innerHTML='<div class="card"><div class="character-head"><div class="big-char">'+escapeHtml(char)+'</div><div><h2>這個生字的資料還在準備中 🌱</h2><p>V2 目前收錄：扭、抱、拍、打、推、拉、找、拾。</p></div></div><p class="note">可以在下一版繼續擴充資料庫。</p></div>';
    return;
  }
  result.innerHTML=singleCard(char,d);
}

function singleCard(char,d){
  return '<div class="card"><div class="character-head"><div class="big-char">'+char+'</div><div class="info"><h2>'+char+'</h2><div class="badges"><span class="badge">🔊 '+d.zhuyin+'</span><span class="badge">部首：'+d.radical+'</span><span class="badge">筆畫：'+d.strokes+'</span></div></div></div><div class="section"><h3>🧩 部件拆解</h3><div class="parts">'+partsHtml(d.parts)+'</div><p class="note">共同部件會使用相同顏色，例如「扌」在不同生字中都標示為藍色。</p></div><div class="section"><h3>📝 常用詞語</h3><div class="words">'+d.words.map(w=>'<div class="word">'+w+'</div>').join("")+'</div></div><div class="section"><h3>💬 例句</h3><div class="example">'+d.sentence+'</div></div></div>';
}

function partsHtml(parts){return parts.map((p,i)=>'<span class="part '+p[1]+'">'+p[0]+'</span>'+(i<parts.length-1?'<span class="plus">＋</span>':"")).join("")}

function showComponent(){
  currentMode="component";
  const char=input.value.trim().slice(0,1);
  const d=DATA[char];
  if(!d){result.innerHTML='<div class="card">請先輸入 V2 已收錄的生字，再找相同部件喔！🌱</div>';return}
  const shared=d.parts[0][0];
  const chars=Object.keys(DATA).filter(c=>DATA[c].parts.some(p=>p[0]===shared));
  result.innerHTML='<div class="card"><div class="cute">🎨 🧩 🌱</div><h2>「'+shared+'」共同部件小家族</h2><p>你正在查看「'+char+'」的共同部件：<strong>'+shared+'</strong>。</p><div class="component-box"><p class="component-title">同樣有「'+shared+'」的生字</p><div class="component-list">'+chars.map(c=>'<span class="component-char">'+c+'</span>').join("")+'</div></div><p class="note">教學小提醒：可以請學生先找出相同部件，再比較另一個部件有什麼不同。</p></div>';
}

function showLesson(){
  currentMode="lesson";
  const chars=Object.keys(DATA);
  result.innerHTML='<div class="card"><div class="cute">📚 🐰 ✏️</div><h2>教材模式｜一字一頁</h2><p>每個生字都是一張獨立教材卡，適合直接列印或投影。</p><div class="lesson-grid">'+chars.map((char,i)=>lessonCard(char,DATA[char],i)).join("")+'</div></div>';
}

function lessonCard(char,d,i){
  return '<article class="lesson-card"><div class="cute">'+["🌱","🐰","⭐","🍀"][i%4]+'</div><div class="lesson-char">'+char+'</div><h3>'+char+'｜'+d.zhuyin+'</h3><div class="lesson-part">'+partsHtml(d.parts)+'</div><div class="lesson-words"><strong>詞語：</strong>'+d.words.join("、")+'<br><strong>部首：</strong>'+d.radical+'　<strong>筆畫：</strong>'+d.strokes+'</div><div class="lesson-sentence">💬 '+d.sentence+'</div></article>';
}

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
analyze();
