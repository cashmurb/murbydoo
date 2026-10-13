import { useEffect, useState } from "react";
import DinoGame from "./DinoGame.jsx";
import { readAvatar } from "../lib/scores.js";

const DIM = "#8A8A8A";
const ACCENT = "#D96614";

const LOADER_CSS = `
@keyframes loaderPromptIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes loaderDots {
  0%, 20%  { opacity: 0.25; }
  50%      { opacity: 1; }
  80%, 100%{ opacity: 0.25; }
}
.loader-prompt {
  animation: loaderPromptIn 0.3s ease both;
}
.loader-dot {
  animation: loaderDots 1.2s ease-in-out infinite;
}
.loader-dot:nth-child(2) { animation-delay: 0.15s; }
.loader-dot:nth-child(3) { animation-delay: 0.3s; }
`;

// Covers the page with the running game until the page behind it has its data
// and the visitor decides they are done playing
export default function PageLoader({ ready, onDone }) {
  const [avatarData] = useState(readAvatar);
  const [waitedLongEnough, setWaitedLongEnough] = useState(false);

  // If the data is slow or never turns up, let the visitor leave anyway
  useEffect(() => {
    const t = setTimeout(() => setWaitedLongEnough(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const canLeave = ready || waitedLongEnough;

  // Keep the page behind from scrolling while the loader is up
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    if (!canLeave) return;
    const onKey = (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canLeave, onDone]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      background: "#FAFAFA",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      fontFamily: "Kode Mono, monospace",
    }}>
      <style>{LOADER_CSS}</style>

      <div style={{ width: "100%", maxWidth: 900 }}>
        <DinoGame avatarData={avatarData} />
      </div>

      <div style={{ height: 34, display: "flex", alignItems: "center" }}>
        {canLeave ? (
          <button
            className="loader-prompt"
            onClick={onDone}
            style={{
              background: "transparent",
              border: `1px solid ${ACCENT}`,
              borderRadius: 6,
              padding: "7px 16px",
              fontSize: 12,
              fontFamily: "Kode Mono, monospace",
              color: ACCENT,
              letterSpacing: 0.5,
              cursor: "pointer",
            }}
          >
            press enter →
          </button>
        ) : (
          <div style={{ fontSize: 12, color: DIM, letterSpacing: 1 }}>
            loading
            <span className="loader-dot">.</span>
            <span className="loader-dot">.</span>
            <span className="loader-dot">.</span>
          </div>
        )}
      </div>
    </div>
  );
}
