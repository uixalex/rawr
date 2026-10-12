// Scramble text: characters cycle through random glyphs and settle left to right.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:■'
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const running = new WeakMap()

export function scramble(el, { duration = 0.5 } = {}) {
  if (reduced || running.has(el)) return
  const final = el.dataset.text ?? (el.dataset.text = el.textContent)
  const start = performance.now()

  const frame = (now) => {
    const t = Math.min((now - start) / (duration * 1000), 1)
    const settled = Math.floor(t * final.length)
    let out = ''
    for (let i = 0; i < final.length; i++) {
      const ch = final[i]
      out += i < settled || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
    }
    el.textContent = out
    if (t < 1) running.set(el, requestAnimationFrame(frame))
    else {
      el.textContent = final
      running.delete(el)
    }
  }
  running.set(el, requestAnimationFrame(frame))
}
