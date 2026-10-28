import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { watchForNewBuild } from "./lib/staleBuild";

watchForNewBuild();

createRoot(document.getElementById("root")!).render(<App />);
