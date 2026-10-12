# RAWR – Urban Culture Festival Website

## Project
One-page promo website for RAWR, a one-night urban culture festival in Munich (09/08, 21H).
Disciplines: graffiti, music, dance, basketball, skateboarding.
The festival has not happened yet, so the site introduces it. No gallery.
Language: English.

Style: between poster, editorial and brutalism. The site must feel like the RAWR posters
came alive: raw black and white documentary photography, flat magenta and acid green
color on the people, heavy grain, huge italic logo, calm neutral info text.

## Working rules
- Build section by section. Show the result and wait for approval before the next section.
- Never change content, structure or styling that was not explicitly requested.
- Never invent copy. Use the placeholder content below, or ask.
- No em dashes in any copy.
- No section headings or subheadings anywhere on the site. Content stands on its own,
  like on the posters. (Visually hidden headings for screen readers are fine.)
- If unsure, ask instead of assuming.

## Tech stack
- Vite + vanilla JS (no framework)
- GSAP + ScrollTrigger for animation
- Lenis for smooth scroll
- OGL (WebGL) for image shaders and grain
- Deploy: Vercel

## Folder structure
/public/fonts        Helvetica Neue LT W1G (web files)
/public/images       image pairs (plain + color)
/src/styles          tokens.css, base.css, sections/*.css
/src/js              main.js, scroll.js, cursor.js, shaders/, sections/
index.html

## Design tokens
Colors (approximate, replace with exact values from the poster files):
--black:      #262626   main background (not pure black)
--offwhite:   #F0F0F0   text on dark, image borders
--grey:       #BDBDBD   info section background
--magenta-bg: #A93CB4   lineup section background
--green-bg:   #3CB959   tickets section background
--magenta:    #E35FE6   accent
--green:      #4FE23D   accent

Rules:
- Black is the base. Color sections appear as hits, like turning a page into a poster.
- Accents (magenta, green) are used for details, states and animations on black sections.
- Grain overlay on everything, including type. Nothing should look digitally smooth.

## Typography
Font: Helvetica Neue LT W1G only.
- Logo / big headlines: Heavy or Black, Extended, Oblique, very tight, huge scale
- Secondary / info: Medium, uppercase, wide spacing between items
- Body: Roman, regular case
Contrast between loud headlines and quiet info text is the key.

## Signature element
The small square from the RAWR logo. Used as:
- separator in marquee and lists
- custom cursor
- active / hover indicator
- blinking "REC" style mark next to the logo

## Images
Every image exists as a pair, same size, perfectly aligned:
- basketball-plain / basketball-color
- dj-plain / dj-color
- graffiti-plain / graffiti-color-a (boy right) / graffiti-color-a-grain2 / graffiti-color-b (hooded figure)
- overview-plain (whole yard: court, crowd, DJ, skate ramp; no color version yet)
Treatment: B&W, heavy grain, people colored in flat magenta + green.
Frames: thin off-white border. Some frames bleed off screen edges.
Format: WebP or AVIF, 1600 to 2000px wide.
Subject masks may be added later. Code should allow switching to mask-based effects.

## Sections (in order)
0. Nav bar, fixed (logo left, MUNICH 09/08 21H center, Tickets button right)
1. Hero (black): three frames only, no text
2. Marquee
3. About / Manifesto (black)
4. Program (black)
5. Lineup (magenta)
6. Info (grey)
7. Tickets + Newsletter (green)
8. Footer (black)

## Placeholder content

### Hero
RAWR ■ Street Art
Munich 09/08 21H
One night. Four disciplines. Zero rules.

### Marquee
GRAFFITI ■ MUSIC ■ DANCE ■ BASKETBALL ■ SKATEBOARDING ■ MUNICH ■ 09.08 ■ ONE NIGHT ONLY ■

### About
RAWR is a one-night festival of urban culture. Walls get painted, beats get dropped,
bodies move and the court never sleeps. No stages between artists and crowd.
Just the city, loud and unfiltered.

### Program (09/08)
20:00  Gates Open                        Info
21:00  Live Wall: Opening Session        Graffiti
21:30  Streetball 3v3 Tournament         Basketball
22:00  Concrete Moves: Open Cypher       Dance
22:30  Spray Workshop for Beginners      Graffiti
23:00  Breaking Battle: Final            Dance
00:00  Headliner DJ Set                  Music
02:00  Closing Session: B2B Night        Music
04:00  Lights Out                        Info

### Lineup
NOVA KRUSH ■ DJ STATIC ■ MOSS & METAL ■ KID ASPHALT ■ LOW FREQ ■ CREW 089 ■ ZERA ■ THE YARD COLLECTIVE

### Info
Venue: Yard 9, Munich (placeholder)
Date: 09.08, from 20:00
Age: 18+
Getting there: placeholder
FAQ: placeholder

### Tickets
Early Bird €25 / Regular €35 / At the door €45 (placeholder)
CTA: GET YOUR TICKET
Newsletter: Stay loud. Get lineup drops first.

### Footer
RAWR ■ Urban Culture Festival ■ Instagram / TikTok / Contact

## Animations
Goal: modern, awwwards level. No basic fades or simple slide-ins.

Core (global):
- Live grain shader over the whole site, subtle flicker, reacts slightly to cursor
- RGB split (magenta / green) on headlines and images, tied to scroll velocity
- Scramble text on times, labels and names
- Square cursor, changes color per section, expands to VIEW on images
- Logo glitch on load and hover

Per section:
- Hero: three B&W frames, color strobes on them in turn (optional beat sync),
  film boil using the two grain versions (8 to 12 fps), parallax + skew on scroll
- About: no standalone image. Each phrase of the text has its own small inline frame
  (walls, beats, bodies, court) that opens and takes color when the phrase lights up
- Program: no image, timetable only. Rows highlight on hover, times and labels scramble
- Lineup: outlined names scramble and fill on hover (no image: there are no artist photos)
- Info: overview photo of the yard next to the facts (it shows the venue)
- Footer: huge centered logo that rises from the bottom edge and glitches
- Transitions: RGB split lock-in when image goes from plain to color

Fallbacks:
- Mobile: hover effects become scroll triggered
- prefers-reduced-motion: disable strobe, boil, glitch and RGB split, keep static color images

## Performance and accessibility
- Lazy load images, preload hero only
- Pause shaders when off screen
- Strobe must stay below 3 flashes per second
- Semantic HTML, alt text on all images, keyboard accessible links
- Mobile first, test at 375px

## Build order
1. Setup, tokens, fonts, grain
2. Hero
3. Marquee + About
4. Program
5. Lineup
6. Info + Tickets + Footer
7. Cursor, transitions, polish
