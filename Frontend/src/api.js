import axios from "axios";

const ROOT_BASE = "http://localhost:8000";
const API_BASE = `${ROOT_BASE}/api`;

export const api = {
  /** Upload resume PDF -- returns parsed resume data */
  uploadResume: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axios.post(`${API_BASE}/resume/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** Start interview session */
  startInterview: async (resumeId, jobDescription, numQuestions = 5, jobTitle = "") => {
    const { data } = await axios.post(`${API_BASE}/interview/start`, {
      resume_id: resumeId,
      job_description: jobDescription,
      job_title: jobTitle,
      num_questions: numQuestions,
    });
    return data;
  },

  /** Score resume against job description */
  scoreResume: async (resumeId, jobDescription) => {
    const { data } = await axios.post(`${API_BASE}/resume/score`, {
      resume_id: resumeId,
      job_description: jobDescription,
    });
    return data;
  },

  /** Resume improvement suggestions */
  resumeSuggestions: async (resumeId, jobDescription) => {
    const { data } = await axios.post(`${API_BASE}/resume/suggestions`, {
      resume_id: resumeId,
      job_description: jobDescription,
    });
    return data;
  },

  /** Get next question */
  nextQuestion: async (sessionId) => {
    const { data } = await axios.post(`${API_BASE}/interview/next`, {
      session_id: sessionId,
    });
    return data;
  },

  /** Evaluate an answer */
  evaluateAnswer: async (sessionId, question, answer) => {
    const { data } = await axios.post(`${API_BASE}/evaluate/answer`, {
      session_id: sessionId,
      question,
      answer,
    });
    return data;
  },

  /** Final report */
  finalReport: async (sessionId, resumeScore) => {
    const { data } = await axios.post(`${API_BASE}/evaluate/final-report`, {
      session_id: sessionId,
      resume_score: resumeScore,
    });
    return data;
  },

  /** Text to speech (returns object URL) */
  tts: async (sessionId, text) => {
    const res = await axios.post(
      `${API_BASE}/interview/tts`,
      { session_id: sessionId, text },
      { responseType: "blob" }
    );
    return URL.createObjectURL(res.data);
  },

  /** Health check */
  healthCheck: async () => {
    const { data } = await axios.get(`${ROOT_BASE}/health`);
    return data;
  },

  /** Helper: build audio URL from relative path returned by backend */
  audioUrl: (path) => (path ? `${ROOT_BASE}${path}` : null),
};
