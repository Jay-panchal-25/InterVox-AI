import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import VoiceRecorder from "./VoiceRecorder";

const scoreChipClass = (score) => {
  if (score >= 7) return "bg-teal-dim text-teal";
  if (score >= 5) return "bg-amber-dim text-amber";
  return "bg-red-dim text-red";
};

export default function Interview({ session, resumeData, jobRole, jobDescription, onEnd }) {
  const [question, setQuestion] = useState(session.first_question || session.question || "");
  const [questionAudioUrl, setQuestionAudioUrl] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const totalQuestions = session.total_questions || 5;
  const initialIndex = Math.max(0, (session.question_number || 1) - 1);
  const [qIndex, setQIndex] = useState(initialIndex);
  const audioRef = useRef(null);
  const urlPoolRef = useRef([]);

  useEffect(() => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentAudioUrl]);

  useEffect(() => {
    if (!question || !session?.session_id) return;
    let isActive = true;
    api.tts(session.session_id, question).then((url) => {
      if (!isActive) return;
      urlPoolRef.current.push(url);
      setQuestionAudioUrl(url);
      setCurrentAudioUrl(url);
    }).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [question, session?.session_id]);

  useEffect(() => {
    return () => {
      urlPoolRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlPoolRef.current = [];
    };
  }, []);

  const handleAnswer = async (answer) => {
    setLoading(true);
    try {
      const evalResult = await api.evaluateAnswer(session.session_id, question, answer);

      const newEntry = {
        question,
        answer,
        score: evalResult.overall_score,
        feedback: evalResult.feedback
      };

      if (evalResult?.feedback && session?.session_id) {
        api.tts(session.session_id, evalResult.feedback).then((url) => {
          urlPoolRef.current.push(url);
          setCurrentAudioUrl(url);
        }).catch(() => {});
      }
      const newHistory = [...history, newEntry];
      setHistory(newHistory);

      const newIndex = qIndex + 1;
      if (newIndex >= totalQuestions) {
        onEnd(newHistory);
        return;
      }

      const next = await api.nextQuestion(session.session_id);
      if (next.is_last || !next.question) {
        onEnd(newHistory);
        return;
      }
      setQIndex(newIndex);
      setQuestion(next.question);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-10 py-5 backdrop-blur-md">
        <div className="font-display text-[20px] font-extrabold tracking-[-0.03em] text-amber">
          InterVox <span className="text-teal">AI</span>
        </div>
        <div className="rounded-full border border-teal/20 bg-teal-dim px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-teal">
          LIVE SESSION
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-text-muted">
            Q{qIndex + 1}/{totalQuestions}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i < qIndex ? "bg-amber" : "bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 items-start px-10 py-10">
        <div className="flex flex-1 flex-col gap-6 pr-12">
          <div className="flex items-center gap-3.5 rounded-base border border-border bg-bg-card px-5 py-4">
            <div className="relative h-[72px] w-[72px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#f8fafc,#94a3b8)] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <div className="absolute left-[22px] top-[24px] h-2 w-2 rounded-full bg-[#0f172a]" />
              <div className="absolute left-[44px] top-[24px] h-2 w-2 rounded-full bg-[#0f172a]" />
              <div
                className={`absolute bottom-[18px] left-[26px] w-[20px] rounded-b-[12px] bg-[#0f172a] transition-[height] duration-150 ${
                  speaking ? "h-[12px]" : "h-[6px]"
                }`}
              />
            </div>
            <div>
              <div className="font-display text-[16px] font-bold">Interviewer</div>
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-text-secondary">
                {speaking ? "Speaking" : "Listening"}
              </div>
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber">
              Question {qIndex + 1} of {totalQuestions}
            </div>
            <div className="h-3" />
            <div className="font-display text-[26px] font-semibold leading-[1.35] text-text-primary animate-fade-up" key={question}>
              {question}
            </div>
          </div>

          <audio
            ref={audioRef}
            src={currentAudioUrl || undefined}
            className="hidden"
            onPlay={() => setSpeaking(true)}
            onEnded={() => setSpeaking(false)}
          />
          {questionAudioUrl && (
            <button
              className="flex w-fit items-center gap-2 rounded-full border border-teal/20 bg-teal-dim px-4 py-2 font-mono text-[12px] text-teal transition hover:bg-teal/20"
              onClick={() => setCurrentAudioUrl(questionAudioUrl)}
            >
              <svg className="text-teal" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <polygon points="2,1 11,6 2,11" fill="currentColor" />
              </svg>
              Replay question audio
            </button>
          )}

          <hr className="my-2 border-t border-border" />

          <div className="rounded-base border border-border bg-bg-card p-8">
            {loading ? (
              <div className="flex items-center gap-2.5 font-mono text-[13px] text-text-muted">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-amber" />
                Evaluating your answer...
              </div>
            ) : (
              <VoiceRecorder onSubmit={handleAnswer} disabled={loading} />
            )}
          </div>

          <button
            className="rounded-sm border border-border px-5 py-2.5 font-mono text-[12px] tracking-[0.05em] text-text-muted transition-colors hover:border-red/30 hover:text-red"
            onClick={() => onEnd(history)}
          >
            End Interview Early
          </button>
        </div>

        <div className="sticky top-[88px] flex w-[340px] shrink-0 flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-base border border-border bg-bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">Role</div>
            <div className="font-display text-[16px] font-semibold">{jobRole}</div>
            {resumeData?.name && (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">Candidate</div>
                <div className="text-[14px] text-text-secondary">{resumeData.name}</div>
              </>
            )}
          </div>

          {history.length > 0 && (
            <div className="flex flex-col gap-3.5 rounded-base border border-border bg-bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                Answered ({history.length})
              </div>
              {history.map((h, i) => (
                <div key={i} className="border-b border-border pb-3.5">
                  <div className="mb-1 text-[12px] leading-snug text-text-secondary">
                    Q{i + 1}: {h.question.length > 60 ? h.question.slice(0, 60) + "..." : h.question}
                  </div>
                  <div className="font-mono text-[11px] leading-snug text-text-muted">
                    {h.answer.length > 80 ? h.answer.slice(0, 80) + "..." : h.answer}
                  </div>
                  {h.score != null && (
                    <div
                      className={`mt-1 inline-block rounded-[4px] px-2 py-0.5 font-mono text-[12px] font-medium ${scoreChipClass(h.score)}`}
                    >
                      Score: {h.score}/10
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}