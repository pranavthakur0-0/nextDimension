import { useState, useRef, useCallback } from "react";
import type { TranscriptMessage } from "../components/Transcript";

export type ConnectionState = "idle" | "connecting" | "connected" | "error";

export function useWebRTC(todayEvents: any[] = []) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [liveText, setLiveText] = useState("");
  const [liveRole, setLiveRole] = useState<"user" | "assistant" | "">("");
  const [volumeLevel, setVolumeLevel] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const assistantMsg = useRef("");
  const assistantId = useRef("");
  const userMsgMap = useRef<Map<string, string>>(new Map());

  // ── Tool execution ──────────────────────────────────────────────────────────
  const handleToolCall = useCallback(async (name: string, args: Record<string, unknown>, callId: string) => {
    const ENDPOINTS: Record<string, { method: string; url: (a: typeof args) => string }> = {
      check_availability: { method: "POST", url: () => "/api/calendar/availability" },
      create_event:       { method: "POST", url: () => "/api/calendar/events" },
      find_event_by_name: { method: "POST", url: () => "/api/calendar/find-event" },
      list_events:        { method: "GET",  url: (a) => `/api/calendar/events?start_date=${a.start_date}&end_date=${a.end_date}` },
    };
    
    const ep = ENDPOINTS[name];
    if (!ep) return;

    const isPost = ep.method === "POST";
    let output: unknown;
    try {
      const res = await fetch(ep.url(args), {
        method: ep.method,
        headers: isPost ? { "Content-Type": "application/json" } : {},
        body: isPost ? JSON.stringify(args) : undefined,
      });
      output = await res.json();
    } catch {
      output = { error: "Tool execution failed" };
    }

    if (dcRef.current?.readyState === "open") {
      dcRef.current.send(JSON.stringify({
        type: "conversation.item.create",
        item: { type: "function_call_output", call_id: callId, output: JSON.stringify(output) }
      }));
      dcRef.current.send(JSON.stringify({ type: "response.create" }));
    }
  }, []);

  // ── Connection lifecycle ────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    pcRef.current?.close(); pcRef.current = null;
    dcRef.current?.close(); dcRef.current = null;
    if (audioRef.current) { audioRef.current.srcObject = null; audioRef.current = null; }
    
    setConnectionState("idle");
    setIsUserSpeaking(false);
    setIsAssistantSpeaking(false);
    setLiveText("");
    setLiveRole("");
    setVolumeLevel(0);
    assistantMsg.current = "";
    assistantId.current = "";
    userMsgMap.current.clear();
  }, []);

  // ── Realtime event handler ──────────────────────────────────────────────────
  const handleEvent = useCallback((event: Record<string, unknown>) => {
    switch (event.type as string) {
      case "input_audio_buffer.speech_started":
        console.log("🎙️ You started speaking...");
        setIsUserSpeaking(true);
        setLiveText("");
        setLiveRole("user");
        break;

      case "input_audio_buffer.speech_stopped":
        console.log("⏹️ You stopped speaking.");
        setIsUserSpeaking(false);
        break;

      case "conversation.item.created": {
        const item = event.item as { id?: string; type?: string; role?: string } | undefined;
        if (item?.type === "message" && item?.role === "user") {
          const msgId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          userMsgMap.current.set(item.id!, msgId);
          setMessages((p) => [...p, { id: msgId, role: "user", text: "..." }]);
        }
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const transcript = ((event.transcript as string) || "").trim();
        const itemId = event.item_id as string;
        if (!transcript) break;
        
        const msgId = userMsgMap.current.get(itemId);
        if (msgId) {
          setMessages((p) => p.map((m) => m.id === msgId ? { ...m, text: transcript } : m));
          userMsgMap.current.delete(itemId);
        } else {
          setMessages((p) => {
            const idx = p.findLastIndex((m) => m.role === "user" && m.text === "...");
            if (idx >= 0) { const u = [...p]; u[idx] = { ...u[idx], text: transcript }; return u; }
            return [...p, { id: `u-${Date.now()}`, role: "user", text: transcript }];
          });
        }
        setLiveText(transcript);
        setLiveRole("user");
        break;
      }

      case "response.audio_transcript.delta": {
        const delta = (event.delta as string) || "";
        console.log("🔊 AI is speaking:", delta);
        setLiveRole("assistant");
        
        if (!assistantId.current) {
          const id = `a-${Date.now()}`;
          assistantId.current = id;
          assistantMsg.current = delta;
          setMessages((p) => [...p, { id, role: "assistant", text: delta }]);
        } else {
          assistantMsg.current += delta;
          const txt = assistantMsg.current;
          const id = assistantId.current;
          setMessages((p) => p.map((m) => m.id === id ? { ...m, text: txt } : m));
        }
        setLiveText((t) => {
          const full = assistantMsg.current;
          return full.length > 100 ? "..." + full.slice(-100) : full;
        });
        break;
      }

      case "response.audio_transcript.done": {
        const final = assistantMsg.current;
        setLiveText(final.length > 100 ? "..." + final.slice(-100) : final);
        assistantMsg.current = "";
        assistantId.current = "";
        break;
      }

      case "response.function_call_arguments.done": {
        const { name, arguments: a, call_id } = event as { name?: string; arguments?: string; call_id?: string };
        if (name && a && call_id) {
          if (name === "end_session") {
            disconnect();
          } else {
            try { handleToolCall(name, JSON.parse(a), call_id); } catch { /* */ }
          }
        }
        break;
      }
    }
  }, [handleToolCall, disconnect]);

  const connect = useCallback(async () => {
    if (connectionState !== "idle" && connectionState !== "error") return;
    setConnectionState("connecting");
    
    try {
      const [key, stream] = await Promise.all([
        fetch("/api/session", { method: "POST" }).then(async (r) => { 
          if (!r.ok) throw new Error(); 
          const d = await r.json(); 
          return d.client_secret?.value as string; 
        }),
        navigator.mediaDevices.getUserMedia({ audio: true }),
      ]);
      
      if (!key) throw new Error("No token returned");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (e) => { 
        audio.srcObject = e.streams[0]; 
        console.log("🎙️ Receiving Audio Stream from AI:", e.streams[0]);

        // Attach Web Audio API to measure emphasis/volume in real-time
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(e.streams[0]);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          let silenceFrames = 0;
          let currentlySpeaking = false;

          const checkVolume = () => {
            if (!pcRef.current) return; // stop looping if disconnected
            
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length; // volume from 0 to 255

            // Update numeric volume state for CSS scaling
            setVolumeLevel(Math.round(avg));

            // Sync the "isSpeaking" boolean perfectly with the physical audio
            if (avg > 2) {
              silenceFrames = 0;
              if (!currentlySpeaking) {
                currentlySpeaking = true;
                setIsAssistantSpeaking(true);
              }
            } else {
              silenceFrames++;
              // If volume is dead silent for ~30 frames (0.5s), AI is done speaking
              if (silenceFrames > 30 && currentlySpeaking) {
                currentlySpeaking = false;
                setIsAssistantSpeaking(false);
              }
            }

            requestAnimationFrame(checkVolume);
          };
          
          // Start the realtime monitoring loop
          checkVolume();
        } catch (err) {
          console.error("Failed to start audio analyser", err);
        }
      };
      
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.onopen = () => {
        setConnectionState("connected");
        
        // Form a simple context about upcoming meetings for the AI's opening line
        const pendingEvents = todayEvents.length > 0 
          ? JSON.stringify(todayEvents) 
          : "No events remaining today.";

        const hiddenPrompt = `I have just connected the voice app. Greet me warmly and concisely. Introduce yourself briefly. 
        Here are my meetings for today: ${pendingEvents}. 
        If any meeting is less than 1 hour away from right now, EXPLICITLY warn me about it and ask if I am prepared. 
        If there are no immediate meetings, simply ask if I want to review my schedule or book something new. 
        Do not read out full times or long blocks of text - keep it to a fast, conversational voice response.`;

        // Silently push it into the AI's context window as an invisible user message
        dc.send(JSON.stringify({
          type: "conversation.item.create",
          item: { type: "message", role: "user", content: [{ type: "input_text", text: hiddenPrompt }] }
        }));
        
        // Force the AI to speak
        dc.send(JSON.stringify({ type: "response.create" }));
      };
      dc.onmessage = (e) => { try { handleEvent(JSON.parse(e.data)); } catch { /* */ } };
      dc.onclose = () => setConnectionState("idle");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const sdpRes = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      
      if (!sdpRes.ok) throw new Error("WebRTC handshake failed");
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
      
    } catch {
      setConnectionState("error");
      disconnect();
    }
  }, [connectionState, handleEvent, disconnect]);

  const toggleConnection = useCallback(() => {
    if (connectionState === "connected") {
      disconnect();
    } else {
      connect();
    }
  }, [connectionState, connect, disconnect]);

  return {
    connectionState,
    isUserSpeaking,
    isAssistantSpeaking,
    messages,
    liveText,
    liveRole,
    volumeLevel,
    connect,
    disconnect,
    toggleConnection,
  };
}
