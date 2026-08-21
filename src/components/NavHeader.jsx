import { useState } from "react";
import { Link } from "react-router-dom";

// Lines connecting the four navigation nodes. 
const EDGES = {
  brainWips: { nodes: ["brain", "wips"], x1: 45, y1: 45.56, x2: 98, y2: 20 },
  brainWorld: { nodes: ["brain", "world"], x1: 118, y1: 20, x2: 181, y2: 46 },
  brainDump: { nodes: ["brain", "dump"], x1: 142, y1: 12, x2: 227, y2: 12 },
  wipsWorld: { nodes: ["wips", "world"], x1: 45, y1: 59, x2: 142, y2: 59 },
  worldDump: { nodes: ["world", "dump"], x1: 216, y1: 54, x2: 252, y2: 20 },
  wipsDump: { nodes: ["wips", "dump"], x1: 58, y1: 49, x2: 234, y2: 20 },
};

const NODES = [
  { name: "brain", to: "/brain", label: "Brain", left: 88, top: 1 },
  { name: "dump", to: "/dump", label: "Dump", left: 235, top: 1 },
  { name: "wips", to: "/wips", label: "WIPs", left: 0, top: 53 },
  { name: "world", to: "/world", label: "World", left: 158, top: 52 },
];

const ACCENT = "#D96614";

// Shared site navigation. `active` highlights a section; `onNavClick` handles optional click behavior.

export default function NavHeader({ active, onNavClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const navColor = { brain: "#000000", dump: "#000000", wips: "#000000", world: "#000000" };
  if (active && navColor[active] !== undefined) navColor[active] = ACCENT;
  if (hoveredNode) navColor[hoveredNode] = ACCENT;

  return (
    <>
      <Link
        to="/home"
        style={{
          position: "absolute",
          top: 44,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 15,
          color: "#000000",
          textDecoration: "none",
          zIndex: 10,
        }}
      >
        Cashmere Blanche Alin
      </Link>

      <div style={{ position: "absolute", left: 1085, top: 43, width: 267, height: 64, zIndex: 10 }}>
        <svg width="267" height="64" viewBox="0 0 267 64" style={{ position: "absolute", top: 0, left: 0 }}>
          {Object.entries(EDGES).map(([key, edge]) => {
            const isActive = edge.nodes.includes(hoveredNode) || hoveredEdge === key;
            const color = edge.nodes.includes(hoveredNode) ? ACCENT : "#000000";
            return (
              <line
                key={key}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={color}
                strokeWidth={isActive ? 2 : 1}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredEdge(key)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{
                  transition:
                    "stroke .3s cubic-bezier(0.4,0,0.2,1), stroke-width .3s cubic-bezier(0.4,0,0.2,1)",
                  pointerEvents: "stroke",
                  cursor: "pointer",
                }}
              />
            );
          })}
        </svg>
        {NODES.map((node) => (
          <Link
            key={node.name}
            to={node.to}
            onMouseEnter={() => setHoveredNode(node.name)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNavClick && onNavClick(node.name)}
            style={{
              position: "absolute",
              left: node.left,
              top: node.top,
              fontSize: 15,
              textDecoration: "none",
              color: navColor[node.name],
              transition: "color .2s",
            }}
          >
            {node.label}
          </Link>
        ))}
      </div>
    </>
  );
}
