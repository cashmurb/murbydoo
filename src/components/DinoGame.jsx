import { useEffect, useRef, useState, useCallback } from "react";
import AvatarFigure from "./AvatarFigure.jsx";
import { getLocalBest, submitScore } from "../lib/scores.js";
import { playDieSound, playJumpSound, startGameMusic, stopGameMusic } from "../lib/sounds.js";

const GAME_H = 220;
const GROUND_Y = 170;

const RUNNER_H = 80;
const RUNNER_W = Math.round(183 * (RUNNER_H / 317));
const RUNNER_X = 60;
const AVATAR_SCALE = RUNNER_H / 317;

const GRAVITY = 0.65;
const JUMP_V = 13.5;
const START_SPEED = 6;
const MAX_SPEED = 13;
const ACCEL = 0.0015;
const SCORE_DIVISOR = 7;

const INK = "#000";
const FAINT = "#C9C9C9";
const CLOUD = "#DEDEDE";
const DIM = "#8A8A8A";
const ACCENT = "#D96614";

const CACTI = [
  { kind: "cactus", w: 26, h: 46 },
  { kind: "cactus", w: 32, h: 64 },
  { kind: "cluster", w: 52, h: 48 },
];
const BIRD = { kind: "bird", w: 42, h: 28 };
const BIRD_HEIGHTS = [4, 48, 84];

const GAME_CSS = `
@keyframes dinoRun {
  0%,  49%  { transform: scale(1, 1); }
  50%, 100% { transform: scale(1.02, 0.96); }
}
@keyframes dinoIdle {
  0%, 100% { transform: scale(1, 1); }
  50%      { transform: scale(1, 0.99); }
}
.dino-runner-art {
  transform-origin: bottom center;
}
.dino-running .dino-runner-art {
  animation: dinoRun 0.34s linear infinite;
}
.dino-idle .dino-runner-art {
  animation: dinoIdle 2.4s ease-in-out infinite;
}
.dino-jumping .dino-runner-art {
  transform: scale(0.99, 1.03);
}

@keyframes dinoDie {
  0%   { transform: scale(1, 1);      opacity: 1; }
  20%  { transform: scale(1.18, 0.78); opacity: 1; }
  100% { transform: scale(1.32, 0.18); opacity: 0; }
}
@keyframes ghostRise {
  0%   { opacity: 0; transform: translateY(8px)   scale(0.55); }
  18%  { opacity: 1; transform: translateY(-6px)  scale(1); }
  100% { opacity: 0; transform: translateY(-98px) scale(1.05); }
}
@keyframes ghostSway {
  0%, 100% { transform: translateX(-5px) rotate(-5deg); }
  50%      { transform: translateX(5px)  rotate(5deg); }
}
.dino-dead .dino-runner-art {
  animation: dinoDie 0.5s ease-in both;
}
.dino-ghost {
  animation: ghostRise 1.9s ease-out both;
}
.dino-ghost-art {
  animation: ghostSway 1.1s ease-in-out infinite;
}
`;

function pad(n) {
  return String(Math.floor(n)).padStart(5, "0");
}

function Ghost() {
  return (
    <svg width="32" height="38" viewBox="0 0 32 38" fill="none">
      <path
        d="M16 2 C8 2 2.5 7.6 2.5 15.5 L2.5 34 L7 29.5 L11.5 34 L16 29.5 L20.5 34 L25 29.5 L29.5 34 L29.5 15.5 C29.5 7.6 24 2 16 2 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="15" r="2.1" fill={INK} />
      <circle cx="20.5" cy="15" r="2.1" fill={INK} />
    </svg>
  );
}

function DefaultRunner() {
  return (
    <svg width={RUNNER_W} height={RUNNER_H} viewBox="0 0 46 80" fill="none">
      <circle cx="23" cy="14" r="12" stroke={INK} strokeWidth="2" fill="#fff" />
      <path d="M23 26 L23 54" stroke={INK} strokeWidth="2" />
      <path d="M23 32 L11 44 M23 32 L35 44" stroke={INK} strokeWidth="2" />
      <path d="M23 54 L14 76 M23 54 L32 76" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

function drawCactus(ctx, x, top, w, h) {
  const trunkW = Math.max(6, Math.round(w * 0.32));
  const trunkX = x + Math.round((w - trunkW) / 2);
  ctx.fillRect(trunkX, top, trunkW, h);

  const armW = Math.max(4, Math.round(trunkW * 0.72));
  const armH = Math.round(h * 0.3);
  const barH = Math.max(4, Math.round(armW * 0.9));

  const leftTop = top + Math.round(h * 0.3);
  ctx.fillRect(x, leftTop, armW, armH);
  ctx.fillRect(x, leftTop + armH - barH, trunkX - x, barH);

  const rightX = x + w - armW;
  const rightTop = top + Math.round(h * 0.18);
  ctx.fillRect(rightX, rightTop, armW, armH);
  ctx.fillRect(trunkX + trunkW, rightTop + armH - barH, rightX - trunkX - trunkW, barH);
}

function drawBird(ctx, x, top, w, h, wingUp) {
  const bodyH = Math.round(h * 0.32);
  const bodyY = top + Math.round(h * 0.38);
  ctx.fillRect(x + 11, bodyY, w - 17, bodyH);
  ctx.fillRect(x, bodyY + 2, 11, Math.max(3, bodyH - 4));
  const wingH = Math.round(h * 0.38);
  if (wingUp) ctx.fillRect(x + 15, top, 18, wingH);
  else ctx.fillRect(x + 15, bodyY + bodyH, 18, wingH);
}

function drawCloud(ctx, x, y) {
  ctx.fillStyle = CLOUD;
  ctx.fillRect(x + 14, y, 18, 3);
  ctx.fillRect(x + 7, y + 3, 32, 3);
  ctx.fillRect(x, y + 6, 48, 3);
  ctx.fillRect(x + 11, y + 9, 26, 3);
}

function drawObstacle(ctx, ob) {
  ctx.fillStyle = INK;
  const top = GROUND_Y - ob.h - ob.lift;
  if (ob.kind === "bird") {
    drawBird(ctx, ob.x, top, ob.w, ob.h, ob.wingUp);
  } else if (ob.kind === "cluster") {
    drawCactus(ctx, ob.x, top, 22, ob.h);
    drawCactus(ctx, ob.x + 30, top + 9, 22, ob.h - 9);
  } else {
    drawCactus(ctx, ob.x, top, ob.w, ob.h);
  }
}

function freshState(best) {
  return {
    status: "ready",
    speed: START_SPEED,
    distance: 0,
    score: 0,
    best,
    y: 0,
    vy: 0,
    grounded: true,
    obstacles: [],
    clouds: [],
    nextObstacle: 420,
    nextCloud: 120,
    reported: false,
  };
}

export default function DinoGame({ avatarData, onScoreSaved }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const runnerRef = useRef(null);
  const stateRef = useRef(freshState(getLocalBest()));
  const frameRef = useRef(null);
  const savedRef = useRef(onScoreSaved);

  const [status, setStatus] = useState("ready");
  const [finalScore, setFinalScore] = useState(0);
  const [deathY, setDeathY] = useState(0);

  useEffect(() => { savedRef.current = onScoreSaved; }, [onScoreSaved]);

  const press = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;

    if (s.status === "over") {
      const next = freshState(s.best);
      next.status = "running";
      stateRef.current = next;
      setStatus("running");
      startGameMusic();
      return;
    }

    if (s.status === "ready") {
      s.status = "running";
      setStatus("running");
      startGameMusic();
    }

    if (s.grounded) {
      s.vy = JUMP_V;
      s.grounded = false;
      playJumpSound();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    let width = wrap.clientWidth;

    const resize = () => {
      width = wrap.clientWidth;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(GAME_H * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${GAME_H}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();

    const spawnObstacle = (s) => {
      const canFly = s.speed > START_SPEED + 1.6;
      const useBird = canFly && Math.random() < 0.28;
      const base = useBird ? BIRD : CACTI[Math.floor(Math.random() * CACTI.length)];
      s.obstacles.push({
        ...base,
        x: width + 20,
        lift: useBird ? BIRD_HEIGHTS[Math.floor(Math.random() * BIRD_HEIGHTS.length)] : 0,
        wingUp: true,
        flap: 0,
      });
      const gap = 320 + Math.random() * 280 + (MAX_SPEED - s.speed) * 26;
      s.nextObstacle = gap;
    };

    const hits = (s, ob) => {
      const rx = RUNNER_X + 11;
      const rw = RUNNER_W - 22;
      const rTop = GROUND_Y - RUNNER_H - s.y + 6;
      const rBottom = GROUND_Y - s.y;

      const oTop = GROUND_Y - ob.h - ob.lift;
      const oBottom = oTop + ob.h;
      const ox = ob.x + 3;
      const ow = ob.w - 6;

      return rx < ox + ow && rx + rw > ox && rTop < oBottom && rBottom > oTop;
    };

    const update = (s, dt) => {
      if (s.status !== "running") return;

      s.speed = Math.min(MAX_SPEED, s.speed + ACCEL * dt);
      s.distance += s.speed * dt;
      s.score = Math.floor(s.distance / SCORE_DIVISOR);

      if (!s.grounded) {
        s.vy -= GRAVITY * dt;
        s.y += s.vy * dt;
        if (s.y <= 0) {
          s.y = 0;
          s.vy = 0;
          s.grounded = true;
        }
      }

      s.nextObstacle -= s.speed * dt;
      if (s.nextObstacle <= 0) spawnObstacle(s);

      s.nextCloud -= s.speed * dt;
      if (s.nextCloud <= 0) {
        s.clouds.push({ x: width + 20, y: 18 + Math.random() * 62 });
        s.nextCloud = 300 + Math.random() * 500;
      }

      s.clouds.forEach(c => { c.x -= s.speed * 0.35 * dt; });
      s.clouds = s.clouds.filter(c => c.x > -60);

      s.obstacles.forEach(ob => {
        ob.x -= s.speed * dt;
        if (ob.kind === "bird") {
          ob.flap += dt;
          if (ob.flap > 9) { ob.flap = 0; ob.wingUp = !ob.wingUp; }
        }
      });
      s.obstacles = s.obstacles.filter(ob => ob.x > -80);

      for (const ob of s.obstacles) {
        if (hits(s, ob)) {
          s.status = "over";
          if (s.score > s.best) s.best = s.score;
          break;
        }
      }
    };

    const draw = (s) => {
      ctx.clearRect(0, 0, width, GAME_H);

      s.clouds.forEach(c => drawCloud(ctx, c.x, c.y));

      ctx.fillStyle = INK;
      ctx.fillRect(0, GROUND_Y, width, 1);
      ctx.fillStyle = FAINT;
      const offset = s.distance % 40;
      for (let x = -offset; x < width; x += 40) {
        ctx.fillRect(x + 6, GROUND_Y + 5, 9, 1);
        ctx.fillRect(x + 24, GROUND_Y + 9, 5, 1);
      }

      s.obstacles.forEach(ob => drawObstacle(ctx, ob));

      ctx.font = "600 14px 'Kode Mono', monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      if (s.best > 0) {
        ctx.fillStyle = DIM;
        ctx.fillText(`HI ${pad(s.best)}`, width - 92, 16);
      }
      ctx.fillStyle = INK;
      ctx.fillText(pad(s.score), width - 8, 16);
    };

    const tick = (now) => {
      const s = stateRef.current;
      const dt = Math.min(2.5, (now - last) / (1000 / 60));
      last = now;

      const wasRunning = s.status === "running";
      update(s, dt);
      draw(s);

      if (runnerRef.current) {
        runnerRef.current.style.transform = `translateY(${-s.y}px)`;
        let pose = "";
        if (s.status === "ready") pose = "dino-idle";
        else if (s.status === "running") pose = s.grounded ? "dino-running" : "dino-jumping";
        else if (s.status === "over") pose = "dino-dead";
        runnerRef.current.className = pose;
      }

      if (wasRunning && s.status === "over" && !s.reported) {
        s.reported = true;
        stopGameMusic();
        playDieSound();
        setFinalScore(s.score);
        setDeathY(s.y);
        setStatus("over");
        submitScore(s.score).then(() => {
          if (savedRef.current) savedRef.current(s.score);
        });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      stopGameMusic();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (e.repeat) return;
      const t = e.target;
      const tag = t?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
      e.preventDefault();
      press();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <div
      ref={wrapRef}
      onPointerDown={(e) => { e.preventDefault(); press(); }}
      style={{
        position: "relative",
        width: "100%",
        height: GAME_H,
        touchAction: "manipulation",
        userSelect: "none",
        cursor: "pointer",
        fontFamily: "Kode Mono, monospace",
      }}
    >
      <style>{GAME_CSS}</style>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: GAME_H }} />

      <div
        ref={runnerRef}
        style={{
          position: "absolute",
          left: RUNNER_X,
          top: GROUND_Y - RUNNER_H,
          width: RUNNER_W,
          height: RUNNER_H,
          pointerEvents: "none",
        }}
      >
        <div className="dino-runner-art" style={{ width: RUNNER_W, height: RUNNER_H }}>
          {avatarData ? (
            <div style={{
              width: 183,
              height: 317,
              transform: `scale(${AVATAR_SCALE})`,
              transformOrigin: "top left",
            }}>
              <AvatarFigure selection={avatarData} />
            </div>
          ) : (
            <DefaultRunner />
          )}
        </div>
      </div>

      {status === "over" && (
        <div
          className="dino-ghost"
          style={{
            position: "absolute",
            left: RUNNER_X,
            top: GROUND_Y - RUNNER_H - deathY,
            width: RUNNER_W,
            height: RUNNER_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <div className="dino-ghost-art">
            <Ghost />
          </div>
        </div>
      )}

      {status === "ready" && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: DIM,
          letterSpacing: 1,
          pointerEvents: "none",
        }}>
          [ press space to run ]
        </div>
      )}

      {status === "over" && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 15, letterSpacing: 6, color: DIM }}>GAME OVER</div>
          <div style={{
            border: `1.5px solid ${INK}`,
            borderRadius: 4,
            padding: "5px 10px",
            fontSize: 12,
            background: "#fff",
            color: INK,
          }}>
            ↻ press space
          </div>
          {finalScore > 0 && (
            <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 0.5 }}>
              you scored {pad(finalScore)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
