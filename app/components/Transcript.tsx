import { useRef } from "react";
import { useEffect } from "react";
import { IconUser, IconBot, IconChevron } from "./Icons";

export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface TranscriptProps {
  messages: TranscriptMessage[];
  isConnected: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Transcript({ messages, isConnected, isOpen, onToggle }: TranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  return (
    <section className="transcript-panel">
      <div className="transcript-toggle" onClick={onToggle}>
        <div className="transcript-toggle-left">
          Transcript
          {messages.length > 0 && <span className="transcript-count">{messages.length}</span>}
        </div>
        <span className={`transcript-toggle-chevron ${isOpen ? "open" : ""}`}>
          <IconChevron />
        </span>
      </div>

      {isOpen && (
        <div className="transcript-box">
          {messages.length === 0 ? (
            <div className="transcript-empty">
              {isConnected ? "Start speaking..." : "No messages yet"}
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`msg ${m.role}`}>
                <div className="msg-avatar">
                  {m.role === "user" ? <IconUser /> : <IconBot />}
                </div>
                <div className="msg-body">
                  <div className="msg-role">{m.role === "user" ? "You" : "Scheduler"}</div>
                  <div className="msg-text">{m.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      )}
    </section>
  );
}
