// Square cursor: color follows the section it is over, grows on links,
// expands to VIEW on images ([data-cursor="view"]). Mouse and trackpad only.
import { gsap } from 'gsap'

const COLORS = {
  black: 'var(--magenta)',
  magenta: 'var(--green)',
  grey: 'var(--magenta)',
  green: 'var(--black)',
}

export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const el = document.createElement('div')
  el.className = 'cursor'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = '<span class="cursor__label t-info">View</span>'
  document.body.append(el)
  document.documentElement.classList.add('has-cursor')

  gsap.set(el, { xPercent: -50, yPercent: -50 })
  const toX = gsap.quickTo(el, 'x', { duration: 0.16, ease: 'power3' })
  const toY = gsap.quickTo(el, 'y', { duration: 0.16, ease: 'power3' })

  window.addEventListener('pointermove', (e) => {
    toX(e.clientX)
    toY(e.clientY)
    el.classList.add('is-visible')
  })
  document.addEventListener('pointerleave', () => el.classList.remove('is-visible'))

  document.addEventListener('pointerover', (e) => {
    const t = e.target
    const theme = t.closest('[data-theme]')?.dataset.theme ?? 'black'
    el.style.setProperty('--c', COLORS[theme])
    el.classList.toggle('is-view', Boolean(t.closest('[data-cursor="view"]')))
    el.classList.toggle('is-link', Boolean(t.closest('a, button, [tabindex], .lineup__name, .tier')))
  })
}
