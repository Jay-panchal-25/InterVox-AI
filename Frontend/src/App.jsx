import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import ResumeInsights from './components/ResumeInsights'
import Interview from './components/Interview'
import Evaluation from './components/Evaluation'

export default function App() {
  const [view, setView] = useState('upload')   // 'upload' | 'resume' | 'interview' | 'evaluation'
  const [ctx, setCtx] = useState(null)         // { resumeData, resumeScore, resumeScoreData, resumeSuggestions, jobRole, jobDescription, interviewData }
  const [history, setHistory] = useState([])

  const handleUploadComplete = (data) => {
    setCtx(data)
    setView('resume')
  }

  const handleInterviewEnd = (h) => {
    setHistory(h)
    setView('evaluation')
  }

  const handleStartInterview = (interviewData) => {
    setCtx((prev) => ({ ...prev, interviewData }))
    setView('interview')
  }

  const handleRestart = () => {
    setCtx(null)
    setHistory([])
    setView('upload')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg font-body text-text-primary">
      <div className="pointer-events-none fixed inset-0 z-0 bg-noise opacity-50" />
      <div className="pointer-events-none fixed left-1/2 top-[-200px] z-0 h-[400px] w-[800px] -translate-x-1/2 bg-ambient opacity-80" />
      <div className="relative z-10">
        {view === 'upload' && (
          <ResumeUpload onComplete={handleUploadComplete} />
        )}

        {view === 'resume' && ctx && (
          <ResumeInsights
            resumeData={ctx.resumeData}
            resumeScore={ctx.resumeScore}
            resumeScoreData={ctx.resumeScoreData}
            resumeSuggestions={ctx.resumeSuggestions}
            jobRole={ctx.jobRole}
            jobDescription={ctx.jobDescription}
            onStartInterview={handleStartInterview}
            onRestart={handleRestart}
          />
        )}

        {view === 'interview' && ctx && (
          <Interview
            session={ctx.interviewData}
            resumeData={ctx.resumeData}
            jobRole={ctx.jobRole}
            jobDescription={ctx.jobDescription}
            onEnd={handleInterviewEnd}
          />
        )}

        {view === 'evaluation' && (
          <Evaluation
            history={history}
            jobRole={ctx?.jobRole}
            sessionId={ctx?.interviewData?.session_id}
            resumeScore={ctx?.resumeScore}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  )
}
