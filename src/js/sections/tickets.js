// Tickets: tiers highlight on hover (touch: middle of the screen).
// Newsletter: no backend yet, the form only validates and marks itself as sent.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initTickets() {
  const section = document.querySelector('.tickets')
  if (!section) return

  const tiers = [...section.querySelectorAll('.tier')]
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const on = (t) => t.classList.add('is-active')
  const off = (t) => t.classList.remove('is-active')

  if (canHover) {
    tiers.forEach((t) => {
      t.addEventListener('pointerenter', () => on(t))
      t.addEventListener('pointerleave', () => off(t))
    })
  } else {
    tiers.forEach((t) =>
      ScrollTrigger.create({
        trigger: t,
        start: 'top 58%',
        end: 'bottom 42%',
        onToggle: (self) => (self.isActive ? on(t) : off(t)),
      }),
    )
  }

  const newsletter = section.querySelector('.newsletter')
  const form = newsletter?.querySelector('form')
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!form.reportValidity()) return
    // TODO: connect to the newsletter service
    newsletter.classList.add('is-sent')
  })
}
