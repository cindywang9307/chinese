// V5：大型漢字資料庫 + 自動部件分析
const DATA_URL="https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt";
const CUSTOM={
  "扭":{zhuyin:"ㄋㄧㄡˇ",words:["扭毛巾","扭傷","扭動"],sentence:"我用力把毛巾扭乾。"},
  "抱":{zhuyin:"ㄅㄠˋ",words:["抱住","擁抱","抱歉"],sentence:"妹妹開心地抱住媽媽。"},
  "拍":{zhuyin:"ㄆㄞ",words:["拍手","拍照","拍球"],sentence:"大家一起拍手歡迎老師。"},
  "打":{zhuyin:"ㄉㄚˇ",words:["打球","打開","打電話"],sentence:"下課時，我和同學一起打球。"},
  "推":{zhuyin:"ㄊㄨㄟ",words:["推開","推車","推動"],sentence:"我和同學一起推開門。"},
  "拉":{zhuyin:"ㄌㄚ",words:["拉手","拉開","拉門"],sentence:"妹妹拉著媽媽的手。"},
  "找":{zhuyin:"ㄓㄠˇ",words:["找到","找人","找錢"],sentence:"我在書包裡找到鉛筆。"},
  "拾":{zhuyin:"ㄕˊ",words:["拾起","拾回","拾荒"],sentence:"我把地上的紙屑拾起來。"}
};
const input=document.querySelector("#character"),result=document.querySelector("#result");
let DB={},dbReady=false,currentMode="single",quizState=null;
const statusEl=(()=>{const e=document.createElement("div");e.id="dbStatus";e.className="db-status";document.querySelector(".search-card").prepend(e);return e})();

initDatabase();
document.querySelector("#analyzeBtn").addEventListener("click",analyze);
document.querySelectorAll(".quick-btn").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.char;analyze()}));
input.addEventListener("keydown",e=>{if(e.key==="Enter")analyze()});
document.querySelector("#componentBtn").addEventListener("click",showComponent);
document.querySelector("#lessonBtn").addEventListener("click",showLesson);
document.querySelector("#quizBtn").addEventListener("click",showQuizConfig);
document.querySelector("#printBtn").addEventListener("click",()=>{if(currentMode!=="lesson")showLesson();setTimeout(()=>window.print(),50)});

async function initDatabase(){
  statusEl.textContent="⏳ 正在載入大型漢字資料庫……第一次開啟可能需要幾秒鐘";
  try{
    const cached=localStorage.getItem("hanziDictionaryV5");
    if(cached) DB=JSON.parse(cached);
    if(!Object.keys(DB).length){
      const res=await fetch(DATA_URL);
      if(!res.ok) throw new Error("database fetch failed");
      const text=await res.text();
      text.split("\n").forEach(line=>{
        if(!line.trim()) return;
        try{
          const d=JSON.parse(line);
          if(d.character) DB[d.character]=d;
        }catch(_){}
      });
      try{localStorage.setItem("hanziDictionaryV5",JSON.stringify(DB))}catch(_){}
    }
    dbReady=true;
    statusEl.innerHTML="🟢 已載入約 <strong>"+Object.keys(DB).length.toLocaleString()+"</strong> 個漢字資料｜現在可以直接輸入資料庫中的生字";
    analyze();
  }catch(err){
    statusEl.textContent="⚠️ 大型資料庫暫時無法載入，仍可使用內建 8 個示範字。";
    dbReady=false; analyze();
  }
}

function getData(c){
  const d=DB[c];
  if(!d) return null;
  const custom=CUSTOM[c]||{};
  const decomposition=d.decomposition||"";
  const rawParts=parseTopLevel(decomposition);
  return {
    zhuyin:custom.zhuyin||toZhuyin((d.pinyin||[])[0]||""),
    pinyin:(d.pinyin||[]).join("、"),
    radical:d.radical||"",
    strokes:Array.isArray(d.strokes)?d.strokes.length:(d.strokes||0),
    parts:rawParts.map((p,i)=>[normalizePart(p),i===0?"color-1":"color-2"]),
    words:custom.words||[],
    sentence:custom.sentence||"",
    definition:d.definition||"",
    decomposition,
    source:"Make Me a Hanzi；教育部國語小字典作為台灣教材核對來源"
  };
}
function normalizePart(p){
  const map={"⺅":"亻","⺡":"氵","⺘":"扌","⻌":"辶","⻖":"阝","⺾":"艹","⺮":"竹","⻊":"足","⺹":"老","⺼":"月"};
  return map[p]||p;
}
function parseTopLevel(s){
  if(!s||s==="？") return [];
  const ops=new Set(["⿰","⿱","⿲","⿳","⿴","⿵","⿶","⿷","⿸","⿹","⿺","⿻"]);
  let i=0;
  function parse(){
    const ch=s[i++];
    if(!ch) return "";
    if(!ops.has(ch)) return ch;
    const count=["⿲","⿳"].includes(ch)?3:2;
    const children=[];
    for(let n=0;n<count;n++) children.push(parse());
    return {op:ch,children};
  }
  const tree=parse();
  return tree&&tree.children?tree.children.flatMap(x=>leafParts(x)):typeof tree==="string"?[tree]:[];
}
function leafParts(x){
  return x&&x.children?x.children.flatMap(leafParts):[x];
}
function analyze(){
  currentMode="single";
  const c=input.value.trim().slice(0,1);
  if(!c){result.innerHTML='<div class="card">請先輸入一個生字喔！🌱</div>';return}
  const d=getData(c);
  if(!d){result.innerHTML='<div class="card"><div class="character-head"><div class="big-char">'+escapeHtml(c)+'</div><div><h2>找不到這個字的資料 🌱</h2><p>請確認輸入的是漢字。若資料庫未收錄，也可以之後加入自訂字。</p></div></div></div>';return}
  result.innerHTML=singleCard(c,d);
}
function singleCard(c,d){
  const parts=d.parts.length?partsHtml(d.parts):'<span class="note">這個字的公開資料沒有可可靠拆出的部件。</span>';
  const words=d.words.length?'<div class="words">'+d.words.map(w=>'<div class="word">'+escapeHtml(w)+'</div>').join("")+'</div>':'<div class="example">📖 字典釋義：'+escapeHtml(d.definition||"目前沒有釋義資料")+'</div>';
  const sentence=d.sentence?'<div class="example">💬 '+escapeHtml(d.sentence)+'</div>':'<div class="note">這個字目前沒有內建教學例句；教師示範字可加入自訂例句。</div>';
  return '<div class="card"><div class="character-head"><div class="big-char">'+c+'</div><div class="info"><h2>'+c+'</h2><div class="badges"><span class="badge">🔊 '+escapeHtml(d.zhuyin||"未提供")+'</span><span class="badge">拼音：'+escapeHtml(d.pinyin||"未提供")+'</span><span class="badge">部首：'+escapeHtml(d.radical||"未提供")+'</span><span class="badge">筆畫：'+(d.strokes||"未提供")+'</span></div></div></div><div class="section"><h3>🧩 自動部件分析</h3><div class="parts">'+parts+'</div><p class="note">部件來自公開漢字字形分解資料，不是靠猜字形。注音、部首與筆畫若需台灣教材核對，建議搭配教育部國語小字典。</p><a class="dict-link" href="https://dict.mini.moe.edu.tw/" target="_blank" rel="noopener">📖 開啟教育部國語小字典</a></div><div class="section"><h3>📝 常用詞語／字義</h3>'+words+'</div><div class="section"><h3>💬 教學例句</h3>'+sentence+'</div></div>'
}
function partsHtml(p){return p.map((x,i)=>'<span class="part '+x[1]+'">'+escapeHtml(x[0])+'</span>'+(i<p.length-1?'<span class="plus">＋</span>':"")).join("")}

function showComponent(){
  currentMode="component";const c=input.value.trim().slice(0,1),d=getData(c);
  if(!d){result.innerHTML='<div class="card">請先輸入資料庫已有的生字，再找相同部件喔！🌱</div>';return}
  const target=d.parts.map(p=>p[0]).filter(Boolean)[0];
  if(!target){result.innerHTML='<div class="card">這個字目前沒有可比較的主要部件。</div>';return}
  const chars=Object.keys(DB).filter(x=>{const q=getData(x);return q&&q.parts.some(p=>p[0]===target)}).slice(0,120);
  result.innerHTML='<div class="card"><div class="cute">🎨 🧩 🌱</div><h2>「'+escapeHtml(target)+'」共同部件小家族</h2><p>「'+escapeHtml(c)+'」的主要共同部件：<strong>'+escapeHtml(target)+'</strong></p><div class="component-box"><p class="component-title">資料庫中找到 '+chars.length+' 個相關字</p><div class="component-list">'+chars.map(x=>'<button class="component-char jump-char" data-char="'+x+'">'+x+'</button>').join("")+'</div></div><p class="note">顯示前 120 個結果，避免畫面太擁擠。</p></div>';
  document.querySelectorAll(".jump-char").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.char;analyze()}));
}
function showLesson(){
  currentMode="lesson";const chars=["扭","抱","拍","打","推","拉","找","拾"].filter(c=>getData(c));
  result.innerHTML='<div class="card"><div class="cute">📚 🐰 ✏️</div><h2>教材模式｜一字一頁</h2><p>示範教材保留原本 8 個教學字；之後可從資料庫選字擴充。</p><div class="lesson-grid">'+chars.map((c,i)=>lessonCard(c,getData(c),i)).join("")+'</div></div>'
}
function lessonCard(c,d,i){
  return '<article class="lesson-card"><div class="cute">'+["🌱","🐰","⭐","🍀"][i%4]+'</div><div class="lesson-char">'+c+'</div><h3>'+c+'｜'+escapeHtml(d.zhuyin||"")+'</h3><div class="lesson-part">'+(d.parts.length?partsHtml(d.parts):"")+'</div><div class="lesson-words"><strong>詞語：</strong>'+(d.words.length?d.words.join("、"):escapeHtml(d.definition||"請看字義"))+'<br><strong>部首：</strong>'+escapeHtml(d.radical||"")+'　<strong>筆畫：</strong>'+d.strokes+'</div><div class="lesson-sentence">💬 '+escapeHtml(d.sentence||"可由教師自行補充例句。")+'</div></article>'
}

function showQuizConfig(){
 currentMode="quiz-config";
 const chars=Object.keys(DB).filter(c=>getData(c));
 const demo=["扭","抱","拍","打","推","拉","找","拾"].filter(c=>DB[c]);
 result.innerHTML='<div class="card"><div class="cute">📝 🐰 ✏️</div><h2 class="quiz-config-title">老師出題模式</h2><p>現在可以從<strong>'+chars.length.toLocaleString()+' 個資料庫漢字</strong>挑選測驗，不再只限原本 8 個字。</p><div class="settings"><div class="setting"><label for="quizCount">題數</label><select id="quizCount"><option value="5">5 題</option><option value="10" selected>10 題</option><option value="15">15 題</option><option value="20">20 題</option></select></div><div class="setting"><label for="quizType">題型</label><select id="quizType"><option value="mixed" selected>混合</option><option value="sound">看字選注音</option><option value="reverseSound">看注音選字</option><option value="commonPart">共同部件</option><option value="word">詞語</option><option value="radical">部首</option></select></div></div><div class="range-box"><strong>🔎 搜尋要考的生字</strong><input id="quizCharSearch" class="quiz-search" placeholder="輸入漢字，例如：清、情、晴、請"><div class="range-list" id="quizCharList"></div><p class="note">點選字卡加入／取消。也可以搜尋資料庫中的其他漢字。</p></div><div class="selected-box"><strong>已選：<span id="selectedCount">0</span> 字</strong><div id="selectedChars" class="selected-chars"></div></div><div class="check-row"><label><input type="checkbox" id="instantHint" checked> 答題後立即顯示正解</label><label><input type="checkbox" id="wrongReview" checked> 測驗後顯示錯題</label></div><div class="quiz-actions"><button class="quiz-btn" id="startConfiguredQuiz">🚀 開始測驗</button></div></div>';
 let selected=new Set(demo);
 const list=document.querySelector("#quizCharList"),search=document.querySelector("#quizCharSearch");
 function renderList(){
   const q=search.value.trim();
   const pool=chars.filter(c=>!q||c.includes(q)).slice(0,120);
   list.innerHTML=pool.map(c=>'<button class="range-btn '+(selected.has(c)?"active":"")+'" data-range="'+c+'">'+c+'</button>').join("")+(pool.length===120?'<div class="note">顯示前 120 個結果，請縮小搜尋範圍。</div>':"");
   list.querySelectorAll(".range-btn").forEach(b=>b.addEventListener("click",()=>{const c=b.dataset.range;if(selected.has(c))selected.delete(c);else selected.add(c);renderList();renderSelected()}));
 }
 function renderSelected(){
   document.querySelector("#selectedCount").textContent=selected.size;
   document.querySelector("#selectedChars").innerHTML=[...selected].map(c=>'<span class="selected-char">'+c+'</span>').join("");
 }
 search.addEventListener("input",renderList);
 renderList();renderSelected();
 document.querySelector("#startConfiguredQuiz").addEventListener("click",()=>startConfiguredQuiz([...selected]));
}
function startConfiguredQuiz(selectedOverride){
 const selected=selectedOverride||[...document.querySelectorAll(".range-btn.active")].map(b=>b.dataset.range);
 if(!selected.length){alert("請至少選擇一個生字！");return}
 const count=Number(document.querySelector("#quizCount").value),type=document.querySelector("#quizType").value;
 const eligibleCommon=selected.filter(c=>findCommonPartQuestion(c,selected));
 if(type==="commonPart"&&!eligibleCommon.length){
   alert("目前選到的生字中，找不到至少 3 個共享同一部件的字。請再選幾個有共同部件的字，例如：清、情、晴、睛。");
   return;
 }
 const chars=shuffle(type==="commonPart"?eligibleCommon:selected),questions=[];
 const mixedTypes=["sound","reverseSound","commonPart","word","radical"];
 for(let i=0;i<count;i++){
   let qType=type==="mixed"?mixedTypes[i%mixedTypes.length]:type;
   let pool=selected;
   if(qType==="commonPart"){
     const commonPool=eligibleCommon.length?eligibleCommon:selected;
     const available=shuffle(commonPool);
     const chosen=available.find(c=>findCommonPartQuestion(c,commonPool));
     if(chosen) questions.push({char:chosen,type:qType,pool:commonPool});
     else qType="sound";
   }
   if(qType!=="commonPart") questions.push({char:chars[i%chars.length],type:qType,pool});
 }
 quizState={questions,idx:0,score:0,answered:false,instantHint:document.querySelector("#instantHint").checked,wrongReview:document.querySelector("#wrongReview").checked,wrong:[]};
 renderQuiz();
}
function renderQuiz(){
 const item=quizState.questions[quizState.idx],c=item.char,d=getData(c),type=item.type;let q,opts,answer,questionVisual="";
 if(type==="sound"){
   q="請選出「"+c+"」的正確注音"; answer=d.zhuyin;
   opts=makeOptions(answer,Object.values(DB).map(x=>toZhuyin((x.pinyin||[])[0]||"")).filter(Boolean));
   questionVisual='<div class="quiz-char">'+c+'</div>';
 }else if(type==="reverseSound"){
   q="哪一個字的注音是「"+d.zhuyin+"」？"; answer=c;
   opts=makeOptions(answer,Object.keys(DB).filter(x=>getData(x)&&getData(x).zhuyin===d.zhuyin));
   questionVisual='<div class="quiz-zhuyin">'+escapeHtml(d.zhuyin)+'</div>';
 }else if(type==="word"){
   q="哪一個是「"+c+"」的詞語？"; answer=d.words[0]||d.definition;
   opts=makeOptions(answer,Object.values(CUSTOM).flatMap(x=>x.words||[]));
   questionVisual='<div class="quiz-char">'+c+'</div>';
 }else if(type==="radical"){
   q="「"+c+"」的部首是哪一個？"; answer=d.radical;
   opts=makeOptions(answer,Object.values(DB).map(x=>x.radical).filter(Boolean));
   questionVisual='<div class="quiz-char">'+c+'</div>';
 }else{
   const info=findCommonPartQuestion(c,item.pool||[]);
   if(!info){
     quizState.questions[quizState.idx].type="sound";
     return renderQuiz();
   }
   q="看到這個共同部件，哪一個字屬於這一家？";
   answer=info.answerChar;
   opts=info.family;
   questionVisual='<div class="common-part-question"><span class="common-part-label">共同部件</span><div class="common-part">'+escapeHtml(info.part)+'</div></div>';
 }
 quizState.answer=answer;quizState.answered=false;
 result.innerHTML='<div class="card"><div class="quiz-progress">📝 第 '+(quizState.idx+1)+' / '+quizState.questions.length+' 題　｜　目前 '+quizState.score+' 分</div>'+questionVisual+'<h2>'+q+'</h2><div class="quiz-options">'+opts.map(o=>'<button class="quiz-option" data-answer="'+encodeURIComponent(o)+'">'+escapeHtml(o)+'</button>').join("")+'</div><div class="quiz-tip">💡 小提醒：先觀察字形，再找出它們共同出現的部件。</div></div>';
 document.querySelectorAll(".quiz-option").forEach(b=>b.addEventListener("click",()=>answerQuiz(decodeURIComponent(b.dataset.answer))));
}
function findCommonPartQuestion(target,pool){
 const targetData=getData(target);
 if(!targetData)return null;
 const candidates=[...new Set(pool)].filter(ch=>getData(ch));
 let best=null;
 for(const part of [...new Set(targetData.parts.map(p=>p[0]).filter(Boolean))]){
   const family=candidates.filter(ch=>getData(ch)?.parts.some(p=>p[0]===part));
   if(family.length>=3&&(!best||family.length>best.family.length)) best={part,family};
 }
 if(!best)return null;
 const family=shuffle(best.family).slice(0,4);
 const answerChar=family.includes(target)?target:family[0];
 return {part:best.part,family,answerChar};
}
function makeOptions(answer,pool){const unique=[...new Set(pool.filter(x=>x&&x!==answer))];return shuffle([answer,...shuffle(unique).slice(0,3)])}
function answerQuiz(v){
 if(quizState.answered)return;
 quizState.answered=true;const ok=v===quizState.answer;if(ok)quizState.score++;else quizState.wrong.push({char:quizState.questions[quizState.idx].char,answer:quizState.answer});
 const card=document.querySelector(".card");
 const feedback=quizState.instantHint?'<div class="quiz-feedback '+(ok?"correct":"wrong")+'">'+(ok?"🎉 答對了！":"再想一下～正確答案是「"+escapeHtml(quizState.answer)+"」。")+'</div>':"";
 card.insertAdjacentHTML("beforeend",feedback+'<div class="quiz-actions"><button class="secondary-btn" id="nextQuiz">'+(quizState.idx===quizState.questions.length-1?"看結果":"下一題 ➜")+'</button></div>');
 document.querySelectorAll(".quiz-option").forEach(b=>b.disabled=true);
 document.querySelector("#nextQuiz").addEventListener("click",()=>{if(quizState.idx===quizState.questions.length-1)showQuizResult();else{quizState.idx++;renderQuiz()}});
}
function showQuizResult(){
 const wrongHtml=quizState.wrongReview&&quizState.wrong.length?'<div class="section"><h3>📌 錯題小整理</h3><div class="wrong-list">'+quizState.wrong.map(x=>'<div class="wrong-item">「'+x.char+'」正確答案：<strong>'+escapeHtml(x.answer)+'</strong></div>').join("")+'</div></div>':"";
 result.innerHTML='<div class="card"><div class="cute">🎉 🐰 ⭐</div><div class="score">測驗完成！<br>'+quizState.score+' / '+quizState.questions.length+' 題</div>'+wrongHtml+'<div class="quiz-actions"><button class="quiz-btn" id="restartQuiz">🔄 重新出題</button><button class="secondary-btn" id="backConfig">⚙️ 修改設定</button></div></div>';
 document.querySelector("#restartQuiz").addEventListener("click",showQuizConfig);
 document.querySelector("#backConfig").addEventListener("click",showQuizConfig);
}
function pinyinParts(py){
 const toneMap={"ā":["a",1],"á":["a",2],"ǎ":["a",3],"à":["a",4],"ē":["e",1],"é":["e",2],"ě":["e",3],"è":["e",4],"ī":["i",1],"í":["i",2],"ǐ":["i",3],"ì":["i",4],"ō":["o",1],"ó":["o",2],"ǒ":["o",3],"ò":["o",4],"ū":["u",1],"ú":["u",2],"ǔ":["u",3],"ù":["u",4],"ǖ":["ü",1],"ǘ":["ü",2],"ǚ":["ü",3],"ǜ":["ü",4]};
 let tone=5,plain=py.toLowerCase();
 for(const k in toneMap) if(plain.includes(k)){plain=plain.replace(k,toneMap[k][0]);tone=toneMap[k][1];break}
 return {plain,tone}
}
function toZhuyin(py){
 if(!py)return "";
 const {plain,tone}=pinyinParts(py);
 let s=plain,initial="";
 const initials=["zh","ch","sh","b","p","m","f","d","t","n","l","g","k","h","j","q","x","r","z","c","s"];
 const hit=initials.find(x=>s.startsWith(x));
 if(hit){initial=hit;s=s.slice(hit.length)}
 const im={"b":"ㄅ","p":"ㄆ","m":"ㄇ","f":"ㄈ","d":"ㄉ","t":"ㄊ","n":"ㄋ","l":"ㄌ","g":"ㄍ","k":"ㄎ","h":"ㄏ","j":"ㄐ","q":"ㄑ","x":"ㄒ","zh":"ㄓ","ch":"ㄔ","sh":"ㄕ","r":"ㄖ","z":"ㄗ","c":"ㄘ","s":"ㄙ"};
 const finals={"a":"ㄚ","o":"ㄛ","e":"ㄜ","ai":"ㄞ","ei":"ㄟ","ao":"ㄠ","ou":"ㄡ","an":"ㄢ","en":"ㄣ","ang":"ㄤ","eng":"ㄥ","ong":"ㄨㄥ","er":"ㄦ","ia":"ㄧㄚ","ie":"ㄧㄝ","iao":"ㄧㄠ","iu":"ㄧㄡ","ian":"ㄧㄢ","in":"ㄧㄣ","iang":"ㄧㄤ","ing":"ㄧㄥ","iong":"ㄩㄥ","ua":"ㄨㄚ","uo":"ㄨㄛ","uai":"ㄨㄞ","ui":"ㄨㄟ","uan":"ㄨㄢ","un":"ㄨㄣ","uang":"ㄨㄤ","ueng":"ㄨㄥ","ü":"ㄩ","üe":"ㄩㄝ","üan":"ㄩㄢ","ün":"ㄩㄣ","u":"ㄨ","i":"ㄧ"};
 if((initial==="j"||initial==="q"||initial==="x")&&s.startsWith("u"))s="ü"+s.slice(1);
 if((initial==="y")&&s.startsWith("u"))s="ü"+s.slice(1);
 if(initial==="y"){initial="";if(s==="i")s="i";else if(s.startsWith("i")){}else if(s.startsWith("u")){}else s="i"+s}
 if(initial==="w"){initial="";if(s==="u")s="u";else s="u"+s}
 const finalKey=Object.keys(finals).sort((a,b)=>b.length-a.length).find(k=>s===k);
 let out=(im[hit]||"")+(finalKey?finals[finalKey]:"");
 if(!out)return py;
 if(tone===2)out+="ˊ";else if(tone===3)out+="ˇ";else if(tone===4)out+="ˋ";else if(tone===5)out="˙"+out;
 return out;
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
