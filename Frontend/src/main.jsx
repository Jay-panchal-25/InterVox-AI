import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { InterviewProvider } from "./context/InterviewContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <InterviewProvider>
        <App />
      </InterviewProvider>
    </BrowserRouter>
  </StrictMode>,
)
