// src/pages/AnalysisPage.jsx

import { useInterview } from "../context/InterviewContext";

export default function AnalysisPage() {
  const { analysis, questions, startInterview, current, results } = useInterview();

  const interviewStarted = results.length > 0 || current > 0;

  if (!analysis) {
    return (
      <div className="p-6 text-white">
        <p>No analysis found. Go back and upload your resume.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4">
      {/* Scores */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-cyan-400/20 bg-[#06111f] p-5 text-white">
          <p className="text-sm text-slate-400">ATS score</p>
          <p className="mt-3 text-4xl font-semibold">{analysis.ats_score}/100</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5 text-white">
          <p className="text-sm text-slate-400">JD match score</p>
          <p className="mt-3 text-4xl font-semibold">{analysis.jd_match_score}/100</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
        <p className="text-sm font-semibold text-white">Resume feedback</p>
        <p className="mt-3 text-sm text-slate-400">{analysis.feedback}</p>
      </div>

      {/* Strengths / Mistakes / Suggestions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
          <p className="text-white font-semibold">Strengths</p>
          {(analysis.strengths || []).map((item, i) => (
            <p key={i} className="text-sm text-slate-400 mt-2">{item}</p>
          ))}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
          <p className="text-white font-semibold">Mistakes</p>
          {(analysis.mistakes || []).map((item, i) => (
            <p key={i} className="text-sm text-slate-400 mt-2">{item}</p>
          ))}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
          <p className="text-white font-semibold">Suggestions</p>
          {(analysis.suggestions || []).map((item, i) => (
            <p key={i} className="text-sm text-slate-400 mt-2">{item}</p>
          ))}
        </div>
      </div>

      {/* Keywords Section */}
<div className="grid gap-4 lg:grid-cols-2">
  {/* Matched */}
  <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
    <p className="text-sm font-semibold text-white">Matched Keywords</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {(analysis.matched_keywords || []).length ? (
        analysis.matched_keywords.map((item) => (
          <span
            key={item}
            className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
          >
            {item}
          </span>
        ))
      ) : (
        <p className="text-sm text-slate-400">No matches found</p>
      )}
    </div>
  </div>

  {/* Missing */}
  <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
    <p className="text-sm font-semibold text-white">Missing Keywords</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {(analysis.missing_keywords || []).length ? (
        analysis.missing_keywords.map((item) => (
          <span
            key={item}
            className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200"
          >
            {item}
          </span>
        ))
      ) : (
        <p className="text-sm text-slate-400">No major gaps</p>
      )}
    </div>
  </div>
</div>

      {/* Interview Button */}
      <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-[22px] border border-white/10">
        <p className="text-sm text-slate-400">
          {questions.length} interview questions ready
        </p>

        <button
          onClick={startInterview}
          disabled={!questions.length}
          className="bg-cyan-400 px-6 py-2 rounded-full text-black font-semibold"
        >
          {interviewStarted ? "Continue Interview" : "Start Interview"}
        </button>
      </div>
    </div>
  );
}