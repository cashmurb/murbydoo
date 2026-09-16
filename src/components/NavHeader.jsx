import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile.js";

const EDGES = {
  brainWips:  { nodes: ["brain","wips"],  x1:45,  y1:45.56, x2:98,  y2:20 },
  brainWorld: { nodes: ["brain","world"], x1:118, y1:20,    x2:181, y2:46 },
  brainDump:  { nodes: ["brain","dump"],  x1:142, y1:12,    x2:227, y2:12 },
  wipsWorld:  { nodes: ["wips","world"],  x1:45,  y1:59,    x2:142, y2:59 },
  worldDump:  { nodes: ["world","dump"],  x1:216, y1:54,    x2:252, y2:20 },
  wipsDump:   { nodes: ["wips","dump"],   x1:58,  y1:49,    x2:234, y2:20 },
};

const NODES = [
  { name: "brain", to: "/brain", label: "Brain", left: 88, top: 1 },
  { name: "dump",  to: "/dump",  label: "Dump",  left: 235, top: 1 },
  { name: "wips",  to: "/wips",  label: "WIPs",  left: 0,   top: 53 },
  { name: "world", to: "/world", label: "World", left: 158, top: 52 },
];

const ACCENT = "#D96614";

function MobileNav({ active }) {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/home",    label: "Home" },
    { to: "/about",   label: "About" },
    { to: "/world",   label: "World" },
    { to: "/brain",   label: "Brain" },
    { to: "/dump",    label: "Dump" },
    { to: "/wips",    label: "WIPs" },
    { to: "/wyd",     label: "Experience" },
    { to: "/socials", label: "Socials" },
  ];

  return (
    <div style={{ position: "relative", zIndex: 100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: open ? "1px solid #E0E0E0" : "none" }}>
        <Link to="/home" style={{ fontSize: 14, color: "#000", textDecoration: "none" }}>Cashmere Blanche Alin</Link>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 4L16 16M16 4L4 16" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : (
            <>
              <span style={{ display: "block", width: 22, height: 1.5, background: "#000" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#000" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#000" }} />
            </>
          )}
        </button>
      </div>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", borderBottom: "1px solid #E0E0E0", padding: "12px 0" }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} style={{ display: "block", padding: "12px 24px", fontSize: 15, color: active === l.label.toLowerCase() ? ACCENT : "#000", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavHeader({ active, onNavClick }) {
  const isMobile = useIsMobile();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  if (isMobile) return <MobileNav active={active} />;

  const navColor = { brain: "#000000", dump: "#000000", wips: "#000000", world: "#000000" };
  if (active && navColor[active] !== undefined) navColor[active] = ACCENT;
  if (hoveredNode) navColor[hoveredNode] = ACCENT;

  return (
    <>
      <Link to="/home" style={{ position: "absolute", top: 44, left: "50%", transform: "translateX(-50%)", fontSize: 15, color: "#000000", textDecoration: "none", zIndex: 10 }}>
        Cashmere Blanche Alin
      </Link>
      <div style={{ position: "absolute", left: 1085, top: 43, width: 267, height: 64, zIndex: 10 }}>
        <svg width="267" height="64" viewBox="0 0 267 64" style={{ position: "absolute", top: 0, left: 0 }}>
          {Object.entries(EDGES).map(([key, edge]) => {
            const isActive = edge.nodes.includes(hoveredNode) || hoveredEdge === key;
            const color = edge.nodes.includes(hoveredNode) ? ACCENT : "#000000";
            return (
              <line key={key} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke={color} strokeWidth={isActive ? 2 : 1} strokeLinecap="round"
                onMouseEnter={() => setHoveredEdge(key)} onMouseLeave={() => setHoveredEdge(null)}
                style={{ transition: "stroke .3s cubic-bezier(0.4,0,0.2,1), stroke-width .3s cubic-bezier(0.4,0,0.2,1)", pointerEvents: "stroke", cursor: "pointer" }} />
            );
          })}
        </svg>
        {NODES.map(node => (
          <Link key={node.name} to={node.to}
            onMouseEnter={() => setHoveredNode(node.name)} onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNavClick && onNavClick(node.name)}
            style={{ position: "absolute", left: node.left, top: node.top, fontSize: 15, textDecoration: "none", color: navColor[node.name], transition: "color .2s" }}>
            {node.label}
          </Link>
        ))}
      </div>
    </>
  );
}
