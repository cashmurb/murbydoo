import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ScaleWrap from "../components/ScaleWrap.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import NavHeader from "../components/NavHeader.jsx";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

function MobileBrain({ entries }) {
  const [index, setIndex] = useState(0);
  const current = entries[index];
  const total = entries.length;

  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader active="brain" />
      <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, margin: 0 }}>brain</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>A compilation of what I've learned throughout the years.</p>

        {current && (
          <Link to={current.url} style={{ border: "1px solid #000", borderRadius: 12, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", textDecoration: "none", color: "#000", minHeight: 200, justifyContent: "center" }}>
            <div style={{ fontSize: 13, color: MUTED }}>{current.number}</div>
            <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3 }}>{current.title}</div>
            {current.subtitle && <div style={{ fontSize: 12, color: MUTED }}>{current.subtitle}</div>}
          </Link>
        )}

        {total > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button onClick={() => setIndex(i => (i + total - 1) % total)} style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>‹</button>
            <span style={{ fontSize: 13, color: MUTED }}>{index + 1} / {total}</span>
            <button onClick={() => setIndex(i => (i + 1) % total)} style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>›</button>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {entries.map((e, i) => (
            <div key={i} onClick={() => setIndex(i)} style={{ width: 32, height: 4, background: i === index ? ACCENT : "#BFBFBF", cursor: "pointer", borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Brain() {
  const isMobile = useIsMobile();
  const [index, setIndex] = useState(0);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    supabase.from('takeaways').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setEntries(data);
    });
  }, []);

  if (isMobile) return <ScaleWrap><MobileBrain entries={entries} /></ScaleWrap>;

  if (!entries.length) return <ScaleWrap variant="fixed"><NavHeader active="brain" /></ScaleWrap>;

  const currentEntry = entries[index];
  const nextArticle = () => setIndex(i => (i + 1) % entries.length);
  const prevArticle = () => setIndex(i => (i + entries.length - 1) % entries.length);

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="brain" />
      <svg width="1440" height="1024" viewBox="0 0 1440 1024" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        <path d="M88.7552 -13H160.035L169.035 -0.0400038V17.42L148.335 39.2H153.555L170.835 64.58V103.64L155.535 113H88.7552V-13Z M105.675 2.3V39.2H126.915L152.115 12.92V2.3H105.675Z M105.675 54.68V97.52H153.915V66.74L145.275 54.68H105.675Z" className="glyph-hover" />
        <path d="M87.3152 217H149.775L169.755 246.16V265.06L152.295 282.88L169.755 308.26V343H152.655V310.6L135.195 284.86H116.835L104.235 277.12V343H87.3152V217Z M104.235 232.48V269.38H144.195L152.655 260.92V248.86L141.315 232.48H104.235Z" className="glyph-hover" />
        <path d="M118.815 447H168.135V573H151.215V516.66H105.675V573H88.9352V477.78L118.815 447Z M105.675 482.1V501.18H151.215V462.48H124.935L105.675 482.1Z" className="glyph-hover" />
        <path d="M87.4952 677H169.575V692.48H136.995V787.52H169.575V803H87.4952V787.52H120.075V692.48H87.4952V677Z" className="glyph-hover" />
        <path d="M152.655 907H169.755V1033H152.655V987.82L109.635 923.56H104.415V1033H87.4952V907H117.735L152.655 959.74V907Z" className="glyph-hover" />
      </svg>
      <div style={{ position: "absolute", left: 272, top: 247, fontSize: 15, color: MUTED }}>A compilation of what I've learned throughout the years.</div>
      <div style={{ position: "absolute", left: 270, top: 283, width: 899, height: 459, border: "1px solid #000000", borderRadius: 15 }}>
        <div onClick={prevArticle} style={{ position: "absolute", left: 56, top: 222, cursor: "pointer", fontSize: 24, userSelect: "none" }}>&#10094;</div>
        <div onClick={nextArticle} style={{ position: "absolute", right: 64, top: 222, cursor: "pointer", fontSize: 24, userSelect: "none" }}>&#10095;</div>
        <Link to={currentEntry.url} style={{ position: "absolute", inset: 0, left: 120, right: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", textDecoration: "none", color: "#000000" }}>
          <div style={{ fontSize: 15, color: MUTED }}>{currentEntry.number}</div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>{currentEntry.title}</div>
          {currentEntry.subtitle && <div style={{ fontSize: 12, color: MUTED, maxWidth: 640 }}>{currentEntry.subtitle}</div>}
        </Link>
      </div>
      <div style={{ position: "absolute", top: 770, left: 0, width: "100%", display: "flex", justifyContent: "center", gap: 29 }}>
        {entries.map((_, i) => (
          <div key={i} onClick={() => setIndex(i)} style={{ width: 40, height: 4, background: i === index ? ACCENT : "#BFBFBF", cursor: "pointer" }} />
        ))}
      </div>
    </ScaleWrap>
  );
}
