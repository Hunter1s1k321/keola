# Page override — index (single page)

> Overrides `../MASTER.md`. MASTER suggested "Hero + Testimonials + CTA" / "Soft UI Evolution",
> which fits a product page, not a love letter. The searches below replaced it.

## Pattern
- `scroll-triggered-storytelling` (landing): Intro hook → chapters → climax. Progress indicator, narrative readable without effects.
- `horizontal-scroll-journey` (landing): used only for the gallery chapter; vertical fallback on mobile and reduced motion.
- Narrative arc from the **slides** skill strategy "Nancy Duarte Sparkline" (tension → release → tension → release → new bliss):

| # | Chapter | Beat | Sky |
|---|---------|------|-----|
| 0 | Gerbang (gate) | hook | dusk, still |
| I | Senja (hero) | what is: warmth at dusk | dusk rose → plum |
| II | Surat (letter) | what could be: gratitude | plum night |
| III | Jarak (distance) | what is: the distance | deepest night, 1 pinned scene |
| IV | Kenangan (gallery) | what could be: the memories | night, 1 pinned horizontal scene |
| — | Malam (video) | breath | black, sticky film frame |
| V | Tentang (about) | release | pre-dawn mauve, petals |
| VI | Fajar (finale) | new bliss | dawn cream/blush/gold |

## Style
- `parallax-storytelling` + `aurora-ui` (style domain). 3–4 parallax layers max; the aurora glow is baked into the sky gradients (static, no blend mode).
- Typography: "Wedding/Romance" pairing (Great Vibes + Cormorant) + Jost labels — see brand guidelines.
- Colours: `design/docs/brand-guidelines.md` → tokens (`keolahtml/css/tokens.css`). No raw hex in components except glows built from tokens.

## Motion (gsap domain)
- Scroll reveal (Complex): scrub 1–1.5, pin ≤ 2 sections.
- Stagger (Complex): SplitText only on short headlines; long letter text is word-split and opacity-scrubbed, never moved.
- Parallax (Standard): decorative layers only, yPercent ≤ 15, never body copy.
- Performance budget (Opera GX on a 144 Hz hybrid-graphics laptop lagged with the first build): native scrolling (no Lenis), GSAP ticker capped at 60 fps, one ambient loop at 30 fps (canvas at CSS-pixel resolution, auto "lite" below 40 fps), no CSS filters / backdrop blur / blend modes, no animated clip-path, at most 3 full-screen fixed layers (sky, canvas, vignette+grain).
- Ambient canvas: stars, fireflies, petals; level driven by Web Audio analyser of the song.

## UX rules applied (ux domain)
- Reduced motion: final state immediately, no pins, static canvas.
- Autoplay media: song starts only from the gate button; persistent pause control; videos muted, play only in view, with pause button.
- Lightbox: native `<dialog>`, visible focus, Esc/arrow keys, swipe.
- Images: WebP, srcset 800/1600, width/height set (CLS), lazy below the fold.
- Touch targets ≥ 48px, no hover-only info.
