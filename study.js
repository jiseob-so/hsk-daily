'use strict';
const initialHome=home;
const initialStart=start;
const initialRender=render;
let studyPool=[],studyTitle='',studyHidden=false,chosenLetter='A',letterBatch=1;
const firstLetter=w=>w.pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase();
const letters=[...new Set(WORDS.map(firstLetter))].sort();
let randomLetters=new Set();
let alphabetMode='mix';
home=function(){initialHome();
 const box=document.createElement('section');box.className='card section';box.id='study-controls';
 box.innerHTML=`<section><h2>알파벳별 랜덤 퀴즈</h2><p>공부한 알파벳을 여러 개 골라 주세요. 선택한 범위의 단어를 모두 섞어서 풀어요.</p><div class="letter-options" role="group" aria-label="랜덤 퀴즈 알파벳 선택">${letters.map(l=>`<button type="button" data-random-letter="${l}" aria-pressed="${randomLetters.has(l)}">${l}</button>`).join('')}</div><div class="backup section"><button id="letters-all">전체 선택</button><button id="letters-clear">선택 해제</button></div><label class="section">알파벳 랜덤 퀴즈 문제 유형<select id="alphabet-mode"><option value="meaning">한자 → 뜻 고르기</option><option value="hanzi">뜻 → 한자 입력</option><option value="mix">두 유형 섞기</option></select></label><p id="letters-summary" aria-live="polite"></p><button id="random-letter" class="primary full">선택한 알파벳으로 랜덤 퀴즈</button><p class="note">개수 제한 없이 선택한 알파벳의 모든 단어를 한 번씩 출제합니다. 중간에 멈춰도 이어서 풀 수 있어요.</p></section><div class="section"><h2>단어 먼저 공부하기</h2><p>한자와 병음, 뜻을 익힌 뒤 퀴즈에 도전해 보세요.</p><button id="study-day" class="primary">DAY ${selectedDay} 단어 공부</button><div class="section"><h2>병음 알파벳으로 공부하기</h2><div class="fields"><label>첫 알파벳<select id="letter">${letters.map(l=>`<option value="${l}">${l} · ${WORDS.filter(w=>firstLetter(w)===l).length}개</option>`).join('')}</select></label><label>퀴즈 범위<select id="letter-batch"></select></label></div><div class="backup section"><button id="study-letter">알파벳 단어 공부</button><button id="quiz-letter" class="primary">선택 범위 퀴즈</button></div><p class="note">순서대로 푸는 퀴즈는 아래 오늘의 퀴즈에서 고른 문제 유형을 사용합니다. 선택 범위는 순서대로 출제합니다.</p></div></div>`;
 main.insertBefore(box,main.firstChild);
 const letter=document.querySelector('#letter');letter.value=chosenLetter;
 const update=()=>{const pool=WORDS.filter(w=>firstLetter(w)===chosenLetter);const n=Math.ceil(pool.length/30);letterBatch=Math.min(letterBatch,n);document.querySelector('#letter-batch').innerHTML=Array.from({length:n},(_,i)=>`<option value="${i+1}">${i*30+1}–${Math.min((i+1)*30,pool.length)}번째 단어</option>`).join('');document.querySelector('#letter-batch').value=letterBatch;};update();
 letter.onchange=e=>{chosenLetter=e.target.value;letterBatch=1;update();};document.querySelector('#letter-batch').onchange=e=>letterBatch=+e.target.value;
 document.querySelector('#study-day').onclick=()=>openStudy(dayWords(selectedDay),'DAY '+selectedDay);
 document.querySelector('#study-letter').onclick=()=>openStudy(WORDS.filter(w=>firstLetter(w)===chosenLetter),'알파벳 '+chosenLetter);
 const updateRandom=()=>{document.querySelectorAll('[data-random-letter]').forEach(b=>b.setAttribute('aria-pressed',String(randomLetters.has(b.dataset.randomLetter))));const count=WORDS.filter(w=>randomLetters.has(firstLetter(w))).length;document.querySelector('#letters-summary').textContent=randomLetters.size?[...randomLetters].sort().join(' · ')+' 선택 · 총 '+count+'개 · '+count+'문제 모두 출제':'알파벳을 하나 이상 선택해 주세요.';document.querySelector('#random-letter').disabled=!randomLetters.size;};
 document.querySelectorAll('[data-random-letter]').forEach(b=>b.onclick=()=>{const l=b.dataset.randomLetter;if(randomLetters.has(l))randomLetters.delete(l);else randomLetters.add(l);updateRandom();});
 document.querySelector('#letters-all').onclick=()=>{randomLetters=new Set(letters);updateRandom();};document.querySelector('#letters-clear').onclick=()=>{randomLetters.clear();updateRandom();};updateRandom();
 if(alphabetMode==='pinyin'||alphabetMode==='allmix')alphabetMode='mix';document.querySelector('#alphabet-mode').value=alphabetMode;document.querySelector('#alphabet-mode').onchange=e=>alphabetMode=e.target.value;
 document.querySelector('#random-letter').onclick=()=>startLetterRandom([...randomLetters]);
 document.querySelector('#quiz-letter').onclick=()=>{const previous=state.session;initialStart(WORDS.filter(w=>firstLetter(w)===chosenLetter).slice((letterBatch-1)*30,letterBatch*30));if(state.session&&state.session!==previous){state.session.label='알파벳 '+chosenLetter+' · '+letterBatch+'번째 묶음';save();quiz();}};
};
function openStudy(pool,title){stopSpeech();studyPool=pool;studyTitle=title;studyHidden=false;view='study';document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));drawStudy();window.scrollTo(0,0);}
function drawStudy(){main.innerHTML=`<div class="row"><button id="study-back">학습 홈으로</button><span class="pill">${esc(studyTitle)} · ${studyPool.length}개</span></div><h1>${esc(studyTitle)} 단어 공부</h1><p>뜻을 가리고 기억해 보세요. 공부 화면은 오답률에 포함되지 않습니다.</p><button id="hide-meanings">${studyHidden?'뜻과 병음 모두 보기':'뜻과 병음 가리기'}</button><div class="study-list">${studyPool.map(w=>`<article class="card section"><div class="row"><div><small>단어장 ${w.id}번</small><div class="han" lang="zh">${esc(w.han)}</div></div><button data-speak="${w.id}">발음 듣기</button></div>${studyHidden?`<details><summary>병음과 뜻 확인</summary><p>${esc(w.pinyin)}<br>${esc(w.meaning)}</p></details>`:`<p>${esc(w.pinyin)}<br><strong>${esc(w.meaning)}</strong></p>`}${hanjaExplanation(w)||'<small>한국식 한자 훈음 자료를 준비 중입니다.</small>'}</article>`).join('')}</div>`;
document.querySelector('#study-back').onclick=()=>go('home');document.querySelector('#hide-meanings').onclick=()=>{studyHidden=!studyHidden;drawStudy();};document.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speakWord(WORDS[+b.dataset.speak-1]));}
render=function(){if(view==='study')drawStudy();else initialRender();};
if(view==='home')home();

function letterRandomPool(selection){const chosen=new Set(Array.isArray(selection)?selection:[selection]);return shuffle(WORDS.filter(w=>chosen.has(firstLetter(w))));}
function startLetterRandom(letter){if(!letter.length){toast('알파벳을 하나 이상 선택해 주세요.');return;}const previous=state.session;const previousMode=mode;try{mode=alphabetMode;initialStart(letterRandomPool(letter),Infinity);}finally{mode=previousMode;}if(state.session&&state.session!==previous){state.session.label='알파벳 '+(Array.isArray(letter)?[...new Set(letter)].sort().join('·'):letter)+' · 랜덤 '+state.session.items.length+'개';save();quiz();}}
