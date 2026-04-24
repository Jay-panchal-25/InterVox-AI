import { useState } from "react";

const getTabClassName = (active) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    active
      ? "bg-cyan-400 text-slate-950"
      : "bg-[#020617] text-slate-300 hover:bg-[#0b1730] hover:text-white"
  }`;

export default function FileDropCard({
  label,
  hint,
  file,
  onChange,
  textValue,
  onTextChange,
  textPlaceholder,
}) {
  const [inputMode, setInputMode] = useState(file ? "upload" : "text");

  const selectMode = (mode) => {
    setInputMode(mode);

    if (mode === "text") {
      onChange(null);
      return;
    }

    onTextChange("");
  };

  const handleTextChange = (value) => {
    if (inputMode !== "text") {
      setInputMode("text");
      onChange(null);
    }

    onTextChange(value);
  };

  const handleFileChange = (nextFile) => {
    setInputMode("upload");
    onTextChange("");
    onChange(nextFile);
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-[#0f172a] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-sm font-semibold text-cyan-200">{label}</span>
          <p className="mt-1 text-lg font-semibold text-white">{hint}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Choose one input method for this section.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-[#08101f] p-1">
          <button
            type="button"
            onClick={() => selectMode("text")}
            className={getTabClassName(inputMode === "text")}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => selectMode("upload")}
            className={getTabClassName(inputMode === "upload")}
          >
            Upload file
          </button>
        </div>
      </div>

      {inputMode === "text" ? (
        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-200" htmlFor={`${label}-text`}>
            Paste {label.toLowerCase()} text
          </label>
          <textarea
            id={`${label}-text`}
            value={textValue}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder={textPlaceholder}
            className="mt-3 h-19 w-full rounded-[20px] border border-white/10 bg-[#020617] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#061120]"
          />
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-200">Upload {label.toLowerCase()} file</p>
          <label className="mt-3 flex cursor-pointer flex-col rounded-[20px] border border-dashed border-white/15 bg-[#020617] px-4 py-4 text-sm text-slate-400 transition hover:border-cyan-400/60 hover:bg-[#081120]">
            {file ? (
              <div>
                <p className="truncate font-semibold text-white">{file.name}</p>
                <p className="mt-1">File selected and ready.</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-100">Choose a file</p>
                <p className="mt-1">Accepted formats: TXT, PDF, DOCX</p>
              </div>
            )}

            <input
              type="file"
              accept=".txt,.pdf,.docx"
              className="sr-only"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
