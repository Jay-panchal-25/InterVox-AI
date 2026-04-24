import { Outlet } from "react-router-dom";
import { useInterview } from "../context/useInterview";

export default function AppShell() {
  const { resetInterview } = useInterview();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#020617_0%,#071124_50%,#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[24px] border border-cyan-400/10 bg-[#0b1220]/90 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                InterVox AI
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Interview practice workspace
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Add your details, answer clearly, and review your final performance.
              </p>
            </div>
            <button
              type="button"
              onClick={resetInterview}
              className="self-start rounded-full border border-white/10 bg-[#0f172a] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400 hover:text-white sm:self-auto"
            >
              Start over
            </button>
          </div>
        </header>

        <main className="flex-1 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
