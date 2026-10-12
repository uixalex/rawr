// Image frame shader: plain / color mix, RGB split (magenta / green), film boil (uBoil),
// grain (uGrain), a slice glitch, and a crossfade to a next image (tNext, uFade).
// Built on image pairs now; a subject mask texture can be added later as tMask.
import { createImageGL, hashGLSL } from './image-gl.js'

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tPlain;
  uniform sampler2D tColor;
  uniform sampler2D tColor2;
  uniform sampler2D tNext;
  uniform vec2 uScale;
  uniform vec2 uFocus;
  uniform vec2 uScaleNext;
  uniform vec2 uFocusNext;
  uniform float uAspect;
  uniform float uFade;
  uniform float uColor;
  uniform float uAlt;
  uniform float uSplit;
  uniform float uSeed;
  uniform float uBoil;
  uniform float uGrain;
  uniform float uGlitch;
  varying vec2 vUv;

  ${hashGLSL}

  vec3 sampleAt(vec2 uv) {
    vec3 plain = texture2D(tPlain, uv).rgb;
    vec3 color = mix(texture2D(tColor, uv).rgb, texture2D(tColor2, uv).rgb, uAlt);
    return mix(plain, color, uColor);
  }

  void main() {
    // Film boil: the frame shivers by a fraction of a pixel per boil frame
    vec2 jitter = (vec2(hash(vec2(uSeed, 3.1)), hash(vec2(uSeed, 7.7))) - 0.5) * 0.003 * uBoil;
    vec2 uv = vUv * uScale + (1.0 - uScale) * uFocus + jitter;

    // Slice glitch: horizontal bands of random height tear sideways
    float band = floor(vUv.y * mix(6.0, 28.0, hash(vec2(uSeed, 1.3))));
    float r = hash(vec2(band, uSeed));
    float tear = step(1.0 - uGlitch * 0.9, r) * (r - 0.5) * 0.18 * uGlitch;
    uv.x += tear;

    // Red right, green left: fringes read as magenta and green
    vec2 o = vec2(uSplit + abs(tear) * 0.35, 0.0);
    vec3 c = vec3(sampleAt(uv + o).r, sampleAt(uv - o).g, sampleAt(uv).b);

    // Crossfade to the next image, with its own cover crop
    if (uFade > 0.0) {
      vec2 uvN = vUv * uScaleNext + (1.0 - uScaleNext) * uFocusNext + jitter;
      uvN.x += tear;
      vec3 next = vec3(texture2D(tNext, uvN + o).r, texture2D(tNext, uvN - o).g, texture2D(tNext, uvN).b);
      c = mix(c, next, uFade);
    }

    c += (hash(gl_FragCoord.xy + uSeed * 13.0) - 0.5) * uGrain;
    gl_FragColor = vec4(c, 1.0);
  }
`

// textures: { name: url } for every image the frame can show.
// show({ plain, color, color2 }) points the samplers at loaded textures by name,
// setNext(name, focus) picks the image uFade crossfades to.
export async function createFrame(figure, { textures, initial, focus }) {
  const frame = await createImageGL(figure, {
    textures,
    fragment,
    focus,
    uniforms: {
      tPlain: { value: null },
      tColor: { value: null },
      tColor2: { value: null },
      tNext: { value: null },
      uScaleNext: { value: [1, 1] },
      uFocusNext: { value: [0.5, 0.5] },
      uFade: { value: 0 },
      uColor: { value: 0 },
      uAlt: { value: 0 },
      uSplit: { value: 0 },
      uSeed: { value: 0 },
      uBoil: { value: 1 },
      uGrain: { value: 0.07 },
      uGlitch: { value: 0 },
    },
  })
  if (!frame) return null

  const u = frame.uniforms

  // object-fit: cover scale for an image of aspect a in the current frame
  const coverScale = (a) => {
    const aspect = u.uAspect.value
    return aspect > a ? [1, a / aspect] : [aspect / a, 1]
  }

  let nextAspect = 1
  frame.show = ({ plain, color, color2 }) => {
    u.tPlain.value = frame.textures[plain]
    u.tColor.value = frame.textures[color]
    u.tColor2.value = frame.textures[color2 || color]
    frame.hasAlt = Boolean(color2)
    frame.setAspect(frame.aspects[plain])
  }
  frame.setNext = (name, focus) => {
    u.tNext.value = frame.textures[name]
    u.uFocusNext.value = focus
    nextAspect = frame.aspects[name]
  }
  // Call before render: keeps the next image's crop right after resizes
  frame.updateNext = () => {
    u.uScaleNext.value = coverScale(nextAspect)
  }

  frame.show(initial)
  frame.setNext(initial.plain, focus)
  return frame
}
