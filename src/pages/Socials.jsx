import { useState } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { data as defaultSocials } from "../content/socials-data.js";

const ACCENT = "#D96614";

function Envelope({ social }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const glow = hovered || open ? `0 0 22px ${ACCENT}99` : "none";

  const toggle = () => setOpen((v) => !v);
  const stop = (e) => e.stopPropagation();

  return (
    <div style={{ width: 190, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative", width: 190, height: 188, perspective: 600, cursor: "pointer" }}
      >
        <div style={{ position: "absolute", inset: 0, border: "1px solid #000000", borderRadius: 2, boxShadow: glow, transition: "box-shadow .3s ease", overflow: "hidden" }}>
          <svg width="190" height="188" viewBox="0 0 191 188" style={{ position: "absolute", top: 0, left: 0 }}>
            <path
              d="M95.5534 97.2421L189.678 0.720322L190.036 1.06943L95.9114 97.5912L95.5534 97.2421ZM0.501638 1.61016L95.5534 97.2421L95.1988 97.5945L0.147031 1.96262L0.501638 1.61016Z"
              fill="black"
              style={{ opacity: open ? 0 : 1, transition: "opacity .4s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: open ? 1 : 0,
              transition: "opacity .35s ease .1s",
            }}
          >
            <a
              href={social.url}
              target="_blank"
              rel="noopener"
              onClick={stop}
              style={{ fontSize: 15, color: "#000000", textDecoration: "none", textAlign: "center", padding: "0 12px" }}
            >
              {social.username}
            </a>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 190,
            height: 97,
            transformOrigin: "top center",
            transform: open ? "rotateX(180deg)" : "rotateX(0deg)",
            transition: "transform .5s cubic-bezier(0.6,0.05,0.2,1)",
          }}
        >
          <svg width="190" height="97" viewBox="0 0 191 98" style={{ position: "absolute", top: 0, left: 0 }}>
            <path d="M0.5 0.5H190.5V0.5L95.5 97.5L0.5 0.5Z" fill="#FFFFFF" stroke="black" />
          </svg>
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 15 }}>{social.name}</div>
    </div>
  );
}

export default function Socials() {
  const socials = defaultSocials;

  return (
    <ScaleWrap variant="fixed">
      <NavHeader />

      <div style={{ position: "absolute", left: 475, top: 211, fontSize: 48, fontWeight: 400, whiteSpace: "nowrap" }}>
        where to find me?
      </div>

      <div style={{ position: "absolute", left: 112, top: 450, width: 1216, display: "flex", justifyContent: "space-between" }}>
        {socials.map((s) => (
          <Envelope key={s.id} social={s} />
        ))}
      </div>
    </ScaleWrap>
  );
}
