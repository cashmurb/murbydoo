import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import Markdown from "../components/Markdown.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

export default function NotesPage() {
  const { subtopicId } = useParams();
  const isMobile = useIsMobile();
  const [subtopic, setSubtopic] = useState(null);
  const [node, setNode] = useState(null);
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subtopicId) return;
    supabase.from('subtopics').select('*, brain_nodes(*)').eq('id', subtopicId).single()
      .then(({ data }) => {
        if (data) {
          setSubtopic(data);
          setNode(data.brain_nodes);
        }
      });
    supabase.from('subtopic_notes').select('*').eq('subtopic_id', subtopicId).single()
      .then(({ data }) => {
        setNotes(data?.body ?? '');
        setLoading(false);
      });
  }, [subtopicId]);

  if (loading || !subtopic) return null;

  const hasNotes = notes && notes.trim() && notes.trim() !== 'Coming soon.';

  return (
  <ScaleWrap variant="fluid">
    <NavHeader active="brain" />
    <div style={{ maxWidth: isMobile ? "100%" : 720, margin: "0 auto", padding: isMobile ? "120px 24px 80px" : "140px 24px 120px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          {node && (
            <Link to={`/topic/${node.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED, textDecoration: "none" }}>
              <svg width="14" height="10" viewBox="0 0 14 10">
                <path d="M5 0L0 5L5 10" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <line x1="0" y1="5" x2="14" y2="5" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {node.abbreviation || node.label}
            </Link>
          )}
        </div>

        <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 600, lineHeight: 1.2, marginBottom: 48 }}>
          {subtopic.title}
        </h1>

        {hasNotes ? (
          <Markdown text={notes} style={{ fontSize: 16, lineHeight: 1.85, color: "#333" }} />
        ) : (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: MUTED, marginBottom: 8 }}>No notes yet.</div>
            <div style={{ fontSize: 13, color: "#ccc" }}>Add notes in the portal → Topics tab.</div>
          </div>
        )}
      </div>
    </ScaleWrap>
  );
}
