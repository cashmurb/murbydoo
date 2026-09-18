import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
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

const GRAPH_CSS = `
.bn-node text { display: none; }
[data-labels="1"] .bn-node text,
.bn-node[data-hl="1"] text { display: block; }
[data-hl-active="1"] .bn-node { opacity: 0.25; }
[data-hl-active="1"] .bn-node[data-hl="1"] { opacity: 1; }
.bn-link { stroke: #ddd; stroke-width: 1; }
[data-hl-active="1"] .bn-link { stroke: #f0f0f0; }
[data-hl-active="1"] .bn-link[data-hl="1"] { stroke: ${ACCENT}; stroke-width: 2; }
`;

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
      position: "absolute", right: 200, top: 190, width: 280,
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

    alphaRef.current *= 0.97;
    const alpha = alphaRef.current;
    const p = posRef.current;
    const cx = width / 2, cy = height / 2;
    const rx = width * 0.36, ry = height * 0.36;

    for (let i = 0; i < nList.length; i++) {
      const pa = p[nList[i].id];
      if (!pa) continue;
      for (let j = i + 1; j < nList.length; j++) {
        const pb = p[nList[j].id];
        if (!pb) continue;
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        const d2 = dx * dx + dy * dy || 1;
        const d = Math.sqrt(d2);
        const f = (3200 / d2) * alpha;
        pa.vx += (dx / d) * f; pa.vy += (dy / d) * f;
        pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f;
      }
    }

    for (const l of lList) {
      const pa = p[l.source], pb = p[l.target];
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x, dy = pb.y - pa.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 115) * 0.033 * alpha;
      pa.vx += (dx / d) * f; pa.vy += (dy / d) * f;
      pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f;
    }

    const centroids = {};
    for (const n of nList) {
      const pp = p[n.id];
      if (!pp) continue;
      let c = centroids[n.group_id];
      if (!c) c = centroids[n.group_id] = { x: 0, y: 0, count: 0 };
      c.x += pp.x; c.y += pp.y; c.count++;
    }
    for (const c of Object.values(centroids)) { c.x /= c.count; c.y /= c.count; }
    for (const n of nList) {
      const pp = p[n.id];
      const c = centroids[n.group_id];
      if (!pp || !c) continue;
      pp.vx += (c.x - pp.x) * 0.022 * alpha;
      pp.vy += (c.y - pp.y) * 0.022 * alpha;
    }

    for (const n of nList) {
      const pp = p[n.id];
      if (!pp || pp.pinned) continue;
      const dx = pp.x - cx, dy = pp.y - cy;
      const dist = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
      if (dist > 1) {
        pp.vx -= dx * (dist - 1) * 0.28 * alpha;
        pp.vy -= dy * (dist - 1) * 0.28 * alpha;
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
    const rx = size.w * 0.36, ry = size.h * 0.36;
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
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", gap: 6, alignItems: "center" }}>
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

      <svg width={size.w} height={size.h} style={{ display: "block", userSelect: "none" }}>
        <g ref={gRef}>
          {links.map(l => (
            <line key={l.id} data-link-id={l.id} className="bn-link" />
          ))}
          {nodes.map(n => {
            const color = GROUPS[n.group_id]?.color || "#999";
            const abbr = n.abbreviation || GROUPS[n.group_id]?.label || n.group_id;
            const isSel = selectedNode?.id === n.id;
            const r = isSel ? 10 : 7;
            return (
              <g
                key={n.id}
                data-node-id={n.id}
                className="bn-node"
                style={{ cursor: "grab" }}
                onMouseEnter={() => handleHover(n.id)}
                onMouseLeave={() => handleHover(null)}
              >
                {isSel && <circle r={r + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.25} />}
                <circle r={r} fill={color} />
                <text y={r + 13} textAnchor="middle" fontSize={11} fill="#000" fontFamily="Kode Mono, monospace" style={{ pointerEvents: "none", userSelect: "none" }}>
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
          nodes={nodes}
          links={links}
          onClose={() => setSelected(null)}
          onNavigate={n => setSelected(n)}
        />
      )}
    </ScaleWrap>
  );
}