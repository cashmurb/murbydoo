import { Link } from "react-router-dom";
import NavHeader from "../components/NavHeader.jsx";

export default function Avatar() {
  return (
    <div
      style={{
        position: "relative",
        fontFamily: "'Kode Mono', monospace",
        color: "#000000",
        background: "#FFFFFF",
        minHeight: "100vh",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1440, maxWidth: "100%", height: 96 }}>
        <NavHeader active={null} />
      </div>

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D96614", marginBottom: 16 }}>
            make your avatar
          </div>
          <div style={{ fontSize: 32, marginBottom: 12 }}>coming soon</div>
          <Link to="/home" style={{ fontSize: 15, textDecoration: "none" }}>
            &#8592; back home
          </Link>
        </div>
      </div>
    </div>
  );
}
