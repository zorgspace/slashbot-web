"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVersion } from "@/hooks/useVersion";

interface ChatMessage {
  type: "user" | "bot" | "tool" | "success" | "muted";
  content: string;
  label?: string;
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const ROBOT_ART = ` ▄▄▄▄▄▄▄
▐░░░░░░░▌
▐░▀░░░▀░▌
▐░░░▄░░░▌
▐░░▀▀▀░░▌
 ▀▀▀▀▀▀▀`;

export function Terminal() {
  const version = useVersion();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReflecting, setIsReflecting] = useState(false);
  const [spinnerIdx, setSpinnerIdx] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  const displayVersion = version || "v2.1.0";

  // Braille spinner animation
  useEffect(() => {
    if (!isReflecting) return;
    const iv = setInterval(
      () => setSpinnerIdx((i) => (i + 1) % SPINNER_FRAMES.length),
      80
    );
    return () => clearInterval(iv);
  }, [isReflecting]);

  // Auto-scroll (only within the terminal, not the page)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Demo loop
  useEffect(() => {
    cancelRef.current = false;

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const addMessages = async (msgs: ChatMessage[], interval = 150) => {
      for (const msg of msgs) {
        if (cancelRef.current) return;
        setMessages((prev) => [...prev, msg]);
        await sleep(interval);
      }
    };

    const runDemo = async () => {
      while (!cancelRef.current) {
        setMessages([]);
        setIsReflecting(false);

        await sleep(1200);
        if (cancelRef.current) return;

        // Exchange 1: WhatsApp — Edit Readme
        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            content: "Edit Readme and bump the release",
            label: "whatsapp",
          },
        ]);

        setIsReflecting(true);
        await sleep(2000);
        if (cancelRef.current) return;
        setIsReflecting(false);

        await addMessages(
          [
            {
              type: "bot",
              content:
                "On it — updating README.md and bumping version to v3.1.0…",
            },
          ],
          300
        );
        await sleep(1500);
        if (cancelRef.current) return;

        await addMessages(
          [
            {
              type: "success",
              content:
                "Done ✓  README updated, version bumped to v3.1.0, pushed to main.",
            },
          ],
          300
        );
        await sleep(2000);
        if (cancelRef.current) return;

        // Exchange 2: WhatsApp — Voice message
        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            content: "🎤 [Voice message received]",
            label: "whatsapp",
          },
        ]);

        setIsReflecting(true);
        await sleep(2000);
        if (cancelRef.current) return;
        setIsReflecting(false);

        await addMessages(
          [
            {
              type: "bot",
              content:
                "Ok, I've updated my HEARTBEAT.md and added to check last 3 emails and make a summary",
            },
          ],
          300
        );
        await sleep(2500);
        if (cancelRef.current) return;

        // Exchange 3: Telegram — Issue status
        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            content: "What's the status of issue #42?",
            label: "telegram",
          },
        ]);

        setIsReflecting(true);
        await sleep(2000);
        if (cancelRef.current) return;
        setIsReflecting(false);

        await addMessages(
          [
            {
              type: "bot",
              content:
                'Issue #42: "Fix auth timeout" — assigned to @marc, in progress. 2 comments, last update 3h ago.',
            },
          ],
          300
        );
        await sleep(2500);
        if (cancelRef.current) return;

        // Exchange 4: Discord — Schedule
        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            content: "Schedule a standup reminder for tomorrow 9am",
            label: "discord",
          },
        ]);

        setIsReflecting(true);
        await sleep(2000);
        if (cancelRef.current) return;
        setIsReflecting(false);

        await addMessages(
          [
            {
              type: "success",
              content:
                "Done ✓  Standup reminder set for tomorrow 9:00 AM. I'll ping #general 5 min before.",
            },
          ],
          300
        );
        await sleep(2500);
        if (cancelRef.current) return;

        // Exchange 5: Slack — PR summary
        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            content: "Summarize the last 3 PRs on the repo",
            label: "slack",
          },
        ]);

        setIsReflecting(true);
        await sleep(2000);
        if (cancelRef.current) return;
        setIsReflecting(false);

        await addMessages(
          [
            {
              type: "bot",
              content:
                "• PR #189: Add OAuth2 support — merged\n• PR #190: Fix rate limiting — in review\n• PR #191: Update deps — merged",
            },
          ],
          300
        );

        await sleep(5000);
        if (cancelRef.current) return;
      }
    };

    runDemo();
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const getMessageClass = (type: ChatMessage["type"]) => {
    switch (type) {
      case "tool":
        return "text-terminal-violet";
      case "success":
        return "text-terminal-green";
      case "muted":
        return "text-terminal-muted";
      default:
        return "text-[#e0e0e8]";
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-[#353550]/60 flex flex-col shadow-2xl"
      style={{ backgroundColor: "#1e1e2e", height: "520px" }}
    >
      {/* Header: Robot + Info + Status */}
      <div className="flex items-start justify-between px-4 pt-2 pb-4 shrink-0">
        <div className="flex items-start gap-4">
          {/* Robot pixel art */}
          <pre
            className="text-terminal-violet leading-none font-mono select-none"
            style={{ fontSize: "9px", lineHeight: "11px" }}
          >
            {ROBOT_ART}
          </pre>
          {/* Info */}
          <div className="font-mono pt-0.5">
            <div className="text-sm tracking-wide">
              <span className="text-[#e0e0e8] font-bold">SLASHBOT</span>{" "}
              <span className="text-[#4ade80]">{displayVersion}</span>
            </div>
            <div className="text-xs text-[#8888a0] mt-0.5">
              ~/Projects/slashbot
            </div>
            <div className="text-xs text-[#8888a0]">
              xai · grok-4-1-fast-reasoning
            </div>
            <div className="text-xs text-[#8888a0]">
              ? help · Tab complete
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="font-mono text-xs space-y-0.5 text-right shrink-0 hidden sm:block">
          <div>
            <span className="text-[#4ade80]">●</span>{" "}
            <span className="text-[#e0e0e8]">ready</span>
          </div>
          <div>
            <span className="text-[#4ade80]">●</span>{" "}
            <span className="text-[#e0e0e8]">Telegram</span>
          </div>
          <div>
            <span className="text-[#4ade80]">●</span>{" "}
            <span className="text-[#e0e0e8]">Discord</span>
          </div>
          <div>
            <span className="text-[#4ade80]">●</span>{" "}
            <span className="text-[#e0e0e8]">Slack</span>
          </div>
          <div>
            <span className="text-[#4ade80]">●</span>{" "}
            <span className="text-[#e0e0e8]">WhatsApp</span>
          </div>
          <div>
            <span className="text-[#4ade80]">●</span>{" "}
            <span className="text-[#e0e0e8]">Heartbeat</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 min-h-0">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={`${i}-${msg.type}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="mb-0.5"
            >
              {msg.type === "user" ? (
                <div className="flex items-stretch">
                  <div className="w-[3px] rounded-full bg-terminal-violet mr-3 shrink-0" />
                  <div className="flex items-center gap-2 py-0.5">
                    {msg.label && (
                      <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#9d7cd8]/15 text-[#9d7cd8] shrink-0">
                        {msg.label}
                      </span>
                    )}
                    <span className="text-[#e0e0e8] text-sm font-mono">
                      {msg.content}
                    </span>
                  </div>
                </div>
              ) : (
                <span
                  className={`${getMessageClass(msg.type)} text-sm font-mono whitespace-pre-wrap`}
                >
                  {msg.content || "\u00A0"}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reflection status */}
      <div className="px-4 h-7 flex items-center font-mono text-sm shrink-0">
        <AnimatePresence>
          {isReflecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-[#e8a030]">
                {SPINNER_FRAMES[spinnerIdx]} Reflection...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input line */}
      <div className="px-4 py-2.5 flex items-center font-mono text-sm border-t border-[#ffffff08] shrink-0">
        <span className="text-[#e8a030] mr-2 text-base leading-none">❯</span>
        <div className="flex-1 min-w-0">
          <span className="text-[#555568]">Type your input prompt...</span>
          <span className="cursor ml-[2px]" />
        </div>
        <span className="text-[#555568] text-[11px] hidden sm:inline shrink-0 ml-4">
          Ctrl+T comm · Ctrl+D diff
        </span>
      </div>
    </div>
  );
}
