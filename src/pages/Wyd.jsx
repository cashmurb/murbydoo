import { useState } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";

const ACCENT = "#D96614";

const ROLES = [
  {
    id: "swe",
    title: "Software Engineer Intern (Data Analytics focus) @ Shanghai Winner-Solution Technology Co. Ltd.",
    description:
      "Worked on data analytics and internal software tools, fixing discrepancies between Python pipelines and the company's testing system while improving data accuracy and debugging efficiency. I also built an interactive dashboard and refined internal tooling to make reporting and day-to-day workflows smoother.",
  },
  {
    id: "research",
    title:
      "Researcher/ Research Assistant\n@ School of Artificial Intelligence and Advanced Computing, Xi'an Jiaotong-Liverpool University",
    description:
      "Worked on YOLOv7-based multi-object tracking for illegal parking detection through XJTLU's Summer Undergraduate Research Fellowship, improving model accuracy by 18%. Published work on Random Forest-based predictive risk analytics for Industry 4.0.",
  },
  {
    id: "content",
    title:
      "Content Creator (Videographer + Video Editor)\n@ University Marketing and Communications, Xi'an Jiaotong-Liverpool University",
    description:
      "Led videography for XJTLU's 2024 graduation video, coordinating production under tight deadlines and limited resources. My work spans filming, editing, and visual storytelling, with tools including Final Cut Pro X and DaVinci Resolve.",
  },
];

export default function Wyd() {
  const [open, setOpen] = useState({});
  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <ScaleWrap variant="fixed">
      <NavHeader />

      <div style={{ position: "absolute", left: 0, top: 96, bottom: 0, width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ paddingLeft: 189 }}>
          <div style={{ fontSize: 48, fontWeight: 400, marginBottom: 38 }}>experience</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 1200 }}>
            {ROLES.map((role) => {
              const isOpen = !!open[role.id];
              return (
                <div key={role.id}>
                  <div onClick={() => toggle(role.id)} style={{ display: "flex", alignItems: "flex-start", gap: 16, cursor: "pointer" }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      style={{
                        flexShrink: 0,
                        marginTop: 4,
                        transform: `rotate(${isOpen ? 90 : 0}deg)`,
                        transition: "transform .25s ease",
                      }}
                    >
                      <path d="M14 7L0 14V0L14 7Z" fill={ACCENT} />
                    </svg>
                    <div style={{ fontSize: 20, lineHeight: 1.4, whiteSpace: "pre-line" }}>{role.title}</div>
                  </div>
                  <div
                    style={{
                      maxHeight: isOpen ? "160px" : "0px",
                      opacity: isOpen ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height .4s cubic-bezier(0.4,0,0.2,1), opacity .3s ease",
                    }}
                  >
                    <div style={{ marginTop: 16, marginLeft: 30, fontSize: 15, lineHeight: 1.7, color: "rgba(0,0,0,0.56)", maxWidth: 900 }}>
                      {role.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScaleWrap>
  );
}
