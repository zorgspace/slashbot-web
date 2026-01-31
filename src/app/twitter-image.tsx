import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export const alt = "Slashbot - AI-Powered CLI Assistant";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <pre
            style={{
              color: "#a855f7",
              fontSize: 48,
              lineHeight: 1.1,
              textAlign: "center",
              margin: 0,
              textShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
            }}
          >
            {` ▄▄▄▄▄▄▄
▐░░░░░░░▌
▐░▀░░░▀░▌
▐░░░▄░░░▌
▐░░▀▀▀░░▌
 ▀▀▀▀▀▀▀`}
          </pre>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 40,
              fontSize: 72,
              fontWeight: "bold",
            }}
          >
            <span style={{ color: "#a855f7" }}>/</span>
            <span style={{ color: "#e4e4e7" }}>slashbot</span>
          </div>

          <div
            style={{
              color: "#71717a",
              fontSize: 32,
              marginTop: 20,
            }}
          >
            AI-Powered CLI Assistant
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 40,
              color: "#71717a",
              fontSize: 24,
            }}
          >
            <span>Grok 4.1</span>
            <span>·</span>
            <span>Telegram</span>
            <span>·</span>
            <span>Discord</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 40,
              padding: "12px 24px",
              backgroundColor: "#18181b",
              borderRadius: 8,
              border: "1px solid #27272a",
            }}
          >
            <span style={{ color: "#a855f7", fontSize: 20 }}>$ </span>
            <span style={{ color: "#e4e4e7", fontSize: 20 }}>
              curl -fsSL https://getslashbot.com/install.sh | bash
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
