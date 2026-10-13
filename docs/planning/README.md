# Product Architecture & UX Planning — editable source

Two documents, matching the two Phase 1 invoices:
- `plan-web` → Website (INV-NKL-00704)
- `plan-app` → Client Application (Farmers & VSLAs) (INV-NKL-00705)

`assemble.py` builds both from shared page sections; `build.js` in each folder renders the PDF (Playwright + Chromium). Shared styles, fonts and assets are in this folder.
