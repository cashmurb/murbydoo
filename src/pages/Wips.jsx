import { useState } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { items as defaultItems } from "../content/inprogress-items.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

export default function Wips() {
  const [index, setIndex] = useState(0);
  const items = defaultItems;
  const currentItem = items[index];

  const nextItem = () => setIndex((i) => (i + 1) % items.length);
  const prevItem = () => setIndex((i) => (i + items.length - 1) % items.length);

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="wips" />

      <svg width="1440" height="1024" viewBox="0 0 1440 1024" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
    <path d="M83.7152 102H100.635V201L106.755 210.9H110.175L119.895 200.64V152.76H136.995V195.42L147.255 210.9H150.315L156.075 204.6V102H173.175V210L155.535 228H139.155L129.795 213.6L116.115 228H100.635L83.7152 202.98V102Z" className="glyph-hover" />
    <path d="M87.4952 332H169.575V347.48H136.995V442.52H169.575V458H87.4952V442.52H120.075V347.48H87.4952V332Z" className="glyph-hover" />
    <path d="M87.4952 562H154.635L169.575 584.5V614.56L154.455 629.86H104.415V688H87.4952V562Z M104.415 577.48V622.3L117.555 614.56H147.795L152.655 609.7V587.2L146.355 577.48H104.415Z" className="glyph-hover" />
    <path d="M104.055 820.8H154.635L164.895 835.92L154.455 847.08L146.715 835.74H111.255L106.395 840.06V851.94L112.695 860.76H154.995L167.775 880.02V903.78L154.995 918H97.2152L89.2952 905.58L99.7352 894.6L105.135 902.52H147.795L151.035 899.1V882.9L146.355 876.24H103.875L89.6552 854.82V834.84L104.055 820.8Z" className="glyph-hover" />
      </svg>

      <div style={{ position: "absolute", left: 272, top: 247, fontSize: 15, color: MUTED, maxWidth: 700 }}>
        Works that I have yet to finish and ideas that have no come to life yet.
      </div>

      <div style={{ position: "absolute", left: 270, top: 283, width: 899, height: 459, border: "1px solid #000000", borderRadius: 15 }}>
        <div onClick={prevItem} style={{ position: "absolute", left: 56, top: 222, cursor: "pointer", fontSize: 24, color: "#000000", userSelect: "none" }}>
          &#10094;
        </div>
        <div onClick={nextItem} style={{ position: "absolute", right: 64, top: 222, cursor: "pointer", fontSize: 24, color: "#000000", userSelect: "none" }}>
          &#10095;
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            left: 120,
            right: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 600 }}>{currentItem.title}</div>
          {currentItem.subtitle ? (
            <div style={{ fontSize: 12, color: MUTED, maxWidth: 640 }}>{currentItem.subtitle}</div>
          ) : null}
        </div>
      </div>

      <div style={{ position: "absolute", top: 770, left: 0, width: "100%", display: "flex", justifyContent: "center", gap: 29 }}>
        {items.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            style={{ width: 72, height: 4, background: i === index ? ACCENT : "#BFBFBF", cursor: "pointer" }}
          />
        ))}
      </div>
    </ScaleWrap>
  );
}
