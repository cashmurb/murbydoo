import { useState, useEffect } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

function MobileDump({ articles }) {
  const [index, setIndex] = useState(0);
  const current = articles[index];
  const total = articles.length;
  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader active="dump" />
      <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, margin: 0 }}>dump</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Essays, observations, and loose thoughts on Substack.</p>
        {current && (
          <a href={current.url} target="_blank" rel="noopener"
            style={{ border: "1px solid #000", borderRadius: 12, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 12, textDecoration: "none", color: "#000", minHeight: 200, justifyContent: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3 }}>{current.title}</div>
            {current.subtitle && <div style={{ fontSize: 13, color: MUTED }}>{current.subtitle}</div>}
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginTop: 4 }}>
              <path d="M22 5.892H2V8.3h20V5.892zM2 10.708V24l10-4.917L22 24V10.708H2zM22 0H2v2.408h20V0z" fill={ACCENT} />
            </svg>
          </a>
        )}
        {total > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button onClick={() => setIndex(i => (i + total - 1) % total)} style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>‹</button>
            <span style={{ fontSize: 13, color: MUTED }}>{index + 1} / {total}</span>
            <button onClick={() => setIndex(i => (i + 1) % total)} style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dump() {
  const isMobile = useIsMobile();
  const [index, setIndex] = useState(0);
  const [articles, setArticles] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.from('articles').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setArticles(data);
      setReady(true);
    });
  }, []);

  if (!ready) return null;
  if (isMobile) return <ScaleWrap><MobileDump articles={articles} /></ScaleWrap>;

  if (!articles.length) return <ScaleWrap variant="fixed"><NavHeader active="dump" /></ScaleWrap>;

  const currentArticle = articles[index];
  const nextArticle = () => setIndex(i => (i + 1) % articles.length);
  const prevArticle = () => setIndex(i => (i + articles.length - 1) % articles.length);

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="dump" />
      <svg width="1440" height="1024" viewBox="0 0 1440 1024" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        <path d="M89.2952 102H146.715L171.555 139.08V212.34L156.435 228H89.2952V102Z M106.215 117.48V212.7H149.415L154.455 207.48V141.6L138.255 117.48H106.215Z" className="glyph-hover" />
        <path d="M152.655 332H169.755V458H152.655V450.08L139.875 458H102.615L87.3152 435.5V332H104.235V432.98L110.715 442.52H147.615L152.655 437.48V332Z" className="glyph-hover" />
        <path d="M87.4952 562H104.415V565.96L123.315 594.04L152.655 562H169.755V688H152.655V584.32L136.095 602.5V617.08H120.435V616L104.415 592.24V688H87.4952V562Z" className="glyph-hover" />
        <path d="M87.4952 792H154.635L169.575 814.5V844.56L154.455 859.86H104.415V918H87.4952V792Z M104.415 807.48V852.3L117.555 844.56H147.795L152.655 839.7V817.2L146.355 807.48H104.415Z" className="glyph-hover" />
      </svg>
      <div style={{ position: "absolute", left: 272, top: 247, fontSize: 15, color: MUTED }}>
        A collection of essays, observations, and loose thoughts published on Substack.
      </div>
      <div style={{ position: "absolute", left: 270, top: 283, width: 899, height: 459, border: "1px solid #000000", borderRadius: 15 }}>
        <div onClick={prevArticle} style={{ position: "absolute", left: 56, top: 222, cursor: "pointer", fontSize: 24, userSelect: "none" }}>&#10094;</div>
        <div onClick={nextArticle} style={{ position: "absolute", right: 64, top: 222, cursor: "pointer", fontSize: 24, userSelect: "none" }}>&#10095;</div>
        <a href={currentArticle.url} target="_blank" rel="noopener" style={{ position: "absolute", inset: 0, left: 120, right: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", textDecoration: "none", color: "#000000" }}>
          <div style={{ fontSize: 32, fontWeight: 600 }}>{currentArticle.title}</div>
          {currentArticle.subtitle && <div style={{ fontSize: 12, color: MUTED, maxWidth: 600 }}>{currentArticle.subtitle}</div>}
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginTop: 2 }}>
            <path d="M22 5.892H2V8.3h20V5.892zM2 10.708V24l10-4.917L22 24V10.708H2zM22 0H2v2.408h20V0z" fill={ACCENT} />
          </svg>
        </a>
      </div>
      <div style={{ position: "absolute", top: 770, left: 0, width: "100%", display: "flex", justifyContent: "center", gap: 29 }}>
        {articles.map((_, i) => (
          <div key={i} onClick={() => setIndex(i)} style={{ width: 72, height: 4, background: i === index ? ACCENT : "#BFBFBF", cursor: "pointer" }} />
        ))}
      </div>
    </ScaleWrap>
  );
}
