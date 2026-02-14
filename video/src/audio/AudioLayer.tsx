import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export const AudioLayer: React.FC = () => (
  <>
    {/* Frames 150-180: URL typing "airbnb.com" (11 chars, 3 frames each) */}
    {Array.from({ length: 11 }, (_, i) => 150 + i * 3).map((f) => (
      <Sequence key={f} from={f} durationInFrames={3} name={`Keystroke ${f}`}>
        <Audio src={staticFile("audio/keystroke.wav")} volume={0.3} />
      </Sequence>
    ))}
  </>
);
