import { IconMic, IconMicOff, IconSquare } from "./Icons";
import SiriOrb from "./SiriOrb";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface MicButtonProps {
  connectionState: ConnectionState;
  isUserSpeaking: boolean;
  isAssistantSpeaking: boolean;
  volumeLevel: number;
  onToggle: () => void;
  onDisconnect: () => void;
}

export default function MicButton({
  connectionState,
  isUserSpeaking,
  isAssistantSpeaking,
  volumeLevel,
  onToggle,
  onDisconnect,
}: MicButtonProps) {
  const isConnected = connectionState === "connected";

  const statusText =
    connectionState === "connecting" ? "Connecting..." :
    isUserSpeaking ? "Listening..." :
    isAssistantSpeaking ? "Speaking..." :
    isConnected ? "Ready — speak anytime" :
    connectionState === "error" ? "Failed — tap to retry" :
    "Tap to connect";

  const labelClass =
    isUserSpeaking ? "listening" :
    isAssistantSpeaking ? "speaking" :
    isConnected ? "active" : "";

  return (
    <section className="voice-area">
      <div className="voice-switch-wrapper" onClick={onToggle}>
        {/* State: Connected -> Show the Siri Globe */}
        {isConnected ? (
          <div className="voice-state-connected">
            <SiriOrb isAssistantSpeaking={isAssistantSpeaking} isUserSpeaking={isUserSpeaking} volumeLevel={volumeLevel} />
          </div>
        ) : (
          /* State: Idle -> Show the default Mic Button */
          <button
            className={`mic-btn ${connectionState === "connecting" ? "connecting" : ""}`}
            aria-label="Start session"
          >
            <div className="mic-btn-ring" />
            <IconMicOff />
          </button>
        )}
      </div>

      <span className={`voice-label ${labelClass}`}>{statusText}</span>

      {isConnected && (
        <button className="btn btn-end" onClick={onDisconnect}>
          <IconSquare />End Session
        </button>
      )}
    </section>
  );
}
