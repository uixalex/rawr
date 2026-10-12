// Live film grain over the whole site.
// Fullscreen OGL canvas, blended with mix-blend-mode: overlay (see base.css).
// Flickers at a film-like frame rate and gets slightly heavier near the cursor.
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uSeed;
  uniform float uIntensity;
  uniform float uCursorBoost;
  uniform float uGrainSize;
  varying vec2 vUv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uGrainSize);
    vec2 s = vec2(uSeed * 17.13, uSeed * 31.71);

    // Two samples averaged: softer, more photographic than pure white noise
    float n = (hash(cell + s) + hash(cell * 1.37 + s.yx)) * 0.5;

    // Slight frame-to-frame exposure flicker
    float flicker = (hash(vec2(uSeed, 1.0)) - 0.5) * 0.02;

    // Heavier grain near the cursor
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    float d = distance(vUv * aspect, uMouse * aspect);
    float boost = 1.0 + uCursorBoost * smoothstep(0.35, 0.0, d);

    float g = 0.5 + (n - 0.5) * uIntensity * boost + flicker;
    gl_FragColor = vec4(vec3(g), 1.0);
  }
`

export function createGrain({
  intensity = 0.22,
  cursorBoost = 0.3,
  grainSize = 1.5,
  fps = 12,
} = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Grain lives in device-independent pixels, no need for high DPR
  const renderer = new Renderer({ dpr: 1, alpha: false, antialias: false, depth: false })
  const gl = renderer.gl
  gl.canvas.classList.add('grain')
  gl.canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(gl.canvas)

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uResolution: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uSeed: { value: 0 },
      uIntensity: { value: intensity },
      uCursorBoost: { value: reduced ? 0 : cursorBoost },
      uGrainSize: { value: grainSize },
    },
  })
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

  const render = () => renderer.render({ scene: mesh })

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height]
    render()
  }
  window.addEventListener('resize', resize)
  resize()

  // Static grain only when the user prefers reduced motion
  if (reduced) return { destroy: () => gl.canvas.remove() }

  const target = [0.5, 0.5]
  const mouse = program.uniforms.uMouse.value
  window.addEventListener('pointermove', (e) => {
    target[0] = e.clientX / window.innerWidth
    target[1] = 1 - e.clientY / window.innerHeight
  })

  let raf = 0
  let last = 0
  const frameTime = 1000 / fps

  const tick = (t) => {
    raf = requestAnimationFrame(tick)
    // Ease the cursor every rAF, but only redraw grain at film frame rate
    mouse[0] += (target[0] - mouse[0]) * 0.08
    mouse[1] += (target[1] - mouse[1]) * 0.08
    if (t - last < frameTime) return
    last = t
    program.uniforms.uSeed.value = (program.uniforms.uSeed.value + 1) % 1000
    render()
  }

  const start = () => { if (!raf) raf = requestAnimationFrame(tick) }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
  start()

  return {
    program,
    destroy() {
      stop()
      gl.canvas.remove()
    },
  }
}
