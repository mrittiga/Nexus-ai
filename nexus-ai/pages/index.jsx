// pages/index.jsx
// ═══════════════════════════════════════════════════════
//  NEXUS AI AGENT  ·  Powered by Claude Sonnet 4.6
//  Deploy on Vercel · github.com/your-username/nexus-ai
// ═══════════════════════════════════════════════════════
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

// ── Design tokens ────────────────────────────────────────
const C = {
  bg: '#08080E', surface: '#0F0F18', card: '#13131E',
  border: '#1C1C2E',
  primary: '#6C63FF', primaryDim: 'rgba(108,99,255,0.15)',
  cyan: '#00D4FF',    cyanDim:    'rgba(0,212,255,0.12)',
  green: '#00FF94',   greenDim:   'rgba(0,255,148,0.12)',
  amber: '#FFB800',   amberDim:   'rgba(255,184,0,0.12)',
  red: '#FF4757',
  text: '#E4E4F0', muted: '#5A5A7A', dim: '#2A2A42',
};

// ── Agent modes ──────────────────────────────────────────
const MODES = {
  assistant: {
    label: 'Assistant', icon: '✦', color: C.primary, dimColor: C.primaryDim,
    system: 'You are NEXUS, a professional executive assistant. Use a polite, formal tone; be concise and task-oriented. Prioritize clarity, provide actionable next steps, summaries, and suggested subject lines when drafting messages. Ask concise clarifying questions before making assumptions.',
  },
  coder: {
    label: 'Code', icon: '</>', color: C.cyan, dimColor: C.cyanDim,
    system: 'You are NEXUS Code, an expert programmer. Write clean, working code in any language. Always explain your code clearly.',
  },
  researcher: {
    label: 'Research', icon: '⊛', color: C.green, dimColor: C.greenDim,
    system: 'You are NEXUS Research. You synthesize information deeply and accurately. Provide comprehensive, well-structured research.',
  },
  analyst: {
    label: 'Analyst', icon: '◈', color: C.amber, dimColor: C.amberDim,
    system: 'You are NEXUS Analyst. Break down complex problems with logical reasoning and provide clear, actionable insights.',
  },
};

// ════════════════════════════════════════════════════════
//  Neural Canvas Background
// ════════════════════════════════════════════════════════
function Neural({ opacity = 0.35 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const set = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    set();
    window.addEventListener('resize', set);

    const N = 45;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
    }));

    let id;
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108,99,255,${(1 - d / 130) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > cv.width)  n.vx *= -1;
        if (n.y < 0 || n.y > cv.height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108,99,255,0.35)';
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', set); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
    />
  );
}

// ════════════════════════════════════════════════════════
//  Message Renderer  (code blocks + plain text)
// ════════════════════════════════════════════════════════
function MsgContent({ content }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ lineHeight: 1.75, fontSize: 14 }}>
      {parts.map((p, i) => {
        if (p.startsWith('```')) {
          const lines = p.slice(3, -3).split('\n');
          const lang = lines[0] || '';
          const code = lines.slice(1).join('\n');
          return (
            <div key={i} style={{ background: '#060610', border: `1px solid ${C.border}`, borderRadius: 10, margin: '10px 0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', background: C.card, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.cyan, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>{lang || 'code'}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(code)}
                  style={{ color: C.muted, fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  copy
                </button>
              </div>
              <pre style={{ margin: 0, padding: '14px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: '#C8C8E8', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {code}
              </pre>
            </div>
          );
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{p}</span>;
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  AUTH SCREEN
// ════════════════════════════════════════════════════════
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ email: '', password: '', name: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const field = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setErr('');
    if (!f.email || !f.password) { setErr('Please fill all fields'); return; }
    if (mode === 'register' && !f.name) { setErr('Name is required'); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const db = JSON.parse(localStorage.getItem('nx_users') || '{}');
    if (mode === 'register') {
      if (db[f.email]) { setErr('Email already exists'); setBusy(false); return; }
      db[f.email] = { name: f.name, pass: f.password, at: Date.now() };
      localStorage.setItem('nx_users', JSON.stringify(db));
    } else {
      if (!db[f.email] || db[f.email].pass !== f.password) { setErr('Invalid credentials'); setBusy(false); return; }
    }
    const u = { email: f.email, name: db[f.email]?.name || f.name };
    localStorage.setItem('nx_session', JSON.stringify(u));
    onAuth(u);
    setBusy(false);
  };

  const IS = {
    width: '100%', padding: '12px 14px', background: C.card,
    border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
    fontSize: 14, marginBottom: 12, outline: 'none',
    fontFamily: "'Inter',sans-serif", boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <Neural opacity={0.55} />
      <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle,rgba(108,99,255,.1) 0%,transparent 70%)', top: '5%', left: '10%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, background: 'radial-gradient(circle,rgba(0,212,255,.07) 0%,transparent 70%)', bottom: '10%', right: '10%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: 430, padding: '40px 36px', background: 'rgba(15,15,24,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(108,99,255,.22)', borderRadius: 22, boxShadow: '0 0 80px rgba(108,99,255,.1),0 24px 64px rgba(0,0,0,.6)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 14px', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 0 36px rgba(108,99,255,.45)' }}>✦</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", background: 'linear-gradient(90deg,#6C63FF,#00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS AI</h1>
          <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 13 }}>Advanced Intelligence Platform</p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 10, padding: 4, marginBottom: 24, border: `1px solid ${C.border}` }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setErr(''); }}
              style={{ flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 13, fontWeight: 500, transition: 'all .2s', background: mode === m ? 'linear-gradient(135deg,#6C63FF,#7B74FF)' : 'transparent', color: mode === m ? '#fff' : C.muted, boxShadow: mode === m ? '0 2px 14px rgba(108,99,255,.3)' : 'none' }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {mode === 'register' && <input placeholder="Full Name" value={f.name} onChange={field('name')} onKeyDown={(e) => e.key === 'Enter' && submit()} style={IS} />}
        <input placeholder="Email" type="email" value={f.email} onChange={field('email')} onKeyDown={(e) => e.key === 'Enter' && submit()} style={IS} />
        <input placeholder="Password" type="password" value={f.password} onChange={field('password')} onKeyDown={(e) => e.key === 'Enter' && submit()} style={{ ...IS, marginBottom: 0 }} />

        {err && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,71,87,.1)', border: '1px solid rgba(255,71,87,.3)', borderRadius: 8, color: C.red, fontSize: 13 }}>
            {err}
          </div>
        )}

        <button onClick={submit} disabled={busy}
          style={{ width: '100%', marginTop: 18, padding: '13px 0', background: busy ? C.dim : 'linear-gradient(135deg,#6C63FF,#5550EE)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', transition: 'all .2s', boxShadow: busy ? 'none' : '0 6px 24px rgba(108,99,255,.4)', fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 0.3 }}>
          {busy ? '···' : mode === 'login' ? 'Enter NEXUS →' : 'Create Account →'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 14, color: C.dim, fontSize: 12 }}>
          {mode === 'login' ? 'Register first, then sign in' : 'Your data is stored locally'}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  PERFORMANCE VIEW
// ════════════════════════════════════════════════════════
function PerfView({ m }) {
  const [, setT] = useState(0);
  useEffect(() => { const t = setInterval(() => setT((p) => p + 1), 1000); return () => clearInterval(t); }, []);
  const dur = Math.floor((Date.now() - m.sessionStart) / 1000);
  const avg = m.rt.length ? (m.rt.reduce((a, b) => a + b, 0) / m.rt.length / 1000).toFixed(2) : '0.00';
  const max = Math.max(...m.rt, 1);

  const cards = [
    { l: 'Total Messages', v: m.msgs,                i: '💬', c: C.primary },
    { l: 'Tokens Used',    v: m.tokens.toLocaleString(), i: '⚡', c: C.cyan   },
    { l: 'Avg Response',  v: avg + 's',              i: '⏱',  c: C.green  },
    { l: 'Session Time',  v: `${Math.floor(dur / 60)}m ${dur % 60}s`, i: '🕐', c: C.amber },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <h2 style={{ margin: '0 0 24px', fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: C.text }}>Performance Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {cards.map((s) => (
          <div key={s.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.i}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: s.c, fontFamily: "'Space Grotesk',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Response Time History (ms)</div>
        {m.rt.length === 0
          ? <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No data yet — start a conversation!</p>
          : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 72 }}>
              {m.rt.slice(-24).map((v, i) => (
                <div key={i} title={v + 'ms'} style={{ flex: 1, background: `linear-gradient(to top,${C.primary},${C.cyan})`, borderRadius: '3px 3px 0 0', height: `${(v / max) * 100}%`, minHeight: 4, opacity: 0.85 }} />
              ))}
            </div>
          )}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>System Configuration</div>
        {[['Engine', 'Claude Sonnet 4.6'], ['Max Tokens', '1,000 / request'], ['Conversations', m.convs], ['Status', '● Online & Ready']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
            <span style={{ color: C.muted }}>{k}</span>
            <span style={{ color: k === 'Status' ? C.green : C.text }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  SETTINGS VIEW
// ════════════════════════════════════════════════════════
function SettingsView({ cfg, setCfg, mode, setMode }) {
  return (
    <div style={{ padding: 28, maxWidth: 720 }}>
      <h2 style={{ margin: '0 0 24px', fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: C.text }}>Settings</h2>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Agent Mode</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(MODES).map(([k, m]) => (
            <button key={k} onClick={() => setMode(k)}
              style={{ padding: '12px 16px', border: `1px solid ${mode === k ? m.color : C.border}`, borderRadius: 10, background: mode === k ? m.dimColor : 'transparent', color: mode === k ? m.color : C.muted, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 9, transition: 'all .2s' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 15 }}>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Custom System Prompt</div>
        <textarea value={cfg.sys || ''} onChange={(e) => setCfg((p) => ({ ...p, sys: e.target.value }))}
          placeholder="Override the agent persona (leave empty for defaults)..."
          style={{ width: '100%', minHeight: 96, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, padding: '10px 12px', outline: 'none', resize: 'vertical', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box', lineHeight: 1.65 }} />
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.primaryDim},${C.cyanDim})`, border: '1px solid rgba(108,99,255,.2)', borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>About NEXUS</div>
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: '0 0 14px' }}>
          NEXUS is a production-grade AI agent built with Claude Sonnet 4.6 and Next.js. Designed and created by Mirthu, NEXUS delivers multi-persona intelligence, real-time performance analytics, persistent conversational memory, neural network visualizations, and a complete authentication system. The application is deployed on Vercel.
        </p>
        {/* Technology badges removed as requested */}
        <div style={{ marginTop: 12, color: C.text, fontSize: 12, fontWeight: 600 }}>Created by Mirthu</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════
export default function Home() {
  const [user, setUser]     = useState(null);
  const [hydrated, setH]    = useState(false);
  const [view, setView]     = useState('chat');
  const [sidebar, setSidebar] = useState(true);
  const [convos, setConvos] = useState([]);
  const [cid, setCid]       = useState(null);
  const [msgs, setMsgs]     = useState([]);
  const [inp, setInp]       = useState('');
  const [busy, setBusy]     = useState(false);
  const [mode, setMode]     = useState('assistant');
  const [cfg, setCfg]       = useState({ sys: '' });
  const [metrics, setMetrics] = useState({ msgs: 0, tokens: 0, rt: [], sessionStart: Date.now(), convs: 0 });

  const endRef = useRef(null);
  const inpRef = useRef(null);

  // Hydrate from localStorage (client-side only)
  useEffect(() => {
    try {
      const s = localStorage.getItem('nx_session');
      if (s) setUser(JSON.parse(s));
      const c = localStorage.getItem('nx_convos');
      if (c) setConvos(JSON.parse(c));
    } catch (_) {}
    setH(true);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  useEffect(() => { if (hydrated) localStorage.setItem('nx_convos', JSON.stringify(convos)); }, [convos, hydrated]);
  useEffect(() => { setMetrics((p) => ({ ...p, convs: convos.length })); }, [convos]);

  const newChat = () => {
    const id = Date.now().toString();
    setConvos((p) => [{ id, title: 'New Chat', msgs: [], at: Date.now(), mode }, ...p]);
    setCid(id); setMsgs([]); setView('chat');
  };

  const loadChat = (id) => {
    const c = convos.find((x) => x.id === id);
    if (c) { setCid(id); setMsgs(c.msgs || []); setView('chat'); }
  };

  const delChat = (id, e) => {
    e.stopPropagation();
    setConvos((p) => p.filter((x) => x.id !== id));
    if (cid === id) { setCid(null); setMsgs([]); }
  };

  const clearAll = () => {
    if (!confirm('Delete all conversations?')) return;
    setConvos([]); setCid(null); setMsgs([]);
  };

  const send = async () => {
    if (!inp.trim() || busy) return;
    const um = { role: 'user', content: inp.trim(), ts: Date.now(), id: Date.now().toString() };
    const next = [...msgs, um];
    setMsgs(next); setInp(''); setBusy(true);
    const t0 = Date.now();

    let convId = cid;
    if (!convId) {
      convId = Date.now().toString();
      const title = um.content.slice(0, 42) + (um.content.length > 42 ? '…' : '');
      setConvos((p) => [{ id: convId, title, msgs: [], at: Date.now(), mode }, ...p]);
      setCid(convId);
    }

    try {
      const sys = cfg.sys || MODES[mode].system;
      // ⬇ Calls our secure serverless function — API key never leaves the server
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })), system: sys, mode }),
      });
      const data = await res.json();
      const elapsed = Date.now() - t0;

      const text =
        data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n') ||
        (data.error ? `Error: ${data.error.message || JSON.stringify(data.error)}` : 'Done.');

      const am = { role: 'assistant', content: text, ts: Date.now(), id: (Date.now() + 1).toString(), rt: elapsed, tok: data.usage?.output_tokens || 0, amode: mode };
      const final = [...next, am];
      setMsgs(final);
      setConvos((p) => p.map((c) => (c.id === convId ? { ...c, msgs: final } : c)));
      setMetrics((p) => ({ ...p, msgs: p.msgs + 1, tokens: p.tokens + (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0), rt: [...p.rt, elapsed] }));
    } catch (e) {
      const em = { role: 'assistant', content: `Network error: ${e.message}`, ts: Date.now(), id: (Date.now() + 1).toString(), isErr: true };
      setMsgs((p) => [...p, em]);
    }
    setBusy(false); inpRef.current?.focus();
  };

  const logout = () => { localStorage.removeItem('nx_session'); setUser(null); };

  if (!hydrated) return null; // Prevent SSR mismatch
  if (!user) return <AuthScreen onAuth={setUser} />;

  const M = MODES[mode];
  const PROMPTS = ['Explain neural networks visually', 'Build a REST API in Python', 'Analyze my startup idea', 'Latest breakthroughs in AI'];

  return (
    <>
      <Head>
        <title>NEXUS AI Agent</title>
        <meta name="description" content="Advanced AI Agent powered by Claude Sonnet 4.6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" />
      </Head>

      <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>

        {/* ── SIDEBAR ───────────────────────────────────── */}
        <div style={{ width: sidebar ? 258 : 0, minWidth: sidebar ? 258 : 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'all .3s ease', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <Neural opacity={0.18} />

          {/* Logo */}
          <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 0 22px rgba(108,99,255,.45)', flexShrink: 0 }}>✦</div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: -0.2 }}>NEXUS</div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 0.5 }}>AI AGENT PLATFORM</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ padding: '10px 10px 0', position: 'relative', zIndex: 1, flexShrink: 0 }}>
            {[{ id: 'chat', i: '💬', l: 'Chat' }, { id: 'performance', i: '📊', l: 'Performance' }, { id: 'settings', i: '⚙️', l: 'Settings' }].map((n) => (
              <button key={n.id} onClick={() => setView(n.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', background: view === n.id ? 'rgba(108,99,255,.14)' : 'transparent', color: view === n.id ? C.primary : C.muted, cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 2, transition: 'all .15s', borderLeft: `2px solid ${view === n.id ? C.primary : 'transparent'}` }}>
                <span>{n.i}</span>{n.l}
              </button>
            ))}
          </div>

          {/* New Chat */}
          <div style={{ padding: '10px 10px 6px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <button onClick={newChat}
              style={{ width: '100%', padding: '9px 0', background: `linear-gradient(135deg,${C.primaryDim},${C.cyanDim})`, border: '1px solid rgba(108,99,255,.28)', borderRadius: 9, color: C.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: "'Space Grotesk',sans-serif" }}>
              ＋ New Chat
            </button>
          </div>

          {/* History */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px 5px' }}>
              <span style={{ fontSize: 10, color: C.dim, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>History</span>
              {convos.length > 0 && <button onClick={clearAll} style={{ fontSize: 10, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>clear all</button>}
            </div>
            {convos.length === 0 && <p style={{ color: C.dim, fontSize: 12, padding: 4 }}>No chats yet</p>}
            {convos.map((c) => (
              <div key={c.id} onClick={() => loadChat(c.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 9px', borderRadius: 7, cursor: 'pointer', marginBottom: 2, background: cid === c.id ? 'rgba(108,99,255,.1)' : 'transparent', border: `1px solid ${cid === c.id ? 'rgba(108,99,255,.22)' : 'transparent'}`, transition: 'all .15s' }}>
                <div style={{ fontSize: 12, color: cid === c.id ? C.text : C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.title}</div>
                <button onClick={(e) => delChat(c.id, e)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 15, padding: '0 2px', flexShrink: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          {/* User footer */}
          <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 33, height: 33, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.email}</div>
                <div style={{ fontSize: 10, color: C.green }}>● Active</div>
              </div>
              <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 17, padding: 4, lineHeight: 1 }}>⏻</button>
            </div>
          </div>
        </div>

        {/* ── MAIN ──────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Top bar */}
          <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${C.border}`, background: C.surface, gap: 10, flexShrink: 0 }}>
            <button onClick={() => setSidebar((p) => !p)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, padding: '4px 8px', borderRadius: 6, lineHeight: 1 }}>☰</button>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, flex: 1 }}>
              {view === 'chat' ? (cid ? convos.find((c) => c.id === cid)?.title || 'Chat' : 'New Chat') : view === 'performance' ? 'Performance' : 'Settings'}
            </div>
            {view === 'chat' && (
              <div style={{ display: 'flex', gap: 5 }}>
                {Object.entries(MODES).map(([k, m]) => (
                  <button key={k} onClick={() => setMode(k)}
                    style={{ padding: '5px 10px', border: `1px solid ${mode === k ? m.color : C.border}`, borderRadius: 8, background: mode === k ? m.dimColor : 'transparent', color: mode === k ? m.color : C.muted, cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all .15s', whiteSpace: 'nowrap' }}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 12, flexShrink: 0 }}>
              <span style={{ width: 7, height: 7, background: C.green, borderRadius: '50%', display: 'inline-block', animation: 'pulse 2.5s ease-in-out infinite' }} />
              Live
            </div>
          </div>

          {/* Views */}
          {view === 'performance'
            ? <div style={{ flex: 1, overflowY: 'auto' }}><PerfView m={metrics} /></div>
            : view === 'settings'
              ? <div style={{ flex: 1, overflowY: 'auto' }}><SettingsView cfg={cfg} setCfg={setCfg} mode={mode} setMode={setMode} /></div>
              : (
                <>
                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                    {msgs.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                        <div style={{ width: 88, height: 88, borderRadius: 22, background: M.dimColor, border: `1px solid ${M.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 18, animation: 'glow 3s ease-in-out infinite' }}>{M.icon}</div>
                        <h2 style={{ margin: '0 0 8px', fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, background: `linear-gradient(90deg,${M.color},${C.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS {M.label}</h2>
                        <p style={{ color: C.muted, fontSize: 14, maxWidth: 360, lineHeight: 1.7, margin: '0 0 24px' }}>Your advanced AI agent is ready. Ask anything — from complex code to deep research and creative problem solving.</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 540 }}>
                          {PROMPTS.map((p) => (
                            <button key={p} onClick={() => setInp(p)} style={{ padding: '8px 16px', background: `${M.color}0F`, border: `1px solid ${M.color}2A`, borderRadius: 20, color: M.color, fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>{p}</button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      msgs.map((m) => (
                        <div key={m.id} style={{ marginBottom: 20, display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 10, animation: 'fadeUp .3s ease' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: m.role === 'user' ? 'linear-gradient(135deg,#6C63FF,#5550EE)' : `${MODES[m.amode || mode].color}22`, border: m.role === 'assistant' ? `1px solid ${MODES[m.amode || mode].color}33` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                            {m.role === 'user' ? user.name?.[0]?.toUpperCase() || 'U' : '✦'}
                          </div>
                          <div style={{ maxWidth: '76%' }}>
                            <div style={{ padding: '12px 16px', background: m.role === 'user' ? 'linear-gradient(135deg,#6C63FF,#5550EE)' : m.isErr ? 'rgba(255,71,87,.1)' : C.card, border: m.role === 'assistant' ? `1px solid ${m.isErr ? C.red : C.border}` : 'none', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', boxShadow: m.role === 'user' ? '0 4px 22px rgba(108,99,255,.3)' : '0 2px 12px rgba(0,0,0,.2)', color: C.text }}>
                              <MsgContent content={m.content} />
                            </div>
                            {m.role === 'assistant' && m.rt && (
                              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, paddingLeft: 4 }}>
                                {(m.rt / 1000).toFixed(2)}s · {m.tok || 0} tokens · {MODES[m.amode || mode].label} mode
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Typing indicator */}
                    {busy && (
                      <div style={{ display: 'flex', gap: 10, marginBottom: 20, animation: 'fadeUp .3s ease' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${M.color}22`, border: `1px solid ${M.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
                        <div style={{ padding: '14px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
                          {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: M.color, animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }} />)}
                        </div>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* Input */}
                  <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: C.card, border: `1px solid ${busy ? M.color + '55' : C.border}`, borderRadius: 16, padding: '8px 8px 8px 16px', transition: 'border-color .25s,box-shadow .25s', boxShadow: busy ? `0 0 24px ${M.color}1A` : 'none' }}>
                      <textarea
                        ref={inpRef}
                        value={inp}
                        onChange={(e) => setInp(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px'; }}
                        placeholder={`Message NEXUS ${M.label}… (Enter to send, Shift+Enter for newline)`}
                        rows={1} disabled={busy}
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 14, resize: 'none', lineHeight: 1.55, fontFamily: "'Inter',sans-serif", paddingTop: 6, paddingBottom: 6, maxHeight: 130, overflowY: 'auto' }}
                      />
                      <button onClick={send} disabled={!inp.trim() || busy}
                        style={{ width: 40, height: 40, borderRadius: 11, border: 'none', background: inp.trim() && !busy ? `linear-gradient(135deg,${M.color},${M.color}CC)` : C.dim, color: inp.trim() && !busy ? '#fff' : C.muted, cursor: inp.trim() && !busy ? 'pointer' : 'not-allowed', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0, boxShadow: inp.trim() && !busy ? `0 4px 18px ${M.color}44` : 'none' }}>
                        {busy
                          ? <div style={{ width: 16, height: 16, border: '2px solid transparent', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin .75s linear infinite' }} />
                          : '↑'}
                      </button>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 7, fontSize: 11, color: C.dim }}>
                      NEXUS · Claude Sonnet 4.6 · {mode === 'researcher' ? '⊛ Web search active' : '✦ ' + M.label + ' mode'} · Shift+Enter for newline
                    </div>
                  </div>
                </>
              )}
        </div>
      </div>
    </>
  );
}
