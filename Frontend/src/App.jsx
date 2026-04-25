import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { useInterview } from "./context/InterviewContext";
import HomePage from "./pages/HomePage";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";
import AnalysisPage from "./pages/AnalysisPage";
function InterviewRoute() {
  const { analysis, questions } = useInterview();

  if (!analysis || !questions.length) {
    return <Navigate to="/" replace />;
  }

  return <InterviewPage />;
}

function ResultsRoute() {
  const { results, summary } = useInterview();

  if (!summary || !results.length) {
    return <Navigate to="/" replace />;
  }

  return <ResultsPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/interview" element={<InterviewRoute />} />
        <Route path="/results" element={<ResultsRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Route>
    </Routes>
  );
}
