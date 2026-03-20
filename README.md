# 🗓️ Smart Scheduler AI Agent

A voice-enabled AI chatbot that helps you find and schedule meetings through natural conversation, powered by **OpenAI's Realtime API** and **Google Calendar**.

![Smart Scheduler](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![OpenAI](https://img.shields.io/badge/OpenAI-Realtime_API-green?style=flat-square&logo=openai) ![Google Calendar](https://img.shields.io/badge/Google-Calendar_API-red?style=flat-square&logo=google-calendar)

## ✨ Features

- **🎤 Voice-First Interface** — Speak naturally to schedule meetings, no typing required
- **🧠 Intelligent Scheduling** — Understands complex time references like "late next week" or "after my Project Alpha meeting"
- **📅 Google Calendar Integration** — Checks your real availability and creates events directly
- **⚡ Sub-Second Latency** — Uses OpenAI's Realtime API via WebRTC for instant voice responses
- **🔄 Conflict Resolution** — Suggests alternative times when your preferred slot is booked
- **📝 Live Transcript** — See the conversation in real-time as you speak
- **🎨 Premium Dark UI** — Modern glassmorphism design with responsive layout

## 🏗️ Architecture

```
┌─────────────────┐     WebRTC      ┌──────────────────┐
│   Browser        │ ◄────────────► │  OpenAI Realtime  │
│                  │                │  API (GPT-4o)     │
│  Voice Chat UI   │                │  STT + LLM + TTS  │
│  Audio Viz       │                │                    │
│  Transcript      │    tool_call   │  Function Calling  │
└────────┬─────────┘ ◄──────────── └──────────────────┘
         │ fetch
         ▼
┌──────────────────┐     OAuth2     ┌──────────────────┐
│  Next.js API      │ ◄───────────► │  Google Calendar  │
│  Routes (Vercel)  │               │  API              │
│                   │               │                    │
│  /api/session     │               │  Free/Busy        │
│  /api/calendar/*  │               │  Events CRUD      │
│  /api/auth/*      │               │  Search           │
└──────────────────┘               └──────────────────┘
```

**How it works:**
1. User signs in with Google to grant calendar access
2. Browser establishes a WebRTC connection to OpenAI's Realtime API
3. User speaks naturally — OpenAI handles STT → LLM → TTS in one low-latency pipeline
4. When the LLM needs calendar data, it issues a **tool call** (e.g., `check_availability`)
5. The browser intercepts the tool call, calls our Next.js API, and returns results
6. The LLM synthesizes the response and speaks it back

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+ installed
- An OpenAI account with API access (Realtime API requires a funded account)
- A Google Cloud Platform account

### Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd smart-scheduler
npm install
```

### Step 2: Set Up Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > Library**
4. Search for and enable **Google Calendar API**
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > OAuth 2.0 Client ID**
7. Select **Web application**
8. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
9. Copy the **Client ID** and **Client Secret**

> **Note:** You also need to configure the OAuth Consent Screen. Add your email as a test user while the app is in "testing" mode.

### Step 3: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys** and create a new key
3. Ensure your account has billing enabled (Realtime API requires a funded account)

### Step 4: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Step 5: Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome (microphone access required).

## 🗣️ Example Conversations

### Basic Scheduling
> **You:** "I need to schedule a 1-hour meeting on Tuesday afternoon."
> **Bot:** "Let me check your Tuesday afternoon... I found two available slots: 2:00 PM and 4:30 PM. Which works better for you?"
> **You:** "Let's go with 2 PM."
> **Bot:** "What should I call this meeting?"
> **You:** "Team sync."
> **Bot:** "I've created 'Team Sync' for Tuesday at 2:00 PM to 3:00 PM. All set!"

### Smart Time Parsing
> **You:** "Find a time for a 30-minute call sometime late next week."
> **Bot:** "I'll check Thursday and Friday of next week for 30-minute slots..."

### Relative Scheduling
> **You:** "Schedule a 15-minute chat a day or two after the Project Alpha kick-off."
> **Bot:** "Let me find the Project Alpha event first... I see it's on Wednesday. I'll check Thursday and Friday for available slots."

### Conflict Resolution
> **You:** "I need a 1-hour slot on Wednesday morning."
> **Bot:** "Wednesday morning is fully booked. I can see openings at 2:00 PM on Wednesday, or there's a 10:00 AM slot on Thursday. Would either work?"

### Changing Requirements
> **You:** "Find me a 30-minute slot for tomorrow morning."
> **Bot:** "I have 9:30 AM or 11:00 AM available."
> **You:** "Actually, we'll need a full hour now."
> **Bot:** "No problem! For a 1-hour meeting tomorrow morning, I have 9:00 AM available. Shall I book it?"

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Server API routes + React frontend, easy Vercel deploy |
| Voice + LLM | OpenAI Realtime API (WebRTC) | Single API for STT + LLM + TTS with <500ms latency |
| Calendar | Google Calendar API (`googleapis`) | Direct integration with free/busy + CRUD |
| Auth | Google OAuth 2.0 | Required for calendar, familiar UX |
| Styling | Vanilla CSS | Maximum flexibility, no framework overhead |

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/google/          # OAuth initiation
│   │   │   └── callback/         # OAuth callback
│   │   ├── calendar/
│   │   │   ├── availability/     # Find available slots
│   │   │   ├── events/           # List/create events
│   │   │   └── find-event/       # Search events by name
│   │   └── session/              # OpenAI ephemeral token
│   ├── globals.css               # Design system
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main voice chat UI
├── lib/
│   ├── calendar-service.ts       # Calendar business logic
│   ├── google.ts                 # OAuth helpers
│   ├── prompt.ts                 # System prompt
│   └── tools.ts                  # Tool definitions
├── .env.example
└── README.md
```

## 🎨 Design Decisions

1. **WebRTC over WebSocket** — Lower latency for real-time audio streaming. WebRTC handles NAT traversal and codec negotiation automatically.

2. **Client-Side Tool Execution** — Tool calls are intercepted in the browser and routed to our API. This avoids the need for a persistent server-side WebSocket connection and works seamlessly with serverless deployment.

3. **Cookie-Based Token Storage** — Google OAuth tokens are stored in HTTP-only cookies. Simple, secure, and no database required for the demo.

4. **Comprehensive System Prompt** — The prompt includes detailed time-parsing instructions, conflict resolution strategies, and conversation guidelines to make the agent behave naturally.

5. **OpenAI Realtime API** — Instead of chaining separate STT → LLM → TTS services (which adds latency at each hop), the Realtime API provides a single <500ms pipeline for the entire voice interaction.

## 🚢 Deployment (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Update `GOOGLE_REDIRECT_URI` to your Vercel domain
5. Add the Vercel callback URL to Google Cloud OAuth credentials
6. Deploy!

## 📄 License

MIT
