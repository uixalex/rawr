import '@fontsource-variable/inter'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/sections/nav.css'
import '../styles/sections/hero.css'
import '../styles/sections/marquee.css'
import '../styles/sections/about.css'
import '../styles/sections/program.css'
import '../styles/sections/lineup.css'
import '../styles/sections/info.css'
import '../styles/sections/tickets.css'
import '../styles/sections/footer.css'

import { createScroll } from './scroll.js'
import { createGrain } from './shaders/grain.js'
import { initCursor } from './cursor.js'
import { initRgbSplit } from './effects.js'
import { initNav } from './sections/nav.js'
import { initHero } from './sections/hero.js'
import { initMarquee } from './sections/marquee.js'
import { initAbout } from './sections/about.js'
import { initProgram } from './sections/program.js'
import { initLineup } from './sections/lineup.js'
import { initInfo } from './sections/info.js'
import { initTickets } from './sections/tickets.js'
import { initFooter } from './sections/footer.js'

export const lenis = createScroll()
export const grain = createGrain()

initCursor()
initRgbSplit(lenis)
initNav()
initHero(lenis)
initMarquee(lenis)
initAbout()
initProgram()
initLineup()
initInfo()
initTickets()
initFooter()
