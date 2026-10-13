# Product Architecture & UX Plan — editable source

The PDF in `/docs` is generated from this folder.

- Edit page content in `parts/*.html` (one file per chapter group); styles and the document grid live in `styles.css`.
- Build: `npm i playwright @fontsource/...` is not needed — fonts are bundled in `fonts/`. Run `node build.js` (needs Playwright + Chromium) to regenerate `index.html`, run the overlap/overflow QA and export the PDF.
- Grid: A4 landscape · 64px side margins · 56px top · 12 columns · 24px gutter · spacing 4/8/12/16/24/32/48/64.
