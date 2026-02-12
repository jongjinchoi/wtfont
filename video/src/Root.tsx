import React from "react";
import { Composition } from "remotion";
import { WTFontDemo } from "./WTFontDemo";

export const Root: React.FC = () => (
  <Composition
    id="wtfont-demo"
    component={WTFontDemo}
    durationInFrames={720}
    fps={30}
    width={1920}
    height={1080}
  />
);
