interface LiveTextProps {
  text: string;
  role: "user" | "assistant" | "";
}

export default function LiveText({ text, role }: LiveTextProps) {
  if (!text) return null;
  return (
    <div className={`live-text ${role === "user" ? "live-user" : ""}`}>
      {role === "user" && <span className="live-you">You: </span>}
      {text}
    </div>
  );
}
