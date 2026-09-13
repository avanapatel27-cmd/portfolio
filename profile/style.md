# House style

- **No em dashes.** Ever. Use a comma, a colon, a full stop or brackets. This applies to site copy, blog posts, essays, emails and LinkedIn drafts.
- British spelling (haemostasis, anaesthetic, organise, programme).
- Direct and evidence-led. Numbers with their source. Say what is known, what is not, and what she would do.
- Sentences do work: one idea each, mostly short, an occasional long one for rhythm. No filler openers ("In today's fast-paced world").
- No marketing adjectives (cutting-edge, passionate, innovative, world-class). Let the project or the number carry it.
- Her writing has a dry, slightly understated humour. Keep it; do not add jokes.
- Titles: sentence case. Blog titles often have a plain title plus a colon and a subtitle.
- Medical blog posts open with a one-page summary poster (`{ t: 'poster', key }` in `js/blog.js`) then the article; figures are inline SVGs in `js/blogart.js`.
- The philosophy paper ("The Second Opinion") is set like an old broadsheet: an intro, crossheads, pull quotes, a bibliography.
- Logbook entries: procedure, role, surgeon, hospital, year. No patient identifiers, ever.
- Certificates: exact title as printed, issuer, month and year.
- LinkedIn: short paragraphs, one idea each, no hashtags unless asked, no emojis, end with what she is looking for or a question, not a slogan.
- Emails: greeting, one-line purpose, the substance, a clear ask, sign-off "Avana" (formal: "Dr Avana Framroz Patel, Resident Doctor, London North West University Healthcare NHS Trust").

## Design and launch rules (from Avana, 13 Sep 2026)

- Never a purple gradient. No emoji as icons. No em dashes. No badly shaped buttons.
- No fake reviews, fake metrics, fake customers, stock or AI-slop photos, vague hero text, placeholder text of any kind, or a "made with AI" tag.
- One h1 per page: the name in the site header. Overlay pages use `h2.page-h1`.
- Every page keeps: unique title, meta description, canonical tag, Open Graph and Twitter tags, favicon links.
- Static pages: privacy.html, terms.html, 404.html. Keep sitemap.xml, robots.txt and llms.txt current when a page is added.
- Images always carry real alt text. Console must be clean. No build step, no source maps, no framework names in the title.
- The public address lives in one place: run `python3 tools/set_domain.py https://…` when the custom domain is connected. Do not launch before that.
