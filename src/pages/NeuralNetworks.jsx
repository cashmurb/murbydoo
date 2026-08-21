import TopicPage from "../components/TopicPage.jsx";
import { sections } from "../content/topics/neural-networks.js";

export default function NeuralNetworks() {
  return <TopicPage title="Introduction to Neural Networks" sections={sections} />;
}
