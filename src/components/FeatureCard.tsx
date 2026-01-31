"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  command?: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  command,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="feature-card group"
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-terminal-text font-semibold text-lg mb-2">
            {title}
          </h3>
          <p className="text-terminal-muted text-sm leading-relaxed mb-3">
            {description}
          </p>
          {command && (
            <code className="text-terminal-violet text-xs bg-terminal-bg px-2 py-1 rounded">
              {command}
            </code>
          )}
        </div>
      </div>
    </motion.div>
  );
}
