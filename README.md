# Scheduler AI

Voice-first AI scheduling assistant. You talk, it books meetings on your Google Calendar. That's the whole thing.

Built with Next.js, OpenAI's Realtime API (WebRTC), and Google Calendar API. No typing, no forms — just say what you need.

---

## What it does

You connect your Google Calendar, click the mic, and just talk. Say something like "schedule a 30-minute call with the design team sometime Thursday afternoon" and it'll check your actual calendar, find the gap, confirm with you, and create the event. It handles all the back-and-forth naturally.

It also greets you when you connect, tells you if a meeting is starting soon, and disconnects on its own when you're done.

---

## Stack

- **Next.js** — handles the frontend and all the API routes
- **OpenAI Realtime API** — voice in, voice out, single low-latency pipeline (WebRTC)
- **Google Calendar API** — real availability checking and event creation
- **Vanilla CSS** — no Tailwind, just clean custom styles

---

## Running locally

You'll need Node 18+, an OpenAI API key with Realtime access, and a Google Cloud project with Calendar API enabled.

```bash
git clone <repo>
cd scheduler-ai
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

For Google Cloud, you need to create an OAuth 2.0 client (Web application), enable the Calendar API, and add your email as a test user on the consent screen while the app is in testing mode.

```bash
npm run dev
```

Then open `http://localhost:3000` in Chrome and sign in with Google.

---

## Deploying

Set the same environment variables in Netlify/Vercel and update `GOOGLE_REDIRECT_URI` to your production domain. Add that callback URL to your Google Cloud OAuth credentials too.

---

## How it actually works

1. You sign in with Google — tokens stored in a cookie
2. When you hit the mic, the browser opens a WebRTC connection directly to OpenAI
3. Everything from there (speech recognition → AI thinking → voice response) happens in one pipeline, usually under 500ms
4. When the AI needs your calendar data, it fires a tool call that hits our Next.js API routes, then picks up the result and keeps talking
5. When you say "thanks" or "that's all", it says goodbye and hangs up on its own

---

## Project layout

```
app/
  api/
    auth/google/          # OAuth flow
    calendar/             # availability, events, search
    session/              # OpenAI session token
  components/             # MicButton, SiriOrb, Transcript, etc.
  hooks/useWebRTC.ts      # all the WebRTC + audio logic
lib/
  calendar-service.ts
  google.ts
  prompt.ts
  tools.ts
```

---

MIT
