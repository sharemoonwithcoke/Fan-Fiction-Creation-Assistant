# Fanfic Cottage — Design System

A warm, British-cottage reimagining of the **同人创作助手 / Fan-Fiction Creation Assistant** platform — a full-stack tool for fan-fiction creators that turns story text into shareable images, generates fake forum / social-media screenshots, and builds playable visual novels.

The original product ships as a **React 18 web app**, a **Taro 4 WeChat Mini Program**, and a **Fastify 4 backend** — sharing ~70% of business logic through a `@fanfic/shared` package. The default visual identity is a clean, sky-blue Tailwind palette (functional, neutral). This design system replaces that with a **warm, fluffy, English-cottage** identity: clotted-cream paper, walnut ink, claret accents, hedgerow sage, and old-style serifs you'd find in a well-loved Penguin Classics paperback.

---

## Sources

This design system was synthesised from a single attached repository — no Figma or other materials were provided.

- **GitHub:** [`sharemoonwithcoke/Fan-Fiction-Creation-Assistant`](https://github.com/sharemoonwithcoke/Fan-Fiction-Creation-Assistant) (default branch `claude/stoic-mayer-nvTjp`)
  - Read in full: `README.md`, `packages/web/src/**` (App, Layout, Button, Input, Login, Dashboard, Projects, TextToImage, ForumPost, VisualNovel)
  - Tailwind config (`primary` = sky-blue scale) — discarded in this redesign in favour of the cottage palette below.
- **Imported file copies** under `packages/web/` in this project for reference while building UI kits.

> If you have access to the repository above, browse the imported pages (`packages/web/src/pages/*`) to understand the screen-by-screen functionality. The product is Chinese-first (zh-CN copy throughout); this design system preserves the Simplified-Chinese typography pairing.

---

## Product surfaces represented

The web app has these top-level routes:

| Route | Chinese label | Function |
|---|---|---|
| `/` | 首页 | Dashboard — greet the creator, three feature tiles, recent projects |
| `/projects` | 我的项目 | All saved projects across the three tools |
| `/text-to-image` | 文字成图 | Convert story text → polished social-media images (Weibo / Xiaohongshu / custom) |
| `/forum-post` | 论坛截图 | Generate realistic forum / Twitter / Weibo thread screenshots |
| `/visual-novel` | 视觉小说 | Branching visual novels driven by Ink scripts — script editor, play viewport, 5 save slots |
| `/login`, `/register` | 登录 / 注册 | Email + password; guest-mode JWT migration on signup |

The **Mini Program** mirrors the same four feature pages with mobile chrome — not covered by this design system pass.

---

## Content fundamentals

The product copy is **Chinese-first** (Simplified, mainland conventions). Tone is **warm, encouraging, slightly literary** — a peer who reads fan-fic, not a brand voice.

### Voice & tone

- **Address the user as 你** ("you", informal). The dashboard literally opens with `你好，{nickname}！` ("Hello, {nickname}!"). Never the formal 您.
- **Encouraging, never prescriptive.** Existing copy says 选择一个工具开始创作 ("pick a tool to start creating") — an invitation, not an instruction.
- **Light, slightly playful, but not jokey.** Default placeholder text in the visual-novel editor is 旁白：这是一个宁静的午后 ("Narration: It was a quiet afternoon."), which sets the cosy register.
- **Specific over generic.** Project type chips read 文字成图 / 论坛截图 / 视觉小说 — descriptive nouns, not vague labels like "Tools" or "Content".

### Casing & punctuation

- **No SHOUTY caps.** Chinese has no case so the question doesn't arise; in the bilingual surfaces (login, brand mark) Title Case for English headlines, sentence case for buttons.
- **Use Chinese punctuation in Chinese sentences** — full-width comma 、 ， and ellipsis ……. Don't mix half-width and full-width.
- **Em-dash for asides**, never two hyphens.
- **Numerals are half-width** even in Chinese sentences: `5 个存档槽`, not `五个存档槽`.

### Vocabulary patterns

- Action buttons are 2-character verbs: 保存 (save), 导出 (export), 删除 (delete), 登录 (sign in), 注册 (register), 退出 (sign out).
- Feature names are 4-character compound nouns: 文字成图, 论坛截图, 视觉小说.
- Empty states are warm and gentle: 还没有项目 ("no projects yet") followed by 前往工具页面创建第一个项目 ("head to a tool page to make your first one") — never "Click here" instruction-speak.
- Confirms use a question mark + bracketed title: `确认删除「{title}」？`.

### Emoji & symbol use

- The original dashboard uses **3 emoji** as feature icons (🖼 💬 🎮). In the cottage redesign these are replaced with **monochrome line illustrations** rendered as SVG (see `assets/icons/` and the ICONOGRAPHY section). Emoji are **not** part of the brand.
- Engagement counts on forum posts inherit platform-specific emoji (👍 💬 ❤️ 🔁) because they're recreating real platforms — leave those alone; they read as platform skeuomorphism, not as our voice.
- Tab labels in the visual-novel editor use a few symbol prefixes (▶ 📝 🎨) — in the cottage redesign we use small inline SVGs instead.

### English specimen copy (for slides / marketing surfaces)

> *Tell the story you can't put down.*
> A snug parlour for fan-fiction makers — turn your prose into postcards, mock the forum threads of your dreams, and stage visual novels by lamplight.

---

## Visual foundations

The system is **paper-first**: every surface is a piece of warm, faintly textured stationery. Furniture sits on top — never glass-morphic, never glowing.

### Palette

| Group | Token | Hex | Use |
|---|---|---|---|
| **Paper** | `--paper-cream` | `#FBF6EC` | Page background — clotted-cream parchment |
|  | `--paper-oat` | `#F4EADA` | Secondary surfaces, sunken panels |
|  | `--paper-linen` | `#EADFC8` | Tertiary fills, table stripes |
|  | `--paper-tea` | `#E0D2B7` | Dividers, faint washes |
| **Ink** | `--ink-walnut` | `#3D2A1F` | Primary text |
|  | `--ink-cocoa` | `#5C3D2A` | Secondary text |
|  | `--ink-tea-stain` | `#8C6F4C` | Captions, metadata |
|  | `--ink-mist` | `#B49E7E` | Placeholder, disabled |
| **Claret** (primary accent) | `--claret` | `#8A2C2C` | Buttons, links, brand mark — a deep tea-rose / postbox red |
|  | `--claret-deep` | `#6E1F1F` | Pressed / hover state |
|  | `--rose-dusty` | `#C2725F` | Warm secondary — dried-rose petal |
|  | `--rose-blush` | `#E4B8A8` | Soft fills, selection |
| **Hedgerow** | `--sage` | `#7C8B5C` | Secondary accent, success |
|  | `--sage-deep` | `#4D5B3C` | Forest moss — deep success / category chips |
| **Honey** | `--honey` | `#C89B3C` | Highlights, badges, mustard tea-cosy |
| **Damson** | `--plum` | `#6B4B6E` | Rare emphasis — never primary |
| **Night** | `--slate-night` | `#2D3A4C` | Only used inside the visual-novel "dialogue box" component (its dark mode) |

**Vibe note:** every shadow is *walnut-tinted*, never grey. Every neutral has yellow/red in it — there are **no cool greys** anywhere in the system.

### Typography

- **Display: Cormorant Garamond** (400/500/600/700, italics) — high-contrast old-style English serif. Used for headlines, hero titles, dialogue character plates.
- **Body: Lora** (400/500/600/700, italics) — well-balanced reading serif. Used for paragraphs, UI labels, body copy.
- **Accent: Caveat** (500/600/700) — handwritten warmth, like marginalia in a library book. Used sparingly for taglines, quoted asides, "made by hand" moments. Never in dense UI.
- **Mono: JetBrains Mono** (400/500) — for Ink script editor and code blocks.
- **CJK: Noto Serif SC** (400/500/600/700) — pairs with Lora for Simplified Chinese. The font stacks in `colors_and_type.css` fall through to `Songti SC` then Georgia, so the system renders gracefully on Chinese-only devices.

> **Substitution flag:** All four families are loaded from Google Fonts (free, ubiquitous). If a custom display face is later licensed (e.g. *Garamond Premier Pro*, *Mrs Eaves XL*, or a bespoke serif from Klim / Commercial Type), drop the `.woff2` into `fonts/` and update the `--font-display` token in `colors_and_type.css`. **Cormorant Garamond is the recommended free stand-in for Garamond/Caslon classics.**

### Backgrounds & textures

- The page-level background is `--paper-cream` overlaid with a subtle **paper-grain SVG turbulence** (`--grain` token). Always-on, fixed attachment, ~3-5% opacity. It is what makes the system feel cosy.
- No full-bleed photography in chrome. Imagery (when present) is illustrative — see ICONOGRAPHY.
- **No gradients used as decoration.** The only gradients in the system are *protection gradients* (vertical fades) over the visual-novel dialogue box to keep text readable against arbitrary background scenes — and even those are warm walnut → transparent.

### Borders & dividers

- **Single hairline:** `1px solid var(--border)` — parchment edge.
- **Double rule** (`.rule-double`): two 1px walnut lines with a 3px gutter — used to separate sections in long-form text, like a chapter break.
- **Decorative diamond divider** (◆): a single 8px walnut diamond between two short hairlines — used as a section-end ornament.
- Borders are **always warm-tan**, never grey or near-black.

### Shadows

- All shadows are **walnut-tinted** (`rgba(61, 42, 31, …)`), not black. They feel like a card sitting on a wooden desk.
- Five tiers: `sm` / `md` / `lg` / `xl` / `inner`. Plus one specialty:
  - `--shadow-wax`: a 2px hard offset (`0 2px 0 var(--claret-deep)`) plus a soft blur — used on the **primary "wax-seal" button** to give it that pressed-into-the-page feel.

### Corner radii

- Cards & big panels: **14-20px** (a paperback corner softened by use).
- Inputs & small buttons: **8-10px**.
- Pills & badges: full radius.
- The visual-novel dialogue box is configurable (0-24px) per the spec — leave that exposed as a user setting.

### Cards

- Soft cream background (`--bg-elevated`, `#FFFCF5`) — slightly lighter than the page.
- Hairline `var(--border)` edge — always visible, not just on hover.
- `var(--shadow-md)` at rest; lifts to `var(--shadow-lg)` on hover.
- Title in Cormorant Garamond display, body in Lora. The title scale is one notch larger than the surrounding paragraph type — feels like a printed catalogue card.

### Hover / press states

- **Hover (links / cards / nav):** colour shift toward the claret-deep token; faint background wash (`--accent-soft` or `--paper-oat`). **No scale transforms** — this is a paper system, things don't grow.
- **Press (buttons):** translate-y by 2px so wax-seal shadow disappears; switch from `--shadow-wax` to `--shadow-press` (inset). Gives an audible "stamp" feel.
- Focus rings are **2px claret outline with a 2px paper-cream gap** — visible but warm, not the OS-default blue.

### Animation

- Transitions are **slow and gentle** (`var(--dur-2)` 200ms / `var(--dur-3)` 320ms).
- Easing is `cubic-bezier(0.22, 0.61, 0.36, 1)` — `--ease-out`. Never bouncy, never spring.
- **Fades and crossfades** are the dominant motion language. Use `opacity` and small `translate-y`s (max 4px). No big slides.
- The only "stamp" motion is the press state on the primary button (described above).
- Page transitions (in the prototype) are a slow 320ms crossfade.

### Use of transparency & blur

- **Almost never used.** This system is *paper*, not glass. The two exceptions:
  1. **Modal backdrop:** `rgba(61, 42, 31, 0.55)` — walnut-tinted scrim, no blur. (You can read what's behind it as if through tinted tracing paper.)
  2. **Visual-novel dialogue box:** has a configurable `opacity` (0.3-1.0) as part of the user-facing style controls. Leave it alone.

### Layout rules

- Page widths max at **1100px** for content surfaces (dashboard, projects). Editor surfaces (text-to-image, forum-post, visual-novel) are full-width with a fixed **320px control rail** on the right.
- Vertical rhythm uses the **4px grid** in `--space-*` tokens. Most card padding is 24px; section gutters are 48-64px.
- Sticky header (56px tall) on all authenticated pages. Sits on top of the page grain.
- Empty states are **centred and quiet** — a small inline illustration, one display-serif headline, one italic Lora subtitle, one button. No more.

### Imagery / illustration palette

When imagery is needed (empty states, marketing, slide decks), use **monochrome line illustrations** in `--ink-cocoa` on cream, with a single **claret** or **honey** spot-colour accent. Think: 1920s book endpaper, Edward Ardizzone pen-and-ink, *The Wind in the Willows* chapter-head decorations. **Never** generate AI-photo realistic imagery. **Never** use full-bleed photography.

Photography, if licensed later, should be **warm-toned** (yellow/red cast, slight grain, never cool/teal) and ideally analogue — film stocks like Portra 400 or Tri-X.

---

## Iconography

The original product uses **3 emoji** (🖼 💬 🎮) as feature icons and a few inline platform-emoji on forum posts (👍 💬 ❤️ 🔁). The cottage redesign **removes emoji from the brand chrome** and replaces them with a curated icon set.

### Icon system

We use **[Lucide](https://lucide.dev/)** from CDN — `<script src="https://unpkg.com/lucide@latest"></script>` — as the primary icon set. Lucide is:

- **Outline / stroked, 1.5px stroke weight** — matches the pen-and-ink illustration register.
- **24px viewBox**, rendered at 16-24px in UI.
- Free, MIT-licensed, ~1400 icons.

> **Substitution flag:** The original repo had **no in-house icon set, no SVG sprite, no icon font**. Lucide is therefore a substitution chosen for visual fit — there's no "official" icons to defer to. If a custom hand-drawn set is later commissioned (which would be ideal for the brand), drop the SVGs into `assets/icons/` and replace the Lucide refs.

### Specific icon mappings (replacing emoji)

| Emoji in source | Cottage replacement (Lucide name) |
|---|---|
| 🖼 (text-to-image feature card) | `image` |
| 💬 (forum-post feature card) | `messages-square` |
| 🎮 (visual-novel feature card) | `book-open` *(re-themed: visual novels feel like books, not games)* |
| 👍 (forum likes) | `heart` |
| 💬 (forum comments) | `message-circle` |
| ❤️ (twitter likes) | `heart` |
| 🔁 (reposts) | `repeat-2` |
| 📤 (weibo share) | `share-2` |
| ▶ (play tab) | `play` |
| 📝 (script tab) | `pen-line` |
| 🎨 (style tab) | `palette` |

### Logos & marks

The project had no logo file. The cottage system introduces a **custom wordmark** (`assets/logo-cottage.svg`, also `assets/logo-cottage-mark.svg` for square contexts) — a single Cormorant Garamond italic ampersand inside a thin claret circle, with `同人创作助手` set beneath. See `assets/` for files and `preview/logo.html` for the specimen.

### Decorative ornaments

A small set of editorial flourishes used as section breaks and corner ornaments — under `assets/ornaments/`:

- `divider-diamond.svg` — `· ◆ ·` style chapter break
- `divider-leaves.svg` — symmetrical sage-coloured leaf sprig
- `corner-rose.svg` — claret rose for postcard corners

These are **decorative only** — never load-bearing UI. Use sparingly, like a tea-cosy: one per page maximum.

### Unicode characters as icons

Used in two narrow places:
- **Number sign `#`** for forum floor counts (`#3楼`) — preserves the original product convention.
- **Section sign `§`** in editorial copy, for chapter references. Not used in chrome.

Everything else is Lucide SVG or our own ornaments.

---

## File index

```
/
├── README.md                          ← you are here
├── colors_and_type.css                ← all design tokens (colors, type, space, shadow, motion)
├── SKILL.md                           ← Agent SKills front-matter for portable use
│
├── assets/
│   ├── logo-cottage.svg               ← full wordmark
│   ├── logo-cottage-mark.svg          ← square mark for favicons & avatars
│   └── ornaments/
│       ├── divider-diamond.svg
│       ├── divider-leaves.svg
│       └── corner-rose.svg
│
├── preview/                           ← Design System tab specimen cards
│   ├── color-paper.html
│   ├── color-ink.html
│   ├── color-accents.html
│   ├── type-display.html
│   ├── type-body.html
│   ├── type-accent-mono.html
│   ├── type-scale.html
│   ├── spacing.html
│   ├── radius.html
│   ├── shadows.html
│   ├── buttons.html
│   ├── inputs.html
│   ├── cards.html
│   ├── badges.html
│   ├── nav.html
│   ├── dividers.html
│   ├── logo.html
│   └── iconography.html
│
├── ui_kits/
│   └── web/                           ← React UI kit recreating the web app
│       ├── README.md
│       ├── index.html                 ← interactive click-thru prototype
│       ├── tokens.css
│       └── components/
│           ├── Button.jsx
│           ├── Input.jsx
│           ├── Card.jsx
│           ├── Header.jsx
│           ├── ProjectCard.jsx
│           ├── DashboardTile.jsx
│           ├── ForumPostBBS.jsx
│           ├── ForumPostTwitter.jsx
│           ├── ForumPostWeibo.jsx
│           ├── DialogueBox.jsx
│           ├── ImagePreview.jsx
│           └── ControlRail.jsx
│
└── packages/web/                      ← source files imported from the repo for reference
    └── ...
```

---

## Caveats

- **No Figma file** was provided — all design decisions are synthesised from the codebase + the brief ("warm, British, fluffy, cozy"). Treat this as a v1 proposal; iterate visually before committing to production.
- **Fonts are Google Fonts substitutions** — see typography notes above. Drop in real licensed faces for the production build.
- **Icons are Lucide via CDN** — see ICONOGRAPHY notes. Consider commissioning a custom hand-drawn set.
- **No imagery is shipped** beyond ornament SVGs. Real product imagery / illustrations are not part of this scope.
- The **Mini Program** surface (Taro) is not covered — only the web app.
