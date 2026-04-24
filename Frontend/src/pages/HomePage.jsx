import { useState } from "react";
import FileDropCard from "../components/FileDropCard";
import SectionCard from "../components/SectionCard";
import { useInterview } from "../context/useInterview";

export default function HomePage() {
  const { generateQuestions, loading } = useInterview();
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");

  return (
    <div className="grid gap-4">
      <SectionCard
        title="Start Interview Setup"
        description="Add your resume and job description, then generate your interview questions."
        className="lg:min-h-[calc(100vh-12rem)]"
      >

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <FileDropCard
            label="Resume"
            hint="Your background"
            file={resumeFile}
            onChange={setResumeFile}
            textValue={resumeText}
            onTextChange={setResumeText}
            textPlaceholder="Paste your resume here."
          />
          <FileDropCard
            label="Job Description"
            hint="Target role"
            file={jdFile}
            onChange={setJdFile}
            textValue={jdText}
            onTextChange={setJdText}
            textPlaceholder="Paste the role description, skills, and requirements here."
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-[#0f172a] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Use either text or file upload in each card. One method per section is enough.
          </p>
          <button
            type="button"
            onClick={() =>
              generateQuestions({
                resumeFile,
                jdFile,
                resumeText,
                jdText,
              })
            }
            disabled={loading}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200"
          >
            {loading ? "Generating..." : "Generate questions"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
