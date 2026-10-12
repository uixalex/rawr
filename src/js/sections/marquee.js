// Marquee: endless row, speeds up with scroll velocity, follows scroll direction
// and leans (skew) into fast scrolling.
import { gsap } from 'gsap'

export function initMarquee(lenis) {
  const el = document.querySelector('.marquee')
  if (!el) return

  const track = el.querySelector('.marquee__track')
  const group = track.querySelector('.marquee__group')

  // Enough copies to always cover the screen twice
  let groupWidth = 0
  const fill = () => {
    track.querySelectorAll('.marquee__group[data-clone]').forEach((c) => c.remove())
    groupWidth = group.getBoundingClientRect().width
    const copies = Math.ceil((window.innerWidth * 2) / groupWidth)
    for (let i = 0; i < copies; i++) {
      const clone = group.cloneNode(true)
      clone.dataset.clone = ''
      track.appendChild(clone)
    }
  }
  document.fonts.ready.then(fill)
  window.addEventListener('resize', fill)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let x = 0
  let dir = -1
  let velocity = 0
  let smooth = 0
  let visible = false

  lenis.on('scroll', (e) => {
    velocity = e.velocity
    if (Math.abs(velocity) > 0.5) dir = velocity > 0 ? -1 : 1
  })

  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(el)

  const setX = gsap.quickSetter(track, 'x', 'px')
  const setSkew = gsap.quickSetter(track, 'skewX', 'deg')

  gsap.ticker.add((time, delta) => {
    smooth += (velocity - smooth) * 0.1
    velocity *= 0.92
    if (!visible || !groupWidth) return

    const base = Math.max(window.innerWidth * 0.045, 40) // px per second
    const speed = base * (1 + Math.min(Math.abs(smooth) * 0.25, 10))
    x = gsap.utils.wrap(-groupWidth, 0, x + dir * speed * (delta / 1000))
    setX(x)
    setSkew(gsap.utils.clamp(-14, 14, smooth * 0.5))
  })
}
