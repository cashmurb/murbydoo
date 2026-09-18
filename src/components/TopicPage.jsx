import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavHeader from "./NavHeader.jsx";
import ScaleWrap from "./ScaleWrap.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

export default function TopicPage({ nodeId }) {
  const isMobile = useIsMobile();
  const [node, setNode] = useState(null);
  const [subtopics, setSubtopics] = useState([]);

  useEffect(() => {
    if (!nodeId) return;
    supabase.from('brain_nodes').select('*').eq('id', nodeId).single()
      .then(({ data }) => setNode(data));
    supabase.from('subtopics').select('*').eq('node_id', nodeId).order('sort_order')
      .then(({ data }) => setSubtopics(data || []));
  }, [nodeId]);

  if (!node) return null;

  return (
  <ScaleWrap variant="fluid">
    <NavHeader active="brain" />
    <div style={{ maxWidth: isMobile ? "100%" : 860, margin: "0 auto", padding: isMobile ? "120px 24px 80px" : "140px 24px 120px" }}>

        <Link to="/brain" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED, textDecoration: "none", marginBottom: 40 }}>
          <svg width="14" height="10" viewBox="0 0 14 10">
            <path d="M5 0L0 5L5 10" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <line x1="0" y1="5" x2="14" y2="5" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          back to brain
        </Link>

        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
          <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 600, lineHeight: 1.2, margin: 0 }}>{node.label}</h1>
          {node.abbreviation && (
            <span style={{ fontSize: 16, color: MUTED, fontWeight: 400 }}>{node.abbreviation}</span>
          )}
        </div>

        {node.description && (
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 48, maxWidth: 640 }}>{node.description}</p>
        )}

        {subtopics.length === 0 ? (
          <div style={{ fontSize: 14, color: MUTED, padding: "40px 0" }}>No subtopics yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {subtopics.map((s, i) => (
              <Link key={s.id} to={`/notes/${s.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  border: "1px solid #E0E0E0", borderRadius: 12, padding: "20px 24px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "border-color .15s, box-shadow .15s", cursor: "pointer",
                  background: "#fff",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 2px 12px rgba(217,102,20,0.1)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0E0E0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>{String(i + 1).padStart(2, '0')}</div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: "#000" }}>{s.title}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                    <path d="M4 8H12M9 5L12 8L9 11" stroke={ACCENT} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ScaleWrap>
  );
}
