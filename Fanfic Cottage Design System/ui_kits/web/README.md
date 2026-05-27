# Fanfic Cottage — Web UI Kit

A clickable, hi-fi recreation of the **Fan-Fiction Creation Assistant** web app (`packages/web/`) reskinned in the cottage system. Modular React components, no production wiring — just visual + interaction fidelity.

## Run it

Open `index.html` directly. It loads React 18 + Babel from the CDN, then layers in:

| File | What's inside |
|---|---|
| `tokens.css` | Imports `colors_and_type.css` from the project root and adds component classes (`.btn`, `.input`, `.card`, `.segmented`, `.range`, layout shells) |
| `components.jsx` | Primitives: `Icon` (inline Lucide), `Button`, `Input`, `Textarea`, `Segmented`, `Chip`, `Header`, `DiamondRule`, `CornerOrnament` |
| `screens-app.jsx` | `LoginScreen`, `DashboardScreen`, `ProjectsScreen`, `ProjectCard` |
| `screens-editors.jsx` | `TextToImageScreen`, `ForumPostScreen`, `VisualNovelScreen` (+ `ForumRow` style variants, `StyleColor`, `StyleSlider`, `RailSlider`) |
| `app.jsx` | Top-level `App` with route state (login → home → 4 inner surfaces) |

Each Babel script attaches its components to `window`, so siblings share scope without imports. Renames must update both definition and the `Object.assign(window, …)` at the bottom of each file.

## Surfaces

The prototype walks through the same routes as the source app, in cottage clothing:

1. **Login** (`LoginScreen`) — postcard-shaped sign-in card with corner-rose ornament, copperplate welcome.
2. **Dashboard** (`DashboardScreen`) — three feature tiles (Postcards / Threads / Novellas) + recent-project shelf.
3. **Library** (`ProjectsScreen`) — full project grid with type-filter Segmented control. Each card has a coloured chapter-cover ribbon.
4. **Postcards / 文字成图** (`TextToImageScreen`) — live preview of the rendered postcard with a font/size/palette control rail.
5. **Threads / 论坛截图** (`ForumPostScreen`) — switch between BBS, Twitter, Weibo renderers; light/dark; edit per-floor.
6. **Novellas / 视觉小说** (`VisualNovelScreen`) — three tabs (Play / Script / Style); a faux warm parlour scene drives the dialogue box; choices branch.

The prototype's state is in-memory only — refreshing returns to the dashboard.

## What it deliberately doesn't do

Per the brief, the UI kit is a recreation of the existing product, not a redesign of its **behavior**:

- No real authentication, persistence, or API calls.
- The visual-novel "engine" is a fixed 4-step scene that loops — no Ink.js parsing.
- The text-to-image preview is a CSS recreation, not html2canvas-rendered.
- No Mini Program / mobile surface.

If you want any of these wired to real logic, you have the React components — slot them into the source `packages/web/` project, swap in real hooks (`useProjects`, `useFontLoader`, `useInkStory`), and replace the in-component sample data.

## Editing notes

- All colour, type, spacing, and shadow values come from CSS custom properties in `colors_and_type.css`. Change a token and every component follows.
- Icons live as inline `<path>` JSX in `components.jsx` under `ICON_PATHS`. Add new ones there.
- The header nav items live in `NAV_ITEMS` (top of `components.jsx`). Add/remove routes by editing `NAV_ITEMS` *and* the route switch in `app.jsx`.
- The dashboard's feature tiles are driven by `FEATURES` (top of `screens-app.jsx`); add a new tool by appending an entry.

## Caveats

- Fonts loaded from Google Fonts; if you're offline they'll fall back to Georgia and the cottage feel softens. Drop real `.woff2` files into `fonts/` if you want a guaranteed render.
- Icons are Lucide outline paths inlined — they will not auto-update if Lucide ships a new viewBox.
- The Novellas viewport draws a CSS-only window/curtain and a single sprite placeholder. Real character art / backgrounds would slot into the `position: absolute` layers.
