import { useState } from "react";
import { api } from "../api";

export default function ResumeInsights({
  resumeData,
  resumeScore,
  resumeScoreData,
  resumeSuggestions,
  jobRole,
  jobDescription,
  onStartInterview,
  onRestart,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const score = resumeScore ?? 0;
  const suggestions = resumeSuggestions?.suggestions || [];
  const summary = resumeSuggestions?.overall_summary || "";

  const handleStart = async () => {
    if (!resumeData?.resume_id) return;
    setLoading(true);
    setError("");
    try {
      const interviewData = await api.startInterview(
        resumeData.resume_id,
        jobDescription || jobRole,
        5,
        jobRole
      );
      onStartInterview(interviewData);
    } catch (err) {
      setError(err?.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center px-6 py-14">
      <div className="mb-6 font-display text-[22px] font-extrabold tracking-[-0.03em] text-amber">
        InterVox <span className="text-teal">AI</span>
      </div>

      <div className="flex w-full max-w-[760px] flex-col gap-5 rounded-base border border-border bg-bg-card p-9 shadow-card animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
              Resume Match
            </div>
            <div className="font-mono text-[12px] text-text-muted">Score: {score.toFixed(1)}/100</div>
            <div className="font-mono text-[12px] text-text-muted">Role: {jobRole}</div>
          </div>
          <div className="font-mono text-[12px] text-text-muted">
            {resumeScoreData?.summary || "Resume analysis completed."}
          </div>
        </div>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
            Matched Skills
          </div>
          <div className="h-2" />
          <div className="flex flex-wrap gap-3">
            {(resumeScoreData?.matched_skills || []).length === 0 && (
              <div className="rounded-sm border border-border bg-bg px-3 py-2.5 font-body text-[14px] leading-relaxed text-text-secondary">
                No matched skills found.
              </div>
            )}
            {(resumeScoreData?.matched_skills || []).slice(0, 12).map((s, i) => (
              <div
                key={i}
                className="rounded-full border border-border bg-teal-dim px-2.5 py-1.5 font-mono text-[11px] text-teal"
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
            Missing Skills
          </div>
          <div className="h-2" />
          <div className="flex flex-wrap gap-3">
            {(resumeScoreData?.missing_skills || []).length === 0 && (
              <div className="rounded-sm border border-border bg-bg px-3 py-2.5 font-body text-[14px] leading-relaxed text-text-secondary">
                No missing skills listed.
              </div>
            )}
            {(resumeScoreData?.missing_skills || []).slice(0, 12).map((s, i) => (
              <div
                key={i}
                className="rounded-full border border-border bg-red-dim px-2.5 py-1.5 font-mono text-[11px] text-red"
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {summary && (
          <div className="rounded-sm border border-border bg-bg px-3 py-2.5 font-body text-[14px] leading-relaxed text-text-secondary">
            <strong className="text-text-primary">Overall Summary</strong>
            <br />{summary}
          </div>
        )}

        {!resumeSuggestions && (
          <div className="rounded-sm border border-red/40 bg-bg px-3 py-2.5 font-body text-[14px] leading-relaxed text-text-secondary">
            LLM suggestions unavailable. Check your GROQ_API_KEY and backend logs.
          </div>
        )}

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
            Suggestions To Improve
          </div>
          <div className="h-2" />
          <div className="flex flex-col gap-2.5">
            {suggestions.length === 0 && (
              <div className="rounded-sm border border-border bg-bg px-3 py-2.5 font-body text-[14px] leading-relaxed text-text-secondary">
                No suggestions available.
              </div>
            )}
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-sm border border-border bg-bg px-3 py-2.5 font-body text-[14px] leading-relaxed text-text-secondary"
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-sm border border-red/40 bg-bg px-3 py-2.5 font-body text-[14px] text-red">
            {error}
          </div>
        )}

        <div className="mt-1.5 flex gap-3">
          <button
            className="rounded-sm bg-amber px-6 py-3 font-display text-[14px] font-bold tracking-[0.02em] text-[#080c14] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-amber/30"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Interview"}
          </button>
          <button
            className="rounded-sm border border-border bg-transparent px-5 py-3 font-mono text-[12px] tracking-[0.05em] text-text-muted"
            onClick={onRestart}
          >
            Upload New Resume
          </button>
        </div>
      </div>
    </div>
  );
}