import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import aboutMeImage from "../assets/about-me.jpg";

const ACCENT = "#D96614";

const TOOLS_LEFT = [
  { name: "Python", top: 510 },
  { name: "MATLAB", top: 552 },
  { name: "C++", top: 594 },
];

const TOOLS_RIGHT = [
  { name: "R", top: 510 },
  { name: "OpenCV", top: 552 },
  { name: "MONAI", top: 594 },
];

function ToolBullet({ tool, left }) {
  return (
    <>
      <svg
        width="6"
        height="7"
        viewBox="0 0 6 7"
        style={{
          position: "absolute",
          left,
          top: tool.top,
        }}
      >
        <path d="M6 3.5L0 7V0L6 3.5Z" fill={ACCENT} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: left + 16,
          top: tool.top,
          fontSize: 15,
          color: "#000000",
        }}
      >
        {tool.name}
      </div>
    </>
  );
}

export default function About() {
  return (
    <ScaleWrap variant="fixed">
      <NavHeader />

      <div
        style={{
          position: "absolute",
          left: 880,
          top: 282,
          width: 370,
          height: 459,
          border: "1px solid #000000",
          borderRadius: 14.5,
          overflow: "hidden",
        }}
      >
        <img
          src={aboutMeImage}
          alt="Portrait"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 190,
          top: 230,
          fontSize: 40,
        }}
      >
        about me
      </div>

      <div
        style={{
          position: "absolute",
          left: 190,
          top: 302,
          width: 560,
          fontSize: 15,
          lineHeight: 1.7,
          color: "#000000",
        }}
      >
        I build systems that teach computers to see, and spend a lot of time
        thinking about how they might one day help us understand the brain. My
        background is in data science, computer vision, and medical imaging,
        with a growing focus on BCI and neurotech.
      </div>

      <div
        style={{
          position: "absolute",
          left: 190,
          top: 474,
          fontSize: 15,
          color: "#000000",
        }}
      >
        Some of the tools I work with:
      </div>

      {TOOLS_LEFT.map((tool) => (
        <ToolBullet key={tool.name} tool={tool} left={190} />
      ))}

      {TOOLS_RIGHT.map((tool) => (
        <ToolBullet key={tool.name} tool={tool} left={397} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 190,
          top: 636,
          width: 560,
          fontSize: 15,
          lineHeight: 1.7,
          color: "#000000",
        }}
      >
        Outside of tech, I take photos, make films, sing, dance a little, and
        read books — usually with a cat somewhere nearby.
      </div>
    </ScaleWrap>
  );
}