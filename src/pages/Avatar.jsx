import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import AvatarFigure from "../components/AvatarFigure.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import {
  OPTIONS,
  HEAD_HOTSPOTS,
  HAIR_HOTSPOTS,
  BODY_HOTSPOTS,
  ITEM_HOTSPOTS,
} from "../content/avatar-design.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

const TABS = ["head", "body", "clothes", "items"];
const SUBS = ["eyes", "nose", "mouth", "hair"];

const PANEL = { left: 745, top: 240, width: 415, height: 400 };
const TAB_H = 34;
const SUB_H = 32;

const TAB_HOTSPOTS = {
  head:    [745, 240, 104, TAB_H],
  body:    [849, 240, 104, TAB_H],
  clothes: [953, 240, 104, TAB_H],
  items:   [1057, 240, 103, TAB_H],
};

const SUB_HOTSPOTS = {
  eyes:  [745, 240 + TAB_H, 104, SUB_H],
  nose:  [849, 240 + TAB_H, 104, SUB_H],
  mouth: [953, 240 + TAB_H, 104, SUB_H],
  hair:  [1057, 240 + TAB_H, 103, SUB_H],
};

const HAIR_SCROLL = {
  left: PANEL.left + 2,
  top: PANEL.top + TAB_H + SUB_H + 2,
  width: PANEL.width - 4,
  height: PANEL.height - TAB_H - SUB_H - 4,
};

function Hotspot({ box, onClick }) {
  const [left, top, width, height] = box;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        left, top, width, height,
        padding: 0, border: "none", outline: "none",
        background: "transparent",
        cursor: "pointer",
        zIndex: 20,
      }}
    />
  );
}

function TabLabels({ names, hotspots, activeName }) {
  return (
    <>
      {names.map(name => {
        const [left, top, width, height] = hotspots[name];
        const active = activeName === name;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left, top, width, height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: active ? ACCENT : "#666666",
              fontWeight: active ? 600 : 400,
              fontSize: 15,
              fontFamily: "Kode Mono, monospace",
              pointerEvents: "none",
              zIndex: 19,
            }}
          >
            {name}
          </div>
        );
      })}
    </>
  );
}

function PieceGrid({ options, hotspots, selectedSet, offsetY = 0 }) {
  if (!options?.length || !hotspots?.length) return null;

  return (
    <>
      {options.map((option, i) => {
        const box = hotspots[i];
        if (!box || !option?.image) return null;
        const [left, top, width, height] = box;
        const cx = left + width / 2;
        const cy = top - offsetY + height / 2;

        const isSel = selectedSet ? selectedSet.has(i) : false;

        return (
          <div
            key={option.id || i}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              transform: "translate(-50%, -50%)",
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 15,
            }}
          >
            <img
              src={option.image}
              alt=""
              draggable="false"
              style={{
                maxWidth: width,
                maxHeight: height,
                width: "auto",
                height: "auto",
                userSelect: "none",
                opacity: isSel ? 1 : 0.85,
              }}
            />
          </div>
        );
      })}
    </>
  );
}

function HairScroll({ options, hotspots, selection, onSelect, topOffset = 0, heightBoost = 0 }) {
  const containerTop = HAIR_SCROLL.top - topOffset;
  const containerHeight = HAIR_SCROLL.height + heightBoost;
  const pageH = containerHeight;

  return (
    <div
      style={{
        position: "absolute",
        left: HAIR_SCROLL.left,
        top: containerTop,
        width: HAIR_SCROLL.width,
        height: containerHeight,
        overflowY: "auto",
        overflowX: "hidden",
        background: "#ffffff",
        zIndex: 16,
      }}
    >
      <div style={{ position: "relative", width: HAIR_SCROLL.width, height: pageH * 2 }}>

        {[0, 1].map(page => {
          const offsetY = page * pageH;
          return (
            <div key={page}>
              {hotspots.map(([left, top, width, height], i) => {
                const optionIndex = page * 6 + i;
                const option = options[optionIndex];
                if (!option?.image) return null;

                const relLeft = left - HAIR_SCROLL.left;
                const relTop = top - HAIR_SCROLL.top + offsetY;

                const isSel = selection === optionIndex;

                return (
                  <div
                    key={`hair-piece-${optionIndex}`}
                    style={{
                      position: "absolute",
                      left: relLeft + width / 2,
                      top: relTop + height / 2,
                      transform: "translate(-50%, -50%)",
                      width,
                      height,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                      zIndex: 15,
                    }}
                  >
                    <img
                      src={option.image}
                      alt=""
                      draggable="false"
                      style={{
                        maxWidth: width,
                        maxHeight: height,
                        width: "auto",
                        height: "auto",
                        userSelect: "none",
                        opacity: isSel ? 1 : 0.85,
                      }}
                    />
                  </div>
                );
              })}

              {hotspots.map(([left, top, width, height], i) => {
                const optionIndex = page * 6 + i;
                const relLeft = left - HAIR_SCROLL.left;
                const relTop = top - HAIR_SCROLL.top + offsetY;
                return (
                  <button
                    key={`hair-hit-${optionIndex}`}
                    type="button"
                    onClick={() => onSelect(optionIndex)}
                    style={{
                      position: "absolute",
                      left: relLeft,
                      top: relTop,
                      width,
                      height,
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      zIndex: 20,
                    }}
                  />
                );
              })}
            </div>
          );
        })}

      </div>
    </div>
  );
}

const DEFAULT_SELECTION = {
  eyes: null,
  nose: null,
  mouth: null,
  hair: null,
  body: null,
  clothes: null,
  items: [],
};

function MobileAvatar() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("build");

  const activate = () => {
    const data = { selection, message };
    try { localStorage.setItem("murb_avatar", JSON.stringify(data)); } catch (e) { void e; }
    window.dispatchEvent(new StorageEvent("storage", { key: "murb_avatar", newValue: JSON.stringify(data) }));
    setStep("done");
  };

  const toggleItem = (index) => {
    setSelection(s => ({
      ...s,
      items: s.items.includes(index) ? s.items.filter(i => i !== index) : [...s.items, index],
    }));
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Kode Mono, monospace" }}>
      <NavHeader active="avatar" />
      <div style={{ padding: "32px 24px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 8 }}>avatar</h1>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 32 }}>Build your avatar, leave a message, then roam the site.</p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ transform: "scale(0.7)", transformOrigin: "top center", height: 222, width: 128 }}>
            <AvatarFigure selection={selection} />
          </div>
        </div>

        {step === "build" && (
          <>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Customize</div>
            {[
              { key: "body", label: "Body", max: 2 },
              { key: "eyes", label: "Eyes", max: 12, nullable: true },
              { key: "nose", label: "Nose", max: 10, nullable: true },
              { key: "mouth", label: "Mouth", max: 10, nullable: true },
              { key: "hair", label: "Hair", max: 12, nullable: true },
            ].map(({ key, label, max, nullable }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>{label}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {nullable && (
                    <button onClick={() => setSelection(s => ({ ...s, [key]: null }))}
                      style={{ padding: "6px 12px", border: `1px solid ${selection[key] === null ? ACCENT : "#E0E0E0"}`, borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, fontFamily: "Kode Mono, monospace", color: selection[key] === null ? ACCENT : "#666" }}>
                      none
                    </button>
                  )}
                  {Array.from({ length: max }, (_, i) => (
                    <button key={i} onClick={() => setSelection(s => ({ ...s, [key]: i }))}
                      style={{ padding: "6px 12px", border: `1px solid ${selection[key] === i ? ACCENT : "#E0E0E0"}`, borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, fontFamily: "Kode Mono, monospace", color: selection[key] === i ? ACCENT : "#666" }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Items</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["glasses", "scarf", "watch", "jewelry", "orange"].map((label, i) => {
                  const active = selection.items.includes(i);
                  return (
                    <button key={i} onClick={() => toggleItem(i)}
                      style={{ padding: "6px 12px", border: `1px solid ${active ? ACCENT : "#E0E0E0"}`, borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, fontFamily: "Kode Mono, monospace", color: active ? ACCENT : "#666" }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setStep("message")}
              style={{ marginTop: 16, padding: "12px 28px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
              next →
            </button>
          </>
        )}

        {step === "message" && (
          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Leave a message</div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>This will float above your avatar as a thought bubble while you roam.</p>
            <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 80))}
              placeholder="say something..." maxLength={80}
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", resize: "none", height: 100, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: 11, color: MUTED, textAlign: "right", marginBottom: 20 }}>{message.length}/80</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep("build")}
                style={{ padding: "12px 20px", background: "none", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
                ← back
              </button>
              <button onClick={activate}
                style={{ flex: 1, padding: "12px 20px", background: "#000", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
                start roaming
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 18, marginBottom: 12 }}>avatar activated!</div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Use ← → arrow keys to walk and spacebar to jump.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => navigate("/")}
                style={{ padding: "12px 20px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
                go roam →
              </button>
              <button onClick={() => navigate("/guestbook")}
                style={{ padding: "12px 20px", background: "none", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
                view guestbook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Avatar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [tab, setTab] = useState("head");
  const [sub, setSub] = useState("eyes");
  const [headExpanded, setHeadExpanded] = useState(true);
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("build");

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem("murb_avatar");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.selection) setSelection(parsed.selection);
          if (parsed.message) setMessage(parsed.message);
        }
      } catch (e) { void e; }
    });
  }, []);

  const handleAvatarClick = () => {
    if (!open) setEverOpened(true);
    setOpen(v => !v);
  };

  const handleTabClick = (name) => {
    if (name === "head") {
      if (tab === "head") {
        setHeadExpanded(v => !v);
      } else {
        setTab("head");
        setHeadExpanded(true);
      }
    } else {
      setTab(name);
    }
  };

  const toggleSelection = (kind, index) => {
    setSelection(current => ({
      ...current,
      [kind]: current[kind] === index ? null : index,
    }));
  };

  const toggleItem = (index) => {
    setSelection(current => {
      const has = current.items.includes(index);
      return {
        ...current,
        items: has ? current.items.filter(i => i !== index) : [...current.items, index],
      };
    });
  };

  const activate = () => {
    const data = { selection, message };
    try { localStorage.setItem("murb_avatar", JSON.stringify(data)); } catch (e) { void e; }
    window.dispatchEvent(new StorageEvent("storage", { key: "murb_avatar", newValue: JSON.stringify(data) }));
    setStep("done");
  };

  if (isMobile) return <ScaleWrap><MobileAvatar /></ScaleWrap>;

  const figureLeft = open ? 418 : 628.5;
  const figureTop = open ? 266 : 273;

  const isHeadTab = tab === "head";
  const showSubs = isHeadTab && headExpanded;
  const isHairTab = isHeadTab && sub === "hair";
  const contentOffset = (isHeadTab && !headExpanded) ? SUB_H : 0;
  const contentHeightBoost = contentOffset;

  const currentOptions = isHeadTab
    ? OPTIONS[sub]
    : tab === "body"
      ? OPTIONS.body
      : tab === "items"
        ? OPTIONS.items
        : [];
  const currentHotspots = isHeadTab
    ? (sub === "hair" ? HAIR_HOTSPOTS : HEAD_HOTSPOTS[sub])
    : tab === "body"
      ? BODY_HOTSPOTS
      : tab === "items"
        ? ITEM_HOTSPOTS
        : [];

  const selectedSet = isHeadTab
    ? new Set(selection[sub] == null ? [] : [selection[sub]])
    : tab === "body"
      ? new Set(selection.body == null ? [] : [selection.body])
      : tab === "items"
        ? new Set(selection.items)
        : new Set();

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="avatar" />

      {step === "build" && (
        <>
          {!open && everOpened && (
            <div style={{
              position: "absolute",
              left: PANEL.left,
              top: PANEL.top,
              width: PANEL.width,
              height: PANEL.height,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
              zIndex: 5,
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  thought bubble message
                </div>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 80))}
                  placeholder="what's on your mind? (optional)"
                  style={{
                    width: 260,
                    padding: "10px 14px",
                    border: "1px solid #E0E0E0",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "Kode Mono, monospace",
                    outline: "none",
                    textAlign: "center",
                  }}
                />
                <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{message.length}/80</div>
              </div>

              <button
                onClick={activate}
                style={{
                  padding: "12px 32px",
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "Kode Mono, monospace",
                  cursor: "pointer",
                }}
              >
                start roaming →
              </button>
            </div>
          )}

          {open && (
            <>
              <div style={{
                position: "absolute",
                left: PANEL.left,
                top: PANEL.top,
                width: PANEL.width,
                height: PANEL.height,
                border: "1px solid #000000",
                background: "#ffffff",
                boxSizing: "border-box",
                pointerEvents: "none",
                zIndex: 1,
              }} />

              <div style={{
                position: "absolute",
                left: PANEL.left,
                top: PANEL.top + TAB_H,
                width: PANEL.width,
                height: 1,
                background: "#000000",
                pointerEvents: "none",
                zIndex: 2,
              }} />

              {showSubs && (
                <div style={{
                  position: "absolute",
                  left: PANEL.left,
                  top: PANEL.top + TAB_H + SUB_H,
                  width: PANEL.width,
                  height: 1,
                  background: "#000000",
                  pointerEvents: "none",
                  zIndex: 2,
                }} />
              )}

              <TabLabels names={TABS} hotspots={TAB_HOTSPOTS} activeName={tab} />

              {TABS.map(name => (
                <Hotspot
                  key={name}
                  box={TAB_HOTSPOTS[name]}
                  onClick={() => handleTabClick(name)}
                />
              ))}

              {showSubs && (
                <TabLabels names={SUBS} hotspots={SUB_HOTSPOTS} activeName={sub} />
              )}

              {showSubs && SUBS.map(name => (
                <Hotspot
                  key={name}
                  box={SUB_HOTSPOTS[name]}
                  onClick={() => setSub(name)}
                />
              ))}

              {!isHairTab && (
                <PieceGrid
                  options={currentOptions}
                  hotspots={currentHotspots}
                  selectedSet={selectedSet}
                  offsetY={contentOffset}
                />
              )}

              {isHairTab && (
                <HairScroll
                  options={OPTIONS.hair}
                  hotspots={HAIR_HOTSPOTS}
                  selection={selection.hair}
                  onSelect={(i) => toggleSelection("hair", i)}
                  topOffset={contentOffset}
                  heightBoost={contentHeightBoost}
                />
              )}

              {isHeadTab && sub !== "hair" && HEAD_HOTSPOTS[sub].map((box, i) => (
                <Hotspot
                  key={`${sub}-${i}`}
                  box={[box[0], box[1] - contentOffset, box[2], box[3]]}
                  onClick={() => toggleSelection(sub, i)}
                />
              ))}

              {tab === "body" && BODY_HOTSPOTS.map((box, i) => (
                <Hotspot
                  key={`body-${i}`}
                  box={box}
                  onClick={() => toggleSelection("body", i)}
                />
              ))}

              {tab === "items" && ITEM_HOTSPOTS.map((box, i) => (
                <Hotspot
                  key={`item-${i}`}
                  box={box}
                  onClick={() => toggleItem(i)}
                />
              ))}

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute",
                  left: 418,
                  top: 266,
                  width: 183,
                  height: 317,
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  zIndex: 13,
                }}
              />
            </>
          )}

          <div style={{
            position: "absolute",
            left: figureLeft,
            top: figureTop,
            zIndex: 12,
            transition: "left .55s cubic-bezier(0.22,1,0.36,1), top .55s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <AvatarFigure selection={selection} onClick={handleAvatarClick} />
          </div>
        </>
      )}

      {step === "done" && (
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 400, marginBottom: 16 }}>avatar activated!</div>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 32, maxWidth: 480, lineHeight: 1.7 }}>
            Use ← → arrow keys to walk and spacebar to jump.<br />
            Hover or click your avatar to show your message.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => navigate("/")}
              style={{ padding: "12px 32px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
              go roam →
            </button>
            <button onClick={() => navigate("/guestbook")}
              style={{ padding: "12px 32px", background: "none", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
              view guestbook
            </button>
            <button onClick={() => setStep("build")}
              style={{ padding: "12px 32px", background: "none", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "Kode Mono, monospace", cursor: "pointer" }}>
              edit avatar
            </button>
          </div>
        </div>
      )}
    </ScaleWrap>
  );
}