// Logo glitch: magenta and green copies jump around the white one, then lock in.
// Works on any .logo svg built from the three .logo__layer groups.
import { gsap } from 'gsap'

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function logoGlitch(svg, { strength = 1 } = {}) {
  if (reduced || !svg) return () => {}

  const [m, g, w] = ['m', 'g', 'w'].map((k) => svg.querySelector(`.logo__layer--${k}`))
  let running = null

  return () => {
    if (running?.isActive()) return
    const r = (n) => gsap.utils.random(-n, n) * strength
    running = gsap.timeline()
    for (let i = 0; i < 7; i++) {
      running.set(m, { x: r(40), y: r(10), opacity: 1 }, i * 0.06)
      running.set(g, { x: r(40), y: r(10), opacity: 1 }, i * 0.06)
      running.set(w, { x: r(12) }, i * 0.06)
    }
    running.set([m, g, w], { x: 0, y: 0 }, 0.42).set([m, g], { opacity: 0 }, 0.42)
  }
}
