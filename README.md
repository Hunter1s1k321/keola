# Keola — Senja ke Fajar

A small love letter for Keola, live at **https://keola.netlify.app**.

The page is one scroll from dusk to dawn: a gate that starts the song (*Firasat* — Marcell),
then six chapters — **Senja** (hero), **Surat** (the letter), **Jarak** (a thread of light from
"aku" to "kamu"), **Kenangan** (the photos as a horizontal film), **Tentang** (about Keola) and
**Fajar** (the ending). The stars, fireflies and petals on the background breathe with the music.

## Layout

```
keolahtml/            ← the site Netlify publishes (static, no build)
  index.html
  css/tokens.css      ← generated, do not edit by hand
  css/main.css
  js/main.js          ← GSAP 3.13 + ScrollTrigger + SplitText, native scrolling
  assets/img|video|audio|icons, og.jpg
design/               ← design source of truth (not published)
  docs/brand-guidelines.md       palette, type, voice, motion rules
  assets/design-tokens.*         brand colour scales (brand skill sync)
  tokens.extra.json              night palette, type, space, motion, components
  build-tokens.cjs               merges both → keolahtml/css/tokens.css
  design-system/keola/           ui-ux-pro-max MASTER.md + page override
  banners/                       OG (1200×630) and story (1080×1920) sources + PNGs
docs/legacy/          ← notes from the first version
```

## Editing

- **Words**: everything is in `keolahtml/index.html`.
- **Colours / fonts / spacing**: edit `design/docs/brand-guidelines.md` or `design/tokens.extra.json`, then
  ```bash
  cd design
  node ~/.claude/skills/brand/scripts/sync-brand-to-tokens.cjs --force
  node build-tokens.cjs
  ```
- **Preview locally**: `python -m http.server 5517 --directory keolahtml` and open http://localhost:5517
  (opening the file directly works too, but the music visualiser only reacts to the song over http).

## Motion & accessibility

Devices that ask for reduced motion (Windows "Animation effects" off, iOS "Reduce Motion") get a calm,
fully readable version. The gate offers **"Nyalakan animasi penuh"** to opt into the full motion;
the choice is remembered, and `?gerak=penuh` in the URL forces it too.
