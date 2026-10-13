import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import NavHeader from "../components/NavHeader.jsx";
import DinoGame from "../components/DinoGame.jsx";
import AvatarFigure from "../components/AvatarFigure.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { fetchTopScores, getVisitorId, readAvatar, readName } from "../lib/scores.js";

const ACCENT = "#D96614";
const MUTED = "#B4B4B4";

function pad(n) {
  return String(Math.floor(n)).padStart(5, "0");
}

function ScoreRow({ row, rank, isYou }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "8px 14px",
      background: isYou ? "#FFF4EC" : "transparent",
      border: `1px solid ${isYou ? "#F0D9C6" : "transparent"}`,
      borderRadius: 6,
    }}>
      <div style={{
        width: 22,
        fontSize: 12,
        color: rank <= 3 ? "#000" : MUTED,
        fontWeight: rank <= 3 ? 600 : 400,
      }}>
        {rank}
      </div>

      <div style={{ width: 26, height: 46, overflow: "hidden", flexShrink: 0 }}>
        {row.avatar_data ? (
          <div style={{ width: 183, height: 317, transform: "scale(0.145)", transformOrigin: "top left" }}>
            <AvatarFigure selection={row.avatar_data} />
          </div>
        ) : null}
      </div>

      <div style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.name || "anonymous"}
        {isYou && <span style={{ color: ACCENT, fontSize: 11, marginLeft: 8 }}>you</span>}
      </div>

      <div style={{ fontSize: 13, letterSpacing: 1 }}>{pad(row.score)}</div>
    </div>
  );
}

function Scoreboard({ rows, visitorId }) {
  return (
    <div style={{
      background: "#FAFAFA",
      border: "1px solid #E8E8E8",
      borderRadius: 10,
      padding: "22px 18px",
    }}>
      <div style={{
        textAlign: "center",
        fontSize: 12,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: MUTED,
        marginBottom: 18,
      }}>
        top scores of all time
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: MUTED }}>
          nobody has run yet. be the first.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rows.map((row, i) => (
            <ScoreRow
              key={row.visitor_id}
              row={row}
              rank={i + 1}
              isYou={row.visitor_id === visitorId}
            />
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: MUTED }}>
        save your run into the{" "}
        <Link to="/guestbook" style={{ color: ACCENT }}>guestbook</Link>
      </div>
    </div>
  );
}

export default function Game() {
  const isMobile = useIsMobile();
  const [avatarData] = useState(readAvatar);
  const [characterName] = useState(readName);
  const [rows, setRows] = useState([]);
  const visitorId = getVisitorId();

  const loadScores = useCallback(() => {
    fetchTopScores(10).then(setRows);
  }, []);

  useEffect(() => { loadScores(); }, [loadScores]);

  return (
    <div style={{
      position: "relative",
      width: 1440,
      maxWidth: "100%",
      margin: "0 auto",
      minHeight: "100vh",
      background: "#fff",
      fontFamily: "Kode Mono, monospace",
    }}>
      <NavHeader />

      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: isMobile ? "120px 16px 72px" : "170px 40px 100px",
      }}>
        <div style={{ marginBottom: 10 }}>
          <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 400, margin: 0, marginBottom: 8 }}>she a runner, she a track star</h1>
          <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
            {isMobile ? "tap to jump." : "space to jump."} your best run goes on the board.
          </p>
          {characterName && (
            <p style={{ fontSize: 12, color: MUTED, margin: "6px 0 0" }}>
              running as <span style={{ color: ACCENT }}>{characterName}</span>
              {" · "}
              <Link to="/avatar" style={{ color: MUTED }}>change</Link>
            </p>
          )}
        </div>

        <div style={{ marginBottom: 36 }}>
          <DinoGame avatarData={avatarData} onScoreSaved={loadScores} />
        </div>

        {!avatarData && (
          <div style={{
            marginBottom: 28,
            padding: "14px 18px",
            background: "#FFF4EC",
            border: "1px solid #F0D9C6",
            borderRadius: 8,
            fontSize: 13,
          }}>
            you are running as a stick figure.{" "}
            <Link to="/avatar" style={{ color: ACCENT }}>make your avatar →</Link>
          </div>
        )}

        <Scoreboard rows={rows} visitorId={visitorId} />
      </div>
    </div>
  );
}
