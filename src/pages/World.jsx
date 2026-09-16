import { useState, useEffect } from "react";
import ScaleWrap from "../components/ScaleWrap.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import NavHeader from "../components/NavHeader.jsx";
import { supabase } from "../lib/supabase.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";
const CATEGORY_NAMES = ["Code", "Film", "Photo"];

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

function isInstagram(url) {
  return !!url && /instagram\.com/.test(url);
}

function ProjectMedia({ project, category }) {
  if (!project || category === "Code") return null;

  if (category === "Film") {
    const ytId = getYouTubeId(project.video_url);
    if (ytId) {
      const src =
        `https://www.youtube.com/embed/${ytId}` +
        `?autoplay=1&mute=1&loop=1&playlist=${ytId}` +
        `&controls=1&modestbranding=1&rel=0&playsinline=1`;
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden", background: "#000" }}>
          <iframe
            src={src}
            title={project.title || "video"}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        </div>
      );
    }

    if (isInstagram(project.video_url) && project.thumbnail_url) {
      return (
        <a href={project.video_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
          <img
            src={project.thumbnail_url}
            alt={project.title || "thumbnail"}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, display: "block" }}
          />
        </a>
      );
    }

    if (project.thumbnail_url) {
      return (
        <img
          src={project.thumbnail_url}
          alt={project.title || "thumbnail"}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, display: "block" }}
        />
      );
    }

    return null;
  }

  if (category === "Photo") {
    if (!project.image_url) return null;
    const img = (
      <img
        src={project.image_url}
        alt={project.title || "photo"}
        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8, display: "block" }}
      />
    );
    return project.link_url ? (
      <a href={project.link_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
        {img}
      </a>
    ) : (
      img
    );
  }

  return null;
}

function MobileWorld({ projects }) {
  const [category, setCategory] = useState("Code");
  const [index, setIndex] = useState(0);
  const list = projects[category] || [];
  const current = list[index] ?? null;
  const total = list.length;

  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader active="world" />
      <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, margin: 0 }}>world</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
          Code, films, and photobooks. All the trinkets I've built, made, and published.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          {CATEGORY_NAMES.map(c => (
            <button
              key={c}
              onClick={() => { setCategory(c); setIndex(0); }}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontFamily: "Kode Mono, monospace",
                fontSize: 13,
                background: c === category ? ACCENT : "#f0f0f0",
                color: c === category ? "#fff" : "#000",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div
          style={{
            border: "1px solid #000",
            borderRadius: 12,
            padding: "20px",
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            textAlign: "center",
            position: "relative",
          }}
        >
          {current ? (
            <>
              {category !== "Code" && (
                <div style={{ width: "100%", aspectRatio: "16 / 9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 10 }}>
                  <ProjectMedia project={current} category={category} />
                </div>
              )}
              <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3 }}>{current.title}</div>
              {current.subtitle && <div style={{ fontSize: 13, color: MUTED }}>{current.subtitle}</div>}
              {current.tag && <div style={{ fontSize: 13, color: ACCENT }}>{current.tag}</div>}
              {current.github && (
                <a
                  href={current.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: ACCENT, fontSize: 13 }}
                >
                  View on GitHub →
                </a>
              )}
            </>
          ) : (
            <div style={{ fontSize: 18, color: MUTED }}>coming soon</div>
          )}
        </div>

        {total > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button
              onClick={() => setIndex(i => (i + total - 1) % total)}
              style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}
            >
              ‹
            </button>
            <span style={{ fontSize: 13, color: MUTED }}>{index + 1} / {total}</span>
            <button
              onClick={() => setIndex(i => (i + 1) % total)}
              style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function World() {
  const isMobile = useIsMobile();
  const [category, setCategory] = useState("Code");
  const [index, setIndex] = useState(0);
  const [projects, setProjects] = useState({ Code: [], Film: [], Photo: [] });

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("slot")
      .then(({ data }) => {
        if (!data) return;
        const grouped = { Code: [], Film: [], Photo: [] };
        data.forEach(p => {
          if (grouped[p.category] && p.title) grouped[p.category].push(p);
        });
        setProjects(grouped);
      });
  }, []);

  if (isMobile) return <ScaleWrap><MobileWorld projects={projects} /></ScaleWrap>;

  const currentList = projects[category];
  const total = currentList.length || 1;
  const currentProject = currentList[index] ?? null;
  const setCategoryAndReset = name => { setCategory(name); setIndex(0); };
  const nextProject = () => setIndex(i => (i + 1) % total);
  const prevProject = () => setIndex(i => (i + total - 1) % total);

  const media = currentProject ? <ProjectMedia project={currentProject} category={category} /> : null;

  return (
    <ScaleWrap variant="fixed">
      <NavHeader active="world" />
      <svg
        width="1440"
        height="1024"
        viewBox="0 0 1440 1024"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <path d="M83.7152 -13H100.635V86L106.755 95.9H110.175L119.895 85.64V37.76H136.995V80.42L147.255 95.9H150.315L156.075 89.6V-13H173.175V95L155.535 113H139.155L129.795 98.6L116.115 113H100.635L83.7152 87.98V-13Z" className="glyph-hover" />
        <path d="M102.795 217H154.815L169.575 239.5V327.34L154.635 343H102.615L87.4952 320.5V232.66L102.795 217Z M104.235 317.98L110.715 327.52H147.975L152.655 322.48V242.02L146.355 232.48H109.095L104.235 237.52V317.98Z" className="glyph-hover" />
        <path d="M87.3152 447H149.775L169.755 476.16V495.06L152.295 512.88L169.755 538.26V573H152.655V540.6L135.195 514.86H116.835L104.235 507.12V573H87.3152V447Z M104.235 462.48V499.38H144.195L152.655 490.92V478.86L141.315 462.48H104.235Z" className="glyph-hover" />
        <path d="M87.3152 677H104.235V777.62L111.075 787.52H152.655V774.38H169.755V803H102.795L87.3152 779.78V677Z" className="glyph-hover" />
        <path d="M89.2952 907H146.715L171.555 944.08V1017.34L156.435 1033H89.2952V907Z M106.215 922.48V1017.7H149.415L154.455 1012.48V946.6L138.255 922.48H106.215Z" className="glyph-hover" />
      </svg>

      <div style={{ position: "absolute", left: 272, top: 247, fontSize: 15, color: MUTED }}>
        Code, films, and photobooks. All the trinkets I've built, made, and published.
      </div>

      <div
        style={{
          position: "absolute",
          left: 270,
          top: 283,
          width: 899,
          height: 459,
          border: "1px solid #000000",
          borderRadius: 15,
        }}
      >
        <div
          onClick={prevProject}
          style={{ position: "absolute", left: 56, top: 222, cursor: "pointer", fontSize: 24, userSelect: "none" }}
        >
          ❮
        </div>
        <div
          onClick={nextProject}
          style={{ position: "absolute", right: 64, top: 222, cursor: "pointer", fontSize: 24, userSelect: "none" }}
        >
          ❯
        </div>

        {currentProject ? (
          <div
            style={{
              position: "absolute",
              top: 40,
              bottom: 40,
              left: 80,
              right: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {category !== "Code" && media && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 560,
                  aspectRatio: "16 / 9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {media}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 10,
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  whiteSpace: "pre-line",
                }}
              >
                {currentProject.title}
              </div>
              {currentProject.subtitle && (
                <div style={{ fontSize: 14, color: MUTED, maxWidth: 520 }}>{currentProject.subtitle}</div>
              )}
              {currentProject.tag && (
                <div style={{ fontSize: 14, color: ACCENT }}>{currentProject.tag}</div>
              )}
              {currentProject.github && (
                <a
                  href={currentProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}
                >
                  <svg width="20" height="20" viewBox="712 698 16 16">
                    <path
                      d="M718.874 709.276C716.94 709.042 715.578 707.65 715.578 705.849C715.578 705.116 715.842 704.325 716.281 703.798C716.091 703.314 716.12 702.289 716.34 701.864C716.926 701.791 717.717 702.099 718.186 702.523C718.742 702.348 719.328 702.26 720.046 702.26C720.764 702.26 721.35 702.348 721.877 702.509C722.331 702.099 723.137 701.791 723.723 701.864C723.928 702.26 723.957 703.285 723.767 703.783C724.235 704.34 724.484 705.087 724.484 705.849C724.484 707.65 723.122 709.013 721.159 709.262C721.657 709.584 721.994 710.287 721.994 711.093V712.616C721.994 713.056 722.36 713.305 722.8 713.129C725.451 712.118 727.531 709.467 727.531 706.186C727.531 702.04 724.162 698.656 720.017 698.656C715.871 698.656 712.531 702.04 712.531 706.186C712.531 709.438 714.597 712.133 717.38 713.144C717.775 713.29 718.156 713.026 718.156 712.631V711.459C717.951 711.547 717.688 711.605 717.453 711.605C716.486 711.605 715.915 711.078 715.505 710.097C715.344 709.701 715.168 709.467 714.831 709.423C714.655 709.408 714.597 709.335 714.597 709.247C714.597 709.071 714.89 708.939 715.183 708.939C715.607 708.939 715.974 709.203 716.354 709.745C716.647 710.17 716.955 710.36 717.321 710.36C717.688 710.36 717.922 710.229 718.259 709.892C718.508 709.643 718.698 709.423 718.874 709.276Z"
                      fill={ACCENT}
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              left: 120,
              right: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 24, color: MUTED }}>coming soon</div>
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 1191, top: 456, display: "flex", flexDirection: "column", gap: 38 }}>
        {CATEGORY_NAMES.map(name => (
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
        {currentList.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: 72,
              height: 4,
              background: i === index ? ACCENT : "#BFBFBF",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </ScaleWrap>
  );
}