import { useState, useRef } from "react";
import { api } from "../api";

export default function ResumeUpload({ onComplete }) {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [backendOk, setBackendOk] = useState(null); // null=unchecked, true, false
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
    else setError("Please upload a PDF file.");
  };

  const checkBackend = async () => {
    setBackendOk(null);
    try {
      await api.healthCheck();
      setBackendOk(true);
    } catch {
      setBackendOk(false);
    }
  };

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) return;
    setLoading(true);
    setError("");
    try {
      setStep("Parsing resume...");
      const resumeData = await api.uploadResume(file);
      console.log("Resume parsed:", resumeData);

      setStep("Scoring resume against job description...");
      const resumeScoreData = await api.scoreResume(
        resumeData.resume_id,
        jobDescription
      );
      console.log("Resume score:", resumeScoreData);

      setStep("Generating resume suggestions...");
      let suggestionsData = null;
      try {
        suggestionsData = await api.resumeSuggestions(
          resumeData.resume_id,
          jobDescription
        );
        console.log("Resume suggestions:", suggestionsData);
      } catch (e) {
        console.warn("Resume suggestions failed:", e);
      }

      setStep("Ready!");
      onComplete({
        resumeData,
        resumeScore: resumeScoreData.match_score,
        resumeScoreData,
        resumeSuggestions: suggestionsData,
        jobRole,
        jobDescription,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="mb-2 font-display text-[28px] font-extrabold tracking-[-0.03em] text-amber">
        InterVox <span className="text-teal">AI</span>
      </div>
      <div className="mb-[60px] font-mono text-[12px] uppercase tracking-[0.18em] text-text-muted">
        Voice-Powered Interview Simulator
      </div>

      <div className="flex w-full max-w-[520px] flex-col gap-7 rounded-base border border-border bg-bg-card p-12 shadow-card animate-fade-up">
        <div>
          <div className="font-display text-[24px] font-bold leading-tight text-text-primary">
            Upload your resume
          </div>
          <div className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">
            We will parse your skills and generate tailored interview questions in
            real-time.
          </div>
        </div>

        <div
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-base border-2 border-dashed p-9 transition ${
            dragging ? "border-amber bg-amber-glow" : "border-[rgba(255,255,255,0.12)]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="text-amber" width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <polyline
              points="14 2 14 8 20 8"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          {file ? (
            <div className="flex items-center gap-2.5 rounded-sm border border-border-glow bg-amber-dim px-4 py-2.5 font-mono text-[13px] text-amber">
              <span>PDF</span>
              <span>{file.name}</span>
            </div>
          ) : (
            <div className="text-center font-mono text-[13px] text-text-secondary">
              Drop your PDF here
              <br />
              <span className="text-text-muted">or click to browse</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) {
              setFile(f);
              setError("");
            }
          }}
        />

        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Target Role
          </div>
          <input
            className="w-full rounded-sm border border-border bg-bg px-4 py-3 font-body text-[14px] text-text-primary outline-hidden transition focus:border-amber"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g. Full Stack Developer"
          />
        </div>

        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Job Description
          </div>
          <textarea
            className="min-h-[120px] w-full resize-y rounded-sm border border-border bg-bg px-4 py-3 font-body text-[14px] text-text-primary outline-hidden transition focus:border-amber"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={checkBackend}
            className="rounded-sm border border-border bg-transparent px-3.5 py-1.5 font-mono text-[11px] tracking-[0.06em] text-text-muted"
          >
            Test Backend Connection
          </button>
          {backendOk === true && (
            <span className="font-mono text-[11px] text-teal">Backend online</span>
          )}
          {backendOk === false && (
            <span className="font-mono text-[11px] text-red">Backend offline</span>
          )}
        </div>

        {loading && step && (
          <div className="flex items-center gap-2.5 font-mono text-[13px] text-amber">
            <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[rgba(8,12,20,0.3)] border-t-[#080c14]" />
            {step}
          </div>
        )}

        {error && (
          <div className="rounded-sm border border-red/20 bg-red-dim px-3.5 py-2.5 font-mono text-[12px] text-red">
            <strong>Error</strong>
            <br />
            {error}
            <br />
            <span className="text-[11px] opacity-70">
              Check the browser Console (F12) for more details.
            </span>
          </div>
        )}

        <button
          className={`rounded-sm py-3.5 font-display text-[15px] font-bold tracking-[0.02em] text-[#080c14] transition ${
            !file || loading || !jobDescription.trim()
              ? "cursor-not-allowed bg-amber/30"
              : "bg-amber hover:opacity-90"
          }`}
          disabled={!file || loading || !jobDescription.trim()}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <span className="mr-2 inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[rgba(8,12,20,0.3)] border-t-[#080c14]" />
              Working...
            </>
          ) : (
            "Start Interview ->"
          )}
        </button>
      </div>
    </div>
  );
}
