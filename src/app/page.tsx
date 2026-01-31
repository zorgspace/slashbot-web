"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Terminal } from "@/components/Terminal";
import { FeatureCard } from "@/components/FeatureCard";
import { Connectors } from "@/components/Connectors";

export default function Home() {
  const [copied, setCopied] = useState(false);

  const installCommand = "curl -fsSL https://slashbot.dev/install.sh | bash";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const features = [
    {
      icon: "●",
      title: "AI-Powered Agent",
      description:
        "Autonomous execution with Grok API. Agentic loop with context-aware continuations.",
      command: "slashbot",
    },
    {
      icon: "●",
      title: "Code Operations",
      description:
        "Grep, read, edit, create files with security checks. Supports glob patterns.",
      command: "[[grep]], [[read]], [[edit]], [[create]]",
    },
    {
      icon: "●",
      title: "Task Scheduling",
      description:
        "Schedule cron jobs and automated commands with the [[schedule]] action.",
      command: "[[schedule cron='0 9 * * *']]",
    },
    {
      icon: "●",
      title: "Git Integration",
      description:
        "Execute git commands safely - status, diff, log, add, commit, checkout, stash.",
      command: "[[git command='status'/]]",
    },
    {
      icon: "●",
      title: "Skills System",
      description:
        "Install and load custom skills/extensions from URLs to extend functionality.",
      command: "/skill install <url>",
    },
    {
      icon: "●",
      title: "Vision Support",
      description:
        "Process images through grok-vision-beta model. Paste images in terminal.",
      command: "/image",
    },
    {
      icon: "●",
      title: "Voice Transcription",
      description:
        "Transcribe voice messages from Telegram and Discord using OpenAI Whisper.",
      command: "auto-transcription",
    },
    {
      icon: "●",
      title: "Web Search & Fetch",
      description:
        "Search the web and fetch URLs with [[search]] and [[fetch]] actions.",
      command: "[[fetch url='...'/]]",
    },
  ];

  const commands = [
    { cmd: "/login [key]", desc: "Enter Grok API key" },
    { cmd: "/logout", desc: "Clear API key" },
    { cmd: "/config", desc: "Show configuration" },
    { cmd: "/init", desc: "Create GROK.md with AI" },
    { cmd: "/grep <pattern>", desc: "Search in code" },
    { cmd: "/files [pattern]", desc: "List project files" },
    { cmd: "/read <path>", desc: "Read file contents" },
    { cmd: "/write <path>", desc: "Write to file" },
    { cmd: "/task [list|run|...]", desc: "Manage scheduled tasks" },
    { cmd: "/skill [list|install]", desc: "Manage skills" },
    { cmd: "/usage [reset]", desc: "Show API usage" },
    { cmd: "/context [on|off]", desc: "Manage context compression" },
    { cmd: "/history [n]", desc: "Show command history" },
    { cmd: "/clear", desc: "Clear conversation" },
    { cmd: "/help", desc: "Show all commands" },
  ];

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Skull Logo */}
            <pre className="text-terminal-violet text-2xl md:text-3xl font-mono mb-6 glow-violet inline-block">
{` ▄▄▄▄▄▄▄
▐░░░░░░░▌
▐░▀░░░▀░▌
▐░░░▄░░░▌
▐░░▀▀▀░░▌
 ▀▀▀▀▀▀▀`}
            </pre>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-terminal-violet glow-violet">/</span>
              <span className="text-terminal-text">slashbot</span>
            </h1>
            <p className="text-terminal-muted text-lg max-w-2xl mx-auto mb-2">
              AI-Powered CLI Assistant
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-terminal-muted text-sm mb-6">
              <span>Grok 4.1</span>
              <span>·</span>
              <a
                href="https://x.com/getslashbot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                @getslashbot
              </a>
              <span>·</span>
              <a
                href="https://t.me/+x1DKI8HTiWowOGNk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                Telegram
              </a>
              <span>·</span>
              <a
                href="https://x.com/i/communities/2016815837026439527"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                Community
              </a>
            </div>

            {/* Install Command */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-terminal-surface border border-terminal-border rounded-lg p-3 font-mono text-sm flex items-center justify-between gap-4">
                <div className="overflow-x-auto">
                  <span className="text-terminal-violet">$ </span>
                  <span className="text-terminal-text whitespace-nowrap">
                    {installCommand}
                  </span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 px-3 py-1 text-xs border border-terminal-border rounded hover:border-terminal-violet hover:text-terminal-violet transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="#install" className="btn-primary">
                Get Started
              </a>
              <a
                href="https://github.com/zorgspace/slashbot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>

          <Terminal />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 violet-gradient">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-terminal-text mb-4">
              <span className="text-terminal-violet">●</span> Features
            </h2>
            <p className="text-terminal-muted max-w-2xl mx-auto">
              Powerful capabilities for developers who live in the terminal.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={<span className="text-terminal-violet">{feature.icon}</span>}
                title={feature.title}
                description={feature.description}
                command={feature.command}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Connectors Section */}
      <section id="connectors" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-terminal-text mb-4">
              <span className="text-terminal-violet">●</span> Connectors
            </h2>
            <p className="text-terminal-muted max-w-2xl mx-auto">
              Stay connected with your AI assistant on your favorite platforms.
            </p>
          </motion.div>

          <Connectors />
        </div>
      </section>

      {/* Commands Reference Section */}
      <section className="py-20 px-4 violet-gradient">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-terminal-text mb-4">
              <span className="text-terminal-violet">●</span> Commands
            </h2>
            <p className="text-terminal-muted">
              Quick reference for slash commands.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="terminal-window"
          >
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-red"></div>
              <div className="terminal-dot bg-terminal-yellow"></div>
              <div className="terminal-dot bg-terminal-green"></div>
              <span className="ml-4 text-terminal-muted text-sm">
                /help
              </span>
            </div>
            <div className="p-6 bg-terminal-bg">
              <div className="grid sm:grid-cols-2 gap-1">
                {commands.map((item) => (
                  <div
                    key={item.cmd}
                    className="flex items-start gap-3 py-2 px-3 rounded hover:bg-terminal-surface transition-colors"
                  >
                    <code className="text-terminal-violet text-sm whitespace-nowrap font-mono">
                      {item.cmd}
                    </code>
                    <span className="text-terminal-muted text-sm">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="install" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-terminal-text mb-4">
              <span className="text-terminal-violet">●</span> Installation
            </h2>
            <p className="text-terminal-muted">
              Get up and running in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Install with curl */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot bg-terminal-red"></div>
                <div className="terminal-dot bg-terminal-yellow"></div>
                <div className="terminal-dot bg-terminal-green"></div>
                <span className="ml-4 text-terminal-muted text-sm">
                  Install
                </span>
              </div>
              <div className="p-4 bg-terminal-bg font-mono text-sm flex items-center justify-between gap-4">
                <div className="overflow-x-auto">
                  <span className="text-terminal-violet">$ </span>
                  <span className="text-terminal-text whitespace-nowrap">
                    {installCommand}
                  </span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 px-3 py-1 text-xs border border-terminal-border rounded hover:border-terminal-violet hover:text-terminal-violet transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Configure with prompts */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot bg-terminal-red"></div>
                <div className="terminal-dot bg-terminal-yellow"></div>
                <div className="terminal-dot bg-terminal-green"></div>
                <span className="ml-4 text-terminal-muted text-sm">
                  Configure
                </span>
              </div>
              <div className="p-4 bg-terminal-bg font-mono text-sm space-y-4">
                <div>
                  <div className="text-terminal-muted text-xs mb-1">Required: X.AI API Key</div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    <span className="text-terminal-violet">/login</span> xai-xxxxxxxxxxxx
                  </div>
                </div>
                <div>
                  <div className="text-terminal-muted text-xs mb-1">Optional: Voice transcription</div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    Set up OpenAI for voice transcription with key sk-xxxxxxxxxxxx
                  </div>
                </div>
                <div>
                  <div className="text-terminal-muted text-xs mb-1">Optional: Telegram</div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    Connect Telegram bot with token 123456:ABC-xyz
                  </div>
                </div>
                <div>
                  <div className="text-terminal-muted text-xs mb-1">Optional: Discord</div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    Set up Discord bot with token MTIxMjM0... on channel 1234567890
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-terminal-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-terminal-violet text-xl font-bold">/</span>
              <span className="text-terminal-text font-semibold">slashbot</span>
              <span className="text-terminal-muted text-sm">v1.0.5</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-terminal-muted text-sm">
              <a
                href="https://github.com/zorgspace/slashbot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x.com/getslashbot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                @getslashbot
              </a>
              <a
                href="https://x.com/i/communities/2016815837026439527"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                X Community
              </a>
              <a
                href="https://t.me/+x1DKI8HTiWowOGNk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-violet transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-terminal-muted text-xs font-mono mb-2">
              Solana: <span className="text-terminal-violet">AtiFyHm6UMNLXCWJGLqhxSwvr3n3MgFKxppkKWUoBAGS</span>
            </div>
            <div className="text-terminal-muted text-xs font-mono">
              Built with Bun, TypeScript & Grok API
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
