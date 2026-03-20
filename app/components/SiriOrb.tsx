interface SiriOrbProps {
  isAssistantSpeaking: boolean;
  isUserSpeaking: boolean;
  volumeLevel: number;
}

export default function SiriOrb({ isAssistantSpeaking, isUserSpeaking, volumeLevel }: SiriOrbProps) {
  // Gentle base pulse scale
  const volumeScale = isAssistantSpeaking ? 1 + volumeLevel / 600 : 1; 

  let stateClass = "idle";
  if (isAssistantSpeaking) stateClass = "ai-speaking";
  else if (isUserSpeaking) stateClass = "user-listening";

  return (
    <div
      className={`siri-orb ${stateClass}`}
      style={{
        transform: `scale(${volumeScale})`,
      }}
    >
      <div className="siri-orb-base" />
      <div className="siri-blob siri-blob-1" />
      <div className="siri-blob siri-blob-2" />
      <div className="siri-blob siri-blob-3" />
      <div className="siri-orb-glass" />
    </div>
  );
}
