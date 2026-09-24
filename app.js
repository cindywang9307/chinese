const DATA={
  "扭":{zhuyin:"ㄋㄧㄡˇ",radical:"手",strokes:7,parts:[["扌","color-1"],["丑","color-2"]],words:["扭毛巾","扭傷","扭動"],sentence:"我用力把毛巾扭乾。"},
  "抱":{zhuyin:"ㄅㄠˋ",radical:"手",strokes:8,parts:[["扌","color-1"],["包","color-2"]],words:["抱住","擁抱","抱歉"],sentence:"妹妹開心地抱住媽媽。"},
  "拍":{zhuyin:"ㄆㄞ",radical:"手",strokes:8,parts:[["扌","color-1"],["白","color-2"]],words:["拍手","拍照","拍球"],sentence:"大家一起拍手歡迎老師。"},
  "打":{zhuyin:"ㄉㄚˇ",radical:"手",strokes:5,parts:[["扌","color-1"],["丁","color-2"]],words:["打球","打開","打電話"],sentence:"下課時，我和同學一起打球。"}
};

const input=document.querySelector("#character");
const result=document.querySelector("#result");
document.querySelector("#analyzeBtn").addEventListener("click",analyze);
document.querySelectorAll(".quick-btn").forEach(btn=>btn.addEventListener("click",()=>{input.value=btn.dataset.char;analyze()}));
input.addEventListener("keydown",e=>{if(e.key==="Enter")analyze()});

function analyze(){
  const char=input.value.trim().slice(0,1);
  if(!char){result.innerHTML='<div class="card">請先輸入一個生字喔！🌱</div>';return}
  const d=DATA[char];
  if(!d){
    result.innerHTML=`<div class="card"><div class="character-head"><div class="big-char">${escapeHtml(char)}</div><div><h2>這個生字的資料還在準備中 🌱</h2><p>目前 V1 先收錄：扭、抱、拍、打。</p></div></div><p class="note">下一版可以加入更完整的生字資料庫與自動部件分析。</p></div>`;
    return;
  }
  result.innerHTML=`
    <div class="card">
      <div class="character-head">
        <div class="big-char">${char}</div>
        <div class="info">
          <h2>${char}</h2>
          <div class="badges">
            <span class="badge">🔊 ${d.zhuyin}</span>
            <span class="badge">部首：${d.radical}</span>
            <span class="badge">筆畫：${d.strokes}</span>
          </div>
        </div>
      </div>
      <div class="section">
        <h3>🧩 部件拆解</h3>
        <div class="parts">${d.parts.map((p,i)=>`<span class="part ${p[1]}">${p[0]}</span>${i<d.parts.length-1?'<span class="plus">＋</span>':''}`).join("")}</div>
        <p class="note">共同部件會使用相同顏色，例如「扌」在不同生字中都標示為藍色。</p>
      </div>
      <div class="section">
        <h3>📝 常用詞語</h3>
        <div class="words">${d.words.map(w=>`<div class="word">${w}</div>`).join("")}</div>
      </div>
      <div class="section">
        <h3>💬 例句</h3>
        <div class="example">${d.sentence}</div>
      </div>
    </div>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
analyze();
