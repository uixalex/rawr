// Info: while the section scrolls past, the yard slowly zooms out and drifts,
// like a camera walking into the venue.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initInfo() {
  const section = document.querySelector('.info')
  if (!section) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.fromTo(
    section.querySelector('.info__frame img'),
    { scale: 1.2, yPercent: -3 },
    {
      scale: 1.08,
      yPercent: 3,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  )
}
