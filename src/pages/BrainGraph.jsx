import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

const CATEGORIES = {
  notes:   { label: "Notes",   color: "#D96614" },
  source:  { label: "Me",      color: "#000000" },
  anime:   { label: "Anime",   color: "#E85D75" },
  books:   { label: "Books",   color: "#4A90D9" },
  music:   { label: "Music",   color: "#9B59B6" },
  hobbies: { label: "Hobbies", color: "#27AE8F" },
};

function nodeColor(node) {
  return CATEGORIES[node.category]?.color || "#999";
}

function nodeLabel(node) {
  if (node.category === 'source') return 'Me';
  return node.abbreviation || node.label?.slice(0, 4) || '?';
}

function useForceGraph(nodes, links, width, height) {
  const [positions, setPositions] = useState({});
  const frameRef = useRef(null);
  const posRef = useRef({});
  const alphaRef = useRef(1);
  const lastRender = useRef(0);

  useEffect(() => {
    if (!nodes.length || !width || !height) return;
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }

    const cx = width / 2, cy = height / 2;
    const rx = width * 0.36, ry = height * 0.36;
    const pos = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      pos[n.id] = {
        x: cx + rx * Math.cos(angle) * (0.4 + Math.random() * 0.5),
        y: cy + ry * Math.sin(angle) * (0.4 + Math.random() * 0.5),
        vx: 0, vy: 0, pinned: false,
      };
    });
    posRef.current = pos;
    alphaRef.current = 1;

    const tick = () => {
      if (alphaRef.current < 0.002) {
        setPositions({ ...posRef.current });
        frameRef.current = null;
        return;
      }
      alphaRef.current *= 0.97;
      const alpha = alphaRef.current;
      const p = posRef.current;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const pa = p[nodes[i].id], pb = p[nodes[j].id];
          if (!pa || !pb) continue;
          const dx = pa.x - pb.x, dy = pa.y - pb.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (3200 / (d * d)) * alpha;
          pa.vx += (dx / d) * f; pa.vy += (dy / d) * f;
          pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f;
        }
      }

      links.forEach(l => {
        const pa = p[l.source], pb = p[l.target];
        if (!pa || !pb) return;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 115) * 0.033 * alpha;
        pa.vx += (dx / d) * f; pa.vy += (dy / d) * f;
        pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f;
      });

      const centroids = {};
      nodes.forEach(n => {
        const pp = p[n.id];
        if (!pp) return;
        if (!centroids[n.group_id]) centroids[n.group_id] = { x: 0, y: 0, count: 0 };
        centroids[n.group_id].x += pp.x;
        centroids[n.group_id].y += pp.y;
        centroids[n.group_id].count++;
      });
      Object.values(centroids).forEach(c => { c.x /= c.count; c.y /= c.count; });
      nodes.forEach(n => {
        const pp = p[n.id], c = centroids[n.group_id];
        if (!pp || !c) return;
        pp.vx += (c.x - pp.x) * 0.022 * alpha;
        pp.vy += (c.y - pp.y) * 0.022 * alpha;
      });

      nodes.forEach(n => {
        const pp = p[n.id];
        if (!pp || pp.pinned) return;
        const dx = pp.x - cx, dy = pp.y - cy;
        const dist = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
        if (dist > 1) {
          pp.vx -= dx * (dist - 1) * 0.28 * alpha;
          pp.vy -= dy * (dist - 1) * 0.28 * alpha;
        }
      });

      nodes.forEach(n => {
        const pp = p[n.id];
        if (!pp || pp.pinned) return;
        pp.vx *= 0.65; pp.vy *= 0.65;
        pp.x = Math.max(30, Math.min(width - 30, pp.x + pp.vx));
        pp.y = Math.max(30, Math.min(height - 30, pp.y + pp.vy));
      });

      if (Date.now() - lastRender.current > 32) {
        lastRender.current = Date.now();
        setPositions({ ...posRef.current });
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; } };
  }, [nodes, links, width, height]);

  const reheat = useCallback(() => { alphaRef.current = 0.5; }, []);
  return { positions, posRef, reheat };
}

function NodePanel({ node, onClose }) {
  const [subtopics, setSubtopics] = useState([]);
  const color = nodeColor(node);
  const cat = node.category || 'notes';

  useEffect(() => {
    if (cat !== 'notes') return;
    let cancelled = false;
    supabase.from('subtopics').select('id, title').eq('node_id', node.id).order('sort_order')
      .then(({ data }) => { if (!cancelled) setSubtopics(data || []); });
    return () => { cancelled = true; };
  }, [node.id, cat]);

  if (!node) return null;

  const visibleSubtopics = cat === 'notes' ? subtopics : [];
  const meta = node.meta || {};

  const panelStyle = {
    position: "absolute", right: 200, top: 195, width: 280,
    background: "#fff", border: "1px solid #000",
    zIndex: 30, display: "flex", flexDirection: "column",
    maxHeight: 680, overflow: "hidden",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
  };

  const header = (
    <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #E0E0E0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
      <div style={{ flex: 1, paddingRight: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, marginBottom: 3 }}>{node.label}</div>
        <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: 1 }}>{CATEGORIES[cat]?.label || cat}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "1px solid #E0E0E0", width: 22, height: 22, cursor: "pointer", fontSize: 11, flexShrink: 0, lineHeight: 1 }}>✕</button>
    </div>
  );

  if (cat === 'source') return (
    <div style={panelStyle}>
      {header}
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        <Link to="/about" style={{ display: "block", fontSize: 12, color: ACCENT, textDecoration: "none", marginBottom: 12 }}>View about me →</Link>
      </div>
    </div>
  );

  if (cat === 'notes') return (
    <div style={panelStyle}>
      {header}
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        {visibleSubtopics.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Subtopics</div>
            {visibleSubtopics.map(s => (
              <Link key={s.id} to={`/notes/${s.id}`} style={{ display: "block", padding: "4px 0", borderBottom: "1px solid #F5F5F5", fontSize: 12, color: "#000", textDecoration: "none" }}>{s.title}</Link>
            ))}
          </div>
        )}
        <Link to={`/topic/${node.id}`} style={{ display: "block", fontSize: 12, color: ACCENT, textDecoration: "none", marginBottom: 12 }}>View all subtopics →</Link>
      </div>
    </div>
  );

  if (cat === 'anime') return (
    <div style={panelStyle}>
      {header}
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.image_url && <img src={node.image_url} alt={node.label} style={{ width: "100%", borderRadius: 6, marginBottom: 12, objectFit: "cover", maxHeight: 180 }} />}
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        {meta.genre && <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Genre: {meta.genre}</div>}
        {meta.episodes && <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Episodes: {meta.episodes}</div>}
        {meta.status && <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Status: {meta.status}</div>}
      </div>
    </div>
  );

  if (cat === 'books') return (
    <div style={panelStyle}>
      {header}
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.image_url && <img src={node.image_url} alt={node.label} style={{ width: 100, borderRadius: 4, marginBottom: 12, objectFit: "cover", float: "right", marginLeft: 12 }} />}
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        {meta.author && <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Author: {meta.author}</div>}
        {meta.genre && <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Genre: {meta.genre}</div>}
        {meta.status && <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Status: {meta.status}</div>}
        <div style={{ clear: "both" }} />
      </div>
    </div>
  );

  if (cat === 'music') return (
    <div style={panelStyle}>
      {header}
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.image_url && <img src={node.image_url} alt={node.label} style={{ width: "100%", borderRadius: 6, marginBottom: 12, objectFit: "cover", maxHeight: 160 }} />}
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        {meta.artist && <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Artist: {meta.artist}</div>}
        {meta.type && <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Type: {meta.type}</div>}
        {meta.spotify_url && (
          <a href={meta.spotify_url} target="_blank" rel="noopener"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1DB954", textDecoration: "none", marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            Listen on Spotify
          </a>
        )}
      </div>
    </div>
  );

  if (cat === 'hobbies') return (
    <div style={panelStyle}>
      {header}
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.image_url && <img src={node.image_url} alt={node.label} style={{ width: "100%", borderRadius: 6, marginBottom: 12, objectFit: "cover", maxHeight: 160 }} />}
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        {meta.link && (
          <a href={meta.link} target="_blank" rel="noopener"
            style={{ display: "block", fontSize: 12, color: ACCENT, textDecoration: "none", marginBottom: 12 }}>
            {meta.link_label || "Learn more"} →
          </a>
        )}
      </div>
    </div>
  );

  return null;
}

function GraphCanvas({ nodes, links, selectedNode, onSelectNode, containerStyle, canvasScale }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [cursorStyle, setCursorStyle] = useState("default");

  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const draggingNode = useRef(null);
  const transformRef = useRef(transform);

  useEffect(() => { transformRef.current = transform; }, [transform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { positions, posRef, reheat } = useForceGraph(nodes, links, size.w, size.h);

  const svgPoint = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const t = transformRef.current;
    const cs = canvasScale || 1;
    return {
      x: ((e.clientX - rect.left) / cs - t.x) / t.scale,
      y: ((e.clientY - rect.top) / cs - t.y) / t.scale,
    };
  }, [canvasScale]);

  const onMouseDown = useCallback((e) => {
    const pt = svgPoint(e);
    let hit = null;
    for (const n of nodes) {
      const p = posRef.current[n.id];
      if (!p) continue;
      const dx = pt.x - p.x, dy = pt.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < 16) { hit = n.id; break; }
    }
    if (hit) {
      draggingNode.current = hit;
      if (posRef.current[hit]) posRef.current[hit].pinned = true;
      setCursorStyle("grabbing");
    } else {
      isPanning.current = true;
      lastPan.current = { x: e.clientX, y: e.clientY };
      setCursorStyle("grabbing");
    }
  }, [nodes, svgPoint, posRef]);

  const onMouseMove = useCallback((e) => {
    if (draggingNode.current) {
      const pt = svgPoint(e);
      const p = posRef.current[draggingNode.current];
      if (p) { p.x = pt.x; p.y = pt.y; p.vx = 0; p.vy = 0; }
      reheat();
      return;
    }
    if (isPanning.current) {
      const cs = canvasScale || 1;
      const dx = (e.clientX - lastPan.current.x) / cs;
      const dy = (e.clientY - lastPan.current.y) / cs;
      lastPan.current = { x: e.clientX, y: e.clientY };
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
    }
  }, [svgPoint, posRef, reheat, canvasScale]);

  const onMouseUp = useCallback(() => {
    if (draggingNode.current) {
      const p = posRef.current[draggingNode.current];
      if (p) p.pinned = false;
      draggingNode.current = null;
      reheat();
    }
    isPanning.current = false;
    setCursorStyle("default");
  }, [posRef, reheat]);

  const onClick = useCallback((e) => {
    const pt = svgPoint(e);
    for (const n of nodes) {
      const p = posRef.current[n.id];
      if (!p) continue;
      const dx = pt.x - p.x, dy = pt.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < 16) { onSelectNode(n); return; }
    }
    onSelectNode(null);
  }, [nodes, svgPoint, posRef, onSelectNode]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const cs = canvasScale || 1;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => {
      const newScale = Math.min(Math.max(t.scale * delta, 0.2), 5);
      const rect = containerRef.current.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / cs;
      const my = (e.clientY - rect.top) / cs;
      return { scale: newScale, x: mx - (mx - t.x) * (newScale / t.scale), y: my - (my - t.y) * (newScale / t.scale) };
    });
  }, [canvasScale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const getHighlighted = (nodeId) => {
    if (!nodeId) return { nodes: new Set(), links: new Set() };
    const hn = new Set([nodeId]);
    const hl = new Set();
    links.forEach(l => {
      if (l.source === nodeId) { hn.add(l.target); hl.add(l.id); }
      if (l.target === nodeId) { hn.add(l.source); hl.add(l.id); }
    });
    return { nodes: hn, links: hl };
  };

  const activeId = hovered || selectedNode?.id;
  const { nodes: hlNodes, links: hlLinks } = getHighlighted(activeId);
  const hasHL = !!activeId;
  const pos = Object.keys(positions).length ? positions : posRef.current;

  return (
    <div
      ref={containerRef}
      style={{ ...containerStyle, position: "absolute", cursor: cursorStyle }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClick}
    >
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={e => { e.stopPropagation(); setTransform(t => ({ ...t, scale: Math.min(t.scale * 1.25, 5) })); }}
          style={{ width: 26, height: 26, border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "monospace" }}>+</button>
        <button onClick={e => { e.stopPropagation(); setTransform(t => ({ ...t, scale: Math.max(t.scale * 0.8, 0.2) })); }}
          style={{ width: 26, height: 26, border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "monospace" }}>−</button>
        <button onClick={e => { e.stopPropagation(); setTransform({ x: 0, y: 0, scale: 1 }); }}
          style={{ height: 26, padding: "0 10px", border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "Kode Mono, monospace" }}>reset</button>
        <button onClick={e => { e.stopPropagation(); setShowLabels(v => !v); }}
          style={{ height: 26, padding: "0 10px", border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "Kode Mono, monospace", color: showLabels ? ACCENT : "#888" }}>
          {showLabels ? "labels on" : "labels off"}
        </button>
      </div>



      <svg width={size.w} height={size.h} style={{ display: "block", userSelect: "none" }}>
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {links.map(l => {
            const pa = pos[l.source], pb = pos[l.target];
            if (!pa || !pb) return null;
            const isHL = hlLinks.has(l.id);
            return (
              <line key={l.id} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={isHL ? ACCENT : (hasHL ? "#f0f0f0" : "#ddd")}
                strokeWidth={isHL ? 2 : 1}
                style={{ transition: "stroke .2s" }} />
            );
          })}
          {nodes.map(n => {
            const p = pos[n.id];
            if (!p) return null;
            const isHL = !hasHL || hlNodes.has(n.id);
            const isSel = selectedNode?.id === n.id;
            const isHov = hovered === n.id;
            const color = nodeColor(n);
            const abbr = nodeLabel(n);
            const r = isSel ? 10 : isHov ? 9 : 7;
            return (
              <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "grab" }}>
                {isSel && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.25} />}
                <circle cx={p.x} cy={p.y} r={r} fill={isHL ? color : "#e8e8e8"} style={{ transition: "fill .2s" }} />
                {(showLabels || isSel || isHov) && (
                  <text x={p.x} y={p.y + r + 13} textAnchor="middle" fontSize={11}
                    fill={isHL ? "#000" : "#ccc"} fontFamily="Kode Mono, monospace"
                    style={{ pointerEvents: "none", userSelect: "none" }}>
                    {abbr}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function MobileBrain({ nodes }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader active="brain" />
      <div style={{ padding: "32px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, marginBottom: 8 }}>brain</h1>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>A compilation of what I've learned throughout the years.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {nodes.map(n => {
            const color = nodeColor(n);
            const isSel = selected?.id === n.id;
            return (
              <div key={n.id} onClick={() => setSelected(isSel ? null : n)}
                style={{ padding: "14px 16px", border: `1px solid ${isSel ? color : "#E0E0E0"}`, borderRadius: 8, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{n.label}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                </div>
                {isSel && n.description && <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginTop: 10 }}>{n.description}</div>}
                {isSel && n.url && n.url !== '#' && <Link to={n.url} style={{ display: "block", fontSize: 13, color: ACCENT, textDecoration: "none", marginTop: 8 }}>View notes →</Link>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Brain() {
  const isMobile = useIsMobile();
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [ready, setReady] = useState(false);
  const loadedRef = useRef({ nodes: false, links: false });

  useEffect(() => {
    supabase.from('brain_nodes').select('*').order('sort_order').then(({ data }) => {
      setNodes(data || []);
      loadedRef.current.nodes = true;
      if (loadedRef.current.links) setReady(true);
    });
    supabase.from('brain_links').select('*').then(({ data }) => {
      setLinks((data || []).map(l => ({ id: l.id, source: l.source_id, target: l.target_id })));
      loadedRef.current.links = true;
      if (loadedRef.current.nodes) setReady(true);
    });
  }, []);

  useEffect(() => {
    const update = () => setCanvasScale(Math.min(window.innerWidth / 1440, window.innerHeight / 1024));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!ready) return null;
  if (isMobile) return <ScaleWrap><MobileBrain nodes={nodes} /></ScaleWrap>;

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="brain" />

      <GraphCanvas
        nodes={nodes}
        links={links}
        selectedNode={selected}
        onSelectNode={n => setSelected(prev => n && prev?.id !== n.id ? n : null)}
        canvasScale={canvasScale}
        containerStyle={{
          left: 190,
          top: 130,
          right: 190,
          bottom: 60,
        }}
      />

      {selected && (
        <NodePanel
          node={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </ScaleWrap>
  );
}