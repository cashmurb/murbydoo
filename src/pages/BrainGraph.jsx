/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

const GROUPS = {
  ml:    { label: "ML",    full: "Machine Learning",  color: "#D96614" },
  cs:    { label: "CS",    full: "Computer Science",  color: "#4A90D9" },
  math:  { label: "Math",  full: "Mathematics",       color: "#7B68EE" },
  neuro: { label: "Neuro", full: "Neurotech",         color: "#50C878" },
  other: { label: "Other", full: "Other",             color: "#999999" },
};

function useForceGraph(nodes, links, width, height) {
  const [positions, setPositions] = useState({});
  const frameRef = useRef(null);
  const posRef = useRef({});
  const alphaRef = useRef(1);
  const nodeIds = nodes.map(n => n.id).join(',');

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

      setPositions({ ...posRef.current });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; } };
  }, [nodeIds, links.length, width, height]);

  const reheat = useCallback(() => { alphaRef.current = 0.5; }, []);
  return { positions, posRef, reheat };
}

function NodePanel({ node, nodes, links, onClose, onNavigate }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const slug = node?.url?.replace('/', '');
    if (slug && slug !== '#') {
      supabase.from('topic_sections').select('heading').eq('topic', slug).order('sort_order')
        .then(({ data }) => setSections(data || []));
      return;
    }
    Promise.resolve().then(() => setSections([]));
  }, [node?.id, node?.url]);

  if (!node) return null;

  const connectedIds = links
    .filter(l => l.source === node.id || l.target === node.id)
    .map(l => l.source === node.id ? l.target : l.source);
  const connected = nodes.filter(n => connectedIds.includes(n.id));
  const color = GROUPS[node.group_id]?.color || ACCENT;

  return (
    <div style={{
      position: "absolute", right: 200, top: 180, width: 280,
      background: "#fff", border: "1px solid #000",
      zIndex: 30, display: "flex", flexDirection: "column",
      maxHeight: 680, overflow: "hidden",
      boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
    }}>
      <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #E0E0E0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, marginBottom: 3 }}>{node.label}</div>
          <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: 1 }}>{GROUPS[node.group_id]?.full || node.group_id}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "1px solid #E0E0E0", width: 22, height: 22, cursor: "pointer", fontSize: 11, flexShrink: 0, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>
        {node.description && <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>{node.description}</p>}
        {sections.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Topics</div>
            {sections.map(s => <div key={s.id} style={{ padding: "4px 0", borderBottom: "1px solid #F5F5F5", fontSize: 12 }}>{s.heading}</div>)}
          </div>
        )}
        {connected.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Connected to</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {connected.map(n => (
                <span key={n.id} onClick={() => onNavigate(n)}
                  style={{ padding: "2px 8px", border: `1px solid ${GROUPS[n.group_id]?.color || "#E0E0E0"}`, fontSize: 11, cursor: "pointer", color: GROUPS[n.group_id]?.color || "#000" }}>
                  {n.label}
                </span>
              ))}
            </div>
          </div>
        )}
        <Link to={`/topic/${node.id}`} style={{ display: "block", fontSize: 12, color: ACCENT, textDecoration: "none", marginTop: 4 }}>View subtopics →</Link>
      </div>
    </div>
  );
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
            const color = GROUPS[n.group_id]?.color || "#999";
            const abbr = n.abbreviation || GROUPS[n.group_id]?.label || n.group_id;
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
            const color = GROUPS[n.group_id]?.color || "#999";
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

  useEffect(() => {
    supabase.from('brain_nodes').select('*').order('sort_order').then(({ data }) => setNodes(data || []));
    supabase.from('brain_links').select('*').then(({ data }) => {
      setLinks((data || []).map(l => ({ id: l.id, source: l.source_id, target: l.target_id })));
    });
  }, []);

  useEffect(() => {
    const update = () => {
      setCanvasScale(Math.min(window.innerWidth / 1440, window.innerHeight / 1024));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
          nodes={nodes}
          links={links}
          onClose={() => setSelected(null)}
          onNavigate={n => setSelected(n)}
        />
      )}
    </ScaleWrap>
  );
}
