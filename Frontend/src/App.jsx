import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8000";

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

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getScoreTone = (score = 0) => {
  if (score >= 8) {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
  }
  if (score >= 6) {
    return "border-amber-400/40 bg-amber-500/10 text-amber-200";
  }
  return "border-rose-400/40 bg-rose-500/10 text-rose-200";
};

function FilePickerCard({ label, hint, file, onChange }) {
  return (
    <label className="group flex cursor-pointer flex-col rounded-[28px] border border-white/12 bg-white/8 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            {label}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{hint}</h3>
        </div>
        <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
          {file ? "Ready" : "Upload"}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 px-4 py-5 text-sm text-slate-300 transition group-hover:border-cyan-300/35 group-hover:text-white">
        {file ? (
          <div className="space-y-1">
            <p className="truncate text-base font-medium text-white">
              {file.name}
            </p>
            <p className="text-slate-400">{formatFileSize(file.size)}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-white">Drop file here or browse</p>
            <p className="text-slate-400">Accepted formats: TXT, PDF, DOCX</p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept=".txt,.pdf,.docx"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function MetricCard({ label, value, tone = "default" }) {
  const toneClasses =
    tone === "highlight"
      ? "border-cyan-300/30 bg-cyan-300/10 text-white"
      : "border-white/10 bg-white/6 text-slate-200";

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);

  const currentQuestion = questions[current];
  const currentQuestionText = currentQuestion ? getQuestionText(currentQuestion) : "";
  const interviewComplete = questions.length > 0 && current >= questions.length;
  const progress = questions.length ? Math.round((current / questions.length) * 100) : 0;

  const averageScore = useMemo(() => {
    if (!results.length) return 0;

    const total = results.reduce(
      (sum, result) => sum + Number(result.overall_score || 0),
      0,
    );

    return (total / results.length).toFixed(1);
  }, [results]);

  const speak = (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
    };

    recognition.onerror = () => {
      alert("Microphone access failed. Please try again.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    if (currentQuestionText) {
      speak(currentQuestionText);
    }
  }, [currentQuestionText]);

  const generateQuestions = async () => {
    if (!resumeFile || !jdFile) {
      alert("Upload both files to generate interview questions.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jd", jdFile);

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      const parsed = parseJsonSafely(data.result);
      const allQuestions = [
        ...(parsed.technical || []),
        ...(parsed.project_based || []),
        ...(parsed.scenario_based || []),
        ...(parsed.hr || []),
      ];

      setQuestions(allQuestions);
      setCurrent(0);
      setResults([]);
      setAnswer("");
    } catch (error) {
      console.error(error);
      alert("Question generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Add an answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);

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
        return;
      }

      const parsed = parseJsonSafely(data.result);

      setResults((previous) => [
        ...previous,
        {
          question: currentQuestionText,
          ...parsed,
        },
      ]);

      if (parsed.feedback) {
        speak(`Score ${parsed.overall_score || 0}. ${parsed.feedback}`);
      }

      setAnswer("");
      setCurrent((previous) => previous + 1);
    } catch (error) {
      console.error(error);
      alert("Evaluation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.14),_transparent_24%),linear-gradient(180deg,_#07111f_0%,_#0b1324_48%,_#030712_100%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="rounded-[36px] border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <header className="flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/80">
                InterVox AI
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Professional interview practice with a sharper, cleaner flow.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Upload a resume and job description, generate role-specific
                questions, answer with voice or text, and review structured
                interview feedback in one focused workspace.
              </p>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-xl">
              <MetricCard
                label="Questions"
                value={questions.length || "--"}
                tone="highlight"
              />
              <MetricCard
                label="Completed"
                value={results.length || 0}
              />
              <MetricCard
                label="Average"
                value={results.length ? averageScore : "--"}
              />
            </div>
          </header>

          {questions.length === 0 && (
            <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <div className="rounded-[30px] border border-white/10 bg-slate-950/35 p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                      Interview Prep
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                      Voice Enabled
                    </span>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <FilePickerCard
                      label="Resume"
                      hint="Candidate profile"
                      file={resumeFile}
                      onChange={setResumeFile}
                    />
                    <FilePickerCard
                      label="Job Description"
                      hint="Target opportunity"
                      file={jdFile}
                      onChange={setJdFile}
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Ready to build your question set
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        We will generate technical, project-based, scenario, and
                        HR prompts from your profile.
                      </p>
                    </div>
                    <button
                      onClick={generateQuestions}
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-500"
                    >
                      {loading ? "Generating questions..." : "Generate questions"}
                    </button>
                  </div>
                </div>
              </div>

              <aside className="grid gap-4">
                <div className="rounded-[30px] border border-white/10 bg-white/6 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Workflow
                  </p>
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        1. Upload source material
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Add your resume and the job description you want to
                        practice for.
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        2. Answer naturally
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Use the microphone or type your answer with full control
                        over pacing.
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        3. Review feedback
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        See scoring, strengths, and improvement suggestions in a
                        clean report.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,255,255,0.04))] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">
                    Best Results
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
                    <li>Use a resume with project details and measurable impact.</li>
                    <li>Choose a specific job description instead of a generic role.</li>
                    <li>Answer in complete thoughts to get stronger feedback quality.</li>
                  </ul>
                </div>
              </aside>
            </section>
          )}

          {questions.length > 0 && !interviewComplete && (
            <section className="grid gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr]">
              <aside className="space-y-4">
                <div className="rounded-[30px] border border-white/10 bg-white/6 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Session Progress
                  </p>
                  <div className="mt-5 rounded-2xl bg-slate-950/45 p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Current question</p>
                        <p className="mt-1 text-3xl font-semibold text-white">
                          {current + 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Completed</p>
                        <p className="mt-1 text-2xl font-semibold text-cyan-200">
                          {progress}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-200 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      {results.length} of {questions.length} answered
                    </p>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-slate-950/35 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Interview Tips
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    <li>Lead with the outcome, then explain your process.</li>
                    <li>Use examples, tradeoffs, and measurable impact when possible.</li>
                    <li>Keep answers structured so feedback can score them accurately.</li>
                  </ul>
                </div>
              </aside>

              <div className="space-y-5">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Live Interview
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">
                        Question {current + 1} of {questions.length}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(currentQuestionText)}
                      className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
                    >
                      Replay question
                    </button>
                  </div>

                  <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-slate-950/45 p-6">
                    <p className="text-lg leading-8 text-slate-100">
                      {currentQuestionText}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">Your answer</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Type normally or capture a voice response.
                        </p>
                      </div>
                      <button
                        onClick={startListening}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          listening
                            ? "bg-rose-400 text-slate-950"
                            : "border border-white/15 bg-white/8 text-white hover:bg-white/12"
                        }`}
                      >
                        {listening ? "Listening..." : "Use microphone"}
                      </button>
                    </div>

                    <textarea
                      placeholder="Explain your approach clearly, mention the tools you used, and highlight impact."
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      className="min-h-56 rounded-[28px] border border-white/12 bg-slate-950/55 px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-400">
                      Feedback is generated after each answer to keep the session focused.
                    </p>
                    <button
                      onClick={submitAnswer}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-500"
                    >
                      {submitting ? "Evaluating..." : "Submit answer"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {interviewComplete && (
            <section className="space-y-8 py-10">
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(255,255,255,0.04))] p-7">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">
                    Interview Report
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    Session complete. Your feedback is ready.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    Review question-by-question performance, identify weak areas,
                    and refine your next practice round with more targeted answers.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <MetricCard label="Average score" value={averageScore} tone="highlight" />
                  <MetricCard label="Questions answered" value={results.length} />
                  <MetricCard
                    label="Strongest area"
                    value={
                      results.length
                        ? results.reduce(
                            (best, result) =>
                              Number(result.overall_score || 0) >
                              Number(best.overall_score || 0)
                                ? result
                                : best,
                            results[0],
                          ).overall_score
                        : "--"
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {results.map((result, index) => (
                  <article
                    key={`${result.question}-${index}`}
                    className="rounded-[28px] border border-white/10 bg-white/6 p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                          Question {index + 1}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          {result.question}
                        </h3>
                      </div>

                      <div
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${getScoreTone(
                          Number(result.overall_score || 0),
                        )}`}
                      >
                        Score {result.overall_score ?? "--"}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <MetricCard label="Accuracy" value={result.technical_accuracy ?? "--"} />
                      <MetricCard label="Depth" value={result.depth ?? "--"} />
                      <MetricCard label="Clarity" value={result.clarity ?? "--"} />
                      <MetricCard label="Structure" value={result.structure ?? "--"} />
                      <MetricCard label="Communication" value={result.communication ?? "--"} />
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                          Feedback
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-200">
                          {result.feedback || "No written feedback returned."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                          Improvements
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {(result.improvement_suggestions || []).length ? (
                            result.improvement_suggestions.map((item, itemIndex) => (
                              <li key={`${item}-${itemIndex}`}>{item}</li>
                            ))
                          ) : (
                            <li>No improvement suggestions returned.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
