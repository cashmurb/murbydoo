import { useState } from "react";
import { Link } from "react-router-dom";
import ScaleWrap from "../components/ScaleWrap.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import NavHeader from "../components/NavHeader.jsx";
import MurbBrain from "../components/MurbBrain.jsx";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";
const PAN_DURATION = 0.6;

function MobileHome() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavHeader />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 32px", gap: 32 }}>
        <div style={{ fontSize: 44, letterSpacing: 4 }}>i'm murb.</div>
        <div style={{ fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 1.8, maxWidth: 320 }}>
          AI researcher by day, artist by night. I teach machines to see, spend an unreasonable amount of time thinking about the brain, take photos, make films and music, and strange little projects in between.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
          {[
            { to: "/about",   label: "who am I?" },
            { to: "/wyd",     label: "what am I doing?" },
            { to: "/socials", label: "where to find me?" },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{ display: "block", padding: "14px 20px", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, color: "#000", textDecoration: "none", textAlign: "center" }}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link to="/avatar" style={{ marginTop: 8, fontSize: 13, color: MUTED, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 1, background: MUTED }} />
          make your avatar
          <span style={{ width: 40, height: 1, background: MUTED }} />
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const [panned, setPanned] = useState(false);
  const [clicked, setClicked] = useState(null);
  const [murbHovered, setMurbHovered] = useState(false);

  if (isMobile) return <ScaleWrap><MobileHome /></ScaleWrap>;

  const murbText = panned ? "i'm murb!" : "i'm murb.";
  const murbLetters = murbText.split("").map(ch => ch === " " ? "\u00A0" : ch);
  const murbLeft = panned ? 790 : 720;
  const murbTop = panned ? 405 : 512;
  const murbTransform = panned ? "translate(0,0)" : "translate(-50%,-50%)";
  const brainOffset = panned ? 0 : -500;
  const brainOpacity = panned ? 1 : 0;
  const brainPointerEvents = panned ? "auto" : "none";
  const descOffset = panned ? 0 : 400;
  const descOpacity = panned ? 1 : 0;
  const descPointerEvents = panned ? "auto" : "none";
  const ctaOffset = panned ? 0 : 12;

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active={clicked} onNavClick={name => setClicked(name)} />
      <div style={{ position: "absolute", top: 0, left: 0, width: 1440, height: 1024 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1440,
            height: 1024,
            transform: `translateX(${brainOffset}px)`,
            opacity: brainOpacity,
            pointerEvents: brainPointerEvents,
            transition: `transform ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1), opacity ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          <MurbBrain
            hovered={murbHovered}
            accent={ACCENT}
            onMouseEnter={() => setMurbHovered(true)}
            onMouseLeave={() => setMurbHovered(false)}
          />
          <Link to="/about"   style={{ position: "absolute", left: 180, top: 464, fontSize: 15, color: MUTED, textDecoration: "none" }}>who am I?</Link>
          <Link to="/wyd"     style={{ position: "absolute", left: 564, top: 327, fontSize: 15, color: MUTED, textDecoration: "none" }}>what am I doing?</Link>
          <Link to="/socials" style={{ position: "absolute", left: 527, top: 677, fontSize: 15, color: MUTED, textDecoration: "none" }}>where to find me?</Link>
        </div>
        <div
          onClick={() => setPanned(true)}
          style={{
            position: "absolute",
            left: murbLeft,
            top: murbTop,
            transform: murbTransform,
            fontSize: 50,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: `left ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1), top ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1), transform ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          {murbLetters.map((char, i) => (
            <span key={i} className="murb-letter" style={{ display: "inline-block" }}>{char}</span>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 790,
            top: 489,
            width: 430,
            fontSize: 15,
            color: MUTED,
            lineHeight: 1.6,
            transform: `translateX(${descOffset}px)`,
            opacity: descOpacity,
            pointerEvents: descPointerEvents,
            transition: `transform ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1), opacity ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          AI researcher by day, artist by night. I teach machines to see, spend an unreasonable amount of time thinking about the brain, take photos, make films and music, and strange little projects in between.
        </div>
        <Link
          to="/avatar"
          style={{
            position: "absolute",
            top: 953,
            left: "50%",
            transform: `translateX(-50%) translateY(${ctaOffset}px)`,
            opacity: descOpacity,
            pointerEvents: descPointerEvents,
            fontSize: 15,
            color: "#000000",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 16,
            whiteSpace: "nowrap",
            transition: `top ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1), transform ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1), opacity ${PAN_DURATION}s cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          <span style={{ width: 129, height: 1, background: "#000000" }} />
          <span>make your avatar</span>
          <span style={{ width: 129, height: 1, background: "#000000" }} />
        </Link>
      </div>
    </ScaleWrap>
  );
}