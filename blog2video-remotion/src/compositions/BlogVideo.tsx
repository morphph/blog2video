import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CtaSlide } from "../slides/CtaSlide";

interface SlideConfig {
  slide_number: number;
  type: string;
  start_time_seconds: number;
  duration_seconds: number;
  data: any;
}

interface SubtitleEntry {
  start: number;
  end: number;
  text: string;
}

interface VideoConfigData {
  video_number: number;
  title: string;
  fps: number;
  width: number;
  height: number;
  slides: SlideConfig[];
  subtitles: SubtitleEntry[];
}

export const BlogVideo: React.FC<{ config: VideoConfigData }> = ({
  config,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current slide
  const currentSlide =
    config.slides.find(
      (s) =>
        currentTime >= s.start_time_seconds &&
        currentTime < s.start_time_seconds + s.duration_seconds
    ) || config.slides[config.slides.length - 1];

  // Find current subtitle
  const currentSubtitle = config.subtitles?.find(
    (sub) => currentTime >= sub.start && currentTime < sub.end
  );

  // Slide transition - fade
  const slideStart = currentSlide.start_time_seconds;
  const fadeInDuration = 10; // frames
  const framesSinceSlideStart = frame - Math.round(slideStart * fps);
  const opacity = Math.min(1, framesSinceSlideStart / fadeInDuration);

  const audioFile = `video_${config.video_number}_audio.mp3`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D1A" }}>
      {/* Slide content */}
      <AbsoluteFill style={{ opacity }}>
        {currentSlide.type === "cta" ? (
          <CtaSlide />
        ) : (
          <Img
            src={staticFile(`slide_${currentSlide.slide_number}.png`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </AbsoluteFill>

      {/* Audio */}
      <Audio src={staticFile(audioFile)} />

      {/* Subtitle overlay */}
      {currentSubtitle && (
        <div
          style={{
            position: "absolute",
            bottom: 350,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            padding: "0 40px",
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: 8,
              padding: "12px 24px",
              maxWidth: 900,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 38,
                fontWeight: 600,
                fontFamily:
                  "-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif",
                lineHeight: 1.4,
              }}
            >
              {currentSubtitle.text}
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
