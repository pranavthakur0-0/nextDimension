"use client";

import { useState, useEffect, useCallback } from "react";
import NavBar from "./components/NavBar";
import MicButton from "./components/MicButton";
import LiveText from "./components/LiveText";
import Transcript from "./components/Transcript";
import AuthScreen from "./components/AuthScreen";
import { useWebRTC } from "./hooks/useWebRTC";

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);

  // All WebRTC complex logic is now neatly encapsulated
  const {
    connectionState,
    isUserSpeaking,
    isAssistantSpeaking,
    messages,
    liveText,
    liveRole,
    volumeLevel,
    toggleConnection,
    disconnect,
  } = useWebRTC(todayEvents);

  // Validate Google Auth on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      setIsAuthenticated(true);
      window.history.replaceState({}, "", "/");
    }
    
    // Fetch today's actual schedule to inject into AI greeting
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    fetch(`/api/calendar/events?start_date=${todayStr}&end_date=${todayStr}`)
      .then(async (r) => { 
        if (r.status !== 401) {
          setIsAuthenticated(true);
          try {
            const data = await r.json();
            setTodayEvents(Array.isArray(data) ? data : []);
          } catch {
            // Empty
          }
        } 
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  const signOut = useCallback(() => {
    document.cookie = "google_tokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    disconnect();
  }, [disconnect]);

  // Loading state
  if (!authChecked) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // App running
  return (
    <div className="app">
      <NavBar isConnected={connectionState === "connected"} onSignOut={signOut} />
      
      <main className="main">
        <MicButton
          connectionState={connectionState}
          isUserSpeaking={isUserSpeaking}
          isAssistantSpeaking={isAssistantSpeaking}
          volumeLevel={volumeLevel}
          onToggle={toggleConnection}
          onDisconnect={disconnect}
        />
        
        <LiveText text={liveText} role={liveRole} />
        
        <Transcript
          messages={messages}
          isConnected={connectionState === "connected"}
          isOpen={showTranscript}
          onToggle={() => setShowTranscript((v) => !v)}
        />
      </main>
    </div>
  );
}
