// About: the text lights up word by word while scrolling, and the R from the logo
// fills from the bottom up with it. When full it locks in with a glitch, then
// keeps flickering now and then while on screen. Its square pulses like REC.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { logoGlitch } from '../logo.js'

gsap.registerPlugin(ScrollTrigger)

// Pause between flickers while the R is on screen, in seconds
const FLICKER_MIN = 6
const FLICKER_MAX = 10

export function initAbout() {
  const about = document.querySelector('.about')
  if (!about) return

  const text = about.querySelector('.about__text')
  const svg = about.querySelector('.about__r')
  const clip = about.querySelector('.about__r-clip')

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(clip, { attr: { y: 270 } })
    return
  }

  splitWords(text)

  const scrub = { trigger: about, start: 'top 80%', end: 'bottom 55%', scrub: true }

  gsap.fromTo(text.querySelectorAll('.about__word'), { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: scrub })

  // Fill rises in hard steps, like a level meter
  const glitch = logoGlitch(svg, { strength: 1.2 })
  let full = false
  gsap.fromTo(
    clip,
    { attr: { y: 525 } },
    {
      attr: { y: 270 },
      ease: 'steps(12)',
      scrollTrigger: {
        ...scrub,
        onUpdate: ({ progress }) => {
          if (progress > 0.98 && !full) {
            full = true
            glitch()
          } else if (progress < 0.9) full = false
        },
      },
    },
  )

  // Random flicker while visible
  let timer = null
  const flicker = () => {
    glitch()
    timer = gsap.delayedCall(gsap.utils.random(FLICKER_MIN, FLICKER_MAX), flicker)
  }
  new IntersectionObserver(([entry]) => {
    timer?.kill()
    if (entry.isIntersecting) timer = gsap.delayedCall(gsap.utils.random(0.8, 1.6), flicker)
  }).observe(svg)

  svg.closest('.about__mark').addEventListener('pointerenter', glitch)
}

// Wrap every word in a span
function splitWords(el) {
  ;[...el.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return
    const frag = document.createDocumentFragment()
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return
      if (/^\s+$/.test(part)) frag.append(' ')
      else {
        const span = document.createElement('span')
        span.className = 'about__word'
        span.textContent = part
        frag.append(span)
      }
    })
    node.replaceWith(frag)
  })
}
