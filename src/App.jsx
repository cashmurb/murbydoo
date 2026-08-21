import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import World from "./pages/World.jsx";
import Brain from "./pages/Brain.jsx";
import Dump from "./pages/Dump.jsx";
import Wips from "./pages/Wips.jsx";
import Wyd from "./pages/Wyd.jsx";
import Socials from "./pages/Socials.jsx";
import NeuralNetworks from "./pages/NeuralNetworks.jsx";
import Dsa from "./pages/Dsa.jsx";
import Numerical from "./pages/Numerical.jsx";
import Cv from "./pages/Cv.jsx";
import Ml from "./pages/Ml.jsx";
import Rl from "./pages/Rl.jsx";
import Avatar from "./pages/Avatar.jsx";
import Topic from "./pages/Topic.jsx";

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
        <Route path="/nn" element={<NeuralNetworks />} />
        <Route path="/dsa" element={<Dsa />} />
        <Route path="/numerical" element={<Numerical />} />
        <Route path="/cv" element={<Cv />} />
        <Route path="/ml" element={<Ml />} />
        <Route path="/rl" element={<Rl />} />
        <Route path="/avatar" element={<Avatar />} />
        <Route path="/topic" element={<Topic />} />
    </Routes>
  );
}

export default App;
