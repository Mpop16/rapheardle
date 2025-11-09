// Update script to work with new markup and provide Heardle-like UI feel
const tracks = [
  { title: 'Climax', artist: 'Slum Village' },
  { title: 'Comfortable', artist: 'Lil Wayne' },
  { title: 'Lose Yourself', artist: 'Eminem' },
  { title: 'HUMBLE.', artist: 'Kendrick Lamar' },
  { title: 'N.Y. State of Mind', artist: 'Nas' }
];

let audioCtx = null;
let currentIndex = 0;
let score = 0;
let attempts = 0;
let snippetStage = 1; // controls hint progression
let progressEl = null;
let progressTimer = null;

const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const guessInput = document.getElementById('guessInput');
const resultEl = document.getElementById('result');
const hintEl = document.getElementById('hint');
const trackNameEl = document.getElementById('trackName');
const trackArtistEl = document.getElementById('trackArtist');
const albumArtEl = document.getElementById('albumArt');
const tilesEl = document.getElementById('tiles');
const scoreEl = document.getElementById('score');

function normalize(s){return (s||'').trim().toLowerCase().replace(/[^a-z0-9\s]/g,'')}

function renderTilesFor(title){
  tilesEl.innerHTML = '';
  const chars = title.split(' ');
  // show word tiles approximating Heardle look
  chars.forEach(w=>{
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = '_'.repeat(Math.min(6,w.length));
    tilesEl.appendChild(tile);
  });
}

function setMeta(){
  const t = tracks[currentIndex];
  trackNameEl.textContent = 'Track Name';
  trackArtistEl.textContent = 'Artist Name';
  albumArtEl.style.background = `linear-gradient(135deg,#222,#111)`;
  renderTilesFor(t.title);
  resultEl.textContent = '';
  hintEl.textContent = '';
  guessInput.value = '';
}

function ensureAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(durationMs){
  ensureAudio();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 220 + Math.random()*700;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs/1000);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durationMs/1000 + 0.05);
}

function animateProgress(durationMs){
  cancelProgress();
  const p = document.getElementById('progress');
  let start = Date.now();
  p.style.width = '0%';
  progressTimer = setInterval(()=>{
    const elapsed = Date.now() - start;
    const pct = Math.min(100, (elapsed / durationMs)*100);
    p.style.width = pct + '%';
    if(pct >= 100) cancelProgress();
  }, 30);
}

function cancelProgress(){ if(progressTimer){ clearInterval(progressTimer); progressTimer = null; }}

function playSnippet(){
  if(snippetStage === 1){ playTone(700); animateProgress(700); hintEl.textContent = 'Hint: artist initial — ' + tracks[currentIndex].artist.charAt(0); }
  else if(snippetStage === 2){ playTone(1400); animateProgress(1400); hintEl.textContent = 'Hint: artist — ' + tracks[currentIndex].artist; }
  else { resultEl.textContent = `Answer: ${tracks[currentIndex].title} — ${tracks[currentIndex].artist}`; }
  snippetStage = Math.min(3, snippetStage + 1);
}

function nextTrack(){
  currentIndex = (currentIndex + 1) % tracks.length;
  attempts = 0; snippetStage = 1; setMeta();
}

function onGuess(){
  const g = normalize(guessInput.value);
  if(!g) return;
  attempts++;
  const correct = normalize(tracks[currentIndex].title);
  if(g === correct || correct.includes(g) || g.includes(correct.split(' ')[0])){
    resultEl.textContent = 'Correct!';
    score += Math.max(1, 3 - (attempts - 1));
    scoreEl.textContent = score;
    setTimeout(nextTrack, 1100);
  } else {
    resultEl.textContent = 'Wrong — try again.';
    if(attempts >= 3){ resultEl.textContent = `Out of attempts. Answer: ${tracks[currentIndex].title} — ${tracks[currentIndex].artist}`; setTimeout(nextTrack, 1400); }
  }
}

playBtn.addEventListener('click', ()=>{ playSnippet(); });
guessBtn.addEventListener('click', onGuess);
guessInput.addEventListener('keydown',(e)=>{ if(e.key === 'Enter') onGuess(); });

// init
setMeta(); scoreEl.textContent = score;
