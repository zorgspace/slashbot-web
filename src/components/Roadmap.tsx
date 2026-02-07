"use client";

import ReactMarkdown from "react-markdown";
import { useRoadmap } from "@/hooks/useRoadmap";

export function Roadmap() {
  const roadmap = useRoadmap();

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-terminal-violet font-bold text-2xl mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-terminal-violet font-bold text-xl mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-terminal-violet font-semibold text-lg mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-terminal-text mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 text-terminal-muted mb-4">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-terminal-muted">{children}</li>
          ),
          code: ({ children }) => (
            <code className="bg-terminal-border text-terminal-text px-1 py-0.5 rounded text-sm">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-terminal-border p-4 rounded text-terminal-text overflow-x-auto mb-4">{children}</pre>
          ),
        }}
      >
        {roadmap}
      </ReactMarkdown>
    </div>
  );
}