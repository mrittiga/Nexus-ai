# ✦ NEXUS AI Agent

> A production-grade AI Agent powered by **Claude Sonnet 4.6** · Built with **Next.js 14** · Deployed on **Vercel**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204.6-6C63FF?style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features

- **Auth System** — Register / Login / Logout with local session persistence
- **4 Agent Modes** — Assistant · Code · Research (live web search) · Analyst
- **Performance Dashboard** — Real-time tokens, response time chart, session stats
- **Conversation History** — Saved locally, restorable across sessions
- **Neural Canvas** — Animated particle background
- **Secure API Proxy** — Anthropic key never exposed to the browser
- **Fully Responsive** — Collapsible sidebar, mobile-friendly layout

---

## Project Structure

```
nexus-ai/
├── pages/
│   ├── _app.js          # Global styles wrapper
│   ├── index.jsx        # Main application (Auth + Chat + Perf + Settings)
│   └── api/
│       └── chat.js      # Serverless API route — keeps API key server-side
├── styles/
│   └── globals.css      # Fonts, resets, keyframe animations
├── public/              # Static assets (favicon, etc.)
├── .env.example         # Environment variable template
├── .gitignore
├── next.config.js
├── vercel.json
└── package.json
```

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nexus-ai.git
cd nexus-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your key at → https://console.anthropic.com/

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to GitHub + Vercel

### Step 1 — Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "feat: initial NEXUS AI Agent"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/nexus-ai.git
git branch -M main
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `nexus-ai` repository
4. Under **Environment Variables**, add:
   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |
5. Click **Deploy** — your site will be live in ~60 seconds

> Every `git push` to `main` will auto-redeploy via Vercel CI/CD.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key from console.anthropic.com |

**Never commit `.env.local` to git.** It is already in `.gitignore`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| AI Model | Claude Sonnet 4.6 |
| API | Anthropic Messages API |
| Deployment | Vercel (Serverless) |
| Styling | CSS-in-JS (inline styles) |
| Storage | localStorage (client-side) |
| Fonts | Space Grotesk · Inter · JetBrains Mono |

---

## How It Works

```
Browser → /api/chat (Vercel Serverless Function)
                ↓
        Anthropic API (Claude Sonnet 4.6)
                ↓
        Response → Browser → Rendered UI
```

The API key is stored as a Vercel Environment Variable and is **never sent to the browser**. All Anthropic calls go through the secure `/api/chat` serverless route.

---

## License

MIT © 2025 — Feel free to use, modify, and deploy.
