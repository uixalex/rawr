// Shared setup for image shaders: one OGL canvas inside a frame element,
// textures loaded from URLs, object-fit: cover with a focal point (uScale, uFocus).
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl'

export const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

export const hashGLSL = /* glsl */ `
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`

const load = (src) => {
  const img = new Image()
  img.src = src
  return img.decode().then(() => img)
}

// textures: { tName: url }. Entries with a falsy url fall back to `fallback[tName]`.
export async function createImageGL(figure, { textures, fallback = {}, fragment, uniforms = {}, focus = [0.5, 0.5] }) {
  let renderer
  try {
    renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), antialias: false, depth: false })
  } catch {
    return null
  }
  const gl = renderer.gl
  if (!gl) return null

  const names = Object.keys(textures).filter((k) => textures[k])
  const images = await Promise.all(names.map((k) => load(textures[k])))

  const texUniforms = {}
  const aspects = {}
  names.forEach((k, i) => {
    texUniforms[k] = { value: new Texture(gl, { image: images[i], generateMipmaps: false, minFilter: gl.LINEAR }) }
    aspects[k] = images[i].naturalWidth / images[i].naturalHeight
  })
  Object.entries(fallback).forEach(([k, from]) => {
    if (!texUniforms[k]) texUniforms[k] = texUniforms[from]
  })

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      ...texUniforms,
      uScale: { value: [1, 1] },
      uFocus: { value: focus },
      uAspect: { value: 1 },
      ...uniforms,
    },
  })
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

  gl.canvas.setAttribute('aria-hidden', 'true')
  figure.appendChild(gl.canvas)

  // object-fit: cover, with a focal point
  let imageAspect = aspects[names[0]]
  const resize = () => {
    const { width, height } = figure.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    const aspect = width / height
    program.uniforms.uAspect.value = aspect
    program.uniforms.uScale.value = aspect > imageAspect ? [1, imageAspect / aspect] : [aspect / imageAspect, 1]
  }
  new ResizeObserver(resize).observe(figure)
  resize()

  figure.classList.add('has-gl')

  return {
    uniforms: program.uniforms,
    imageAspect,
    // Every loaded texture by name, so a section can swap what a sampler shows
    textures: Object.fromEntries(names.map((k) => [k, texUniforms[k].value])),
    aspects,
    setAspect(a) {
      imageAspect = a
      resize()
    },
    render: () => renderer.render({ scene: mesh }),
  }
}
