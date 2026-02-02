import React from 'react';
import { useCurrentFrame, AbsoluteFill, Sequence, spring } from 'remotion';

interface TerminalLine {
  type: string;
  content: string;
  delay: number;
}

const fullBanner = ` ▄▄▄▄▄▄▄   Slashbot 1.2.1
▐░░░░░░░▌  Grok 4.1 · X.AI · ~/
▐░▀░░░▀░▌  Context: GROK.md
▐░░░▄░░░▌  ? help · Tab complete
▐░░▀▀▀░░▌
 ▀▀▀▀▀▀▀ `;

const demoLines: TerminalLine[] = [
  { type: "logo", content: fullBanner, delay: 200 },
  { type: "muted", content: "────────────────────────────────────────────────────────────", delay: 100 },
  { type: "output", content: "", delay: 200 },
  { type: "prompt", content: "slashbot > ", delay: 0 },
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
  { type: "prompt", content: "slashbot > ", delay: 0 },
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
  { type: "prompt", content: "slashbot > ", delay: 0 },
];

const getColor = (type: string) => {
  switch (type) {
    case "prompt": return "#8b5cf6";
    case "command": return "#ffffff";
    case "output": return "#6b7280";
    case "error": return "#ef4444";
    case "success": return "#10b981";
    case "violet": return "#8b5cf6";
    case "muted": return "#6b7280";
    case "logo": return "#8b5cf6";
    default: return "#ffffff";
  }
};

const TypewriterText: React.FC<{ text: string; color: string; fps: number }> = ({ text, color, fps }) => {
  const frame = useCurrentFrame();
  const charsPerSecond = 20; // Adjust typing speed
  const totalChars = text.length;
  const totalFrames = Math.ceil((totalChars / charsPerSecond) * fps);
  const visibleChars = Math.min(totalChars, Math.floor((frame / totalFrames) * totalChars));
  const displayText = text.slice(0, visibleChars);

  return (
    <div style={{ color, fontFamily: 'monospace', whiteSpace: 'pre' }}>
      {displayText}
      {frame < totalFrames && <span style={{ color: '#ffffff' }}>█</span>}
    </div>
  );
};

const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  const logoLines = fullBanner.split('\n');
  const lineDelay = 15; // frames between lines

  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 100, mass: 0.8 } });
  const glow = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 50, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: `scale(${scale})`, filter: `drop-shadow(0 0 ${glow * 20}px #8b5cf6)`, textAlign: 'center' }}>
        {logoLines.map((line, index) => {
          const lineStartFrame = index * lineDelay;
          const visible = frame >= lineStartFrame;
          const localFrame = frame - lineStartFrame;

          if (!visible) return null;

          const charsPerSecond = 30;
          const totalChars = line.length;
          const totalTypingFrames = Math.ceil((totalChars / charsPerSecond) * fps);
          const visibleChars = Math.min(totalChars, Math.floor((localFrame / totalTypingFrames) * totalChars));
          const displayText = line.slice(0, visibleChars);

          const lineOpacity = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 200, mass: 0.3 } });

          return (
            <div
              key={index}
              style={{
                fontFamily: 'monospace',
                color: '#8b5cf6',
                fontSize: '2.5rem',
                whiteSpace: 'pre',
                opacity: lineOpacity,
                marginBottom: '0.5rem',
              }}
            >
              {displayText}
              {localFrame < totalTypingFrames && <span style={{ color: '#ffffff' }}>█</span>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const TerminalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Calculate which lines are visible and their typing progress
  const visibleLines: Array<{ line: TerminalLine; visibleChars: number; showCursor: boolean }> = [];
  let currentFrame = 0;
  for (const line of demoLines) {
    const delayFrames = Math.ceil((line.delay / 1000) * fps);
    const startFrame = currentFrame;
    const endFrame = startFrame + delayFrames;
    currentFrame = endFrame;

    if (frame >= startFrame && frame < endFrame) {
      const localFrame = frame - startFrame;
      const charsPerSecond = 20;
      const totalChars = line.content.length;
      const totalTypingFrames = Math.ceil((totalChars / charsPerSecond) * fps);
      const visibleChars = Math.min(totalChars, Math.floor((localFrame / totalTypingFrames) * totalChars));
      const showCursor = localFrame < totalTypingFrames;
      visibleLines.push({ line, visibleChars, showCursor });
    } else if (frame >= endFrame) {
      visibleLines.push({ line, visibleChars: line.content.length, showCursor: false });
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f', padding: '20px', fontFamily: 'monospace' }}>
      {/* Terminal header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', marginRight: '8px' }}></div>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', marginRight: '8px' }}></div>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '8px' }}></div>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>slashbot — zsh</span>
      </div>

      {/* Terminal body */}
      <div style={{ backgroundColor: '#000000', padding: '20px', borderRadius: '8px', height: 'calc(100% - 40px)', overflow: 'hidden' }}>
        {visibleLines.map((item, index) => {
          const { line, visibleChars, showCursor } = item;
          const displayText = line.content.slice(0, visibleChars);
          return (
            <div key={index} style={{ marginBottom: '5px', color: getColor(line.type), whiteSpace: 'pre' }}>
              {displayText}
              {showCursor && <span style={{ color: '#ffffff' }}>█</span>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BrandingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Use spring for smoother, more natural animations (Remotion best practice)
  const step1Opacity = spring({ frame, fps: 30, config: { damping: 10, stiffness: 100, mass: 0.5 } });
  const step2Opacity = spring({ frame: frame - 60, fps: 30, config: { damping: 10, stiffness: 100, mass: 0.5 } });
  const step3Opacity = spring({ frame: frame - 120, fps: 30, config: { damping: 10, stiffness: 100, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      {/* Step 1 */}
      <div style={{ opacity: step1Opacity, textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '4rem', color: 'white', margin: 0 }}>Slashbot Web</h1>
        <h2 style={{ fontSize: '2rem', color: '#8b5cf6', margin: '0.5rem 0' }}>Your AI Coding Assistant</h2>
        <p style={{ fontSize: '1.5rem', color: '#6b7280', margin: 0 }}>Code. Automate. Integrate.</p>
      </div>

      {/* Step 2 */}
      <div style={{ opacity: step2Opacity, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#ff6b6b' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Code Assistance</h3>
        </div>
        <div style={{ color: '#4ecdc4' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Terminal Simulation</h3>
        </div>
        <div style={{ color: '#8b5cf6' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Project Management</h3>
        </div>
        <div style={{ color: '#ffd700' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Telegram Connector</h3>
        </div>
        <div style={{ color: '#10b981', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Discord Integration</h3>
        </div>
      </div>

      {/* Step 3 */}
      <div style={{ opacity: step3Opacity, textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '3rem', color: '#ffd700', margin: 0 }}>Accelerate Your Development with AI!</h2>
        <p style={{ fontSize: '2rem', color: '#4ecdc4', margin: '0.5rem 0' }}>Explore Slashbot Web Today</p>
      </div>
    </AbsoluteFill>
  );
};

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={60}>
        <LogoScene />
      </Sequence>
      <Sequence from={60} durationInFrames={340}>
        <TerminalScene />
      </Sequence>
      <Sequence from={400}>
        <BrandingScene />
      </Sequence>
    </AbsoluteFill>
  );
};