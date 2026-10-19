# AI Tools Mockup

A clickable UI mockup for a no-code AI workspace, with two screens:

- **Whiteboard** (`#/`): a freeform board where you drag AI widgets (OCR, time series forecast, image classification, text classification, anomaly detection), sticky notes and text labels, connect widgets with arrows, and configure each widget's data, model and parameters.
- **Tool directory** (`#/tools`): tools in three columns (Documents & images, Text, Numbers & time series). Clicking a tool opens a workspace with only that tool's upload, model choices and settings.

All data, models and results are **mock**. File uploads show the file's name but nothing is processed.

## Run locally

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Publish on GitHub Pages

1. Create a new repository on GitHub and push this folder to its `main` branch:
   ```bash
   git init
   git add .
   git commit -m "AI tools mockup"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`. Watch it under the **Actions** tab. When it finishes, the site is at
   `https://<your-username>.github.io/<repo-name>/`.

## Project layout

```
src/
  App.jsx         hash router: #/ → Whiteboard, #/tools → Tools
  Whiteboard.jsx  freeform board, dock, inspector, connections
  Tools.jsx       tool catalog (CATALOG) and the per-tool workspace
  ui.jsx          css() helper, icons, small shared components
  index.css       base styles, responsive rules, animations
```

## Making it real

- **Add or change a tool:** edit `CATALOG` in `src/Tools.jsx`. Each tool lists its accepted file types, models, settings (`select`, `range`, `toggle`) and a sample result.
- **Connect real models:** replace the `run()` methods (they currently wait 1.5 s and show sample results) with a call to your backend, for example a FastAPI server that loads PaddleOCR, Prophet or a Hugging Face model and returns JSON. Keep API keys on the server, never in this frontend.
- **Save boards:** the whiteboard's `items` and `edges` state is plain JSON, so it can be saved to a database or `localStorage` as is.
