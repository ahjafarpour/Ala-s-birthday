/* ============================================================
   CONFIG — tweak timings here without touching the logic below.
   All values are in milliseconds.
   ============================================================ */
const CONFIG = {
  ENVELOPE_ENTRANCE_MS: 1500,       // must match the CSS transition on .envelope-wrap
  TAP_TEXT_DELAY_MS: 500,          // how long after the envelope settles before the prompt fades in
  PHOTO_REVEAL_DELAY_MS: 400,       // pause after the click, while the envelope fades away
  PHOTO_STAGGER_MS: 150,            // gap between each photo appearing
  FINAL_MESSAGE_DELAY_MS: 4500,     // how long the photos are shown before the final message appears
  FINAL_MESSAGE_FADE_MS: 1000,      // must match the CSS transition on .final-message
  FINAL_MESSAGE_HOLD_MS: 45000,      // how long the final message stays fully visible
  SUNBURST_RAYS: 28,
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('stage');
const envelopeWrap = document.getElementById('envelopeWrap');
const envelope = document.getElementById('envelope');
const tapText = document.getElementById('tapText');
const photoField = document.getElementById('photoField');
const finalMessage = document.getElementById('finalMessage');
const bgm = document.getElementById('bgm');
const sunburst = document.getElementById('sunburst');
const sunburstRays = document.getElementById('sunburstRays');

let opened = false;

/* ------------------------------------------------------------
   Sunburst — draws the thin radiating lines behind the scene.
   Purely decorative; safe to delete this whole section (and its
   CSS/HTML) if you'd rather keep the background plain.
   ------------------------------------------------------------ */
function buildSunburst(count){
  const svgNS = 'http://www.w3.org/2000/svg';
  const cx = 400, cy = 400, rInner = 90, rOuter = 380;
  for(let i = 0; i < count; i++){
    const angle = (i / count) * Math.PI * 2;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', cx + Math.cos(angle) * rInner);
    line.setAttribute('y1', cy + Math.sin(angle) * rInner);
    line.setAttribute('x2', cx + Math.cos(angle) * rOuter);
    line.setAttribute('y2', cy + Math.sin(angle) * rOuter);
    sunburstRays.appendChild(line);
  }
}

/* ------------------------------------------------------------
   Step 1 — page load: envelope animates in, then the prompt
   fades in above it.
   ------------------------------------------------------------ */
function init(){
  buildSunburst(CONFIG.SUNBURST_RAYS);

  // Two rAFs guarantee the browser has painted the initial (hidden)
  // state before we add the classes that trigger the transitions.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.corner').forEach(c => c.classList.add('show'));
      sunburst.classList.add('show');
      envelopeWrap.classList.add('show');
    });
  });

  setTimeout(() => {
    tapText.classList.add('show');
  }, CONFIG.ENVELOPE_ENTRANCE_MS + CONFIG.TAP_TEXT_DELAY_MS);

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      openEnvelope();
    }
  });
}

/* ------------------------------------------------------------
   Step 2 — user opens the envelope: prompt fades out, the
   envelope itself fades away, the song starts, and the photos
   are scheduled to appear.
   ------------------------------------------------------------ */
function openEnvelope(){
  if(opened) return;
  opened = true;

  tapText.classList.remove('show');
  tapText.classList.add('hide');
  envelopeWrap.classList.add('closing');

  // play() is called synchronously inside this click handler (not inside
  // a setTimeout) because browsers only allow audio autoplay in direct
  // response to a user gesture. Replace audio/your-song.mp3 with your file.
  const playPromise = bgm.play();
  if(playPromise && typeof playPromise.catch === 'function'){
    playPromise.catch(() => {
      // Autoplay was blocked by the browser — nothing to do here, the
      // rest of the animation still runs fine without sound.
    });
  }

  setTimeout(revealPhotos, CONFIG.PHOTO_REVEAL_DELAY_MS);
}

/* ------------------------------------------------------------
   Step 3 — photos fade in at random, non-overlapping positions
   and then drift very slightly and randomly forever after.
   ------------------------------------------------------------ */
function pickRandomPosition(placed){
  const MARGIN = 10;      // keep photos away from the very edge, in %
  const CLEAR_CENTER = 20; // keep a clear zone in the middle, in %
  const MIN_GAP = 15;      // minimum spacing between photos, in %
  const MAX_TRIES = 24;

  for(let i = 0; i < MAX_TRIES; i++){
    const top = MARGIN + Math.random() * (100 - 2 * MARGIN);
    const left = MARGIN + Math.random() * (100 - 2 * MARGIN);
    const distFromCenter = Math.hypot(top - 50, left - 50);
    if(distFromCenter < CLEAR_CENTER) continue;

    const tooClose = placed.some(p => Math.hypot(p.top - top, p.left - left) < MIN_GAP);
    if(!tooClose) return { top, left };
  }
  // fall back to whatever we last tried rather than looping forever
  return {
    top: MARGIN + Math.random() * (100 - 2 * MARGIN),
    left: MARGIN + Math.random() * (100 - 2 * MARGIN),
  };
}

function startFloating(el){
  (function drift(){
    const x = (Math.random() - 0.5) * 26; // small random offset, in px
    const y = (Math.random() - 0.5) * 26;
    const duration = 2600 + Math.random() * 2400;
    el.style.transitionDuration = `${duration}ms`;
    el.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(drift, duration);
  })();
}

function revealPhotos(){
  const photos = document.querySelectorAll('.photo');
  const placed = [];

  photos.forEach((photo, i) => {
    const pos = pickRandomPosition(placed);
    placed.push(pos);
    photo.style.setProperty('--top', `${pos.top}%`);
    photo.style.setProperty('--left', `${pos.left}%`);

    const rotation = (Math.random() * 16 - 8).toFixed(1);
    photo.querySelector('img').style.setProperty('--r', `${rotation}deg`);

    setTimeout(() => {
      photo.classList.add('show');
      if(!reducedMotion) startFloating(photo);
    }, i * CONFIG.PHOTO_STAGGER_MS);
  });

  setTimeout(showFinalMessage, CONFIG.FINAL_MESSAGE_DELAY_MS);
}



/* ------------------------------------------------------------
   Step 4 — final message fades in, holds, then fades back out.
   ------------------------------------------------------------ */
function showFinalMessage(){
  finalMessage.classList.add('show');
  setTimeout(() => {
    finalMessage.classList.remove('show');
  }, CONFIG.FINAL_MESSAGE_FADE_MS + CONFIG.FINAL_MESSAGE_HOLD_MS);
}

document.addEventListener('DOMContentLoaded', init);
