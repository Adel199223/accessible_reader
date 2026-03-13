# Recall Browser Companion

This workspace contains the Stage 5 MV3 browser companion for Recall.

## What It Does
- queries the local backend through `POST /api/recall/browser/context`
- shows a low-noise in-page chip only when the backend marks the page as prompt-worthy
- provides a popup for manual lookup on the current page
- provides an options page for backend URL, auto-prompt, and result-limit settings

## What It Does Not Do
- import the current tab into storage
- capture login-gated or private page data into Recall
- call AI services

## Commands
```bash
cd extension
npm install
npm test -- --run
npm run build
```

## Load Unpacked In Edge
1. Build the extension with `npm run build`.
2. Open `edge://extensions`.
3. Enable `Developer mode`.
4. Choose `Load unpacked`.
5. Select the built `extension/dist` directory.

## Default Backend
- `http://127.0.0.1:8000`

Use the extension options page if your local backend runs on another port.
