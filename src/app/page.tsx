"use client";

import { useState } from "react";

import { Navigation } from "@/components/Navigation";
import { Terminal } from "@/components/Terminal";
import { FeatureCard } from "@/components/FeatureCard";
import { Connectors } from "@/components/Connectors";
import { motion } from "framer-motion";
import { useVersion } from "@/hooks/useVersion";
import ReactMarkdown from "react-markdown";
import { Roadmap } from "@/components/Roadmap";
import { TokenUtility } from "@/components/TokenUtility";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const version = useVersion();

  const installCommand = "curl -fsSL https://getslashbot.com/install.sh | bash";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const features = [
    {
      icon: "●",
      title: "Multi-Provider AI Agent",
      description:
        "21 LLM providers including xAI, OpenAI, Anthropic, Google, Mistral, Ollama and more. Full agentic loop with tool calling.",
      command: "/providers select",
    },
    {
      icon: "●",
      title: "Shell & Filesystem",
      description:
        "Execute shell commands with safety gates. Read, write, patch, append files. Hard-blocked destructive patterns.",
      command: "shell.exec · fs.read · fs.write · fs.patch",
    },
    {
      icon: "●",
      title: "Multi-Agent System",
      description:
        "Register specialist agents with custom prompts, tool allowlists, and provider pinning. Team orchestration.",
      command: "/agents register · @agent_id",
    },
    {
      icon: "●",
      title: "Automation",
      description:
        "Cron jobs, webhooks with HMAC validation, repeating timers, and one-shot delayed jobs. Persistent job queue.",
      command: "automation.add_cron · automation.add_webhook",
    },
    {
      icon: "●",
      title: "Skills System",
      description:
        "50+ bundled skills. Install custom skills from GitHub. Rule files and environment overrides.",
      command: "/skill list · /skill install <url>",
    },
    {
      icon: "●",
      title: "Persistent Memory",
      description:
        "Markdown-based memory store. Search, upsert facts, take timestamped daily notes across sessions.",
      command: "memory.search · memory.upsert · memory.note",
    },
    {
      icon: "●",
      title: "Voice Transcription",
      description:
        "OpenAI Whisper integration. Auto-transcribe voice messages from Telegram, Discord, Slack, and WhatsApp.",
      command: "/transcription setup",
    },
    {
      icon: "●",
      title: "Solana Wallet",
      description:
        "Integrated wallet for SOL & $SLASHBOT tokens. Pay for API usage, send tokens, redeem credits.",
      command: "/wallet balance · /wallet send",
    },
    {
      icon: "●",
      title: "Web Search & Fetch",
      description:
        "AI-powered web search and HTTP fetch with content extraction and summarization.",
      command: "web.search · web.fetch",
    },
    {
      icon: "●",
      title: "Heartbeat System",
      description:
        "Periodic health checks with HEARTBEAT.md review, alert classification, and delivery to any connector.",
      command: "/heartbeat enable · /heartbeat trigger",
    },
    {
      icon: "●",
      title: "Orchestrator",
      description:
        "Delegate tasks to subagents with auto-routing, fan-out, and pipeline strategies. Background execution.",
      command: "orchestrate · orchestrate.list",
    },
    {
      icon: "●",
      title: "Hooks & Plugins",
      description:
        "Plugin-first runtime. Shell hook scripts auto-discovered from .slashbot/hooks/. Extensible event system.",
      command: ".slashbot/hooks/{event}.{name}.sh",
    },
  ];

  const commands = [
    { cmd: "/health", desc: "Runtime health summary" },
    { cmd: "/doctor", desc: "Plugin diagnostics" },
    { cmd: "/help", desc: "List commands and tools" },
    { cmd: "/setup", desc: "Provider onboarding" },
    { cmd: "/providers [select]", desc: "Show/switch LLM provider" },
    { cmd: "/model [select]", desc: "Show/switch active model" },
    { cmd: "/skill [list|run|info]", desc: "Manage skills" },
    { cmd: "/agents [list|register]", desc: "Manage agents & teams" },
    { cmd: "/discord [status|setup]", desc: "Discord connector" },
    { cmd: "/telegram [status|setup]", desc: "Telegram connector" },
    { cmd: "/slack [status|setup]", desc: "Slack connector" },
    { cmd: "/whatsapp [status|setup]", desc: "WhatsApp connector" },
    { cmd: "/heartbeat [status|trigger]", desc: "Health check system" },
    { cmd: "/wallet [balance|send]", desc: "Solana wallet management" },
    { cmd: "/transcription [setup]", desc: "Whisper transcription" },
    { cmd: "/update", desc: "Self-update from git/npm" },
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
            {/* Robot Logo */}
            <pre className="text-terminal-violet text-2xl md:text-3xl font-mono mb-6 glow-violet inline-block leading-tight">
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
              AI-Powered CLI Assistant - Made with Slashbot
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-terminal-muted text-sm mb-6">
              <span>Grok · xAI</span>
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
                icon={
                  <span className="text-terminal-violet">{feature.icon}</span>
                }
                title={feature.title}
                description={feature.description}
                command={feature.command}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4 violet-gradient">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-terminal-text mb-4">
              <span className="text-terminal-violet">●</span> Roadmap
            </h2>
            <p className="text-terminal-muted max-w-2xl mx-auto">
              Future plans and milestones for Slashbot.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
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
                  ROADMAP.md
                </span>
              </div>
              <div className="p-6 bg-terminal-bg text-terminal-text">
                <Roadmap />
              </div>
            </motion.div>
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

      {/* Token Utility Section */}
      <section id="token-utility" className="py-20 px-4 violet-gradient">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-terminal-text mb-4">
              <span className="text-terminal-violet">●</span> Token Utility
            </h2>
            <p className="text-terminal-muted max-w-2xl mx-auto">
              Learn about the $SLASHBOT token and how it powers the ecosystem.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
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
                  TOKEN_UTILITY.md
                </span>
              </div>
              <div className="p-6 bg-terminal-bg text-terminal-text">
                <TokenUtility />
              </div>
            </motion.div>
          </div>
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
              <span className="ml-4 text-terminal-muted text-sm">/help</span>
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
                  <div className="text-terminal-muted text-xs mb-1">
                    Required: X.AI API Key
                  </div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    <span className="text-terminal-violet">/login</span>{" "}
                    xai-xxxxxxxxxxxx
                  </div>
                </div>
                <div>
                  <div className="text-terminal-muted text-xs mb-1">
                    Optional: Voice transcription
                  </div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    Set up OpenAI for voice transcription with key
                    sk-xxxxxxxxxxxx
                  </div>
                </div>
                <div>
                  <div className="text-terminal-muted text-xs mb-1">
                    Optional: Telegram
                  </div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    Connect Telegram bot with token 123456:ABC-xyz
                  </div>
                </div>
                <div>
                  <div className="text-terminal-muted text-xs mb-1">
                    Optional: Discord
                  </div>
                  <div className="text-terminal-text">
                    <span className="text-terminal-violet">slashbot &gt; </span>
                    Set up Discord bot with token MTIxMjM0... on channel
                    1234567890
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
              {version && (
                <span className="text-terminal-muted text-sm">{version}</span>
              )}
              <span className="text-terminal-muted text-xs">
                Made with Slashbot
              </span>
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
              Solana:{" "}
              <span className="text-terminal-violet">
                AtiFyHm6UMNLXCWJGLqhxSwvr3n3MgFKxppkKWUoBAGS
              </span>
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
