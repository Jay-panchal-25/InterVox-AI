import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileDropCard from "../components/FileDropCard";
import SectionCard from "../components/SectionCard";
import { useInterview } from "../context/InterviewContext";

export default function HomePage() {
  const { analysis, loading, prepareInterview } = useInterview();

  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");

  const navigate = useNavigate();

  // 🚀 Redirect when analysis is ready
  useEffect(() => {
    if (analysis && !loading) {
      navigate("/analysis", { replace: true });
    }
  }, [analysis, loading, navigate]);

  return (
    <div className="grid gap-4">
      <SectionCard
        title="Resume Analysis"
        description="Upload or paste your resume and job description."
        className="lg:min-h-[calc(100vh-12rem)]"
      >
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <FileDropCard
            label="Resume"
            file={resumeFile}
            onChange={setResumeFile}
            textValue={resumeText}
            onTextChange={setResumeText}
          />

          <FileDropCard
            label="Job Description"
            file={jdFile}
            onChange={setJdFile}
            textValue={jdText}
            onTextChange={setJdText}
          />
        </div>

        <div className="mt-4 flex justify-between items-center bg-[#0f172a] p-4 rounded-[22px] border border-white/10">
          <p className="text-sm text-slate-400">
            Upload or paste content to analyze
          </p>

          <button
            onClick={() =>
              prepareInterview({
                resumeFile,
                jdFile,
                resumeText,
                jdText,
              })
            }
            disabled={loading}
            className="bg-cyan-400 px-6 py-3 rounded-full text-black font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}