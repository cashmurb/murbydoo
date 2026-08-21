import TopicPage from "../components/TopicPage.jsx";
import { sections, linkText, linkUrl } from "../content/topics/rl.js";

export default function Rl() {
  return <TopicPage title="Reinforcement Learning" sections={sections} linkText={linkText} linkUrl={linkUrl} />;
}
