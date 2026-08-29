# Bonny & Bright — Run locally

This repository is a static front-end build. To run it locally:

Option 1 — Quick (recommended)

1. Clone the repo and start a simple HTTP server from the repo root:

```bash
git clone https://github.com/BALUQUUUU/BONNY-BRIGHT.git
cd BONNY-BRIGHT
python3 -m http.server 8000
```

Open http://localhost:8000/ in your browser.

Option 2 — Serve at /bonny-and-bright/ (if you need that exact path)

On macOS/Linux:

```bash
ln -s . bonny-and-bright
python3 -m http.server 8000
```

On Windows (PowerShell):

```powershell
New-Item -ItemType Junction -Path .\bonny-and-bright -Target .
python -m http.server 8000
```

Option 3 — one-file Python server that strips the prefix

Save serve_prefix.py (committed in this repo) and run it:

```bash
python3 serve_prefix.py
```

Open http://localhost:8000/bonny-and-bright/

Troubleshooting

- If JS/CSS files 404, open DevTools Network to check asset paths. The committed index.html now uses relative paths (assets/) so you should not need the bonny-and-bright prefix unless hosting expects it.
- The repo is a front-end prototype: optional backend integrations (Supabase, Stripe) are not included here.

