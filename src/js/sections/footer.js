// Footer: the huge logo rises out of the bottom edge as you reach the end,
// locks in with a glitch, and glitches again on hover.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { logoGlitch } from '../logo.js'

gsap.registerPlugin(ScrollTrigger)

export function initFooter() {
  const footer = document.querySelector('.footer')
  if (!footer) return

  const wrap = footer.querySelector('.footer__logo')
  const svg = wrap.querySelector('.logo')
  const glitch = logoGlitch(svg, { strength: 0.6 })
  wrap.addEventListener('pointerenter', glitch)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // The page can't scroll past the end, so lock in near full progress instead of onLeave
  let locked = false
  gsap.fromTo(
    svg,
    { yPercent: 70 },
    {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          if (self.progress > 0.97 && !locked) {
            locked = true
            glitch()
          } else if (self.progress < 0.85) locked = false
        },
      },
    },
  )
}
