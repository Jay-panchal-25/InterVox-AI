import SectionCard from "../components/SectionCard";
import { useInterview } from "../context/InterviewContext";

const getPerformanceTone = (performance) => {
  if (performance === "Strong") return "text-emerald-300";
  if (performance === "Good") return "text-cyan-300";
  if (performance === "Needs work") return "text-amber-300";
  return "text-rose-300";
};

export default function ResultsPage() {
  const { analysis, results, summary } = useInterview();

  return (
    <div className="space-y-6">
      <SectionCard title="Interview Summary" description="One final view of your overall performance.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-cyan-400/20 bg-[#06111f] p-5 text-white">
            <p className="text-sm text-slate-400">Total score</p>
            <p className="mt-3 text-4xl font-semibold">
              {summary.total_score} / {summary.max_score}
            </p>
            <p className="mt-2 text-sm text-slate-300">Average {summary.average_score} / 10</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
            <p className="text-sm text-slate-400">Performance</p>
            <p className={`mt-3 text-4xl font-semibold ${getPerformanceTone(summary.performance)}`}>
              {summary.performance}
            </p>
            <p className="mt-2 text-sm text-slate-400">Overall interview performance</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
            <p className="text-sm font-semibold text-white">Feedback</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{summary.feedback}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
            <p className="text-sm font-semibold text-white">Improvement suggestions</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-400">
              {(summary.improvement_suggestions || []).length ? (
                summary.improvement_suggestions.map((item, index) => (
                  <p key={`${item}-${index}`}>{item}</p>
                ))
              ) : (
                <p>No improvement suggestions returned.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
          <p className="text-sm font-semibold text-white">Score breakdown</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {(summary.dimension_scores || []).map((item) => (
              <div key={item.key} className="rounded-[20px] border border-white/10 bg-[#08101f] p-4">
                <p className="text-sm capitalize text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.score}/10</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {analysis ? (
        <SectionCard
          title="Resume Review Recap"
          description="The resume and JD analysis you saw before the interview."
        >
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

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
              <p className="text-sm font-semibold text-white">Resume mistakes</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-400">
                {(analysis.mistakes || []).map((item, index) => (
                  <p key={`results-mistake-${index}`}>{item}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-5">
              <p className="text-sm font-semibold text-white">Resume suggestions</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-400">
                {(analysis.suggestions || []).map((item, index) => (
                  <p key={`results-suggestion-${index}`}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
