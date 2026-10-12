// Short street sounds for hover, synthesized with Web Audio (no audio files):
// one per discipline in the program, a double tech click for the lineup.
// Off by default. The nav toggle turns it on: that click is the user gesture browsers
// need before any sound can play. The choice is remembered for the next visit, in which
// case sound unlocks on the first click, tap or key press.

const VOLUME = 0.35
const MIN_GAP = 0.05 // seconds between two sounds, so fast mouse sweeps don't stack
const STORE_KEY = 'rawr-sound'

let ctx = null
let master = null
let noise = null
let last = 0
let enabled = false

function setup() {
  if (ctx) return true
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = VOLUME
  master.connect(ctx.destination)

  // One second of white noise, the raw material for most sounds
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return true
}

function unlock() {
  if (!enabled || !setup()) return
  if (ctx.state !== 'running') ctx.resume()
}

function save(on) {
  try {
    localStorage.setItem(STORE_KEY, on ? 'on' : 'off')
  } catch {}
}

function saved() {
  try {
    return localStorage.getItem(STORE_KEY) === 'on'
  } catch {
    return false
  }
}

export function isSoundOn() {
  return enabled
}

export function setSound(on) {
  enabled = on
  save(on)
  if (on) {
    unlock()
    // Short confirmation once the context is running
    ctx?.resume().then(() => programSound('info'))
  } else if (ctx) {
    ctx.suspend()
  }
}

enabled = saved()
;['pointerdown', 'keydown', 'touchstart'].forEach((type) =>
  window.addEventListener(type, unlock, { passive: true }),
)

function ready() {
  if (!enabled || !ctx) return false
  if (ctx.state !== 'running') {
    ctx.resume()
    return false
  }
  if (ctx.currentTime - last < MIN_GAP) return false
  last = ctx.currentTime
  return true
}

// Click: a few milliseconds of band passed noise plus a tiny sine tick.
// tone sets the brightness, so rows can sound slightly different.
function click(t, { tone = 3200, level = 0.6, length = 0.012 } = {}) {
  const src = ctx.createBufferSource()
  src.buffer = noise
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = tone
  bp.Q.value = 2.5
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + length)
  src.connect(bp).connect(g).connect(master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + length + 0.01)

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(tone * 0.6, t)
  osc.frequency.exponentialRampToValueAtTime(tone * 0.3, t + length)
  const og = ctx.createGain()
  og.gain.setValueAtTime(level * 0.5, t)
  og.gain.exponentialRampToValueAtTime(0.001, t + length)
  osc.connect(og).connect(master)
  osc.start(t)
  osc.stop(t + length + 0.01)
}

// Noise through a filter with a gain envelope: attack, hold, release in seconds
function noiseBurst(t, { type = 'bandpass', freq = 4000, q = 1, level = 0.5, attack = 0.005, hold = 0, release = 0.05 } = {}) {
  const src = ctx.createBufferSource()
  src.buffer = noise
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(level, t + attack)
  g.gain.setValueAtTime(level, t + attack + hold)
  g.gain.exponentialRampToValueAtTime(0.001, t + attack + hold + release)
  src.connect(f).connect(g).connect(master)
  const end = attack + hold + release + 0.02
  src.start(t, Math.random() * (1 - end))
  src.stop(t + end)
  return f
}

// Spray can: a bright hiss that opens and closes
function spray(t) {
  noiseBurst(t, { type: 'highpass', freq: 3500, q: 0.7, level: 0.45, attack: 0.02, hold: 0.14, release: 0.08 })
  noiseBurst(t, { type: 'bandpass', freq: 7500, q: 1.2, level: 0.25, attack: 0.02, hold: 0.12, release: 0.06 })
}

// Ball on concrete: two low thuds, the second one quieter and sooner
function bounce(t) {
  ;[
    [0, 1],
    [0.17, 0.55],
  ].forEach(([dt, level]) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(170, t + dt)
    osc.frequency.exponentialRampToValueAtTime(55, t + dt + 0.09)
    const g = ctx.createGain()
    g.gain.setValueAtTime(level * 0.9, t + dt)
    g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.14)
    osc.connect(g).connect(master)
    osc.start(t + dt)
    osc.stop(t + dt + 0.16)
    noiseBurst(t + dt, { type: 'lowpass', freq: 1200, level: level * 0.35, attack: 0.002, release: 0.03 })
  })
}

// Sneaker squeak: a thin high tone that bends up and down with a fast wobble
function squeak(t) {
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(1700, t)
  osc.frequency.linearRampToValueAtTime(2700, t + 0.05)
  osc.frequency.linearRampToValueAtTime(2200, t + 0.12)
  const wobble = ctx.createOscillator()
  wobble.frequency.value = 38
  const depth = ctx.createGain()
  depth.gain.value = 90
  wobble.connect(depth).connect(osc.frequency)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2400
  bp.Q.value = 3
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(1.4, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
  osc.connect(bp).connect(g).connect(master)
  osc.start(t)
  wobble.start(t)
  osc.stop(t + 0.15)
  wobble.stop(t + 0.15)
}

// Vinyl scratch: a forward and back sweep, like a record pushed and pulled under the needle
function scratch(t) {
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(120, t)
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.06)
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.1)
  osc.frequency.exponentialRampToValueAtTime(460, t + 0.15)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 4
  bp.frequency.setValueAtTime(600, t)
  bp.frequency.exponentialRampToValueAtTime(2200, t + 0.06)
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.1)
  bp.frequency.exponentialRampToValueAtTime(2000, t + 0.15)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(1.8, t + 0.01)
  g.gain.setValueAtTime(1.8, t + 0.08)
  g.gain.exponentialRampToValueAtTime(0.15, t + 0.1)
  g.gain.exponentialRampToValueAtTime(1.5, t + 0.12)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
  osc.connect(bp).connect(g).connect(master)
  osc.start(t)
  osc.stop(t + 0.2)
  const hiss = noiseBurst(t, { type: 'bandpass', freq: 1500, q: 2, level: 0.15, attack: 0.01, hold: 0.12, release: 0.05 })
  hiss.frequency.exponentialRampToValueAtTime(3000, t + 0.06)
  hiss.frequency.exponentialRampToValueAtTime(1200, t + 0.1)
}

const BY_DISCIPLINE = {
  graffiti: spray,
  basketball: bounce,
  dance: squeak,
  music: scratch,
}

// Program row: the sound of its discipline, a tech click for info rows
export function programSound(cat) {
  if (!ready()) return
  const t = ctx.currentTime
  const play = BY_DISCIPLINE[cat]
  if (play) play(t)
  else click(t, { tone: 2900 })
}

// Lineup name: a double tech click
export function lineupSound() {
  if (!ready()) return
  const t = ctx.currentTime
  click(t, { tone: 2000, level: 0.7, length: 0.014 })
  click(t + 0.045, { tone: 3400, level: 0.5, length: 0.01 })
}
