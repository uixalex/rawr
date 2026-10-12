// Hero: one full bleed frame showing only the color images (figures in magenta / green).
// They follow one another with a smooth crossfade.
// Light grain, a soft RGB split + skew from scroll velocity, parallax.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createFrame } from '../shaders/frame.js'

gsap.registerPlugin(ScrollTrigger)

const IMG = '/images/'
const TEXTURES = {
  graffiti: `${IMG}graffiti-color-a.webp`,
  basketball: `${IMG}basketball-color.webp`,
  skate: `${IMG}skate-color.webp`,
  dj: `${IMG}dj-color.webp`,
}

// Each shot: which image, where to crop on narrow screens
const SHOTS = [
  { img: 'graffiti', focus: [0.92, 0.5] },
  { img: 'basketball', focus: [0.43, 0.5] },
  { img: 'skate', focus: [0.31, 0.5] },
  { img: 'dj', focus: [0.78, 0.5] },
]

// Timing, in seconds. One image every ~1s.
const HOLD = 0.6 // full image on screen
const FADE = 0.4 // crossfade to the next one
// Grain refresh rate, and how strong it is on the image
const GRAIN_FPS = 8
const GRAIN = 0.02

export async function initHero(lenis) {
  const hero = document.querySelector('.hero')
  if (!hero) return

  // Static first image, no switching or split
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const figure = hero.querySelector('.hero__frame')
  const img = figure.querySelector('img')

  // The shader shows one texture: plain and color point at the same image
  const asShot = (shot) => ({ plain: shot.img, color: shot.img })
  const frame = await createFrame(figure, {
    textures: TEXTURES,
    initial: asShot(SHOTS[0]),
    focus: SHOTS[0].focus.slice(),
  }).catch(() => null)

  // No film boil: the image stays still, only the grain moves
  if (frame) {
    frame.uniforms.uBoil.value = 0
    frame.uniforms.uGrain.value = GRAIN
  }

  // State the timeline writes to and the ticker reads from
  const state = { fade: 0, fx: SHOTS[0].focus[0], fy: SHOTS[0].focus[1] }

  // Without WebGL the img swaps its source instead
  const show = (shot) => {
    if (frame) return frame.show(asShot(shot))
    img.src = TEXTURES[shot.img]
    figure.style.setProperty('--focus', `${shot.focus[0] * 100}% ${shot.focus[1] * 100}%`)
  }

  const reel = gsap.timeline({ repeat: -1, delay: HOLD })
  SHOTS.forEach((_, i) => {
    const shot = SHOTS[(i + 1) % SHOTS.length]
    const at = reel.duration()
    const done = at + FADE

    reel
      .call(() => frame?.setNext(shot.img, shot.focus), null, at)
      .fromTo(state, { fade: 0 }, { fade: 1, duration: FADE, ease: 'power1.inOut' }, at)
      .call(() => show(shot), null, done)
      .set(state, { fade: 0, fx: shot.focus[0], fy: shot.focus[1] }, done)
      .set({}, {}, done + HOLD)
  })

  // Scroll velocity drives a soft skew, RGB split and a light tear
  const layer = hero.querySelector('.hero__layer')
  const setSkew = gsap.quickSetter(layer, 'skewY', 'deg')
  let velocity = 0
  let smooth = 0
  lenis.on('scroll', (e) => (velocity = e.velocity))

  let visible = true
  let grainClock = 0
  let seed = 0

  const tick = (time, delta) => {
    if (!visible) return
    smooth += (velocity - smooth) * 0.12
    velocity *= 0.9
    setSkew(gsap.utils.clamp(-1.5, 1.5, smooth * -0.06))
    if (!frame) return

    const speed = Math.abs(smooth)
    const velSplit = Math.min(speed * 0.0004, 0.006)
    const velGlitch = Math.min(Math.max(speed - 12, 0) * 0.012, 0.2)

    grainClock += delta / 1000
    if (grainClock > 1 / GRAIN_FPS) {
      grainClock = 0
      seed = (seed + 1) % 1000
    }

    const u = frame.uniforms
    u.uColor.value = 1
    u.uSplit.value = velSplit
    u.uGlitch.value = velGlitch
    u.uFocus.value[0] = state.fx
    u.uFocus.value[1] = state.fy
    u.uSeed.value = seed

    u.uFade.value = state.fade
    if (state.fade > 0) frame.updateNext()
    frame.render()
  }
  gsap.ticker.add(tick)

  // Pause shader and reel when the hero is off screen
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    visible ? reel.play() : reel.pause()
  }).observe(hero)

  // Parallax: the image lags behind the page
  gsap.to(figure, {
    yPercent: 22,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  })
}
