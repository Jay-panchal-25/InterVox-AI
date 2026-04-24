import SectionCard from "../components/SectionCard";
import { useInterview } from "../context/useInterview";
import { buildInterviewSummary } from "../lib/interviewSummary";

const getPerformanceTone = (performance) => {
  if (performance === "Strong") return "text-emerald-300";
  if (performance === "Good") return "text-cyan-300";
  if (performance === "Needs work") return "text-amber-300";
  return "text-rose-300";
};

export default function ResultsPage() {
  const { results } = useInterview();
  const summary = buildInterviewSummary(results);

  return (
    <div className="space-y-6">
      <SectionCard title="Interview Summary" description="One final view of your overall performance.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-cyan-400/20 bg-[#06111f] p-5 text-white">
            <p className="text-sm text-slate-400">Total score</p>
            <p className="mt-3 text-4xl font-semibold">
              {summary.totalScore} / {summary.maxScore}
            </p>
            <p className="mt-2 text-sm text-slate-300">Average {summary.averageScore} / 10</p>
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
              {summary.improvementSuggestions.length ? (
                summary.improvementSuggestions.map((item, index) => (
                  <p key={`${item}-${index}`}>{item}</p>
                ))
              ) : (
                <p>No improvement suggestions returned.</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
