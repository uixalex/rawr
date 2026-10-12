// Tickets: tiers highlight on hover, a click selects one.
// Newsletter: no backend yet, the form only validates and marks itself as sent.
import { gsap } from 'gsap'

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
  }

  // Pick a tier: it stays selected until another one is picked
  let selected = null
  tiers.forEach((t) =>
    t.addEventListener('click', () => {
      selected?.classList.remove('is-selected')
      selected?.setAttribute('aria-pressed', 'false')
      selected = t
      t.classList.add('is-selected')
      t.setAttribute('aria-pressed', 'true')
      cta.classList.add('is-ready')
    }),
  )

  // CTA: no shop yet. Without a tier it points back to the tiers,
  // with a tier it is where the checkout link goes.
  const cta = section.querySelector('.tickets__cta')
  cta.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selected) {
      gsap.fromTo(tiers, { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, stagger: 0.04, clearProps: 'x' })
      return
    }
    // TODO: open the ticket shop for selected.dataset.tier
  })

  const newsletter = section.querySelector('.newsletter')
  const form = newsletter?.querySelector('form')
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!form.reportValidity()) return
    // TODO: connect to the newsletter service
    newsletter.classList.add('is-sent')
  })
}
