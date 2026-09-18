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

function App() {
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
    </Routes>
  );
}

export default App;
