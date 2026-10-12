// RGB split on display type, tied to scroll velocity.
// Writes one CSS variable (--rgb) that .t-display uses in its text-shadow.
import { gsap } from 'gsap'

export function initRgbSplit(lenis) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const root = document.documentElement
  let velocity = 0
  let smooth = 0
  let last = 0
  lenis.on('scroll', (e) => (velocity = e.velocity))

  gsap.ticker.add(() => {
    smooth += (velocity - smooth) * 0.15
    velocity *= 0.85
    const px = Math.round(gsap.utils.clamp(-14, 14, smooth * 0.35) * 10) / 10
    if (px === last) return
    last = px
    root.style.setProperty('--rgb', `${px}px`)
  })
}
