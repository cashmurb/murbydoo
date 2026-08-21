import { useState } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import { projects as defaultProjects } from "../content/projects-data.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";
const CONTENT_GAP = 14;
const CATEGORY_NAMES = ["Code", "Film", "Photo"];

export default function World() {
  const [category, setCategory] = useState("Code");
  const [index, setIndex] = useState(0);
  const projects = defaultProjects;

  const currentProject = projects[category][index];

  const setCategoryAndReset = (name) => {
    setCategory(name);
    setIndex(0);
  };
  const nextProject = () => setIndex((i) => (i + 1) % 3);
  const prevProject = () => setIndex((i) => (i + 2) % 3);

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="world" />

      <svg width="1440" height="1024" viewBox="0 0 1440 1024" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
    <path d="M83.7152 -13H100.635V86L106.755 95.9H110.175L119.895 85.64V37.76H136.995V80.42L147.255 95.9H150.315L156.075 89.6V-13H173.175V95L155.535 113H139.155L129.795 98.6L116.115 113H100.635L83.7152 87.98V-13Z" className="glyph-hover" />
    <path d="M102.795 217H154.815L169.575 239.5V327.34L154.635 343H102.615L87.4952 320.5V232.66L102.795 217Z M104.235 317.98L110.715 327.52H147.975L152.655 322.48V242.02L146.355 232.48H109.095L104.235 237.52V317.98Z" className="glyph-hover" />
    <path d="M87.3152 447H149.775L169.755 476.16V495.06L152.295 512.88L169.755 538.26V573H152.655V540.6L135.195 514.86H116.835L104.235 507.12V573H87.3152V447Z M104.235 462.48V499.38H144.195L152.655 490.92V478.86L141.315 462.48H104.235Z" className="glyph-hover" />
    <path d="M87.3152 677H104.235V777.62L111.075 787.52H152.655V774.38H169.755V803H102.795L87.3152 779.78V677Z" className="glyph-hover" />
    <path d="M89.2952 907H146.715L171.555 944.08V1017.34L156.435 1033H89.2952V907Z M106.215 922.48V1017.7H149.415L154.455 1012.48V946.6L138.255 922.48H106.215Z" className="glyph-hover" />
      </svg>

      <div style={{ position: "absolute", left: 272, top: 247, fontSize: 15, color: "#B4B4B4" }}>
        Code, films, and photobooks. All the trinkets I've built, made, and published.
      </div>

      <div style={{ position: "absolute", left: 270, top: 283, width: 899, height: 459, border: "1px solid #000000", borderRadius: 15 }}>
        <div onClick={prevProject} style={{ position: "absolute", left: 56, top: 222, cursor: "pointer", fontSize: 24, color: "#000000", userSelect: "none" }}>
          &#10094;
        </div>
        <div onClick={nextProject} style={{ position: "absolute", right: 64, top: 222, cursor: "pointer", fontSize: 24, color: "#000000", userSelect: "none" }}>
          &#10095;
        </div>

        {currentProject ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              left: 120,
              right: 120,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: CONTENT_GAP,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.25, whiteSpace: "pre-line" }}>
              {currentProject.title}
            </div>
            <div style={{ fontSize: 15, color: MUTED, maxWidth: 520 }}>{currentProject.subtitle}</div>
            <div style={{ fontSize: 15, color: ACCENT, display: "flex", alignItems: "center" }}>{currentProject.tag}</div>
            <a
              href={currentProject.github}
              target="_blank"
              rel="noopener"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0 }}
            >
              <svg width="20" height="20" viewBox="712 698 16 16" style={{ display: "block" }}>
                <path
                  d="M718.874 709.276C716.94 709.042 715.578 707.65 715.578 705.849C715.578 705.116 715.842 704.325 716.281 703.798C716.091 703.314 716.12 702.289 716.34 701.864C716.926 701.791 717.717 702.099 718.186 702.523C718.742 702.348 719.328 702.26 720.046 702.26C720.764 702.26 721.35 702.348 721.877 702.509C722.331 702.099 723.137 701.791 723.723 701.864C723.928 702.26 723.957 703.285 723.767 703.783C724.235 704.34 724.484 705.087 724.484 705.849C724.484 707.65 723.122 709.013 721.159 709.262C721.657 709.584 721.994 710.287 721.994 711.093V712.616C721.994 713.056 722.36 713.305 722.8 713.129C725.451 712.118 727.531 709.467 727.531 706.186C727.531 702.04 724.162 698.656 720.017 698.656C715.871 698.656 712.531 702.04 712.531 706.186C712.531 709.438 714.597 712.133 717.38 713.144C717.775 713.29 718.156 713.026 718.156 712.631V711.459C717.951 711.547 717.688 711.605 717.453 711.605C716.486 711.605 715.915 711.078 715.505 710.097C715.344 709.701 715.168 709.467 714.831 709.423C714.655 709.408 714.597 709.335 714.597 709.247C714.597 709.071 714.89 708.939 715.183 708.939C715.607 708.939 715.974 709.203 716.354 709.745C716.647 710.17 716.955 710.36 717.321 710.36C717.688 710.36 717.922 710.229 718.259 709.892C718.508 709.643 718.698 709.423 718.874 709.276Z"
                  fill={ACCENT}
                />
              </svg>
            </a>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, left: 120, right: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 24, color: MUTED }}>coming soon</div>
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 1191, top: 456, display: "flex", flexDirection: "column", gap: 38 }}>
        {CATEGORY_NAMES.map((name) => (
          <div
            key={name}
            onClick={() => setCategoryAndReset(name)}
            style={{ cursor: "pointer", fontSize: 15, color: category === name ? ACCENT : "#000000" }}
          >
            {name}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", top: 770, left: 0, width: "100%", display: "flex", justifyContent: "center", gap: 29 }}>
        {[0, 1, 2].map((i) => (
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
