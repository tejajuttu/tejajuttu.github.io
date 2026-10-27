# tejajuttu.github.io

Personal site of Teja Juttu. Plain static HTML, CSS and a little JavaScript — no framework, no build step. GitHub Pages serves the `main` branch from the repository root.

## Structure

- `index.html` — home (intro, Eliza, selected work, about, notes, off the clock, contact)
- `work/multimodal-search/` — project page
- `archive/` — grad-school projects (filterable; readable without JS)
- `404.html` — not-found page
- `projects.html` — redirect from the old archive URL to `/archive/`
- `assets/site.css`, `assets/secondary.css`, `assets/site.js` — shared styling, supporting-page layouts and behaviour
- `assets/fonts/` — Bricolage Grotesque and Source Serif 4 (SIL Open Font License, see LICENSE files)
- `assets/img/` — photos
- `social-card.png` — link preview image (1200×630)

## Edit

Edit the HTML directly. Text lives in the pages; shared layout lives in `assets/site.css`, with supporting-page adjustments in `assets/secondary.css`.
To add a project page, copy `work/multimodal-search/index.html` into a new folder under `work/`, change the text, link to it from the home page, and add it to `sitemap.xml`.

## Preview locally

```sh
python3 -m http.server 4173
# open http://127.0.0.1:4173
```

## Check

```sh
npm install
npm run serve   # in one terminal
npm test        # in another
```

Checks: no horizontal overflow at 1440 / 820 / 390 / 320px, minimum text size, image dimensions, touch targets, axe WCAG 2.1 AA, reduced motion, skip link, chess puzzle, contact links, back navigation, archive filter, the `/projects.html` redirect, and the archive without JavaScript. Set `SITE_URL=https://tejajuttu.github.io` to check the live site. Set `CHROME_PATH` if Chrome isn't found.

## Publish

Commit and push to `main`. GitHub Pages updates within a minute or two.
