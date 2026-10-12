// Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
// Anchor links (#tickets etc.) scroll smoothly.
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function createScroll() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const lenis = new Lenis({
    lerp: reduced ? 1 : 0.1,
    smoothWheel: !reduced,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]')
    if (!link) return
    const id = link.getAttribute('href')
    if (id === '#') return
    const target = id === '#main' ? 0 : document.querySelector(id)
    if (target === null) return
    e.preventDefault()
    lenis.scrollTo(target, { immediate: reduced })
  })

  return lenis
}
