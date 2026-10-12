// Converts the source PNG/JPG files in /assets to WebP in /public/images,
// using the pair names from CLAUDE.md. Run: npm run images
import sharp from 'sharp'
import { mkdirSync, existsSync } from 'node:fs'

const map = {
  'Framsade 45.png': 'basketball-plain',
  'Frame 45.png': 'basketball-color',
  'Gemini_Generated_Image_e6ee2ke6ee2ke6ee.jpg': 'dj-plain',
  'Gemini_Generated_Image_e6ee2ke6ee2ke6ee.png': 'dj-color',
  'Gemini_Generated_Image_vwsmjqvwsmjqvwsm 1.png': 'graffiti-plain',
  'Gemini_Generatefasfafsafd_Image_vwsmjqvwsmjqvwsm 1.png': 'graffiti-color-a',
  'jaj 1.png': 'graffiti-color-a-grain2',
  'jaj221.png': 'graffiti-color-b',
  'Gemini_Generated_Image_59iozy59iozy59io.jpg': 'overview-plain',
  'Gemini_Generated_Image_a99aa0a99aa0a99a.jpg': 'skate-plain',
  'Gemini_Generated_Image_a99aa0a99aa0a99a.png': 'skate-color',
  'place-info.jpg': 'place-empty',
}

mkdirSync('public/images', { recursive: true })

for (const [src, name] of Object.entries(map)) {
  if (!existsSync(`assets/${src}`)) {
    console.log(`skip ${name}: assets/${src} not found`)
    continue
  }
  const out = `public/images/${name}.webp`
  // Sources are below 1600px wide, so never upscale.
  const info = await sharp(`assets/${src}`)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(out)
  console.log(`${name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`)
}
