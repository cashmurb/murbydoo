import { useState } from "react";
import ScaleWrap from "./ScaleWrap.jsx";
import NavHeader from "./NavHeader.jsx";

const MUTED = "#B4B4B4";
const ACCENT = "#D96614";

// Shared layout for Brain topic pages. 
export default function TopicPage({ title = "Topic", sections = [], linkText = "", linkUrl = "#" }) {
  const [open, setOpen] = useState({});
  const toggle = (i) => setOpen((s) => ({ ...s, [i]: !s[i] }));

  return (
    <ScaleWrap variant="fluid">
      <NavHeader active="brain" />

      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: "absolute",
          top: 290,
          left: 136,
          width: 1172,
          display: "flex",
          flexDirection: "column",
          gap: 44,
        }}
      >
        {sections.map((section, i) => {
          const isOpen = open[i] !== false;
          return (
            <div key={i}>
              <div
                onClick={() => toggle(i)}
                style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", userSelect: "none" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  style={{
                    flexShrink: 0,
                    marginTop: 4,
                    transform: `rotate(${isOpen ? 90 : 0}deg)`,
                    transition: "transform .25s ease",
                  }}
                >
                  <path d="M14 7L0 14V0L14 7Z" fill={ACCENT} />
                </svg>
                <div style={{ fontSize: 20 }}>{section.heading}</div>
              </div>
              <div
                style={{
                  maxHeight: isOpen ? "400px" : "0px",
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height .4s cubic-bezier(0.4,0,0.2,1), opacity .3s ease",
                }}
              >
                <div style={{ marginTop: 14, marginLeft: 28, fontSize: 15, lineHeight: 1.8, color: MUTED, maxWidth: 1050 }}>
                  {section.body ?? "Coming soon."}
                </div>
              </div>
            </div>
          );
        })}

        {linkText ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
              <path d="M7 0 L13.06 10.5 L0.94 10.5 Z" fill={ACCENT} />
            </svg>
            <a href={linkUrl} target="_blank" rel="noopener" style={{ fontSize: 20, textDecoration: "none" }}>
              {linkText}
            </a>
          </div>
        ) : null}
      </div>
    </ScaleWrap>
  );
}
