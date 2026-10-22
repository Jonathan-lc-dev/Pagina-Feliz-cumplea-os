// Caja de regalo animada, cuatro sorpresas reveladas una a una y abejita voladora.
window.Gift = (() => {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cards = $$('.card'), next = $('#next'), box = $('#box'), area = $('#box-area'), wrap = $('#gift-wrap'), beeEl = $('#bee'), slot = $('#bee-slot');
let opened = false, busy = false, shown = 0;

function showCard(i) {
  const c = cards[i]; c.classList.add('in'); shown = Math.max(shown, i + 1); Sfx.soft();
  setTimeout(() => { const r = c.getBoundingClientRect(); Fx.spark(r.left + r.width / 2, r.top + 30, 14); c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 150);
  next.textContent = shown >= cards.length ? 'Continuar 💌' : 'Siguiente sorpresa ✨';
}
function open() {
  if (opened || busy) return; busy = true; Sfx.soft(); box.classList.add('shake');
  setTimeout(() => { box.classList.remove('shake'); box.classList.add('unwrap'); }, 750);                       // moño y cinta se separan
  setTimeout(() => { box.classList.add('lid-up'); $('#rays').classList.add('on'); Sfx.open();                    // tapa gira hacia atrás + luz
    const r = box.getBoundingClientRect(); Fx.spark(r.left + r.width / 2, r.top + 40, 50); }, 1400);
  setTimeout(() => { opened = true; busy = false; box.disabled = true; area.classList.add('opened');
    $('#gift-msg').hidden = true; $('#open-btn').hidden = true; next.hidden = false; showCard(0); bee.start(); }, 2600);
}
box.addEventListener('click', open); $('#open-btn').addEventListener('click', open);
next.addEventListener('click', () => { if (shown >= cards.length) App.go('final'); else showCard(shown); });

$('#disc').addEventListener('click', () => { $('#vinyl').classList.toggle('spin'); $('#disc-note').classList.add('show'); Sfx.soft(); });
$$('.note').forEach(n => n.addEventListener('click', () => {
  if (n.classList.contains('open')) return; n.classList.add('open'); n.setAttribute('aria-expanded', 'true'); Sfx.soft();
  const r = n.getBoundingClientRect(); Fx.spark(r.left + r.width / 2, r.top + 20, 10);
}));

const bee = (() => {
  let on = false, x = 0, y = 0, vx = 0, t = 0, phase = 0, pt = 0, last = 0, raf = 0;
  const DUR = [6, 2.6, 3.2];   // alrededor de la caja → visita una tarjeta → vuelve a su flor
  const rel = (el, fx = .5, fy = .5) => { const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect(); return [r.left - w.left + r.width * fx, r.top - w.top + r.height * fy]; };
  function target() {
    if (phase === 0) { const [cx, cy] = rel(box); return [cx + Math.cos(t * 1.2) * (reduce ? 40 : 105), cy + Math.sin(t * 2.3) * (reduce ? 10 : 40) - 10]; }
    if (phase === 1) { const [cx, cy] = rel(cards[Math.max(shown - 1, 0)], 1, 0); return [cx - 26 + Math.sin(t * 3) * 6, cy - 24 + Math.cos(t * 4) * 5]; }   // se detiene junto a la esquina, sin tapar texto
    if (cards[2].classList.contains('in')) { const [sx, sy] = rel(slot); return [sx, sy - 4]; }
    return rel(box, .5, .2);
  }
  function loop(ms) {
    raf = requestAnimationFrame(loop); const dt = Math.min(.05, (ms - last) / 1000 || .016); last = ms; t += dt; pt += dt;
    if (pt > DUR[phase]) { phase = (phase + 1) % 3; pt = 0; }
    const [tx, ty] = target(), k = 1 - Math.exp(-dt * (phase === 0 ? 5 : 3)), px = x; x += (tx - x) * k; y += (ty - y) * k; vx += ((x - px) / dt - vx) * .1;
    beeEl.style.transform = `translate3d(${x - 27}px,${y - 23}px,0) rotate(${clamp(vx * .05, -18, 18)}deg)`;
  }
  const hit = () => {
    beeEl.classList.remove('hit'); void beeEl.offsetWidth; beeEl.classList.add('hit'); Sfx.soft();
    const h = document.createElement('i'); h.className = 'pop'; h.textContent = '💗'; h.style.left = (x - 8) + 'px'; h.style.top = (y - 40) + 'px'; wrap.append(h); setTimeout(() => h.remove(), 1000);
    const r = beeEl.getBoundingClientRect(); Fx.spark(r.left + r.width / 2, r.top, 10);
  };
  beeEl.addEventListener('click', hit); beeEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
  return {
    start() { if (on) return; on = true; beeEl.classList.add('on'); [x, y] = rel(box, .5, .3); last = performance.now(); raf = requestAnimationFrame(loop); },
    stop() { on = false; cancelAnimationFrame(raf); }
  };
})();

return {
  appear() { if (opened) { cards.forEach(c => c.classList.add('in')); shown = cards.length; next.hidden = false; next.textContent = 'Continuar 💌'; bee.start(); } },
  pause() { bee.stop(); }
};
})();
