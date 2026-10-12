# Brand Guidelines — Keola v2.0 "Senja ke Fajar"

> Last updated: 2026-10-12
> Status: Approved for keola.netlify.app redesign

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #D4949B |
| Secondary Color | #E8B57A |
| Accent Color | #C77051 |
| Display Font | Cormorant Garamond |
| Script Font | Great Vibes (nama & tanda tangan saja) |
| Label Font | Jost |
| Voice | Lembut, tulus, hangat, pelan |

The palette is pulled from the photos and videos themselves: warm skin tones
(#CBACA3, #B49186), café terracotta (#C77051), candle-gold highlights (#C48D58)
and the deep night of the second video (#131613). Pink stays, but as a dusty
"senja" rose rather than candy pink, so the photos look warm instead of washed out.

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Rose Senja | #D4949B | rgb(212,148,155) | Headings accent, links, focus ring, glow |
| Rose Senja Dark | #8A5560 | rgb(138,85,96) | Hover / pressed on light (dawn) sections |
| Rose Senja Light | #F2D3D3 | rgb(242,211,211) | Soft fills, petals, highlights on dark |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Cahaya Lilin | #E8B57A | rgb(232,181,122) | Candle light, stars, quote highlight |
| Cahaya Lilin Dark | #C48D58 | rgb(196,141,88) | Gold on dawn background |
| Cahaya Lilin Light | #F7DDB8 | rgb(247,221,184) | Firefly cores, shimmer |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Bara Terakota | #C77051 | rgb(199,112,81) | Rare warm accent: heart, progress, CTA glow |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Tinta Malam | #120D16 | rgb(18,13,22) | Deepest night background |
| Malam Plum | #1E1522 | rgb(30,21,34) | Night surface |
| Senja Ungu | #3A2836 | rgb(58,40,54) | Dusk sky band, card borders |
| Mauve | #6E5262 | rgb(110,82,98) | Horizon, dividers |
| Krem Surat | #F7EDE6 | rgb(247,237,230) | Body text on night |
| Kabut | #C9B6B9 | rgb(201,182,185) | Secondary text on night |
| Fajar | #F8E6DF | rgb(248,230,223) | Dawn background (finale) |
| Tinta Fajar | #3A2430 | rgb(58,36,48) | Text on dawn background |

### Accessibility

- Krem Surat on Tinta Malam: 16.6:1 (AAA)
- Kabut on Tinta Malam: 9.9:1 (AAA)
- Rose Senja on Tinta Malam: 7.8:1 (AAA)
- Cahaya Lilin on Tinta Malam: 10.3:1 (AAA)
- Tinta Fajar on Fajar: 11.8:1 (AAA)
- Rose Senja Dark on Fajar: 4.9:1 (AA) — links/labels on dawn
- Bara Terakota on Tinta Malam: 5.4:1 (AA) — accents only, never body text

---

## 2. Typography

### Font Stack

```css
--font-display: 'Cormorant Garamond', 'Times New Roman', serif;
--font-script: 'Great Vibes', 'Cormorant Garamond', cursive;
--font-label: 'Jost', system-ui, sans-serif;
```

Pairing source: ui-ux-pro-max typography "Wedding/Romance" (Great Vibes +
Cormorant), with Jost added for small uppercase labels where a thin serif
would get lost at 12–14px.

### Type Scale (fluid)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Name (script) | clamp(4.5rem, 16vw, 13rem) | 400 | 0.9 |
| Chapter title | clamp(2.5rem, 7vw, 5.5rem) | 300 italic | 1.05 |
| Letter text | clamp(1.35rem, 2.6vw, 2.1rem) | 400 | 1.55 |
| Body | 1.125rem (18px) | 500 | 1.7 |
| Label | 0.75rem, tracking 0.32em, uppercase | 400 | 1.4 |

---

## 3. Logo Usage

Monogram "K" set in Cormorant Garamond italic inside a thin crescent ring
(a moon at dusk). Files: `design/assets/monogram.svg`, favicon `keolahtml/assets/icons/favicon.svg`.

- Minimum size: 24px (favicon), 32px in UI
- Only on Tinta Malam or Fajar backgrounds, in Krem Surat or Rose Senja
- Never add drop shadows; a soft glow (Rose Senja at 35%) is the only effect

---

## 4. Voice & Tone

| Trait | Description | Do | Don't |
|-------|-------------|-----|-------|
| Lembut | Quiet, unhurried | "Pelan-pelan saja, Kei." | Exclamation marks, CAPS |
| Tulus | Plain, honest words | Keep the original letter as written | Inflated poetry, clichés |
| Hangat | Personal, aku–kamu | Bahasa Indonesia, a little English where it was already used | Formal "Anda" |
| Pelan | Room to breathe | One idea per screen | Walls of text, busy UI |

Context: chapter labels are short Indonesian words (Senja, Surat, Jarak,
Kenangan, Fajar). English is kept only where the author already wrote it.

---

## 5. Motion Principles

- Slow in, slower out: reveals 1.2–1.8s, `expo.out` / `power2.out`
- Scroll-scrubbed storytelling with at most 2 pinned scenes per page
- Ambient motion breathes with the song (Web Audio analyser), never flashes
- `prefers-reduced-motion`: no smooth-scroll, no scrub, no particles drift — final readable state immediately
