import { Composition, registerRoot } from "remotion";
import { BlogVideo } from "./compositions/BlogVideo";
import videoConfig from "./data/video_config.json";

const RemotionRoot: React.FC = () => {
  const fps = videoConfig.fps || 30;
  const totalDuration = videoConfig.slides.reduce(
    (sum: number, s: any) =>
      Math.max(sum, s.start_time_seconds + s.duration_seconds),
    0
  );
  const totalFrames = Math.ceil(totalDuration * fps);

  return (
    <Composition
      id="BlogVideo"
      component={BlogVideo}
      durationInFrames={totalFrames}
      fps={fps}
      width={videoConfig.width || 1080}
      height={videoConfig.height || 1920}
      defaultProps={{ config: videoConfig as any }}
    />
  );
};

registerRoot(RemotionRoot);
