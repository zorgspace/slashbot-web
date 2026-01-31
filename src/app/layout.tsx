import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slashbot - AI-Powered CLI Assistant",
  description:
    "A lightweight CLI assistant powered by AI. Connect to Telegram, Discord, and use with xAI or ChatGPT APIs.",
  keywords: [
    "CLI",
    "AI assistant",
    "Telegram bot",
    "Discord bot",
    "Grok",
    "ChatGPT",
    "xAI",
    "terminal",
    "developer tools",
  ],
  authors: [{ name: "Slashbot Team" }],
  openGraph: {
    title: "Slashbot - AI-Powered CLI Assistant",
    description:
      "A lightweight CLI assistant powered by AI. Connect to Telegram and Discord.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
