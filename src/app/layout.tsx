import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://getslashbot.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Slashbot - AI-Powered CLI Assistant",
    template: "%s | Slashbot",
  },
  description:
    "AI-powered CLI assistant with Grok 4.1. Features autonomous code operations, git integration, task scheduling, voice capabilities via OpenAI, tokenization with Bankr, social networking on Moltbook, and connectors for Telegram & Discord.",
  keywords: [
    "slashbot",
    "CLI",
    "AI assistant",
    "Grok",
    "Grok 4.1",
    "xAI",
    "terminal",
    "developer tools",
    "code assistant",
    "Telegram bot",
    "Discord bot",
    "agentic AI",
    "command line",
    "automation",
  ],
  authors: [{ name: "slashbinslashnoname" }],
  creator: "slashbinslashnoname",
  publisher: "slashbinslashnoname",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Slashbot",
    title: "Slashbot - AI-Powered CLI Assistant",
    description:
      "AI-powered CLI assistant with Grok 4.1. Autonomous code operations, git integration, task scheduling, and connectors for Telegram & Discord.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slashbot - AI-Powered CLI Assistant",
    description:
      "AI-powered CLI assistant with Grok 4.1. Autonomous code operations, git integration, and Telegram & Discord connectors.",
    creator: "@getslashbot",
  },
  alternates: {
    canonical: siteUrl,
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Slashbot",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, macOS",
  description:
    "AI-powered CLI assistant with Grok 4.1. Autonomous code operations, git integration, task scheduling, and connectors for Telegram & Discord.",
  url: "https://getslashbot.com",
  author: {
    "@type": "Person",
    name: "slashbinslashnoname",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  downloadUrl: "https://getslashbot.com/install.sh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
