import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { useInterview } from "./context/useInterview";
import HomePage from "./pages/HomePage";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";

function InterviewRoute() {
  const { questions } = useInterview();

  if (!questions.length) {
    return <Navigate to="/" replace />;
  }

  return <InterviewPage />;
}

function ResultsRoute() {
  const { results } = useInterview();

  if (!results.length) {
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
      </Route>
    </Routes>
  );
}
