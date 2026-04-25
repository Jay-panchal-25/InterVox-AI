import SectionCard from "../components/SectionCard";
import { useInterview } from "../context/InterviewContext";

export default function InterviewPage() {
  const {
    answer,
    current,
    currentQuestionText,
    listening,
    progress,
    questions,
    setAnswer,
    speak,
    startListening,
    stopListening,
    submitAnswer,
    submitting,
    answeredCount,
  } = useInterview();

  const currentQuestionNumber = Math.min(current + 1, questions.length);

  const handleAnswerChange = (value) => {
    if (listening) {
      stopListening();
    }

    setAnswer(value);
  };

  return (
    <div className="grid gap-6">
      <SectionCard
        title="Interview in progress"
        description="One clear question, one focused answer."
      >
        <div className="rounded-[30px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.96))] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Question {currentQuestionNumber} of {questions.length}
              </span>
              <p className="mt-4 text-sm text-cyan-100/80">
                {answeredCount} answered so far
              </p>
            </div>
            <p className="text-sm font-medium text-cyan-100/80">{progress}% completed</p>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-6 text-2xl font-semibold leading-10 tracking-tight text-white sm:text-[2rem]">
            {currentQuestionText}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => speak(currentQuestionText)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-white"
            >
              Read aloud
            </button>
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                listening
                  ? "bg-rose-500 text-white"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              }`}
            >
              {listening ? "Stop microphone" : "Use microphone"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-white/10 bg-[#0f172a] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-200" htmlFor="answer-box">
                Your answer
              </label>
              <p className="mt-2 text-sm text-slate-400">
                Finish your answer in text or keep dictating with the microphone.
              </p>
            </div>
            <p className="text-sm text-slate-400">
              {currentQuestionNumber === questions.length ? "Last response" : "Answer section"}
            </p>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <textarea
            id="answer-box"
            placeholder="Start with the result, then explain what you did and why."
            value={answer}
            onChange={(event) => handleAnswerChange(event.target.value)}
            className="mt-5 min-h-80 w-full rounded-[28px] border border-white/10 bg-[#08101f] px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#111b31]"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <p className="text-sm text-slate-400">
            Keep the answer concise and specific.
          </p>
          <button
            type="button"
            onClick={submitAnswer}
            disabled={submitting}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200"
          >
            {submitting
              ? currentQuestionNumber === questions.length
                ? "Finishing interview..."
                : "Checking answer..."
              : "Submit answer"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
