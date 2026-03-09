import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

const COLORS = {
  bg: "#0D0D1A",
  cardBg: "#1A1A2E",
  purple: "#8B5CF6",
  yellow: "#F59E0B",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0CC",
  cardBorder: "rgba(139, 92, 246, 0.2)",
};

export const CtaSlide: React.FC = () => {
  const frame = useCurrentFrame();

  // Staggered fade-in animations
  const brandOpacity = Math.min(1, frame / 15);
  const qrOpacity = Math.min(1, Math.max(0, (frame - 10) / 15));
  const taglineOpacity = Math.min(1, Math.max(0, (frame - 20) / 15));
  const urlOpacity = Math.min(1, Math.max(0, (frame - 30) / 15));

  // Subtle scale animation for QR code
  const qrScale = 0.9 + 0.1 * Math.min(1, Math.max(0, (frame - 10) / 20));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 60px 520px 60px",
      }}
    >
      {/* Brand line */}
      <div
        style={{
          opacity: brandOpacity,
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 4,
            height: 32,
            backgroundColor: COLORS.purple,
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.purple,
            letterSpacing: 3,
            fontFamily:
              "Inter, -apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif",
          }}
        >
          精读AI × LoreAI
        </span>
      </div>

      {/* QR Code container */}
      <div
        style={{
          opacity: qrOpacity,
          transform: `scale(${qrScale})`,
          backgroundColor: COLORS.cardBg,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 24,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Img
          src={staticFile("qr-subscribe-zh.png")}
          style={{
            width: 320,
            height: 320,
            borderRadius: 12,
          }}
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 40,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.textPrimary,
            fontFamily:
              "-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif",
          }}
        >
          扫码关注 · 每期读透一篇
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: COLORS.textSecondary,
            fontFamily:
              "-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif",
          }}
        >
          AI 世界很吵，每期帮你读透一篇
        </span>
      </div>

      {/* URL hint */}
      <div
        style={{
          opacity: urlOpacity,
          marginTop: 32,
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderRadius: 8,
          padding: "8px 24px",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: COLORS.purple,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 1,
          }}
        >
          loreai.dev/zh/subscribe
        </span>
      </div>
    </AbsoluteFill>
  );
};
