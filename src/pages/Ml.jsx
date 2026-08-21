import TopicPage from "../components/TopicPage.jsx";
import { sections } from "../content/topics/ml.js";

export default function Ml() {
  return <TopicPage title="Machine Learning Fundamentals" sections={sections} />;
}
