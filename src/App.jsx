import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import World from "./pages/World.jsx";
import Brain from "./pages/BrainGraph.jsx";
import Dump from "./pages/Dump.jsx";
import Wips from "./pages/Wips.jsx";
import Wyd from "./pages/Wyd.jsx";
import Socials from "./pages/Socials.jsx";
import Avatar from "./pages/Avatar.jsx";
import TopicPageRoute from "./pages/TopicPageRoute.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import Portal from "./pages/Portal.jsx";
import Guestbook from "./pages/Guestbook.jsx";
import Game from "./pages/Game.jsx";
import { playClickSound, playTypingSound } from "./lib/sounds.js";

function App() {
  useEffect(() => {
    const onClick = event => {
      if (event.target.closest("button, a")) playClickSound();
    };

    const onKeyDown = event => {
      if (event.target.closest("[data-terminal-input]")) return;
      const isTypingKey = event.key.length === 1 || event.key === "Enter" || event.key === "Backspace";
      if (!isTypingKey || event.ctrlKey || event.metaKey || event.altKey) return;
      playTypingSound();
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/world" element={<World />} />
      <Route path="/brain" element={<Brain />} />
      <Route path="/dump" element={<Dump />} />
      <Route path="/wips" element={<Wips />} />
      <Route path="/wyd" element={<Wyd />} />
      <Route path="/socials" element={<Socials />} />
      <Route path="/avatar" element={<Avatar />} />
      <Route path="/topic/:nodeId" element={<TopicPageRoute />} />
      <Route path="/notes/:subtopicId" element={<NotesPage />} />
      <Route path="/portal" element={<Portal />} />
      <Route path="/guestbook" element={<Guestbook />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}

export default App;
