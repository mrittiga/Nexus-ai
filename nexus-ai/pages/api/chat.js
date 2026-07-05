// pages/api/chat.js
// ─────────────────────────────────────────────────────────────
//  Server-side proxy: keeps ANTHROPIC_API_KEY off the browser.
//  Deployed as a Vercel Serverless Function automatically.
// ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not set. Add it in your Vercel dashboard → Settings → Environment Variables.',
    });
  }

  try {
    const { messages, system, mode } = req.body;

    const body = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system,
      messages,
    };

    // Enable live web search for Research mode
    if (mode === 'researcher') {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error('[NEXUS API error]', err);
    return res.status(500).json({ error: { message: err.message } });
  }
}
