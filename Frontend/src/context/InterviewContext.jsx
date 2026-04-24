import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InterviewContext } from "./interview-context";
const API_URL = "http://localhost:8000";
const STORAGE_KEY = "intervox-session";

const parseJsonSafely = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return { feedback: String(value) };
  }
};

const getQuestionText = (question) =>
  typeof question === "object" ? question.question : question;

const normalizeQuestionText = (question) =>
  getQuestionText(question)
    ?.toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const dedupeQuestions = (questions) => {
  const seen = new Set();

  return questions.filter((question) => {
    const normalized = normalizeQuestionText(question);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

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

export function InterviewProvider({ children }) {
  const navigate = useNavigate();
  const storedSession = readStoredSession();

  const [questions, setQuestions] = useState(storedSession?.questions ?? []);
  const [current, setCurrent] = useState(storedSession?.current ?? 0);
  const [answer, setAnswer] = useState(storedSession?.answer ?? "");
  const [results, setResults] = useState(storedSession?.results ?? []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const dictatedBaseRef = useRef("");

  const currentQuestion = questions[current];
  const currentQuestionText = currentQuestion ? getQuestionText(currentQuestion) : "";
  const interviewComplete = questions.length > 0 && current >= questions.length;
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
        questions,
        current,
        answer,
        results,
      }),
    );
  }, [questions, current, answer, results]);

  useEffect(() => {
    if (interviewComplete) {
      navigate("/results", { replace: true });
    }
  }, [interviewComplete, navigate]);

  const averageScore = useMemo(() => {
    if (!results.length) return 0;

    const total = results.reduce(
      (sum, result) => sum + Number(result.overall_score || 0),
      0,
    );

    return Number((total / results.length).toFixed(1));
  }, [results]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    dictatedBaseRef.current = "";
    setListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;

    stopListening();
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  }, [stopListening]);

  const generateQuestions = async ({ resumeFile, jdFile, resumeText, jdText }) => {
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

      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return false;
      }

      const parsed = parseJsonSafely(data.result);
      const allQuestions = dedupeQuestions([
        ...(parsed.technical || []),
        ...(parsed.project_based || []),
        ...(parsed.scenario_based || []),
        ...(parsed.hr || []),
      ]);

      setQuestions(allQuestions);
      setCurrent(0);
      setResults([]);
      setAnswer("");
      navigate("/interview");
      return true;
    } catch (error) {
      console.error(error);
      alert("Question generation failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Add an answer before submitting.");
      return false;
    }

    try {
      setSubmitting(true);
      stopListening();

      const response = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestionText,
          answer,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return false;
      }

      const parsed = parseJsonSafely(data.result);
      const nextQuestionIndex = current + 1;
      const nextQuestion = questions[nextQuestionIndex];
      const nextQuestionText = nextQuestion ? getQuestionText(nextQuestion) : "";

      setResults((previous) => [
        ...previous,
        {
          question: currentQuestionText,
          answer,
          ...parsed,
        },
      ]);

      setAnswer("");
      setCurrent(nextQuestionIndex);

      if (nextQuestionText) {
        speak(nextQuestionText);
      }

      return true;
    } catch (error) {
      console.error(error);
      alert("Evaluation failed.");
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

      const base = dictatedBaseRef.current;
      const nextAnswer = [base, finalTranscript.trim(), interimTranscript.trim()]
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
    setQuestions([]);
    setCurrent(0);
    setAnswer("");
    setResults([]);
    setListening(false);
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    navigate("/");
  };

  const value = {
    answer,
    averageScore,
    current,
    currentQuestionText,
    interviewComplete,
    listening,
    loading,
    progress,
    questions,
    results,
    setAnswer,
    speak,
    startListening,
    stopListening,
    submitAnswer,
    submitting,
    generateQuestions,
    resetInterview,
    answeredCount,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}
