// Program: rows highlight on hover with the sound of their discipline.
// Times and labels scramble in once as rows enter.
// Touch screens: the row in the middle of the screen is the active one.
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { scramble } from '../scramble.js'
import { programSound } from '../sound.js'

gsap.registerPlugin(ScrollTrigger)

export function initProgram() {
  const section = document.querySelector('.program')
  if (!section) return

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const rows = [...section.querySelectorAll('.program__row')]

  let activeRow = null
  const activate = (row) => {
    if (row === activeRow) return
    activeRow?.classList.remove('is-active')
    activeRow = row
    if (!row) return
    row.classList.add('is-active')
  }

  // Times and labels scramble in once as rows enter
  rows.forEach((row) =>
    ScrollTrigger.create({
      trigger: row,
      start: 'top 92%',
      once: true,
      onEnter: () => row.querySelectorAll('[data-scramble]').forEach((el) => scramble(el, { duration: 0.7 })),
    }),
  )

  if (canHover) {
    rows.forEach((row) => {
      row.addEventListener('pointerenter', () => {
        if (row !== activeRow) programSound(row.dataset.cat)
        activate(row)
      })
      row.addEventListener('focusin', () => activate(row))
    })
    section.querySelector('.program__list').addEventListener('pointerleave', () => activate(null))
  } else {
    rows.forEach((row) =>
      ScrollTrigger.create({
        trigger: row,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && activate(row),
      }),
    )
  }
}
