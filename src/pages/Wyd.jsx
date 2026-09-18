import { useState, useEffect } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";

export default function Wyd() {
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState({});
  const [ready, setReady] = useState(false);


  useEffect(() => {
    supabase.from('experience').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setRoles(data);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <ScaleWrap variant="fixed">
      <NavHeader />
      <div style={{ position: "absolute", left: 0, top: 96, bottom: 0, width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ paddingLeft: 189 }}>
          <div style={{ fontSize: 48, fontWeight: 400, marginBottom: 38 }}>experience</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 1200 }}>
            {roles.map((role) => {
              const isOpen = !!open[role.id];
              return (
                <div key={role.id}>
                  <div onClick={() => toggle(role.id)} style={{ display: "flex", alignItems: "flex-start", gap: 16, cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 4, transform: `rotate(${isOpen ? 90 : 0}deg)`, transition: "transform .25s ease" }}>
                      <path d="M14 7L0 14V0L14 7Z" fill={ACCENT} />
                    </svg>
                    <div style={{ fontSize: 20, lineHeight: 1.4, whiteSpace: "pre-line" }}>{role.title}</div>
                  </div>
                  <div style={{ maxHeight: isOpen ? "160px" : "0px", opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(0.4,0,0.2,1), opacity .3s ease" }}>
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
