// Lightweight mock implementation so the site runs without Spotify credentials.
// This plays short generated "snippets" using the Web Audio API and provides a simple guessing game.

const tracks = [
  { title: 'Climax', artist: 'Slum Village' },
  { title: 'Comfortable', artist: 'Lil Wayne' },
  { title: 'Lose Yourself', artist: 'Eminem' },
  { title: 'HUMBLE.', artist: 'Kendrick Lamar' },
  { title: 'N.Y. State of Mind', artist: 'Nas' }
];

let currentIndex = 0;
let score = 0;
let attempts = 0;
let audioCtx = null;
let snippetStage = 1; // 1 = short, 2 = longer, 3 = full reveal

const scoreEl = document.getElementById('score');
const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const guessInput = document.getElementById('guessInput');
const resultEl = document.getElementById('result');
const hintEl = document.getElementById('hint');
const trackNameEl = document.getElementById('trackName');
const trackArtistEl = document.getElementById('trackArtist');
const albumArtEl = document.getElementById('albumArt');

function normalize(s){
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g,'');
}

function updateUI(){
  const t = tracks[currentIndex];
  trackNameEl.textContent = 'Track Name';
  trackArtistEl.textContent = 'Artist Name';
  resultEl.textContent = '';
  hintEl.textContent = '';
  guessInput.value = '';
  // visual placeholder for album art
  albumArtEl.style.background = `linear-gradient(45deg, #222, #111), linear-gradient(0deg, rgba(29,185,84,0.12), rgba(29,185,84,0.12))`;
}

function playToneSequence(durationMs){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220 + Math.random()*800, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs/1000);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durationMs/1000 + 0.05);
}

function playSnippet(){
  // snippetStage controls snippet length
  if(snippetStage === 1){
    playToneSequence(700);
    hintEl.textContent = 'Hint: first letter of artist — ' + tracks[currentIndex].artist.charAt(0);
  } else if(snippetStage === 2){
    playToneSequence(1400);
    hintEl.textContent = 'Hint: artist name — ' + tracks[currentIndex].artist;
  } else {
    // final stage: reveal full title
    resultEl.textContent = `Answer: ${tracks[currentIndex].title} — ${tracks[currentIndex].artist}`;
  }
  snippetStage = Math.min(3, snippetStage + 1);
}

function nextTrack(){
  currentIndex = (currentIndex + 1) % tracks.length;
  attempts = 0;
  snippetStage = 1;
  updateUI();
}

function onGuess(){
  const guess = normalize(guessInput.value);
  if(!guess) return;
  const correct = normalize(tracks[currentIndex].title);
  attempts++;
  if(guess === correct || correct.includes(guess) || guess.includes(correct.split(' ')[0])){
    resultEl.textContent = 'Correct!';
    score += Math.max(1, 3 - (attempts - 1));
    scoreEl.textContent = score;
    setTimeout(nextTrack, 1200);
  } else {
    resultEl.textContent = 'Wrong — try again.';
    if(attempts >= 3){
      resultEl.textContent = `Out of attempts. Answer: ${tracks[currentIndex].title} — ${tracks[currentIndex].artist}`;
      setTimeout(nextTrack, 1400);
    }
  }
}

playBtn.addEventListener('click', ()=>{
  playSnippet();
});

guessBtn.addEventListener('click', onGuess);

guessInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') onGuess();
});

// initialize
updateUI();
scoreEl.textContent = score;
