// Lineup: names fill white with a small shake and a double tech click on hover.
// Touch screens: names fill as they cross the middle, without sound.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lineupSound } from '../sound.js'

gsap.registerPlugin(ScrollTrigger)

export function initLineup() {
  const section = document.querySelector('.lineup')
  if (!section) return

  const names = [...section.querySelectorAll('.lineup__name')]
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const on = (el) => el.classList.add('is-filled')
  const off = (el) => el.classList.remove('is-filled')

  if (canHover) {
    names.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        lineupSound()
        on(el)
      })
      el.addEventListener('pointerleave', () => off(el))
      el.addEventListener('focusin', () => on(el))
      el.addEventListener('focusout', () => off(el))
    })
  } else {
    names.forEach((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 58%',
        end: 'bottom 42%',
        onToggle: (self) => (self.isActive ? on(el) : off(el)),
      }),
    )
  }
}
