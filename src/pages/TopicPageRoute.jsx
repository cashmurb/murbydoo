import { useParams } from "react-router-dom";
import TopicPage from "../components/TopicPage.jsx";

export default function TopicPageRoute() {
  const { nodeId } = useParams();
  return <TopicPage nodeId={nodeId} />;
}
