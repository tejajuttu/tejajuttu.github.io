# Teja Juttu — Finding the next line

Personal portfolio, built with Vite, vanilla JavaScript, and Three.js. Static HTML keeps the professional content accessible without JavaScript. The procedurally generated alpine scene loads separately and falls back to a CSS landscape without WebGL.

## Develop

```sh
npm ci
npm run dev
```

Edit `app/index.html`, `app/style.css`, `app/main.js`, and `app/mountain.js`. The existing academic archive is `projects.html`.

## Build and publish

```sh
npm run build
```

The build bundles into `dist/`, then copies the deployable files into the repository root. Commit both source and generated files. GitHub Pages serves `main` at `/`; no backend, credentials, or paid services are needed. `assets/` is build-owned.

## Experience

- Responsive 3D terrain with a CSS fallback and motion control
- Native HTML project dialogs and expandable career history
- Optional chess mate-in-one and snowboard mini-game
- Local-only exploration progress (resettable; no analytics or account)
- Reduced-motion support, keyboard navigation, focus restoration, and readable static content

Public experience is based on Teja's supplied LinkedIn export. The PDF itself and private customer material are not included. Selected work descriptions do not assert client-specific results or metrics. Field notes are editorial principles, not attributed quotations.

## Verify

With Chrome installed, serve the repository root on port 4173 and run `npm test`. Set `SITE_URL` to check a deployed site. The browser checks cover responsive overflow, reduced motion, project dialogs, the chess solution, snowboard movement, focus restoration, anchor targets, and automated WCAG 2.1 AA checks. Automated accessibility checks supplement manual visual and keyboard review; they are not a full accessibility certification.
