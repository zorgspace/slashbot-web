"use client";

import { motion } from "framer-motion";

export function Connectors() {
  const connectors = [
    {
      name: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      color: "#0088cc",
      description: "Connect your bot to Telegram for mobile notifications and chat interactions.",
      features: [
        "Voice message transcription",
        "Markdown formatting",
        "Real-time notifications",
        "Authorized chat filtering",
      ],
      prompt: "Connect Telegram bot with token 123456:ABC-xyz",
    },
    {
      name: "Discord",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
      ),
      color: "#5865F2",
      description: "Integrate with Discord servers for team collaboration and bot commands.",
      features: [
        "Voice attachment support",
        "Channel-specific routing",
        "Typing indicators",
        "Message splitting",
      ],
      prompt: "Set up Discord bot with token MTIxMjM0... on channel 1234567890",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {connectors.map((connector, index) => (
        <motion.div
          key={connector.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="terminal-window"
          style={{ borderColor: `${connector.color}30` }}
        >
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-red"></div>
            <div className="terminal-dot bg-terminal-yellow"></div>
            <div className="terminal-dot bg-terminal-green"></div>
            <span className="text-terminal-muted text-sm ml-4">
              {connector.name.toLowerCase()}-connector
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${connector.color}20`, color: connector.color }}
              >
                {connector.icon}
              </div>
              <div>
                <h3 className="text-terminal-text font-semibold text-xl">
                  {connector.name}
                </h3>
                <p className="text-terminal-muted text-sm">Connector</p>
              </div>
            </div>

            <p className="text-terminal-muted text-sm mb-4">
              {connector.description}
            </p>

            <div className="mb-4">
              <h4 className="text-terminal-text text-sm font-medium mb-2">Features</h4>
              <ul className="space-y-1">
                {connector.features.map((feature) => (
                  <li key={feature} className="text-terminal-muted text-sm flex items-center gap-2">
                    <span className="text-terminal-green">+</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-terminal-text text-sm font-medium mb-2">Setup</h4>
              <div className="code-block">
                <span className="text-terminal-violet text-sm">slashbot &gt; </span>
                <span className="text-terminal-text text-sm">{connector.prompt}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
