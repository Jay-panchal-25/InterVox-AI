/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";
const STORAGE_KEY = "intervox-session";

const InterviewContext = createContext(null);

const readStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getErrorMessage = (payload, fallback) =>
  payload?.detail || payload?.error || fallback;

const readResponse = async (response, fallback) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, fallback));
  }

  return payload;
};

export function InterviewProvider({ children }) {
  const navigate = useNavigate();
  const storedSession = readStoredSession();

  const [analysis, setAnalysis] = useState(storedSession?.analysis ?? null);
  const [questions, setQuestions] = useState(storedSession?.questions ?? []);
  const [current, setCurrent] = useState(storedSession?.current ?? 0);
  const [answer, setAnswer] = useState(storedSession?.answer ?? "");
  const [results, setResults] = useState(storedSession?.results ?? []);
  const [summary, setSummary] = useState(storedSession?.summary ?? null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const dictatedBaseRef = useRef("");

  const currentQuestionText = questions[current] || "";
  const answeredCount = Math.min(results.length, questions.length);
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analysis,
        questions,
        current,
        answer,
        results,
        summary,
      }),
    );
  }, [analysis, questions, current, answer, results, summary]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    dictatedBaseRef.current = "";
    setListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) {
      return;
    }

    stopListening();
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  }, [stopListening]);

  const prepareInterview = async ({ resumeFile, jdFile, resumeText, jdText }) => {
    if (!resumeFile && !resumeText?.trim()) {
      alert("Add resume text or upload a resume file.");
      return false;
    }

    if (!jdFile && !jdText?.trim()) {
      alert("Add job description text or upload a job description file.");
      return false;
    }

    const formData = new FormData();

    if (resumeFile) {
      formData.append("resume", resumeFile);
    }
    if (jdFile) {
      formData.append("jd", jdFile);
    }
    if (resumeText?.trim()) {
      formData.append("resume_text", resumeText.trim());
    }
    if (jdText?.trim()) {
      formData.append("jd_text", jdText.trim());
    }

    try {
      setLoading(true);
      stopListening();

      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        body: formData,
      });
      const data = await readResponse(response, "Resume analysis failed.");

      setAnalysis(data.analysis ?? null);
      setQuestions(data.questions ?? []);
      setCurrent(0);
      setResults([]);
      setSummary(null);
      setAnswer("");
      return true;
    } catch (error) {
      console.error(error);
      alert(error.message || "Resume analysis failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    if (!questions.length) {
      return;
    }

    navigate("/interview");
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Add an answer before submitting.");
      return false;
    }

    try {
      setSubmitting(true);
      stopListening();

      const evaluationResponse = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestionText,
          answer,
        }),
      });
      const evaluation = await readResponse(evaluationResponse, "Evaluation failed.");

      const nextResults = [
        ...results,
        {
          question: currentQuestionText,
          answer,
          ...evaluation,
        },
      ];
      const nextQuestionIndex = current + 1;
      const nextQuestionText = questions[nextQuestionIndex] || "";

      setResults(nextResults);
      setAnswer("");
      setCurrent(nextQuestionIndex);

      if (nextQuestionText) {
        speak(nextQuestionText);
        return true;
      }

      const summaryResponse = await fetch(`${API_URL}/interview-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          results: nextResults,
        }),
      });
      const summaryPayload = await readResponse(summaryResponse, "Final summary failed.");

      setSummary(summaryPayload);
      navigate("/results");
      return true;
    } catch (error) {
      console.error(error);
      alert(error.message || "Evaluation failed.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop?.();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    dictatedBaseRef.current = answer;

    setListening(true);

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          finalTranscript += ` ${transcript}`;
        } else {
          interimTranscript += ` ${transcript}`;
        }
      }

      const nextAnswer = [
        dictatedBaseRef.current,
        finalTranscript.trim(),
        interimTranscript.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      setAnswer(nextAnswer);
    };

    recognition.onerror = (event) => {
      const ignoredErrors = ["aborted", "no-speech"];

      if (!ignoredErrors.includes(event.error)) {
        alert("Microphone access failed. Please try again.");
      }

      setListening(false);
      recognitionRef.current = null;
      dictatedBaseRef.current = "";
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      dictatedBaseRef.current = "";
    };

    recognition.start();
  };

  const resetInterview = () => {
    stopListening();
    setAnalysis(null);
    setQuestions([]);
    setCurrent(0);
    setAnswer("");
    setResults([]);
    setSummary(null);
    setListening(false);

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      window.sessionStorage.removeItem(STORAGE_KEY);
    }

    navigate("/");
  };

  return (
    <InterviewContext.Provider
      value={{
        analysis,
        answer,
        answeredCount,
        current,
        currentQuestionText,
        listening,
        loading,
        prepareInterview,
        progress,
        questions,
        resetInterview,
        results,
        setAnswer,
        speak,
        startInterview,
        startListening,
        stopListening,
        submitAnswer,
        submitting,
        summary,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }

  return context;
}
