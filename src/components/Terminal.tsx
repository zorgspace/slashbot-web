"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TerminalLine {
  type: "prompt" | "command" | "output" | "error" | "success" | "violet" | "muted" | "logo";
  content: string;
  delay?: number;
}

const skullLogo = ` ▄▄▄▄▄▄▄
▐░░░░░░░▌
▐░▀░░░▀░▌
▐░░░▄░░░▌
▐░░▀▀▀░░▌
 ▀▀▀▀▀▀▀`;

const demoLines: TerminalLine[] = [
  { type: "logo", content: skullLogo, delay: 200 },
  { type: "violet", content: "Slashbot v1.0.5", delay: 100 },
  { type: "muted", content: "Grok 4.1 · X.AI · ~/projects", delay: 50 },
  { type: "muted", content: "─".repeat(40), delay: 100 },
  { type: "output", content: "", delay: 200 },
  { type: "prompt", content: "slashbot > " },
  { type: "command", content: "/help", delay: 600 },
  { type: "output", content: "", delay: 150 },
  { type: "muted", content: "Commands:", delay: 50 },
  { type: "output", content: "  /login      Enter Grok API key", delay: 30 },
  { type: "output", content: "  /config     Show configuration", delay: 30 },
  { type: "output", content: "  /grep       Search in code", delay: 30 },
  { type: "output", content: "  /files      List project files", delay: 30 },
  { type: "output", content: "  /task       Manage scheduled tasks", delay: 30 },
  { type: "output", content: "  /skill      Manage skills", delay: 30 },
  { type: "output", content: "", delay: 100 },
  { type: "prompt", content: "slashbot > " },
  { type: "command", content: "Add JWT authentication to my Express API", delay: 1000 },
  { type: "output", content: "", delay: 200 },
  { type: "violet", content: "● Glob(src/**/*.ts)", delay: 150 },
  { type: "muted", content: "  ⎿ Found 12 files", delay: 150 },
  { type: "output", content: "", delay: 100 },
  { type: "violet", content: "● Read(src/index.ts)", delay: 200 },
  { type: "muted", content: "  ⎿ Read 45 lines", delay: 100 },
  { type: "output", content: "", delay: 100 },
  { type: "violet", content: "● Create(src/middleware/auth.ts)", delay: 300 },
  { type: "success", content: "  ⎿ Created (38 lines)", delay: 150 },
  { type: "violet", content: "● Edit(src/index.ts)", delay: 200 },
  { type: "success", content: "  ⎿ Updated", delay: 150 },
  { type: "output", content: "", delay: 100 },
  { type: "violet", content: "● Exec(bun run typecheck)", delay: 200 },
  { type: "success", content: "  ⎿ ✓ No errors", delay: 200 },
  { type: "output", content: "", delay: 100 },
  { type: "muted", content: "Added JWT middleware with verify and sign functions.", delay: 100 },
  { type: "output", content: "", delay: 100 },
  { type: "prompt", content: "slashbot > " },
];

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex < demoLines.length) {
      const line = demoLines[currentIndex];
      const delay = line.delay || 50;

      const timer = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        setCurrentIndex((prev) => prev + 1);

        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, delay);

      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setLines([]);
        setCurrentIndex(0);
      }, 6000);
      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex]);

  const getLineClass = (type: string) => {
    switch (type) {
      case "prompt":
        return "text-terminal-violet font-bold";
      case "command":
        return "text-terminal-text";
      case "output":
        return "text-terminal-muted";
      case "error":
        return "text-terminal-red";
      case "success":
        return "text-terminal-green";
      case "violet":
        return "text-terminal-violet";
      case "muted":
        return "text-terminal-muted";
      case "logo":
        return "text-terminal-violet";
      default:
        return "text-terminal-text";
    }
  };

  return (
    <div className="terminal-window w-full max-w-3xl mx-auto violet-glow">
      <div className="terminal-header">
        <div className="terminal-dot bg-terminal-red"></div>
        <div className="terminal-dot bg-terminal-yellow"></div>
        <div className="terminal-dot bg-terminal-green"></div>
        <span className="ml-4 text-terminal-muted text-sm">
          slashbot — zsh
        </span>
      </div>
      <div
        ref={terminalRef}
        className="terminal-body h-[420px] overflow-y-auto bg-terminal-bg"
      >
        <AnimatePresence>
          {lines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.05 }}
              className="flex"
            >
              <span className={`${getLineClass(line.type)} whitespace-pre font-mono`}>
                {line.content}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentIndex === demoLines.length - 1 && (
          <span className="cursor"></span>
        )}
      </div>
    </div>
  );
}
