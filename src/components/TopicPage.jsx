import { useState, useEffect } from "react";
import ScaleWrap from "./ScaleWrap.jsx";
import NavHeader from "./NavHeader.jsx";
import Markdown from "./Markdown.jsx";
import { supabase } from "../lib/supabase.js";

const MUTED = "#B4B4B4";
const ACCENT = "#D96614";

export default function TopicPage({ title = "Topic", topic = "" }) {
  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState({});

  useEffect(() => {
    if (!topic) return;
    supabase
      .from('topic_sections')
      .select('*')
      .eq('topic', topic)
      .order('sort_order')
      .then(({ data }) => {
        if (data?.length) {
          setSections(data);
          // Default all sections open
          const openState = {};
          data.forEach((_, i) => { openState[i] = true; });
          setOpen(openState);
        }
      });
  }, [topic]);

  const toggle = (i) => setOpen((s) => ({ ...s, [i]: !s[i] }));

  // Find link (stored on whichever section has it)
  const linkSection = sections.find(s => s.link_text);

  return (
    <ScaleWrap variant="fluid">
      <NavHeader active="brain" />

      <div style={{ position: "absolute", top: 160, left: 0, width: "100%", textAlign: "center", fontSize: 32, fontWeight: 600 }}>
        {title}
      </div>

      <div style={{ position: "absolute", top: 290, left: 136, width: 1172, display: "flex", flexDirection: "column", gap: 44 }}>
        {sections.map((section, i) => {
          const isOpen = open[i] !== false;
          return (
            <div key={section.id}>
              <div onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", userSelect: "none" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 4, transform: `rotate(${isOpen ? 90 : 0}deg)`, transition: "transform .25s ease" }}>
                  <path d="M14 7L0 14V0L14 7Z" fill={ACCENT} />
                </svg>
                <div style={{ fontSize: 20 }}>{section.heading}</div>
              </div>
              <div style={{ maxHeight: isOpen ? "1000px" : "0px", opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(0.4,0,0.2,1), opacity .3s ease" }}>
                <div style={{ marginTop: 14, marginLeft: 28, maxWidth: 1050 }}>
                  <Markdown text={section.body} />
                </div>
              </div>
            </div>
          );
        })}

        {linkSection && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
              <path d="M7 0 L13.06 10.5 L0.94 10.5 Z" fill={ACCENT} />
            </svg>
            <a href={linkSection.link_url} target="_blank" rel="noopener" style={{ fontSize: 20, textDecoration: "none" }}>
              {linkSection.link_text}
            </a>
          </div>
        )}
      </div>
    </ScaleWrap>
  );
}
