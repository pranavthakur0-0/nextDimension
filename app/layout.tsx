import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Scheduler — AI Meeting Assistant",
  description:
    "Voice-enabled AI agent that helps you find and schedule meetings through natural conversation. Powered by OpenAI and Google Calendar.",
  keywords: ["AI scheduler", "meeting assistant", "voice chatbot", "Google Calendar"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
