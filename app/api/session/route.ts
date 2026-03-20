import { NextResponse } from "next/server";
import { TOOL_DEFINITIONS } from "@/lib/tools";
import { getSystemPrompt } from "@/lib/prompt";

export async function POST() {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "coral",
        instructions: getSystemPrompt(currentDate, timezone),
        tools: TOOL_DEFINITIONS,
        input_audio_transcription: {
          model: "whisper-1",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", errorText);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
