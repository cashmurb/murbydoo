import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile.js";
import NavHeader from "../components/NavHeader.jsx";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";
const DIM = "#8A8A8A";

const MURB_INTRO = "i'm murb.";
const MURB_FINAL = "i'm murb!";

const PAN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const PAN_DURATION = 0.5;

const ERASE_MS = 45;
const TYPE_MS = 65;
const POST_ERASE_PAUSE = 120;
const POST_PAN_PAUSE = 150;
const POST_TYPE_PAUSE = 200;

const CAT_ASCII = `    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)'`;

const TERM_CSS = `
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes catWave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-6deg); }
  75% { transform: rotate(6deg); }
}
@keyframes catFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes goodbyeFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hintPulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.85; }
}
.term-cursor {
  display: inline-block;
  width: 9px;
  height: 1em;
  background: ${ACCENT};
  vertical-align: text-bottom;
  margin-left: 3px;
  animation: blink 1s steps(1) infinite;
  transform: translateY(3px);
}
.term-link {
  color: #000;
  text-decoration: none;
  border-bottom: 1px solid #C8C8C8;
  padding-bottom: 1px;
  transition: color 0.15s, border-color 0.15s;
}
.term-link:hover {
  color: ${ACCENT};
  border-color: ${ACCENT};
}
.term-link-accent {
  color: ${ACCENT};
  border-color: ${ACCENT};
}
.cat-ascii {
  animation: catFloat 3.2s ease-in-out infinite;
  font-family: "Courier New", Courier, "Lucida Console", monospace;
  font-size: 1em;
  color: ${ACCENT};
  white-space: pre;
  text-align: left;
  line-height: 1.1;
  letter-spacing: 0;
  margin: 0;
  display: block;
  user-select: none;
  pointer-events: none;
}
.goodbye-cat {
  animation: catWave 1.6s ease-in-out infinite;
  font-family: "Courier New", Courier, "Lucida Console", monospace;
  color: ${ACCENT};
  white-space: pre;
  text-align: left;
  line-height: 1.1;
  letter-spacing: 0;
  margin: 0;
  display: block;
  user-select: none;
  transform-origin: 50% 90%;
}
.goodbye-text {
  animation: goodbyeFadeIn 0.8s ease-out 0.4s both;
}
.term-hint {
  animation: hintPulse 2.4s ease-in-out infinite;
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.term-scroll::-webkit-scrollbar {
  width: 8px;
}
.term-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.term-scroll::-webkit-scrollbar-thumb {
  background: #D8D8D8;
  border-radius: 4px;
}
.term-scroll::-webkit-scrollbar-thumb:hover {
  background: #B8B8B8;
}
`;

function PromptLine({ cmd, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 15, lineHeight: 1.9, ...style }}>
      <span style={{ color: ACCENT, flexShrink: 0 }}>❯</span>
      <span style={{ color: DIM }}>{cmd}</span>
    </div>
  );
}

function OutputLine({ children, style = {} }) {
  return (
    <div style={{ marginLeft: 24, fontSize: 14, lineHeight: 1.8, color: "#333", ...style }}>
      {children}
    </div>
  );
}

function TerminalFrame({ title, children }) {
  return (
    <div style={{
      background: "#FAFAFA",
      border: "1px solid #D0D0D0",
      borderRadius: 10,
      overflow: "hidden",
      fontFamily: "Kode Mono, monospace",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 14px",
        background: "#F0F0F0",
        borderBottom: "1px solid #D0D0D0",
        gap: 6,
      }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#D8D8D8" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#D8D8D8" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#D8D8D8" }} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: DIM, letterSpacing: 0.3 }}>{title}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function extractName(raw) {
  let s = raw.trim();
  s = s.replace(/^(my name is|my name's|i am|i'm|im|call me|it's|its)\s+/i, "");
  s = s.replace(/[.!?]+$/, "");
  s = s.trim();
  if (!s) return null;
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function buildLsOutput() {
  return (
    <>
      <OutputLine style={{ marginBottom: 10 }}>
        here are the commands to find out more about me!
      </OutputLine>
      <OutputLine style={{ lineHeight: 2.1 }}>
        <span style={{ color: "#000", fontWeight: 600 }}>bio</span>
        <span style={{ color: DIM }}>{"      "}→ </span>
        <span style={{ color: "#555" }}>murb's bio</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>who</span>
        <span style={{ color: DIM }}>{"      "}→ </span>
        <span style={{ color: "#555" }}>who am i</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>wyd</span>
        <span style={{ color: DIM }}>{"      "}→ </span>
        <span style={{ color: "#555" }}>what i'm doing</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>wya</span>
        <span style={{ color: DIM }}>{"      "}→ </span>
        <span style={{ color: "#555" }}>where to find me</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>avatar</span>
        <span style={{ color: DIM }}>{"   "}→ </span>
        <span style={{ color: "#555" }}>make your avatar</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>cat</span>
        <span style={{ color: DIM }}>{"      "}→ </span>
        <span style={{ color: "#555" }}>a small surprise</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>reset</span>
        <span style={{ color: DIM }}>{"    "}→ </span>
        <span style={{ color: "#555" }}>forget my name and avatar</span>
        <br />
        <span style={{ color: "#000", fontWeight: 600 }}>bye</span>
        <span style={{ color: DIM }}>{"      "}→ </span>
        <span style={{ color: "#555" }}>until next time</span>
      </OutputLine>
    </>
  );
}

function processCommand(raw, conv) {
  const cmd = raw.trim().toLowerCase().replace(/[.?!,]+$/g, "");
  const outputs = [];
  let nextConv = conv;

  if (cmd === "") return { outputs, nextConv };

  if (conv.awaitingName) {
    const name = extractName(raw);
    if (!name) {
      outputs.push({
        kind: "output",
        content: <OutputLine>sorry, i didn't catch that. what's your name?</OutputLine>,
      });
      return { outputs, nextConv: conv };
    }
    nextConv = { awaitingName: false, name };
    try { localStorage.setItem("murb_visitor_name", name); } catch (e) { void e; }

    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          nice to meet you, <span style={{ color: ACCENT, fontWeight: 600 }}>{name}</span>.
          to find out more about murb, type <span style={{ color: "#000", fontWeight: 600 }}>ls</span> to view the commands.
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "hello" || cmd === "hi" || cmd === "hey" || cmd === "yo") {
    if (conv.name) {
      outputs.push({
        kind: "output",
        content: (
          <OutputLine>
            hey <span style={{ color: ACCENT }}>{conv.name}</span>! good to see you again.
            type <span style={{ color: "#000", fontWeight: 600 }}>ls</span> to see what else i can do.
          </OutputLine>
        ),
      });
      return { outputs, nextConv };
    }
    nextConv = { ...conv, awaitingName: true };
    outputs.push({
      kind: "output",
      content: <OutputLine>hello! what's your name?</OutputLine>,
    });
    return { outputs, nextConv };
  }

  if (cmd === "ls") {
    outputs.push({
      kind: "output",
      content: buildLsOutput(),
    });
    return { outputs, nextConv };
  }

  if (cmd === "bio" || cmd === "murb") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          murb is an AI researcher by day and an artist by night. She teaches machines to see and spend an unreasonable amount of time thinking about the brain. She also takes photos, makes films and music, and do strange little projects in between.
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "who") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          <Link to="/about" className="term-link">→ who is she</Link>
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "wyd") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          <Link to="/wyd" className="term-link">→ what is she doing</Link>
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "wya") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          <Link to="/socials" className="term-link">→ where to find her</Link>
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "avatar") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          let's make your avatar. <Link to="/avatar" className="term-link term-link-accent">→ start</Link>
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "cat" || cmd === "meow") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          <pre className="cat-ascii" style={{ margin: 0 }}>{CAT_ASCII}</pre>
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  if (cmd === "reset" || cmd === "reset name" || cmd === "reset avatar" ||
      cmd === "forget" || cmd === "forget me" || cmd === "clear avatar") {
    let hasName = !!conv.name;
    let hasAvatar = false;
    try { hasAvatar = !!localStorage.getItem("murb_avatar"); } catch (e) { void e; }

    if (!hasName && !hasAvatar) {
      outputs.push({
        kind: "output",
        content: (
          <OutputLine style={{ color: DIM }}>
            nothing to forget. i don't know your name or avatar yet.
          </OutputLine>
        ),
      });
      return { outputs, nextConv };
    }

    const cleared = [];
    if (hasName) cleared.push(conv.name);
    if (hasAvatar) cleared.push("your avatar");

    outputs.push({
      kind: "output",
      content: (
        <OutputLine>
          forgotten: <span style={{ color: ACCENT }}>{cleared.join(" and ")}</span>. say <span style={{ color: "#000", fontWeight: 600 }}>hello</span> to start over.
        </OutputLine>
      ),
    });
    return {
      outputs,
      nextConv: { awaitingName: false, name: null },
      resetName: hasName,
      resetAvatar: hasAvatar,
    };
  }

  if (cmd === "bye" || cmd === "goodbye" || cmd === "see ya" || cmd === "cya" ||
      cmd === "q" || cmd === "quit" || cmd === "exit") {
    const farewell = conv.name
      ? `thanks for stopping by, ${conv.name}!`
      : "thanks for stopping by!";
    outputs.push({
      kind: "output",
      content: <OutputLine>{farewell}</OutputLine>,
    });
    return { outputs, nextConv, quit: true };
  }

  if (cmd === "help") {
    outputs.push({
      kind: "output",
      content: (
        <OutputLine style={{ color: DIM }}>
          coming soon.
        </OutputLine>
      ),
    });
    return { outputs, nextConv };
  }

  outputs.push({
    kind: "output",
    content: (
      <OutputLine>
        <span style={{ color: "#A0A0A0" }}>
          command not found: {cmd}. type 'ls' to see what you can do.
        </span>
      </OutputLine>
    ),
  });
  return { outputs, nextConv };
}

function InteractiveTerminal({ showMurbText, visibleTyped, showCursorOnMurb, compact = false }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [closed, setClosed] = useState(false);
  const [conv, setConv] = useState(() => {
    try {
      const saved = localStorage.getItem("murb_visitor_name");
      return { awaitingName: false, name: saved || null };
    } catch {
      return { awaitingName: false, name: null };
    }
  });
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!compact) inputRef.current?.focus();
  }, [compact]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history]);

  const handleSubmit = () => {
    const raw = input;
    setInput("");

    if (raw.trim().toLowerCase() === "clear") {
      setHistory([]);
      return;
    }

    const { outputs, nextConv, quit, resetName, resetAvatar } = processCommand(raw, conv);
    setConv(nextConv);
    setHistory(h => [...h, { kind: "input", text: raw }, ...outputs]);

    if (resetName) {
      try { localStorage.removeItem("murb_visitor_name"); } catch (e) { void e; }
    }

    if (resetAvatar) {
      try { localStorage.removeItem("murb_avatar"); } catch (e) { void e; }
      window.dispatchEvent(new CustomEvent("murb-avatar-reset"));
    }

    if (quit) {
      setTimeout(() => {
        try { window.close(); } catch (e) { void e; }
        setTimeout(() => {
          if (!window.closed) setClosed(true);
        }, 300);
      }, 900);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const focusInput = (e) => {
    if (e.target.tagName === "A" || e.target.closest("a")) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  const murbSize = compact ? 26 : 44;
  const murbLine = compact ? 34 : 62;
  const maxHeight = compact ? 480 : 560;

  const welcomeMsg = conv.name
    ? `welcome back, ${conv.name}!`
    : "welcome, strangers!";

  const farewellName = conv.name || "friend";
  const showHint = history.length === 0 && !conv.awaitingName;

  return (
    <>
      <div
        style={{
          position: "relative",
          height: maxHeight,
          fontFamily: "Kode Mono, monospace",
        }}
      >
        <div style={{
          position: "absolute",
          bottom: compact ? 14 : 20,
          right: compact ? 14 : 24,
          fontSize: compact ? 11 : 13,
          color: DIM,
          textAlign: "left",
          zIndex: 2,
          background: "#FAFAFA",
          paddingLeft: 8,
        }}>
          <pre className="cat-ascii" style={{ margin: 0 }}>{CAT_ASCII}</pre>
        </div>

        <div
          ref={scrollRef}
          onClick={focusInput}
          className="term-scroll"
          style={{
            position: "absolute",
            inset: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: compact ? "22px 130px 26px 18px" : "36px 190px 44px 44px",
            cursor: "text",
          }}
        >
          <PromptLine cmd={welcomeMsg} />

          <div style={{
            height: murbLine,
            marginLeft: 24,
            fontSize: murbSize,
            lineHeight: `${murbLine}px`,
            letterSpacing: compact ? 0.5 : 1,
            fontFamily: "Kode Mono, monospace",
            whiteSpace: "nowrap",
            color: "#000",
          }}>
            {showMurbText && visibleTyped.split("").map((c, i) => (
              <span key={i} style={{ display: "inline-block" }}>{c === " " ? "\u00A0" : c}</span>
            ))}
            {showCursorOnMurb && <span className="term-cursor" />}
          </div>

          <div
            className={showHint ? "term-hint" : ""}
            style={{
              marginLeft: 24,
              marginTop: 6,
              marginBottom: 4,
              fontSize: 13,
              color: MUTED,
              fontFamily: "Kode Mono, monospace",
              letterSpacing: 0.3,
              opacity: showHint ? 1 : 0,
              transform: showHint ? "translateY(0)" : "translateY(-4px)",
              pointerEvents: "none",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            type <span style={{ color: "#000", fontWeight: 600 }}>hello</span> to start
          </div>

          {history.map((entry, i) => (
            <div key={i}>
              {entry.kind === "input"
                ? <PromptLine cmd={entry.text} />
                : entry.content}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 15, lineHeight: 1.9, marginTop: 2 }}>
            <span style={{ color: ACCENT, flexShrink: 0 }}>❯</span>
            <span style={{ color: "#000" }}>{input}</span>
            <span className="term-cursor" />
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={!compact}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            style={{
              position: "absolute",
              left: -9999,
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {closed && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "#0A0A0A",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          fontFamily: "Kode Mono, monospace",
          color: "#4A4A4A",
          animation: "fadeIn 0.6s ease-out",
        }}>
          <div style={{
            fontSize: 26,
            color: ACCENT,
            marginBottom: 4,
          }}>
            <pre className="goodbye-cat">{CAT_ASCII}</pre>
          </div>

          <div className="goodbye-text" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{ fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#8A8A8A" }}>
              see you soon, {farewellName}
            </div>
            <div style={{ fontSize: 12, color: "#4A4A4A", letterSpacing: 1 }}>
              you can close this tab now
            </div>
            <div style={{
              marginTop: 8,
              width: 8,
              height: 14,
              background: "#4A4A4A",
              animation: "blink 1s steps(1) infinite",
            }} />
          </div>
        </div>
      )}
    </>
  );
}

function MobileHome() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Kode Mono, monospace" }}>
      <style>{TERM_CSS}</style>
      <NavHeader />
      <div style={{ padding: "24px 16px 64px" }}>
        <TerminalFrame title="murb — zsh">
          <InteractiveTerminal
            compact
            showMurbText
            visibleTyped={MURB_FINAL}
            showCursorOnMurb={false}
          />
        </TerminalFrame>
      </div>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState("idle");
  const [eraseIndex, setEraseIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);

  useEffect(() => {
    const active = phase === "idle" || phase === "erasing";
    window.dispatchEvent(new CustomEvent("murb-intro-state", { detail: { active } }));
    return () => {
      window.dispatchEvent(new CustomEvent("murb-intro-state", { detail: { active: false } }));
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") return;

    if (phase === "erasing") {
      if (eraseIndex >= MURB_INTRO.length) {
        const t = setTimeout(() => setPhase("panning"), POST_ERASE_PAUSE);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setEraseIndex(i => i + 1), ERASE_MS);
      return () => clearTimeout(t);
    }

    if (phase === "panning") {
      const t = setTimeout(() => setPhase("typing"), PAN_DURATION * 1000 + POST_PAN_PAUSE);
      return () => clearTimeout(t);
    }

    if (phase === "typing") {
      if (typedCount >= MURB_FINAL.length) {
        const t = setTimeout(() => setPhase("done"), POST_TYPE_PAUSE);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setTypedCount(c => c + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, eraseIndex, typedCount]);

  const startErase = () => {
    if (phase !== "idle") return;
    setPhase("erasing");
    setEraseIndex(0);
  };

  if (isMobile) return <MobileHome />;

  const visibleIntro = MURB_INTRO.slice(0, Math.max(0, MURB_INTRO.length - eraseIndex));
  const showIntro = phase === "idle" || phase === "erasing";
  const showFrame = phase === "panning" || phase === "typing" || phase === "done";

  return (
    <>
      <style>{TERM_CSS}</style>

      {showIntro && (
        <div
          onClick={startErase}
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            zIndex: 100,
            cursor: phase === "idle" ? "pointer" : "default",
            fontFamily: "Kode Mono, monospace",
          }}
        >
          <div style={{
            position: "relative",
            fontSize: 52,
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}>
            <span style={{ visibility: "hidden" }}>{MURB_INTRO}</span>
            <span style={{ position: "absolute", left: 0, top: 0 }}>
              {visibleIntro.split("").map((c, i) => (
                <span key={i} style={{ display: "inline-block" }}>{c === " " ? "\u00A0" : c}</span>
              ))}
              <span className="term-cursor" />
            </span>
          </div>
          {phase === "idle" && (
            <div style={{ fontSize: 13, color: DIM, letterSpacing: 0.5 }}>
              [ click to run ]
            </div>
          )}
        </div>
      )}

      <div style={{
        position: "relative",
        width: 1440,
        maxWidth: "100%",
        margin: "0 auto",
        minHeight: "100vh",
        opacity: showFrame ? 1 : 0,
        transition: `opacity ${PAN_DURATION}s ${PAN_EASE}`,
      }}>
        <NavHeader />

        {showFrame && (
          <div style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "140px 40px 80px",
          }}>
            <TerminalFrame title="cashmere@blanche — ~ — zsh">
              <InteractiveTerminal
                showMurbText
                visibleTyped={MURB_FINAL}
                showCursorOnMurb={false}
              />
            </TerminalFrame>
          </div>
        )}
      </div>
    </>
  );
}