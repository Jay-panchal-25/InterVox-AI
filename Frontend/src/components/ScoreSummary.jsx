import {
  buildScoreGroups,
  clampScore,
  getScoreLabel,
  getScoreTone,
} from "../lib/score";

function ScoreBar({ label, score, hint }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{label}</p>
          <p className="text-sm text-slate-400">{hint}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreTone(score)}`}>
          {score}/10
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreSummary({ result }) {
  const overall = clampScore(result.overall_score);
  const groups = buildScoreGroups(result);

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <div className="rounded-[28px] border border-cyan-400/20 bg-[#06111f] p-6 text-white">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overall</p>
        <p className="mt-4 text-5xl font-semibold">{overall}</p>
        <p className="mt-2 text-base text-slate-300">{getScoreLabel(overall)}</p>
      </div>

      <div className="grid gap-3">
        {groups.map((group) => (
          <ScoreBar key={group.label} {...group} />
        ))}
      </div>
    </div>
  );
}
