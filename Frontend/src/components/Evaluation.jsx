import { useEffect, useState } from "react";
import { api } from "../api";

const scoreColorClass = (score) => {
  if (score >= 7) return "text-teal";
  if (score >= 5) return "text-amber";
  return "text-red";
};

const scoreBadgeClass = (score) => {
  if (score >= 7) return "bg-teal-dim text-teal";
  if (score >= 5) return "bg-amber-dim text-amber";
  return "bg-red-dim text-red";
};

function getVerdict(score) {
  if (score >= 8) return "Outstanding performance";
  if (score >= 7) return "Strong candidate";
  if (score >= 5) return "Good with room to grow";
  return "Keep practicing";
}

export default function Evaluation({ history, jobRole, sessionId, resumeScore, onRestart }) {
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const entries = report?.question_evaluations || history;
  const validEntries = entries.filter((h) => (h.score ?? h.overall_score) != null);
  const avg = validEntries.length
    ? (validEntries.reduce((s, h) => s + (h.score ?? h.overall_score), 0) / validEntries.length).toFixed(1)
    : "N/A";

  const numScore = parseFloat(avg);
  const finalScore = report?.final_score ?? null;
  const interviewScore = report?.interview_score ?? null;
  const resumeScoreValue = report?.resume_score ?? resumeScore ?? null;
  const displayScore = finalScore != null ? finalScore : numScore;
  const displaySuffix = finalScore != null ? "/100" : "/10";
  const displayScoreText = Number.isFinite(displayScore) ? displayScore.toFixed(1) : "N/A";
  const verdictScore = finalScore != null ? finalScore / 10 : numScore;

  useEffect(() => {
    const canFetch = sessionId && typeof resumeScore === "number";
    if (!canFetch) return;
    setLoadingReport(true);
    setReportError("");
    api.finalReport(sessionId, resumeScore)
      .then((data) => {
        setReport(data);
      })
      .catch((err) => {
        setReportError(err?.message || "Failed to load final report.");
      })
      .finally(() => {
        setLoadingReport(false);
      });
  }, [sessionId, resumeScore]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center px-6 py-14">
      <div className="mb-10 font-display text-[22px] font-extrabold tracking-[-0.03em] text-amber">
        InterVox <span className="text-teal">AI</span>
      </div>

      <div className="mb-6 flex w-full max-w-[680px] flex-col items-center gap-3 rounded-base border border-border bg-bg-card p-10 shadow-amber animate-fade-up">
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
          {finalScore != null ? "Final Score" : "Overall Score"}
        </div>
        <div
          className={`font-display text-[72px] font-extrabold leading-none tracking-[-0.04em] ${scoreColorClass(verdictScore)}`}
        >
          {displayScoreText}
          <span className="text-[32px] opacity-40">{displaySuffix}</span>
        </div>
        <div className="mt-2 font-display text-[20px] font-semibold text-text-primary">
          {getVerdict(verdictScore)}
        </div>
        <div className="font-mono text-[12px] text-text-muted">
          Role: {jobRole} - {entries.length} question{entries.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loadingReport && (
        <div className="w-full max-w-[680px] rounded-sm border border-border bg-bg px-3.5 py-3 font-mono text-[12px] leading-relaxed text-text-secondary">
          Loading final report...
        </div>
      )}

      {reportError && (
        <div className="w-full max-w-[680px] rounded-sm border border-red/40 bg-bg px-3.5 py-3 font-mono text-[12px] leading-relaxed text-text-secondary">
          {reportError}
        </div>
      )}

      {report && (
        <div className="mb-8 flex w-full max-w-[680px] flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-base border border-border bg-bg-card p-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Final Report</span>
              <span className={`rounded-full px-2.5 py-1 font-mono text-[13px] font-medium ${scoreBadgeClass(verdictScore)}`}>
                {displayScoreText}{displaySuffix}
              </span>
            </div>
            <div className="rounded-sm border border-border bg-bg px-3.5 py-3 font-mono text-[12px] leading-relaxed text-text-secondary">
              <div>Resume Score: {resumeScoreValue?.toFixed(1)}/100</div>
              <div>Interview Score: {interviewScore?.toFixed(1)}/100</div>
              <div>Final Score: {finalScore?.toFixed(1)}/100</div>
            </div>
            {report.strengths?.length > 0 && (
              <div className="border-t border-border pt-2 text-[13px] leading-relaxed text-text-secondary">
                <strong className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-primary">Strengths</strong>
                <br />{report.strengths.join("; ")}
              </div>
            )}
            {report.improvements?.length > 0 && (
              <div className="border-t border-border pt-2 text-[13px] leading-relaxed text-text-secondary">
                <strong className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-primary">Improvements</strong>
                <br />{report.improvements.join("; ")}
              </div>
            )}
            {report.overall_feedback && (
              <div className="border-t border-border pt-2 text-[13px] leading-relaxed text-text-secondary">
                <strong className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-primary">Overall Feedback</strong>
                <br />{report.overall_feedback}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex w-full max-w-[680px] flex-col gap-4">
        {entries.map((h, i) => {
          const scoreValue = h.score ?? h.overall_score ?? 0;
          return (
            <div key={i} className="flex flex-col gap-3.5 rounded-base border border-border bg-bg-card p-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Question {i + 1}</span>
                {scoreValue != null && (
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[13px] font-medium ${scoreBadgeClass(scoreValue)}`}>
                    {scoreValue}/10
                  </span>
                )}
              </div>

              <div className="font-display text-[16px] font-semibold leading-snug text-text-primary">{h.question}</div>

              <div className="rounded-sm border border-border bg-bg px-3.5 py-3 font-mono text-[12px] leading-relaxed text-text-secondary">
                <span className="text-[10px] uppercase tracking-[0.1em] text-text-muted">Your answer - </span>
                {h.answer}
              </div>

              {h.feedback && (
                <div className="border-t border-border pt-2 text-[13px] leading-relaxed text-text-secondary">
                  <strong className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-primary">Feedback</strong>
                  <br />{h.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="mt-2 rounded-sm bg-amber px-10 py-3.5 font-display text-[15px] font-bold tracking-[0.02em] text-[#080c14] transition hover:opacity-90"
        onClick={onRestart}
      >
        Start New Interview 
      </button>
    </div>
  );
}