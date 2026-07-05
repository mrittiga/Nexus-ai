# ✦ NEXUS AI Agent

> A production-grade AI Agent powered by **Claude Sonnet 4.6** · Built with **Next.js 14** · Deployed on **Vercel**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
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
## License

MIT © 2025 — Feel free to use, modify, and deploy.
