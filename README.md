# Dr. Avana Framroz Patel — The Study

A cinematic portfolio: you open on the desk, each object is a doorway.

| Object  | Section              | What happens on click                                              |
|---------|----------------------|--------------------------------------------------------------------|
| Laptop  | AI & MedTech         | plays the Kling clip and freezes on the laptop screen; the on-screen ENTER button opens a full page |
| Logbook | Research             | camera dolly onto the book (crop of the desk render) + side panel  |
| Skull   | Medicine & Surgery   | plays the "zoom to eye" clip, holds inside the eye socket, then fades to black and a 3D DNA helix (Three.js) builds itself strand by strand. Drag to turn it, scroll to zoom; four gold markers (Research, Clinical Development, Certificates & Courses, Medical Blog) fly the camera in and open their own page |
| Orrery  | Philosophy & Culture | plays the Hailuo clip, holds the last frame for a second, then fades into the blog: an old-broadsheet newspaper ("The Orrery") |

## Run it

Any static server works. From this folder:

```bash
python3 -m http.server 5173
```

then open http://localhost:5173. (Modules and the video need http://, not file://.)

## Edit content

Everything you will want to change lives in `js/content.js`:

- `x` / `y` — hotspot position as a % of the desk image
- `eyebrow`, `title`, `blurb` — the panel copy
- `items` — the project cards (add as many as you like)
- `image` — the close-up render shown after the zoom
- `crop` / `focus` — how that render is framed next to the panel
- `video`, `videoRate`, `videoFade` — use a rendered clip as the zoom instead of the CSS dolly
- `landing: true` — freeze on the clip's last frame with no side panel (laptop, skull, orrery). `freezeAt: <seconds>` holds an earlier frame instead (the skull clip fades to black at the end).
- `enter: {x, y, w, h}` + `page: true` — a clickable hotspot on the frozen frame (percent of the frame) that opens a full page (the laptop's ENTER button). The page's copy and cards come from the same `title`, `blurb` and `items`.
- `page: 'dna'` + `autoOpen: <ms>` — after the freeze, fade into the DNA helix (the skull). The four markers and their pages come from `dna.sections` (label, hint, eyebrow, title, blurb, items). The helix itself is `js/dna.js`.
- A section can use `groups` (a list of `{title, items}`) instead of `items` to render a grouped ledger — the Certificates & Courses page does this. Any item with a `file` (PDF, PNG or JPG under `assets/certs/`) opens in the built-in viewer when clicked; the viewer has an “open in new tab” link.
- `page: 'newspaper'` + `autoOpen: <ms>` — after the freeze, wait and fade into the newspaper-style blog, “Second Opinion” (the orrery). Masthead text is in `paper`; the articles live in `js/articles.js` (kicker, title, deck, date, `intro` paragraphs shown on the front page, `sections` with crossheads, `quotes` keyed to the section they follow, an `art` illustration from `js/paperart.js`, and a `bibliography`). The first article is the leading article; every headline opens the full piece. House style: no em dashes.

## Surgical logbook (the book)

Clicking the book zooms in and opens the logbook page: a ruled table of theatre cases (procedure, specialty, role, supervising surgeon, where, when) and an “ongoing projects” section. Both lists are `book.logbook` in `js/content.js`; leave a field as `''` and it prints “to add”.

## Helix sounds

`js/sfx.js` synthesises the helix's sounds with the Web Audio API (no files): a metallic clink on marker hover, an ascending chime on select, a lower chime on the way back, and a rising shimmer with soft ticks while the strand assembles. They obey the same mute button as the ambient track.

## MedTech console (laptop)

The laptop's ENTER opens a HUD-style console with one tile per project. Projects are `laptop.projects` in `js/content.js`: id, code, title, kicker, tagline, tags, `media` (a demo `video` + `poster`, or an `image`), `body` paragraphs, `features`, and `links` (`video: true` scrolls to the demo, `file` opens the viewer, `paper` opens a reading copy, `href` opens a new tab). Assets live in `assets/medtech/` (demos re-encoded to 720p H.264; posters made with qlmanage). The Z-plasty 3D simulator is hosted at `assets/tools/zplasty/index.html`. The two PneumoVision reports are reading copies in `js/papers.js` (`medtech: true`).

## Research reading copies

The Research page (skull → DNA → Research) lists papers from `js/papers.js`, a generated file: cleaned reading copies of the dissertation, two case reports and three essays with title pages, candidate numbers and university headers removed. A card entry in `content.js` is just `{ tag, paper: '<id>' }`. Inside each reading copy, coursework carries a Queen Mary affiliation tag and the case reports carry a histology-confidentiality tag. Figures and tables are extracted from the source documents into `assets/research/fig/` (`tools/extract_figs.py`, needs PyMuPDF) and shown inline in the reading copies; case-report figures whose caption says photograph, histopathology or MRI are withheld (the Word files only contain placeholders for those). Header-stripped PDFs of the coursework live in `assets/research/` and are linked from each reading copy as “original document with figures and tables”.

To regenerate after editing a source document, run the builder (it lives in the session scratchpad as `build_papers.py`; keep a copy in the repo if you want to rerun it later).

## Posting an article

Open `js/articles.js` and add an entry:

```js
{
  kicker: 'Essay',
  title: 'On the uses of wonder',
  deck: 'One line under the headline.',
  date: '1 October 2026',
  intro: ['Opening paragraph shown on the front page.'],
  sections: [ { h: 'A crosshead', p: ['Paragraph.', 'Paragraph.'] } ],
  quotes: { 0: 'A pull quote printed after the first section.' },
  bibliography: ['Reference one.'],
},
```

Put it first to make it the leading article.

Name and tagline are in `index.html` (`.brand`). Colours and type are CSS variables at the top of `css/style.css`.

## About me

The small photo / “i” button beside the name opens the About page. Its hero is the portrait (`assets/about-photo.jpg`) with a CT/X-ray render (`assets/about-xray.jpg`) underneath; moving the cursor erases fluid blobs and pixel flecks that heal over time, revealing the X-ray (`js/xray.js`). The X-ray’s scale/offset under the face is `ABOUT.hero.align` in `js/content.js` — tune it live in the console with `__xray.setAlign({k, tx, ty})`. Its text and facts are `ABOUT` in `js/content.js`. Put a portrait at `assets/avana.jpg` (a monogram is shown until it exists). The CV linked there is `assets/certs/avana-patel-cv.pdf`. The Contact section at the foot of the About page (also reached via the header “Contact” link) is `CONTACT` in `js/content.js`.

## Ambient sound

A ten-minute AAC loop at `assets/audio/ambient.m4a` plays faintly (volume 0.14) after the visitor's first click or key press, with a fade-in. The equaliser button beside the name mutes it; the choice is remembered in localStorage. Replace the file to change the track.

## Assets

`assets/` holds JPEG versions of the renders in `~/Desktop/portfolio` plus the clips: `intro.mp4` (laptop), `skull.mp4` (zoom to eye), `orrery.mp4`.
The book has no dedicated close-up yet — it currently crops the desk render. Drop a `book.jpg` in `assets/`
and point `SECTIONS.book.image` at it (remove the `crop` line) when you have one.

## Deploy

It is plain HTML/CSS/JS with Three.js from a CDN (used for the DNA helix), so it deploys anywhere static: GitHub Pages, Netlify, Vercel, Cloudflare Pages.


## Medical blog

Posts live in `js/blog.js` in the same block format as the research papers, plus two extra block types: `{ t: 'poster', key }` draws a one-page summary poster and `{ t: 'art', key, k, n, x }` draws an inline SVG figure, both from `js/blogart.js`. The poster template (`poster({...})`) takes an eyebrow, title, thesis, four stat tiles, a numbered flow, side notes and a footnote, so a new post needs data, not drawing. Cards on the Medical Blog page come from `{ tag, paper: '<id>' }` entries in `js/content.js`.

## The placements road (Clinical Development)

`roadmap` on the Clinical Development section in `js/content.js` holds `years` and `placements` (title, optional `sub`, site, trust, `from`/`to` as YYYY-MM-DD, `hue`). `js/roadmap.js` draws a 3D road (CSS perspective) with one slab per placement, standing cards, month ticks and a "You are here" beacon at today's date. On open the camera drives from the start of the programme to today; drag, scroll, arrow keys or the prev/Today/next buttons move along it. Change a rotation by editing the dates; nothing else needs touching.

## Publishing

The folder is the site. Two ways to put it online:

1. **GitHub Pages (repeatable, works with the back office).** Create an empty repository on GitHub (private is fine; Pages can still be public), then from this folder:

   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

   In the repository settings, Pages → Source → "GitHub Actions". `.github/workflows/pages.yml` deploys on every push to `main`. It publishes only the public files (pages, `css/`, `js/`, `assets/` without originals); `CLAUDE.md`, `.claude/`, `profile/`, `tools/`, `inbox/` and `drafts/` never reach the web. The site appears at `https://<you>.github.io/<repo>/`; add a custom domain in the same settings page if you want one. Every file must be under 100 MB (the largest here is 41 MB).

2. **Netlify Drop (quickest, no git).** Drag this folder onto https://app.netlify.com/drop. Updating means dragging it again.

Ambient music pauses when the tab is hidden or the window loses focus and resumes on return.

## The back office (updating the site with Claude)

The easiest way is the private app in `../portfolio-backoffice`: double-click `start.command` (or `node server.js`) and open http://localhost:5174. Choose where the new thing goes (laptop, logbook, skull, orrery), paste rough text, attach files, press Do it; preview, then publish from the same screen.  It runs on this Mac only and uses Claude Code with your subscription (nothing to pay, no keys): run `claude` then `/login` once in Terminal. It previews the working copy before publishing.

The same thing works in a terminal: run Claude Code inside this folder (`cd portfolio-site && claude`). `CLAUDE.md` briefs it as the site's editor and your assistant; `profile/` holds who you are (`about.md`, `cv.txt`, `style.md`) and what is on the site (`portfolio-index.md`, regenerate with `node tools/profile_index.js > profile/portfolio-index.md`). Skills in `.claude/skills/`:

| Say | Skill | Does |
|---|---|---|
| "add this to my logbook: …" | `/add-log-entry` | polishes and adds a case or audit |
| "new medical blog post: …" | `/add-medical-post` | writes the post, builds its poster and figures |
| "new essay for the paper: …" | `/add-essay` | adds to The Second Opinion |
| "new medtech project: …" | `/add-project` | adds a console tile with media |
| "file this certificate" | `/add-certificate` | files it under the right group |
| "publish" | `/publish` | checks, commits and pushes; Pages deploys |
| "draft an email to … / a LinkedIn post about … / my answer to this application question" | `/draft` | writes it in your voice into `drafts/`, never sends |

Rough text in, finished copy out, in the house style (no em dashes, British spelling, evidence first). It never invents facts: missing hospital names or dates stay blank and it tells you.


## Launch checklist (done, except the domain)

- One h1 per page (the name in the header); overlay pages use `h2.page-h1`. Unique title, meta description, canonical, Open Graph and Twitter tags, JSON-LD (Person, WebSite, ProfilePage), favicon set (`assets/favicon.svg`, PNG fallbacks, `site.webmanifest`), social share image `assets/share.jpg`.
- Static pages with their own titles and canonicals: `privacy.html`, `terms.html`, `404.html` (GitHub Pages serves it automatically). Linked from the contact section.
- `robots.txt`, `sitemap.xml`, `llms.txt`. Breadcrumbs on every overlay page. Real alt text on every image. No placeholders, no em dashes (including the reading copies in `js/papers.js`).
- No build step, so no source maps or bundles; Three.js loads from the CDN only when the skull opens.
- **Before launch:** connect the custom domain, then run `python3 tools/set_domain.py https://your.domain` once. It rewrites every absolute address (canonical, Open Graph, structured data, sitemap, robots, llms.txt) and writes `CNAME`. Until then those tags carry `https://your-domain.example`, which is deliberate.

## Devices

Laptop and desktop show the desk as designed. On phones and portrait tablets the desk becomes a scene you swipe across (labels stay visible), the tapped object is centred and zoomed with the CSS dolly rather than the video clips (autoplay rules and data), the helix stands upright with labels kept on screen, and the road uses a tighter scale. Tested at 375x812, 768x1024, 1440x900 and 1920x1080.

## Checks

`node tools/check.js` parses every script, refuses em dashes and placeholder text, and confirms every asset the content refers to exists. The Pages workflow runs it before publishing, so a broken commit never goes live. There is a print stylesheet (the open document, black on white), keyboard focus styles, and the helix markers are reachable by keyboard.
