// Nav: logo glitch on load and hover, sound toggle.
import { logoGlitch } from '../logo.js'
import { isSoundOn, setSound } from '../sound.js'

export function initNav() {
  const link = document.querySelector('.nav__logo')
  if (!link) return

  const glitch = logoGlitch(link.querySelector('.logo'))
  link.addEventListener('pointerenter', glitch)
  link.addEventListener('focus', glitch)
  glitch()

  const toggle = document.querySelector('.nav__sound')
  if (!toggle) return
  const label = toggle.querySelector('.nav__sound-label')
  const render = () => {
    const on = isSoundOn()
    toggle.setAttribute('aria-pressed', String(on))
    label.textContent = on ? 'Sound on' : 'Sound off'
  }
  toggle.addEventListener('click', () => {
    setSound(!isSoundOn())
    render()
  })
  render()
}
