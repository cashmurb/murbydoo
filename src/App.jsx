import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { setLastPath } from "./lib/navHistory.js";
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

function App() {
  const location = useLocation();

  // Recorded after the new page has rendered, so that page can still see
  // which one the visitor came from while it sets itself up
  useEffect(() => {
    setLastPath(location.pathname);
  }, [location.pathname]);

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
