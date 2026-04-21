import { useState, useEffect } from "react";

export default function App() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);

  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  // =========================
  // 🔊 SPEAK FUNCTION
  // =========================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  // =========================
  // 🎤 LISTEN FUNCTION
  // =========================
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported (use Chrome)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("User said:", transcript);
      setAnswer(transcript);
    };

    recognition.onerror = (err) => {
      console.error(err);
      alert("Mic error");
    };

    recognition.start();
  };

  // =========================
  // 🔊 AUTO SPEAK QUESTION
  // =========================
  useEffect(() => {
    if (questions.length > 0 && current < questions.length) {
      const q =
        typeof questions[current] === "object"
          ? questions[current].question
          : questions[current];

      speak(q);
    }
  }, [current, questions]);

  // =========================
  // GENERATE QUESTIONS
  // =========================
  const generateQuestions = async () => {
    if (!resume.trim() || !jd.trim()) {
      alert("Enter Resume and Job Description");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resume.slice(0, 1500),
          jd: jd.slice(0, 1500),
        }),
      });

      const data = await res.json();
      console.log("Raw response:", data);

      // 🔥 Handle string JSON issue
      let parsed = data;
      if (data.result) {
        try {
          parsed = JSON.parse(data.result);
        } catch (e) {
          alert("JSON parsing failed");
          return;
        }
      }

      const allQuestions = [
        ...(parsed.technical || []),
        ...(parsed.project_based || []),
        ...(parsed.scenario_based || []),
        ...(parsed.hr || []),
      ];

      if (allQuestions.length === 0) {
        alert("No questions received");
        return;
      }

      setQuestions(allQuestions);
    } catch (err) {
      console.error(err);
      alert("Request failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUBMIT ANSWER
  // =========================
  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Speak or type an answer");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question:
            typeof questions[current] === "object"
              ? questions[current].question
              : questions[current],
          answer,
        }),
      });

      const data = await res.json();
      console.log("Evaluation:", data);

      setResults([...results, data]);
      setAnswer("");

      // 🔊 Speak feedback
      speak(`Score ${data.overall_score}. ${data.feedback}`);

      setCurrent(current + 1);
    } catch (err) {
      console.error(err);
      alert("Evaluation failed");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">InterVox AI</h1>

      {/* INPUT SCREEN */}
      {questions.length === 0 && (
        <div className="w-full max-w-2xl space-y-4">
          <textarea
            placeholder="Paste Resume..."
            className="w-full p-3 rounded bg-gray-800 border border-gray-700"
            rows={6}
            onChange={(e) => setResume(e.target.value)}
          />

          <textarea
            placeholder="Paste Job Description..."
            className="w-full p-3 rounded bg-gray-800 border border-gray-700"
            rows={6}
            onChange={(e) => setJd(e.target.value)}
          />

          <button
            onClick={generateQuestions}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold disabled:bg-gray-600"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>
      )}

      {/* QUESTION SCREEN */}
      {questions.length > 0 && current < questions.length && (
        <div className="w-full max-w-2xl space-y-4">
          <h2 className="text-xl font-semibold">
            Question {current + 1} / {questions.length}
          </h2>

          <div className="bg-gray-800 p-4 rounded">
            {typeof questions[current] === "object"
              ? questions[current].question
              : questions[current]}
          </div>

          <div className="flex gap-2">
            <textarea
              placeholder="Your Answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              rows={4}
            />

            <button
              onClick={startListening}
              className="bg-yellow-500 px-4 rounded"
            >
              🎤
            </button>
          </div>

          <button
            onClick={submitAnswer}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* RESULT SCREEN */}
      {questions.length > 0 && current === questions.length && (
        <div className="w-full max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold">Final Results</h2>

          {results.map((r, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded">
              <p>Score: {r.overall_score}</p>
              <p>Accuracy: {r.technical_accuracy}</p>
              <p>Clarity: {r.clarity}</p>
              <p>Depth: {r.depth}</p>
              <p className="mt-2 text-gray-300">{r.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}