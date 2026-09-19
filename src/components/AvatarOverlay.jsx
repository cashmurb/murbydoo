import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import AvatarFigure from "./AvatarFigure.jsx";

const SCALE = 0.27;
const AW = Math.round(183 * SCALE);
const AH = Math.round(317 * SCALE);
const GRAVITY = 0.6;
const JUMP_FORCE = 16;
const MAX_FALL_SPEED = 12;
const MOVE_SPEED = 3.2;
const FRICTION = 0.82;
const LANDING_DURATION_MS = 320;

const GROUND_Y = 93;

const PLATFORM_PRESETS = {
  home: [
    { x1: 4,  y: 82, x2: 8 },
    { x1: 16, y: 74, x2: 20 },
    { x1: 89, y: 80, x2: 93 },
    { x1: 79, y: 66, x2: 83 },
    { x1: 5,  y: 62, x2: 9 },
    { x1: 19, y: 52, x2: 23 },
    { x1: 85, y: 56, x2: 89 },
    { x1: 75, y: 44, x2: 79 },
    { x1: 7,  y: 42, x2: 11 },
    { x1: 21, y: 32, x2: 25 },
    { x1: 87, y: 34, x2: 91 },
    { x1: 77, y: 22, x2: 81 },
  ],
  column: [
    { x1: 4,  y: 80, x2: 8 },
    { x1: 89, y: 74, x2: 93 },
    { x1: 5,  y: 60, x2: 9 },
    { x1: 87, y: 56, x2: 91 },
    { x1: 4,  y: 40, x2: 8 },
    { x1: 89, y: 40, x2: 93 },
    { x1: 7,  y: 24, x2: 11 },
    { x1: 85, y: 26, x2: 89 },
  ],
  wide: [
    { x1: 0,  y: 80, x2: 4 },
    { x1: 96, y: 76, x2: 100 },
    { x1: 0,  y: 60, x2: 4 },
    { x1: 96, y: 58, x2: 100 },
    { x1: 0,  y: 40, x2: 4 },
    { x1: 96, y: 42, x2: 100 },
    { x1: 2,  y: 24, x2: 6 },
    { x1: 94, y: 26, x2: 98 },
  ],
};

const EXCLUDED = ["/home", "/brain", "/portal", "/avatar"];

function presetForPath(pathname) {
  if (pathname === "/home") return "home";
  if (pathname === "/world" || pathname === "/dump") return "wide";
  return "column";
}

function isEditableTarget(target) {
  if (!target || !target.tagName) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

const OVERLAY_CSS = `
@keyframes avatarIdleBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}
@keyframes avatarWalk {
  0%   { transform: translateY(0) rotate(-3deg); }
  25%  { transform: translateY(-3px) rotate(0deg); }
  50%  { transform: translateY(0) rotate(3deg); }
  75%  { transform: translateY(-3px) rotate(0deg); }
  100% { transform: translateY(0) rotate(-3deg); }
}
@keyframes avatarLandA {
  0%   { transform: scale(1.18, 0.82) translateY(6px); }
  40%  { transform: scale(0.94, 1.06) translateY(-2px); }
  70%  { transform: scale(1.02, 0.98) translateY(1px); }
  100% { transform: scale(1, 1) translateY(0); }
}
@keyframes avatarLandB {
  0%   { transform: scale(1.18, 0.82) translateY(6px); }
  40%  { transform: scale(0.94, 1.06) translateY(-2px); }
  70%  { transform: scale(1.02, 0.98) translateY(1px); }
  100% { transform: scale(1, 1) translateY(0); }
}
@keyframes thoughtFadeIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
.avatar-overlay-figure {
  transform-origin: bottom center;
  animation: avatarIdleBob 0.7s ease-in-out infinite;
}
.avatar-walking .avatar-overlay-figure {
  animation: avatarWalk 0.42s ease-in-out infinite;
}
.avatar-landing-0 .avatar-overlay-figure {
  animation: avatarLandA ${LANDING_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.avatar-landing-1 .avatar-overlay-figure {
  animation: avatarLandB ${LANDING_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
`;

function ThoughtBubble({ message, pinned, visible }) {
  if (!message || (!visible && !pinned)) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "100%",
        marginBottom: 4,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1.5px solid #000",
          borderRadius: 12,
          padding: "6px 10px",
          fontSize: 10,
          fontFamily: "Kode Mono, monospace",
          lineHeight: 1.5,
          textAlign: "center",
          boxShadow: "1px 1px 0 #000",
          position: "relative",
          wordBreak: "break-word",
          maxWidth: 200,
          animation: "thoughtFadeIn 0.2s ease both",
        }}
      >
        {message}
        <span
          style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 3,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", border: "1.5px solid #000", display: "block" }} />
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#fff", border: "1.5px solid #000", display: "block", marginTop: 3 }} />
        </span>
      </div>
    </div>
  );
}

function PlatformLines({ platforms }) {
  if (!platforms.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9990 }}>
      {platforms.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x1}%`,
            top: `${p.y}%`,
            width: `${p.x2 - p.x1}%`,
            height: 1,
            background: "#000",
            opacity: 0.14,
          }}
        />
      ))}
    </div>
  );
}

export default function AvatarOverlay() {
  const location = useLocation();
  const [avatarData, setAvatarData] = useState(null);
  const [message, setMessage] = useState("");
  const [pos, setPos] = useState({ x: 100, y: 0 });
  const [facing, setFacing] = useState(1);
  const [walking, setWalking] = useState(false);
  const [landingPhase, setLandingPhase] = useState(0);
  const [landingActive, setLandingActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [introActive, setIntroActive] = useState(false);

  const stateRef = useRef({
    x: 100,
    y: 0,
    vx: 0,
    vy: 0,
    onGround: false,
  });
  const keysRef = useRef({ left: false, right: false, space: false });
  const jumpQueuedRef = useRef(false);
  const landingTimeoutRef = useRef(null);
  const frameRef = useRef(null);

  const excluded = EXCLUDED.some(p => location.pathname.startsWith(p)) || introActive;
  const presetName = presetForPath(location.pathname);
  const platforms = excluded ? [] : (PLATFORM_PRESETS[presetName] || []);

  useEffect(() => {
    const onIntro = (e) => setIntroActive(Boolean(e.detail?.active));
    window.addEventListener("murb-intro-state", onIntro);
    return () => window.removeEventListener("murb-intro-state", onIntro);
  }, []);

  useEffect(() => {
    const onReset = () => {
      setAvatarData(null);
      setMessage("");
      setPinned(false);
      setHovered(false);
    };
    window.addEventListener("murb-avatar-reset", onReset);
    return () => window.removeEventListener("murb-avatar-reset", onReset);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem("murb_avatar");
        if (saved) {
          const parsed = JSON.parse(saved);
          setAvatarData(parsed.selection);
          setMessage(parsed.message || "");
        }
      } catch (e) { void e; }
    });
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "murb_avatar") {
        if (e.newValue == null) {
          setAvatarData(null);
          setMessage("");
          return;
        }
        try {
          const parsed = JSON.parse(e.newValue);
          setAvatarData(parsed.selection);
          setMessage(parsed.message || "");
        } catch (e) { void e; }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const down = (e) => {
      if (isEditableTarget(e.target)) return;

      if (e.key === "ArrowLeft")  keysRef.current.left  = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
      if (e.key === " ") {
        keysRef.current.space = true;
        jumpQueuedRef.current = true;
      }
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    };
    const up = (e) => {
      if (isEditableTarget(e.target)) return;

      if (e.key === "ArrowLeft")  keysRef.current.left  = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
      if (e.key === " ")          keysRef.current.space = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!avatarData || excluded) return;

    const currentPlatforms = PLATFORM_PRESETS[presetName] || [];

    const vhInitial = window.innerHeight;
    const initY = (GROUND_Y / 100) * vhInitial - AH;

    stateRef.current = {
      x: 100,
      y: initY,
      vx: 0,
      vy: 0,
      onGround: true,
    };
    Promise.resolve().then(() => setPos({ x: 100, y: initY }));

    const tick = () => {
      const s = stateRef.current;
      const keys = keysRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const groundLine = (GROUND_Y / 100) * vh;

      let { x, y, vx, vy } = s;

      if (keys.left)  vx -= MOVE_SPEED * 0.4;
      if (keys.right) vx += MOVE_SPEED * 0.4;
      vx *= FRICTION;
      if (Math.abs(vx) > MOVE_SPEED) vx = Math.sign(vx) * MOVE_SPEED;

      const wantsJump = keys.space || jumpQueuedRef.current;
      if (wantsJump && s.onGround) {
        vy = -JUMP_FORCE;
        jumpQueuedRef.current = false;
        if (landingTimeoutRef.current) {
          clearTimeout(landingTimeoutRef.current);
          landingTimeoutRef.current = null;
        }
        setLandingActive(false);
      } else if (!keys.space) {
        jumpQueuedRef.current = false;
      }

      vy += GRAVITY;
      if (vy > MAX_FALL_SPEED) vy = MAX_FALL_SPEED;

      const prevBottom = s.y + AH;

      x += vx;
      y += vy;
      x = Math.max(0, Math.min(vw - AW, x));

      let grounded = false;

      const newBottom = y + AH;
      const charLeft = x;
      const charRight = x + AW;

      for (const p of currentPlatforms) {
        const platX1 = (p.x1 / 100) * vw;
        const platX2 = (p.x2 / 100) * vw;
        const platY = (p.y / 100) * vh;

        const horizontalOverlap = charRight > platX1 && charLeft < platX2;
        if (!horizontalOverlap) continue;

        const crossedFromAbove = prevBottom <= platY + 4 && newBottom >= platY - 4;
        if (crossedFromAbove) {
          y = platY - AH;
          vy = 0;
          grounded = true;
          break;
        }
      }

      if (y + AH >= groundLine) {
        y = groundLine - AH;
        vy = 0;
        grounded = true;
      }

      if (y < 0) {
        y = 0;
        vy = Math.abs(vy) * 0.3;
      }

      const justLanded = grounded && !s.onGround;

      s.x = x;
      s.y = y;
      s.vx = vx;
      s.vy = vy;
      s.onGround = grounded;

      setPos({ x, y });
      if (vx < -0.2) setFacing(-1);
      else if (vx > 0.2) setFacing(1);
      setWalking(Math.abs(vx) > 0.3);

      if (justLanded) {
        setLandingPhase(p => (p + 1) % 2);
        setLandingActive(true);
        if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current);
        landingTimeoutRef.current = setTimeout(() => {
          setLandingActive(false);
          landingTimeoutRef.current = null;
        }, LANDING_DURATION_MS);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [avatarData, excluded, presetName]);

  if (excluded || !avatarData) return null;

  const stateClass = landingActive
    ? `avatar-landing-${landingPhase}`
    : walking
      ? "avatar-walking"
      : "avatar-idle";

  return (
    <>
      <style>{OVERLAY_CSS}</style>
      <PlatformLines platforms={platforms} />
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: AW,
          height: AH,
          zIndex: 9995,
          userSelect: "none",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setPinned(p => !p)}
      >
        <ThoughtBubble message={message} pinned={pinned} visible={hovered} />

        <div
          className={stateClass}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${SCALE}) scaleX(${facing})`,
            transformOrigin: "top left",
            width: 183,
            height: 317,
          }}
        >
          <div className="avatar-overlay-figure">
            <AvatarFigure selection={avatarData} />
          </div>
        </div>
      </div>
    </>
  );
}