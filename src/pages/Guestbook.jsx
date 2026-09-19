import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavHeader from "../components/NavHeader.jsx";
import AvatarFigure from "../components/AvatarFigure.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

const PIN_COLORS = ["#D96614", "#4A90D9", "#E85D75", "#27AE8F", "#9B59B6", "#000"];

const LAYOUT_KEY = "murb_guestbook_layout";

const GUESTBOOK_CSS = `
@keyframes gbFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.gb-card {
  animation: gbFadeIn 0.35s ease both;
}
.gb-resize-handle {
  opacity: 0;
  transition: opacity 0.15s;
}
.gb-card:hover .gb-resize-handle {
  opacity: 1;
}
`;

function loadLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) { return {}; }
}

function saveLayout(layout) {
  try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); } catch (e) { void e; }
}

function Pushpin({ color }) {
  return (
    <svg width="18" height="24" viewBox="0 0 18 24" style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", zIndex: 2, pointerEvents: "none" }}>
      <circle cx="9" cy="7" r="6" fill={color} stroke="#000" strokeWidth="1" />
      <line x1="9" y1="13" x2="9" y2="24" stroke="#888" strokeWidth="1.5" />
    </svg>
  );
}

function GuestCard({ entry, pinColor, delay, layout, onLayoutChange }) {
  const { avatar_data, message, name, created_at } = entry;
  const date = created_at
    ? new Date(created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const scale = layout?.scale ?? 1;
  const dx = layout?.dx ?? 0;
  const dy = layout?.dy ?? 0;
  const baseRotation = layout?.baseRotation ?? (((entry.id.charCodeAt(0) * 7) % 11) - 5);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("[data-resize-handle]")) return;
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      mode: "drag",
      startX: e.clientX,
      startY: e.clientY,
      startDx: dx,
      startDy: dy,
    };

    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { void err; }
  };

  const onPointerMove = (e) => {
    const st = dragRef.current;
    if (!st || st.mode !== "drag") return;
    const moveX = e.clientX - st.startX;
    const moveY = e.clientY - st.startY;
    onLayoutChange(entry.id, {
      dx: st.startDx + moveX,
      dy: st.startDy + moveY,
    });
  };

  const onPointerUp = (e) => {
    if (dragRef.current?.mode === "drag") {
      dragRef.current = null;
      setDragging(false);
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) { void err; }
    }
  };

  const onResizePointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      mode: "resize",
      startY: e.clientY,
      startScale: scale,
    };

    setResizing(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { void err; }
  };

  const onResizePointerMove = (e) => {
    const st = dragRef.current;
    if (!st || st.mode !== "resize") return;
    const deltaY = e.clientY - st.startY;
    const next = Math.max(0.5, Math.min(2.0, st.startScale + deltaY * 0.005));
    onLayoutChange(entry.id, { scale: next });
  };

  const onResizePointerUp = (e) => {
    if (dragRef.current?.mode === "resize") {
      dragRef.current = null;
      setResizing(false);
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) { void err; }
    }
  };

  const isActive = dragging || resizing;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="gb-card"
      style={{
        position: "relative",
        background: "#FFFEF8",
        border: "1px solid #E8E3D8",
        borderRadius: 4,
        padding: "28px 16px 16px",
        width: 160,
        minHeight: 240,
        transform: `translate(${dx}px, ${dy}px) rotate(${baseRotation}deg) scale(${scale})`,
        transformOrigin: "center center",
        boxShadow: isActive
          ? "6px 10px 24px rgba(0,0,0,0.18)"
          : "2px 4px 12px rgba(0,0,0,0.09)",
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
        flexShrink: 0,
        touchAction: "none",
        cursor: isActive ? "grabbing" : "grab",
        zIndex: isActive ? 50 : 1,
        userSelect: "none",
      }}
    >
      <Pushpin color={pinColor} />

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, overflow: "hidden", height: 90, pointerEvents: "none" }}>
        {avatar_data ? (
          <div style={{ transform: "scale(0.48)", transformOrigin: "top center", width: 183, height: 317, marginTop: 0, flexShrink: 0 }}>
            <AvatarFigure selection={avatar_data} />
          </div>
        ) : (
          <div style={{ width: 40, height: 90, background: "#F0EDE6", borderRadius: 4 }} />
        )}
      </div>

      {message && (
        <div style={{
          background: "#fff",
          border: "1px solid #E8E3D8",
          borderRadius: 8,
          padding: "6px 8px",
          fontSize: 10,
          fontFamily: "Kode Mono, monospace",
          lineHeight: 1.5,
          marginBottom: 8,
          color: "#333",
          wordBreak: "break-word",
          position: "relative",
          pointerEvents: "none",
        }}>
          "{message}"
          <span style={{ position: "absolute", bottom: -5, left: 16, display: "flex", gap: 2 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff", border: "1px solid #E8E3D8", display: "block" }} />
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#fff", border: "1px solid #E8E3D8", display: "block", marginTop: 3 }} />
          </span>
        </div>
      )}

      <div style={{ marginTop: message ? 10 : 4, fontSize: 9, color: MUTED, fontFamily: "Kode Mono, monospace", display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
        {name && <span style={{ fontWeight: 600, color: "#888" }}>{name}</span>}
        <span>{date}</span>
      </div>

      <div
        data-resize-handle
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        className="gb-resize-handle"
        style={{
          position: "absolute",
          right: -6,
          bottom: -6,
          width: 20,
          height: 20,
          cursor: "nwse-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M12 2 L2 12 M12 6 L6 12 M12 10 L10 12" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function SubmitPanel({ onSubmit }) {
  const navigate = useNavigate();
  const [avatarData, setAvatarData] = useState(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem("murb_avatar");
        if (raw) {
          const parsed = JSON.parse(raw);
          setAvatarData(parsed.selection);
          setMessage(parsed.message || "");
        }
        const visitorName = localStorage.getItem("murb_visitor_name");
        if (visitorName) setName(visitorName);
      } catch (e) { void e; }
    });
  }, []);

  const submit = async () => {
    if (!avatarData) { navigate("/avatar"); return; }
    setSaving(true);
    const { error } = await supabase.from("guestbook").insert({
      avatar_data: avatarData,
      message: message.trim(),
      name: name.trim() || null,
    });
    setSaving(false);
    if (!error) { setDone(true); onSubmit(); }
  };

  if (!avatarData) return (
    <div style={{ padding: "20px 24px", background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: 8 }}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>You haven't made an avatar yet.</div>
      <button onClick={() => navigate("/avatar")}
        style={{ padding: "10px 20px", background: ACCENT, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
        make one →
      </button>
    </div>
  );

  if (done) return (
    <div style={{ padding: "20px 24px", background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontSize: 16, marginBottom: 8 }}>pinned! 📌</div>
      <div style={{ fontSize: 13, color: MUTED }}>your avatar is now in the guestbook.</div>
    </div>
  );

  return (
    <div style={{ padding: "20px 24px", background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Leave your mark</div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 183 * 0.42, height: 317 * 0.42, overflow: "hidden", flexShrink: 0 }}>
          <div style={{ transform: "scale(0.42)", transformOrigin: "top left", width: 183, height: 317 }}>
            <AvatarFigure selection={avatarData} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Message</div>
          <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 80))} maxLength={80}
            placeholder="what's on your mind?" rows={3}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #E0E0E0", borderRadius: 6, fontSize: 12, fontFamily: "Kode Mono, monospace", resize: "none", outline: "none", boxSizing: "border-box" }} />
          <div style={{ fontSize: 10, color: MUTED, textAlign: "right" }}>{message.length}/80</div>
        </div>
      </div>
      <button onClick={submit} disabled={saving}
        style={{ width: "100%", padding: "10px 0", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
        {saving ? "pinning..." : "pin to guestbook →"}
      </button>
    </div>
  );
}

export default function Guestbook() {
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState([]);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState(() => loadLayout());

  const load = () => {
    supabase.from("guestbook").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setEntries(data || []); setReady(true); });
  };

  useEffect(() => { load(); }, []);

  const handleLayoutChange = (id, partial) => {
    setLayout(prev => {
      const next = {
        ...prev,
        [id]: { ...(prev[id] || {}), ...partial },
      };
      saveLayout(next);
      return next;
    });
  };

  const resetLayout = () => {
    if (!confirm("Reset all card positions to default?")) return;
    setLayout({});
    saveLayout({});
  };

  if (!ready) return null;

  const pins = entries.map((_, i) => PIN_COLORS[i % PIN_COLORS.length]);

  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "Kode Mono, monospace" }}>
        <style>{GUESTBOOK_CSS}</style>
        <NavHeader />
        <div style={{ padding: "140px 20px 80px" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 400, margin: 0, marginBottom: 8 }}>guestbook</h1>
            <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{entries.length} visitor{entries.length !== 1 ? "s" : ""} left a mark</p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <SubmitPanel onSubmit={load} />
          </div>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: MUTED, fontSize: 14 }}>
              no entries yet. be the first to leave a mark!
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 28, paddingTop: 20 }}>
              {entries.map((entry, i) => (
                <GuestCard
                  key={entry.id}
                  entry={entry}
                  pinColor={pins[i]}
                  delay={i * 60}
                  layout={layout[entry.id]}
                  onLayoutChange={handleLayoutChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{GUESTBOOK_CSS}</style>

      <div style={{
        position: "fixed",
        inset: 0,
        background: "#FAFAFA",
        zIndex: -1,
      }} />

      <div style={{
        position: "relative",
        width: 1440,
        maxWidth: "100%",
        margin: "0 auto",
        minHeight: "100vh",
        fontFamily: "Kode Mono, monospace",
      }}>
        <NavHeader />
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "170px 40px 120px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 48,
            gap: 24,
          }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, margin: 0, marginBottom: 8 }}>guestbook</h1>
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{entries.length} visitor{entries.length !== 1 ? "s" : ""} left a mark</p>
            </div>
            <div style={{ width: 320 }}>
              <SubmitPanel onSubmit={load} />
            </div>
          </div>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: MUTED, fontSize: 14 }}>
              no entries yet. be the first to leave a mark!
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button
                  onClick={resetLayout}
                  style={{
                    padding: "4px 12px",
                    background: "transparent",
                    border: "1px solid #E0E0E0",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: "Kode Mono, monospace",
                    color: MUTED,
                    cursor: "pointer",
                  }}
                >
                  reset layout
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 36, paddingTop: 20 }}>
                {entries.map((entry, i) => (
                  <GuestCard
                    key={entry.id}
                    entry={entry}
                    pinColor={pins[i]}
                    delay={i * 60}
                    layout={layout[entry.id]}
                    onLayoutChange={handleLayoutChange}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}