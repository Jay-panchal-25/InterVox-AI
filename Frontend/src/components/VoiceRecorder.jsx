import { useState, useRef, useEffect } from "react";

const BARS = 14;

export default function VoiceRecorder({ onSubmit, disabled }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [barHeights, setBarHeights] = useState(Array(BARS).fill(0.4));
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognitionRef.current = rec;
  }, []);

  const animateBars = () => {
    animRef.current = setInterval(() => {
      setBarHeights(Array.from({ length: BARS }, () => 0.2 + Math.random() * 0.8));
    }, 120);
  };

  const stopAnim = () => {
    clearInterval(animRef.current);
    setBarHeights(Array(BARS).fill(0.4));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.start();
      mediaRef.current = mr;
      recognitionRef.current?.start();
      setRecording(true);
      animateBars();
    } catch (err) {
      alert("Microphone access denied. Please allow mic permissions.");
    }
  };

  const stopRecording = () => {
    if (!mediaRef.current) return;
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    recognitionRef.current?.stop();
    setRecording(false);
    stopAnim();
  };

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    onSubmit(transcript.trim());
    setTranscript("");
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-7 items-center gap-[3px]">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-[2px] bg-amber origin-center ${
              recording ? "opacity-100 transition-[height] duration-100" : "opacity-25"
            }`}
            style={{
              height: `${h * 28}px`,
              animationDelay: `${i * 0.07}s`,
            }}
          />
        ))}
      </div>

      <button
        className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
          recording
            ? "bg-red-dim shadow-[0_0_0_1px_#f87171,0_0_24px_rgba(248,113,113,0.2)]"
            : "bg-amber-dim shadow-[0_0_0_1px_rgba(251,191,36,0.35)]"
        }`}
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
        title={recording ? "Stop recording" : "Start recording"}
      >
        {recording && (
          <div className="absolute inset-0 rounded-full bg-red/20 animate-pulse-ring" />
        )}
        {recording ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" rx="2" fill="#f87171" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" fill="#fbbf24" />
            <path
              d="M5 10a7 7 0 0 0 14 0"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <line
              x1="12"
              y1="17"
              x2="12"
              y2="21"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="9"
              y1="21"
              x2="15"
              y2="21"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      <span className="font-mono text-[12px] tracking-[0.05em] text-text-muted">
        {recording ? "RECORDING - click to stop" : "CLICK TO SPEAK"}
      </span>

      {(transcript || recording) && (
        <div className="w-full">
          <div className="min-h-[64px] w-full rounded-sm border border-border bg-bg px-4 py-3 font-mono text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
            {transcript || (recording ? <span className="text-text-muted">Listening...</span> : "")}
          </div>
        </div>
      )}

      {transcript && !recording && (
        <button
          className="rounded-sm bg-amber px-7 py-2.5 font-display text-[14px] font-bold tracking-[0.03em] text-[#080c14] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Submit Answer 
        </button>
      )}
    </div>
  );
}