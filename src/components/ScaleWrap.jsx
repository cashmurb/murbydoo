import { useEffect, useRef, useState } from "react";

// Handles scaling for the 1440x1024 layout.
// `fixed` fits the whole page; `fluid` allows longer pages to scroll.
export default function ScaleWrap({ children, variant = "fixed" }) {
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1024);

  useEffect(() => {
    if (variant === "fixed") {
      const update = () =>
        setScale(Math.min(window.innerWidth / 1440, window.innerHeight / 1024));
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const updateScale = () => setScale(Math.min(window.innerWidth / 1440, 1));
    updateScale();
    window.addEventListener("resize", updateScale);

    const node = innerRef.current;
    let observer;
    if (node && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => setContentHeight(node.scrollHeight));
      observer.observe(node);
      setContentHeight(node.scrollHeight);
    }
    return () => {
      window.removeEventListener("resize", updateScale);
      if (observer) observer.disconnect();
    };
  }, [variant]);

  if (variant === "fluid") {
    return (
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          height: contentHeight * scale,
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: 1440,
            minHeight: 1024,
            background: "#FFFFFF",
            position: "relative",
            fontFamily: "'Kode Mono', monospace",
            color: "#000000",
            paddingBottom: 120,
            flexShrink: 0,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      <div
        style={{
          width: 1440,
          height: 1024,
          background: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Kode Mono', monospace",
          color: "#000000",
          flexShrink: 0,
          transform: `scale(${scale})`,
          animation: "fadeInPage .5s ease both",
        }}
      >
        {children}
      </div>
    </div>
  );
}
