import { useState, useEffect } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { supabase } from "../lib/supabase.js";
import aboutMeImageFallback from "../assets/about-me.jpg";

const ACCENT = "#D96614";

function ToolBullet({ name, top, left }) {
  return (
    <>
      <svg width="6" height="7" viewBox="0 0 6 7" style={{ position: "absolute", left, top }}>
        <path d="M6 3.5L0 7V0L6 3.5Z" fill={ACCENT} />
      </svg>
      <div style={{ position: "absolute", left: left + 16, top, fontSize: 15, color: "#000000" }}>
        {name}
      </div>
    </>
  );
}

const TOP_OFFSETS = [510, 552, 594];

export default function About() {
  const [data, setData] = useState(null);

  useEffect(() => {
    supabase.from('about').select('*').eq('id', 1).single().then(({ data: row }) => {
      if (row) setData(row);
    });
  }, []);

  const bio = data?.bio ?? "I build systems that teach computers to see, and spend a lot of time thinking about how they might one day help us understand the brain. My background is in data science, computer vision, and medical imaging, with a growing focus on BCI and neurotech.";
  const toolsLeft = data?.tools_left ?? ["Python", "MATLAB", "C++"];
  const toolsRight = data?.tools_right ?? ["R", "OpenCV", "MONAI"];
  const photo = data?.photo_url || aboutMeImageFallback;

  return (
    <ScaleWrap variant="fixed">
      <NavHeader />

      <div style={{ position: "absolute", left: 880, top: 282, width: 370, height: 459, border: "1px solid #000000", borderRadius: 14.5, overflow: "hidden" }}>
        <img src={photo} alt="Portrait" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>

      <div style={{ position: "absolute", left: 190, top: 230, fontSize: 40 }}>about me</div>

      <div style={{ position: "absolute", left: 190, top: 302, width: 560, fontSize: 15, lineHeight: 1.7, color: "#000000" }}>
        {bio}
      </div>

      <div style={{ position: "absolute", left: 190, top: 474, fontSize: 15, color: "#000000" }}>
        Some of the tools I work with:
      </div>

      {toolsLeft.map((name, i) => name && (
        <ToolBullet key={`l${i}`} name={name} top={TOP_OFFSETS[i]} left={190} />
      ))}
      {toolsRight.map((name, i) => name && (
        <ToolBullet key={`r${i}`} name={name} top={TOP_OFFSETS[i]} left={397} />
      ))}

      <div style={{ position: "absolute", left: 190, top: 636, width: 560, fontSize: 15, lineHeight: 1.7, color: "#000000" }}>
        Outside of tech, I take photos, make films, sing, dance a little, and read books — usually with a cat somewhere nearby.
      </div>
    </ScaleWrap>
  );
}
