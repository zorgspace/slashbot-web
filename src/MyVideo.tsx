import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '7em',
        color: 'white',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      }}
    >
      <div style={{ opacity }}>Slashbot Web</div>
    </div>
  );
};