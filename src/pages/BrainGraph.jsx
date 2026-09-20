import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
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

const CATEGORY_ORDER = ["notes", "books", "anime", "music", "hobbies"];
const FILTER_CATEGORIES = ["notes", "music"];

function nodeColor(node) {
  return CATEGORIES[node.category]?.color || "#999";
}

function nodeLabel(node) {
  if (node.category === 'source') return 'Me';
  return node.abbreviation || node.label?.slice(0, 4) || '?';
}

const GRAPH_CSS = `
.bn-node text { display: none; }
[data-labels="1"] .bn-node text,
.bn-node[data-hl="1"] text,
.bn-node[data-sel="1"] text { display: block; }

.bn-node .bn-dot { r: 7; }
.bn-node:hover .bn-dot { r: 9; }
.bn-node[data-sel="1"] .bn-dot { r: 10; }

[data-hl-active="1"] .bn-node { opacity: 0.22; }
[data-hl-active="1"] .bn-node[data-hl="1"] { opacity: 1; }
[data-hl-active="1"] .bn-node text { fill: #ccc; }
[data-hl-active="1"] .bn-node[data-hl="1"] text { fill: #000; }

.bn-link { stroke: #ddd; stroke-width: 1; }
[data-hl-active="1"] .bn-link { stroke: #f0f0f0; }
[data-hl-active="1"] .bn-link[data-hl="1"] { stroke: ${ACCENT}; stroke-width: 2; }
`;

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
  const gRef = useRef(null);
  const nodeGroupsRef = useRef({});
  const linkElsRef = useRef({});
  const posRef = useRef({});
  const alphaRef = useRef(1);
  const frameRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const draggingNode = useRef(null);
  const downPos = useRef(null);
  const wasDrag = useRef(false);
  const hoveredRef = useRef(null);

  const nodesRef = useRef(nodes);
  const linksRef = useRef(links);
  const sizeRef = useRef({ w: 0, h: 0 });
  const canvasScaleRef = useRef(canvasScale);
  const selectedIdRef = useRef(selectedNode?.id);

  nodesRef.current = nodes;
  linksRef.current = links;
  canvasScaleRef.current = canvasScale;
  selectedIdRef.current = selectedNode?.id;

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize(prev => {
        if (Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2) return prev;
        return { w, h };
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  sizeRef.current = size;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nmap = {};
    container.querySelectorAll('[data-node-id]').forEach(el => {
      nmap[el.getAttribute('data-node-id')] = el;
    });
    nodeGroupsRef.current = nmap;
    const lmap = {};
    container.querySelectorAll('[data-link-id]').forEach(el => {
      lmap[el.getAttribute('data-link-id')] = el;
    });
    linkElsRef.current = lmap;
  }, [nodes, links]);

  useLayoutEffect(() => {
    if (gRef.current) {
      const t = transformRef.current;
      gRef.current.setAttribute('transform', `translate(${t.x},${t.y}) scale(${t.scale})`);
    }
    if (containerRef.current) {
      containerRef.current.style.cursor = "default";
    }
  }, []);

  const applyHighlight = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const active = hoveredRef.current || selectedIdRef.current;
    const nList = nodesRef.current;
    const lList = linksRef.current;

    if (!active) {
      container.removeAttribute('data-hl-active');
      for (const n of nList) {
        const el = nodeGroupsRef.current[n.id];
        if (el) el.removeAttribute('data-hl');
      }
      for (const l of lList) {
        const el = linkElsRef.current[l.id];
        if (el) el.removeAttribute('data-hl');
      }
      return;
    }

    container.setAttribute('data-hl-active', '1');
    const hlNodes = new Set([active]);
    const hlLinks = new Set();
    for (const l of lList) {
      if (l.source === active) { hlNodes.add(l.target); hlLinks.add(l.id); }
      else if (l.target === active) { hlNodes.add(l.source); hlLinks.add(l.id); }
    }
    for (const n of nList) {
      const el = nodeGroupsRef.current[n.id];
      if (!el) continue;
      if (hlNodes.has(n.id)) el.setAttribute('data-hl', '1');
      else el.removeAttribute('data-hl');
    }
    for (const l of lList) {
      const el = linkElsRef.current[l.id];
      if (!el) continue;
      if (hlLinks.has(l.id)) el.setAttribute('data-hl', '1');
      else el.removeAttribute('data-hl');
    }
  }, []);

  useEffect(() => {
    applyHighlight();
  }, [selectedNode, nodes, links, applyHighlight]);

  const stepSim = useCallback(function step() {
    const nList = nodesRef.current;
    const lList = linksRef.current;
    const { w: width, h: height } = sizeRef.current;
    if (!nList.length || !width || !height) {
      frameRef.current = null;
      return;
    }

    alphaRef.current *= 0.985;
    const alpha = alphaRef.current;
    const p = posRef.current;
    const cx = width / 2, cy = height / 2;
    const rx = width * 0.46, ry = height * 0.46;

    for (let i = 0; i < nList.length; i++) {
      const pa = p[nList[i].id];
      if (!pa) continue;
      for (let j = i + 1; j < nList.length; j++) {
        const pb = p[nList[j].id];
        if (!pb) continue;
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        const d2 = dx * dx + dy * dy || 1;
        const d = Math.sqrt(d2);
        const f = (70000 / d2) * alpha;
        pa.vx += (dx / d) * f; pa.vy += (dy / d) * f;
        pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f;
      }
    }

    const catOf = {};
    for (const n of nList) catOf[n.id] = n.category;

    for (const l of lList) {
      const pa = p[l.source], pb = p[l.target];
      if (!pa || !pb) continue;
      const sameCat = catOf[l.source] && catOf[l.source] === catOf[l.target];
      const strength = sameCat ? 0 : 0.012;
      const rest = sameCat ? 100 : 130;
      const dx = pb.x - pa.x, dy = pb.y - pa.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - rest) * strength * alpha;
      pa.vx += (dx / d) * f; pa.vy += (dy / d) * f;
      pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f;
    }

    for (const n of nList) {
      const pp = p[n.id];
      if (!pp || pp.pinned) continue;
      const dx = pp.x - cx, dy = pp.y - cy;
      const dist = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
      if (dist > 1) {
        pp.vx -= dx * (dist - 1) * 0.20 * alpha;
        pp.vy -= dy * (dist - 1) * 0.20 * alpha;
      }
    }

    for (const n of nList) {
      const pp = p[n.id];
      if (!pp || pp.pinned) continue;
      pp.vx *= 0.65; pp.vy *= 0.65;
      pp.x = Math.max(30, Math.min(width - 30, pp.x + pp.vx));
      pp.y = Math.max(30, Math.min(height - 30, pp.y + pp.vy));
    }

    for (const n of nList) {
      const pp = p[n.id];
      if (!pp) continue;
      const g = nodeGroupsRef.current[n.id];
      if (g) g.setAttribute('transform', `translate(${pp.x},${pp.y})`);
    }
    for (const l of lList) {
      const pa = p[l.source], pb = p[l.target];
      if (!pa || !pb) continue;
      const el = linkElsRef.current[l.id];
      if (el) {
        el.setAttribute('x1', pa.x);
        el.setAttribute('y1', pa.y);
        el.setAttribute('x2', pb.x);
        el.setAttribute('y2', pb.y);
      }
    }

    if (alphaRef.current < 0.002) {
      frameRef.current = null;
      return;
    }
    frameRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (!nodes.length || !size.w || !size.h) return;
    const cx = size.w / 2, cy = size.h / 2;
    const rx = size.w * 0.46, ry = size.h * 0.46;
    const pos = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      pos[n.id] = {
        x: cx + rx * Math.cos(angle) * (0.55 + Math.random() * 0.5),
        y: cy + ry * Math.sin(angle) * (0.55 + Math.random() * 0.5),
        vx: 0, vy: 0, pinned: false,
      };
    });
    posRef.current = pos;
    alphaRef.current = 1;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(stepSim);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [nodes, size.w, size.h, stepSim]);

  const reheat = useCallback(() => {
    alphaRef.current = Math.max(alphaRef.current, 0.5);
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(stepSim);
    }
  }, [stepSim]);

  const handleHover = useCallback((id) => {
    if (hoveredRef.current === id) return;
    hoveredRef.current = id;
    applyHighlight();
  }, [applyHighlight]);

  const svgPoint = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const t = transformRef.current;
    const cs = canvasScaleRef.current || 1;
    return {
      x: ((e.clientX - rect.left) / cs - t.x) / t.scale,
      y: ((e.clientY - rect.top) / cs - t.y) / t.scale,
    };
  }, []);

  const onMouseDown = useCallback((e) => {
    const pt = svgPoint(e);
    let hit = null;
    for (const n of nodesRef.current) {
      const p = posRef.current[n.id];
      if (!p) continue;
      const dx = pt.x - p.x, dy = pt.y - p.y;
      if (dx * dx + dy * dy < 256) { hit = n.id; break; }
    }
    downPos.current = { x: e.clientX, y: e.clientY };
    wasDrag.current = false;
    if (hit) {
      draggingNode.current = hit;
      if (posRef.current[hit]) posRef.current[hit].pinned = true;
    } else {
      isPanning.current = true;
      lastPan.current = { x: e.clientX, y: e.clientY };
    }
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  }, [svgPoint]);

  const onMouseMove = useCallback((e) => {
    if (downPos.current) {
      const dx = e.clientX - downPos.current.x;
      const dy = e.clientY - downPos.current.y;
      if (dx * dx + dy * dy > 16) wasDrag.current = true;
    }
    if (draggingNode.current) {
      const pt = svgPoint(e);
      const p = posRef.current[draggingNode.current];
      if (p) { p.x = pt.x; p.y = pt.y; p.vx = 0; p.vy = 0; }
      reheat();
      return;
    }
    if (isPanning.current) {
      const cs = canvasScaleRef.current || 1;
      const dx = (e.clientX - lastPan.current.x) / cs;
      const dy = (e.clientY - lastPan.current.y) / cs;
      lastPan.current = { x: e.clientX, y: e.clientY };
      const t = transformRef.current;
      t.x += dx;
      t.y += dy;
      if (gRef.current) gRef.current.setAttribute('transform', `translate(${t.x},${t.y}) scale(${t.scale})`);
    }
  }, [svgPoint, reheat]);

  const onMouseUp = useCallback(() => {
    if (draggingNode.current) {
      const p = posRef.current[draggingNode.current];
      if (p) p.pinned = false;
      draggingNode.current = null;
      reheat();
    }
    isPanning.current = false;
    downPos.current = null;
    if (containerRef.current) containerRef.current.style.cursor = "default";
  }, [reheat]);

  const onClick = useCallback((e) => {
    if (wasDrag.current) { wasDrag.current = false; return; }
    const pt = svgPoint(e);
    for (const n of nodesRef.current) {
      const p = posRef.current[n.id];
      if (!p) continue;
      const dx = pt.x - p.x, dy = pt.y - p.y;
      if (dx * dx + dy * dy < 256) { onSelectNode(n); return; }
    }
    onSelectNode(null);
  }, [svgPoint, onSelectNode]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const cs = canvasScaleRef.current || 1;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const t = transformRef.current;
    const newScale = Math.min(Math.max(t.scale * delta, 0.2), 5);
    const rect = containerRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / cs;
    const my = (e.clientY - rect.top) / cs;
    t.x = mx - (mx - t.x) * (newScale / t.scale);
    t.y = my - (my - t.y) * (newScale / t.scale);
    t.scale = newScale;
    if (gRef.current) gRef.current.setAttribute('transform', `translate(${t.x},${t.y}) scale(${t.scale})`);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const zoomBy = useCallback((factor) => {
    const t = transformRef.current;
    t.scale = Math.min(Math.max(t.scale * factor, 0.2), 5);
    if (gRef.current) gRef.current.setAttribute('transform', `translate(${t.x},${t.y}) scale(${t.scale})`);
  }, []);

  const resetView = useCallback(() => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
    if (gRef.current) gRef.current.setAttribute('transform', `translate(0,0) scale(1)`);
  }, []);

  return (
    <div
      ref={containerRef}
      data-labels={showLabels ? "1" : "0"}
      style={{ ...containerStyle, position: "absolute" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClick}
    >
      <style>{GRAPH_CSS}</style>
      <div style={{ position: "absolute", top: 30, right: 8, zIndex: 10, display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={e => { e.stopPropagation(); zoomBy(1.25); }}
          style={{ width: 26, height: 26, border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "monospace" }}>+</button>
        <button onClick={e => { e.stopPropagation(); zoomBy(0.8); }}
          style={{ width: 26, height: 26, border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "monospace" }}>−</button>
        <button onClick={e => { e.stopPropagation(); resetView(); }}
          style={{ height: 26, padding: "0 10px", border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "Kode Mono, monospace" }}>reset</button>
        <button onClick={e => { e.stopPropagation(); setShowLabels(v => !v); }}
          style={{ height: 26, padding: "0 10px", border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "Kode Mono, monospace", color: showLabels ? ACCENT : "#888" }}>
          {showLabels ? "labels on" : "labels off"}
        </button>
      </div>

      <div style={{ position: "absolute", top: 64, right: 8, zIndex: 10, display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
        {["notes", "anime", "music", "hobbies", "books"].map(cat => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORIES[cat].color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Kode Mono, monospace" }}>
              {CATEGORIES[cat].label}
            </span>
          </div>
        ))}
      </div>

      <svg width={size.w} height={size.h} style={{ display: "block", userSelect: "none" }}>
        <g ref={gRef}>
          {links.map(l => (
            <line key={l.id} data-link-id={l.id} className="bn-link" />
          ))}
          {nodes.map(n => {
            const color = nodeColor(n);
            const abbr = nodeLabel(n);
            const isSel = selectedNode?.id === n.id;
            return (
              <g
                key={n.id}
                data-node-id={n.id}
                data-sel={isSel ? "1" : undefined}
                className="bn-node"
                style={{ cursor: "grab" }}
                onMouseEnter={() => handleHover(n.id)}
                onMouseLeave={() => handleHover(null)}
              >
                {isSel && <circle r={16} fill="none" stroke={color} strokeWidth={1.5} opacity={0.25} />}
                <circle className="bn-dot" r={7} fill={color} />
                <text y={20} textAnchor="middle" fontSize={11} fill="#000" fontFamily="Kode Mono, monospace" style={{ pointerEvents: "none", userSelect: "none" }}>
                  {abbr}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function MobileBrain({ nodes }) {
  const [filter, setFilter] = useState(null);

  const grouped = {};
  for (const n of nodes) {
    const cat = n.category || 'notes';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(n);
  }

  const counts = Object.fromEntries(
    Object.entries(grouped).map(([k, v]) => [k, v.length])
  );

  const visibleCategories = filter
    ? [filter]
    : CATEGORY_ORDER.filter(c => grouped[c]?.length > 0);

  const sourceNode = grouped.source?.[0];
  const totalNodes = nodes.length;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <NavHeader active="brain" />
      <div style={{ padding: "32px 24px 64px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, margin: 0, marginBottom: 24 }}>brain</h1>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          <button
            onClick={() => setFilter(null)}
            style={{
              padding: "6px 14px", borderRadius: 20, cursor: "pointer",
              border: "1px solid " + (filter === null ? "#000" : "#E0E0E0"),
              background: filter === null ? "#000" : "transparent",
              color: filter === null ? "#fff" : "#666",
              fontFamily: "Kode Mono, monospace", fontSize: 12,
            }}
          >
            All · {totalNodes}
          </button>
          {FILTER_CATEGORIES.filter(c => grouped[c]?.length > 0).map(cat => {
            const active = filter === cat;
            const color = CATEGORIES[cat]?.color || "#999";
            return (
              <button
                key={cat}
                onClick={() => setFilter(active ? null : cat)}
                style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                  border: "1px solid " + (active ? color : "#E0E0E0"),
                  background: active ? color : "transparent",
                  color: active ? "#fff" : "#666",
                  fontFamily: "Kode Mono, monospace", fontSize: 12,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#fff" : color, flexShrink: 0 }} />
                {CATEGORIES[cat]?.label} · {counts[cat]}
              </button>
            );
          })}
        </div>

        {visibleCategories.map(cat => {
          const color = CATEGORIES[cat]?.color || "#999";
          const items = grouped[cat] || [];
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Kode Mono, monospace" }}>
                  {CATEGORIES[cat]?.label || cat}
                </span>
                <span style={{ fontSize: 11, color: MUTED, fontFamily: "Kode Mono, monospace" }}>
                  {items.length}
                </span>
                <div style={{ flex: 1, height: 1, background: "#EEE" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(n => {
                  const meta = n.meta || {};
                  const metaParts = [];
                  if (meta.author) metaParts.push(meta.author);
                  if (meta.artist) metaParts.push(meta.artist);
                  if (meta.genre) metaParts.push(meta.genre);
                  if (meta.status) metaParts.push(String(meta.status).toUpperCase());
                  const metaLine = metaParts.slice(0, 2).join(" · ");

                  return (
                    <div
                      key={n.id}
                      style={{
                        border: "1px solid #E0E0E0",
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: metaLine || n.description ? 4 : 0 }}>
                        {n.label}
                      </div>
                      {metaLine && (
                        <div style={{ fontSize: 11, color: MUTED, fontFamily: "Kode Mono, monospace", marginBottom: n.description ? 8 : 0 }}>
                          {metaLine}
                        </div>
                      )}
                      {n.description && (
                        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: 0, marginTop: metaLine ? 0 : 4 }}>
                          {n.description}
                        </p>
                      )}
                      {n.category === 'notes' && n.url && n.url !== '#' && (
                        <Link
                          to={n.url}
                          style={{ display: "inline-block", fontSize: 13, color: ACCENT, textDecoration: "none", fontFamily: "Kode Mono, monospace", marginTop: 8 }}
                        >
                          View notes →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!filter && sourceNode && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#000", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Kode Mono, monospace" }}>
                About
              </span>
              <div style={{ flex: 1, height: 1, background: "#EEE" }} />
            </div>
            <div
              style={{
                border: "1px solid #E0E0E0",
                borderLeft: "3px solid #000",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 10 }}>
                {sourceNode.description || "Who I am, what I do, what I'm into."}
              </div>
              <Link
                to="/about"
                style={{ fontSize: 13, color: ACCENT, textDecoration: "none", fontFamily: "Kode Mono, monospace" }}
              >
                forgot about me already? →
              </Link>
            </div>
          </div>
        )}
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
          left: 20,
          top: 110,
          right: 20,
          bottom: 20,
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