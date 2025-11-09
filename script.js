// Simple static quiz logic (5 sample questions). Stores leaderboard in localStorage.
const QUESTIONS = [
  {q: "What color is the sky on a clear day?", choices:["Blue","Green","Red","Purple"], a:0},
  {q: "Which animal barks?", choices:["Cat","Dog","Cow","Sheep"], a:1},
  {q: "2 + 3 = ?", choices:["3","4","5","6"], a:2},
  {q: "Which planet do we live on?", choices:["Mars","Venus","Earth","Jupiter"], a:2},
  {q: "What do you call frozen water?", choices:["Steam","Ice","Vapor","Cloud"], a:1}
];

let currentIndex = 0;
let timeLeft = 60;
let timerInterval = null;
let score = 0;
let startTime = null;
const playerNameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const qScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const qTitle = document.getElementById('q-title');
const choicesList = document.getElementById('choices');
const nextBtn = document.getElementById('next-btn');
const timeLeftEl = document.getElementById('time-left');
const playerEl = document.getElementById('player');
const resultText = document.getElementById('result-text');
const saveScoreBtn = document.getElementById('save-score-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const leaderboardEl = document.getElementById('leaderboard');
const clearLbBtn = document.getElementById('clear-leaderboard');
const exportCsvBtn = document.getElementById('export-csv');

function startTimer(){
  timeLeft = 60;
  timeLeftEl.textContent = timeLeft;
  timerInterval = setInterval(()=> {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;
    if(timeLeft<=0) endQuiz();
  },1000);
}

function showQuestion(){
  const q = QUESTIONS[currentIndex];
  qTitle.textContent = q.q;
  choicesList.innerHTML = '';
  q.choices.forEach((c, i)=>{
    const li = document.createElement('li');
    li.textContent = c;
    li.dataset.index = i;
    li.addEventListener('click', onChoose);
    choicesList.appendChild(li);
  });
}

function onChoose(e){
  const li = e.currentTarget;
  const chosen = Number(li.dataset.index);
  const correct = QUESTIONS[currentIndex].a;
  // disable further clicks
  Array.from(choicesList.children).forEach(ch => ch.removeEventListener('click', onChoose));
  if(chosen === correct){
    li.classList.add('correct');
    // reward: 10 points + time bonus (remaining seconds)
    score += 10 + Math.max(0, Math.floor(timeLeft/5));
  } else {
    li.classList.add('wrong');
    // mark correct
    const correctEl = Array.from(choicesList.children).find(ch => Number(ch.dataset.index) === correct);
    if(correctEl) correctEl.classList.add('correct');
  }
  nextBtn.classList.remove('hidden');
}

function nextQuestion(){
  currentIndex++;
  nextBtn.classList.add('hidden');
  if(currentIndex >= QUESTIONS.length) {
    endQuiz();
  } else {
    showQuestion();
  }
}

function endQuiz(){
  clearInterval(timerInterval);
  qScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  resultText.textContent = `Name: ${playerNameInput.value || 'Player'} — Score: ${score}`;
}

function saveScore(){
  const name = (playerNameInput.value || 'Player').trim();
  const entry = {name, score, date: new Date().toISOString()};
  const lb = JSON.parse(localStorage.getItem('sky_leaderboard')||'[]');
  lb.push(entry);
  lb.sort((a,b)=>b.score-a.score);
  localStorage.setItem('sky_leaderboard', JSON.stringify(lb.slice(0,20)));
  renderLeaderboard();
  saveScoreBtn.disabled = true;
}

function renderLeaderboard(){
  const lb = JSON.parse(localStorage.getItem('sky_leaderboard')||'[]');
  leaderboardEl.innerHTML = lb.map(e=>`<li>${e.name} — ${e.score} <span class="muted">(${new Date(e.date).toLocaleString()})</span></li>`).join('');
}

function clearLeaderboard(){
  if(confirm('Clear leaderboard?')) {
    localStorage.removeItem('sky_leaderboard');
    renderLeaderboard();
  }
}

function exportCSV(){
  const lb = JSON.parse(localStorage.getItem('sky_leaderboard')||'[]');
  if(lb.length===0){ alert('No leaderboard data'); return; }
  const rows = [['name','score','date'], ...lb.map(e=>[e.name, String(e.score), e.date])];
  const csv = rows.map(r=>r.map(c=>`"${c.replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sky_leaderboard.csv'; a.click();
  URL.revokeObjectURL(url);
}

startBtn.addEventListener('click',()=>{
  const name = (playerNameInput.value || 'Player').trim();
  playerEl.textContent = 'Player: ' + name;
  startScreen.classList.add('hidden');
  qScreen.classList.remove('hidden');
  currentIndex = 0; score = 0;
  startTimer();
  showQuestion();
  saveScoreBtn.disabled = false;
});

nextBtn.addEventListener('click', nextQuestion);
saveScoreBtn.addEventListener('click', saveScore);
playAgainBtn.addEventListener('click', ()=> location.reload());
clearLbBtn.addEventListener('click', clearLeaderboard);
exportCsvBtn.addEventListener('click', exportCSV);

document.addEventListener('DOMContentLoaded', renderLeaderboard);
