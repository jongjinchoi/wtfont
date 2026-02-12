import React from "react";
import { Series } from "remotion";
import { HomePage } from "./scenes/HomePage";
import { ResultPage } from "./scenes/ResultPage";

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap');
`;

// 2 scenes: HomePage (boot+typing 240f) + ResultPage (log+results 480f) = 720f
export const WTFontDemo: React.FC = () => (
  <>
    <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
    <Series>
      <Series.Sequence durationInFrames={240}>
        <HomePage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={480}>
        <ResultPage />
      </Series.Sequence>
    </Series>
  </>
);
