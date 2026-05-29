# Neviso Frontend Skill

You are building the **Neviso (نویسو)** frontend — a Persian-language AI-powered note-taking app that turns recorded lectures and scanned notes into searchable, editable notebooks.

## Project overview

- **Language / direction**: Farsi (Persian) RTL. Every container gets `dir="rtl"`. The HTML root is `lang="fa" dir="rtl"`.
- **Tech stack**: React 18 + Babel in-browser JSX, no build step in prototyping mode. Production stack uses Vite + React + TypeScript.
- **Viewport hint**: `<meta name="viewport" content="width=1400">` (desktop) / `width=device-width` (responsive).
- **Design concept**: _Calm Academic × Modern Friendly_ — warm cream paper, deep ink, saffron accent, slightly skeuomorphic notebook / spine metaphor.

---

## Design tokens (CSS custom properties)

All tokens are defined on `:root`. Always use var(--token) — never hardcode hex values in new components.

### Surfaces

```css
--paper: #faf6ec /* main app background — warm cream */ --paper-2: #f2ebd9
  /* hover surface, subtle band */ --paper-edge: #e7dec4 /* line separator on cream */
  --card: #ffffff --card-soft: #fdfbf5;
```

### Text (ink scale)

```css
--ink: #1b1b1f /* primary */ --ink-2: #3b3a3f /* secondary */ --ink-3: #6a6766 /* muted */
  --ink-4: #9c9690 /* placeholder / disabled */;
```

### Brand

```css
--saffron: #e8a53d /* primary accent — buttons, highlights */ --saffron-deep: #b97a1e
  /* hover / pressed state */ --saffron-soft: #fbeacb /* tinted backgrounds */ --slate: #1f2937
  /* dark surfaces, page chrome */ --slate-2: #2d3748;
```

### Semantic

```css
--sage: #6b8b6e /* success / academic green */ --sage-soft: #dfead9 --ruby: #b0413e
  /* destructive */ --ruby-soft: #f6dedc --indigo: #455a8f /* info (subtle) */
  --indigo-soft: #dde3f0;
```

### Typography

```css
--font: 'Vazirmatn', system-ui, -apple-system, sans-serif;

--t-display: 700 56px/1.1 var(--font) --t-h1: 700 36px/1.15 var(--font) --t-h2: 700 28px/1.2
  var(--font) --t-h3: 600 22px/1.3 var(--font) --t-h4: 600 18px/1.35 var(--font) --t-body: 400
  15px/1.6 var(--font) --t-body-md: 500 15px/1.55 var(--font) --t-small: 400 13px/1.5 var(--font)
  --t-xs: 500 11px/1.4 var(--font);
```

### Spacing (4-base scale)

```css
--s-1: 4px --s-2: 8px --s-3: 12px --s-4: 16px --s-5: 24px --s-6: 32px --s-7: 48px --s-8: 64px;
```

### Border radius

```css
--r-xs: 6px --r-sm: 10px --r-md: 14px --r-lg: 20px --r-xl: 28px;
```

### Shadows

```css
--sh-1:
  0 1px 2px rgba(31, 27, 18, 0.06) --sh-2: 0 2px 8px rgba(31, 27, 18, 0.08),
  0 1px 2px rgba(31, 27, 18, 0.04) --sh-3: 0 12px 32px -8px rgba(31, 27, 18, 0.18),
  0 4px 12px rgba(31, 27, 18, 0.06) --sh-spine: 0 6px 16px -4px rgba(60, 40, 10, 0.22),
  inset -1px 0 0 rgba(0, 0, 0, 0.04) /* notebook spine */;
```

---

## Utility CSS classes

```css
.paper-texture   /* warm cream bg + subtle radial gradients */
.paper-ruled     /* horizontal rule lines every 28px — use inside note editors */
.btn             /* base button: inline-flex, gap 8, pad 10/18, r-md, body-md 600 */
.btn-primary     /* bg: --ink, color: --paper */
.btn-accent      /* bg: --saffron, color: --ink */
.btn-ghost       /* transparent, hover: --paper-2 */
.btn-outline     /* bg: --card, border: --paper-edge */
.chip            /* pill label: pad 4/10, r-999, t-xs 600, bg: --paper-2 */
.chip-saffron    /* bg: --saffron-soft, color: --saffron-deep */
.chip-sage       /* bg: --sage-soft, color: #3E5A3F */
.chip-ruby       /* bg: --ruby-soft, color: --ruby */
.chip-indigo     /* bg: --indigo-soft, color: --indigo */
```

---

## Icon system

Icons are thin SVG components using `currentColor` and `strokeLinecap="round"`.

```jsx
// Named usage:
<Icon name="mic" size={20} />

// Direct component usage:
<MicIcon size={20} />
<MicIcon size={20} stroke="#B97A1E" />
```

Available icons: `mic`, `camera`, `chat`, `bell`, `pdf`, `folder`, `folder-move`, `calendar`, `door`, `globe`, `lock`, `user`, `info`, `alert`, `play`, `send`, `star`, `clock`, `trash`, `books`, `sparkle` (AI), `check`, `x`, `plus`, `arrow-right`, `arrow-left`, `search`, `upload`, `download`, `edit`, `menu`, `chevron-down`.

Default props: `size=16`, `strokeWidth=2`, `fill="none"`. Use `fill="currentColor"` only for filled icons (play, star).

---

## Shared layout components

### DashHeader (desktop top bar)

```jsx
<DashHeader credits="۲۶۵" notifications={3} onUpload={fn} />
```

- Right side: Neviso logo + app name
- Left side: credit balance chip + bell icon + upload button (`.btn-accent`)
- Background: `--slate` / `--paper` depending on page type

### MTopBar (mobile, 390px)

```jsx
<MTopBar title="نام صفحه" credits="۲۶۵" back onAction={fn} />
```

- Height: 56px, background `--paper`
- Right: back chevron (if `back` prop), page title
- Left: action slot (context-specific)

### MFrame (mobile shell)

```jsx
<MFrame noNav={false}>{/* page content */}</MFrame>
```

- Full 390px width, `--paper` bg
- Bottom tab bar: داشبورد (home), پوشه‌ها (folders), آپلود (upload), چت (chat), پروفایل
- Active tab highlighted in `--saffron`
- Set `noNav` for modals / fullscreen flows

---

## Screens inventory

| #   | ID            | Title (FA)  | Key components                                                               |
| --- | ------------- | ----------- | ---------------------------------------------------------------------------- |
| 00  | foundation    | بنیان طراحی | Color swatches, type scale, notebook spine, component gallery                |
| 01  | landing       | صفحهٔ فرود  | Hero + CTA, features grid, pricing teaser — desktop 1280px + mobile 390px    |
| 02  | auth          | ورود OTP    | Phone step → OTP step → optional password; split layout on desktop           |
| 03  | dashboard     | داشبورد     | Folder card grid (notebook covers with colored spines), credit display       |
| 04  | folder        | جزئیات پوشه | Note list with filter chips, folder actions, sort                            |
| 05  | upload        | آپلود       | 4-step flow: file pick → folder+date → uploading → processing (saffron glow) |
| 06  | editor        | ویرایشگر    | Centered column, `.paper-ruled` bg, rich toolbar, audio player docked bottom |
| 07  | chatbot       | چت‌بات      | Folder selector, context chips, message thread, source citations             |
| 08  | notifications | اعلان‌ها    | Slide-in panel 420px, processing status (success/error/unread)               |
| 09  | plans         | شارژ اعتبار | Credit purchase cards, Iranian payment gateway (no recurring subscription)   |
| 10  | profile       | پروفایل     | Account info, optional password, language/font toggles                       |
| 11  | new-folder    | پوشهٔ جدید  | Modal (desktop) / bottom sheet (mobile), spine color picker, name input      |

---

## Notebook / folder metaphor rules

Folders are rendered as notebook book covers:

- **Spine**: colored vertical bar (right side in RTL), uses `--sh-spine` shadow
- **Cover**: warm card background with title + note count chip
- **Spine colors**: pick from saffron, sage, ruby, indigo, slate or user-custom hex
- **Card ratio**: ~4:3 (e.g. 180×240px in grid view)
- Hover lifts the card: `transform: translateY(-4px)`, `--sh-3`

---

## RTL / Persian implementation rules

1. **Always** set `dir="rtl"` on every top-level container and on the `<html>` element.
2. Use **Vazirmatn** at all weights (300–700). Import via `@font-face` or Google Fonts CDN.
3. Persian numerals in UI copy: `۰۱۲۳۴۵۶۷۸۹` (not 0–9). Use `toLocaleString('fa-IR')` or hardcode in fixtures.
4. Dates: Persian calendar (Jalali). Display as `۲۵ آبان ۱۴۰۳`.
5. Text alignment defaults to `right` (RTL handles this automatically — don't override with `text-align: right` explicitly; set `dir`).
6. Flexbox rows flow right-to-left: `flex-direction: row` + `dir="rtl"` puts the first item on the right.
7. Logical CSS properties (`margin-inline-start`, `padding-inline-end`) are preferred over `margin-left`/`right` in new code.
8. Icons that point directionally (arrows, chevrons) must be mirrored: add `transform: scaleX(-1)` to left-pointing arrows when used in RTL back-navigation.

---

## Upload & processing states

The upload flow uses a 4-step progress indicator (`StepDots`):

1. **انتخاب فایل** — drag-drop zone + file type chips (audio .mp3/.m4a, image/PDF)
2. **پوشه و تاریخ** — folder selector dropdown + Persian date picker
3. **در حال آپلود** — progress bar, animated saffron glow `box-shadow: 0 0 24px var(--saffron)`
4. **آپلود کامل / در حال پردازش** — pulsing saffron ring, AI processing indicator

---

## AI chatbot interface

- Left column (240px): folder/source selector with checkboxes + context size indicator
- Right column: message thread
- User bubbles: `--saffron-soft` bg, `--ink` text, align right
- AI bubbles: `--card` bg, `--sh-2` shadow, align left
- Citations appear as `<span class="chip chip-indigo">` inline within AI responses
- Bottom: textarea + send button + context toggle

---

## Implementation checklist for new screens

- [ ] `dir="rtl"` on root container
- [ ] `fontFamily: 'var(--font)'` set (don't rely on body inheritance in inline styles)
- [ ] `background: 'var(--paper)'` + optionally `className="paper-texture"`
- [ ] Desktop: include `<DashHeader>` at top
- [ ] Mobile (390px): wrap in `<MFrame>` with `<MTopBar>`
- [ ] All text uses ink scale tokens, not hardcoded colors
- [ ] Buttons use `.btn` + variant class (no custom button CSS without strong reason)
- [ ] Status/category labels use `.chip` + color variant
- [ ] Folder cards follow notebook spine metaphor

---

## What NOT to do

- Do not use English in UI copy — all visible text is Farsi.
- Do not use Latin numerals in dates, counts, or currency — use Persian digits.
- Do not use `margin-left`/`padding-left` for RTL-sensitive spacing — use logical properties or `margin-inline-start`.
- Do not add `dir="ltr"` anywhere except code blocks or technical identifiers.
- Do not create custom button or chip styles — extend the existing `.btn`/`.chip` system.
- Do not use images as folder covers by default — the notebook-spine metaphor uses CSS color only.
- Do not add subscriptions or recurring billing UI — the monetization model is credit-based (pay per use).
