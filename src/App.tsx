import { useEffect, useState } from 'react'
import type { ShuffledQuestion, QuizQuestion } from './utils'
import { selectRandomQuestions, shuffleQuestionOptions } from './utils'
import { SetupScreen } from './components/SetupScreen'
import { QuizScreen } from './components/QuizScreen'
import { ReviewScreen } from './components/ReviewScreen'
import quizData from './data/java.json'

type AppState = 'setup' | 'quiz' | 'review'

interface QuizSession {
  name: string
  questions: ShuffledQuestion[]
  answers: Record<number, string | null>
  timeLimitSeconds: number
  timeSpent: number
  isTimedOut: boolean
}

function App() {
  const [appState, setAppState] = useState<AppState>('setup')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Timer for tracking time spent
  useEffect(() => {
    if (appState !== 'quiz' || !startTime) return

    const interval = setInterval(() => {
      // Just keep track, timer component handles the countdown
    }, 1000)

    return () => clearInterval(interval)
  }, [appState, startTime])

  const handleStartQuiz = (name: string, questionCount: number, timeLimitSeconds: number) => {
    // Select random questions
    const selectedQuestions = selectRandomQuestions(quizData as QuizQuestion[], questionCount)
    
    // Shuffle options for each question
    const shuffledQuestions = selectedQuestions.map((q) => shuffleQuestionOptions(q))

    setSession({
      name,
      questions: shuffledQuestions,
      answers: {},
      timeLimitSeconds,
      timeSpent: 0,
      isTimedOut: false,
    })

    setStartTime(Date.now())
    setAppState('quiz')
  }

  const handleSubmitQuiz = (answers: Record<number, string | null>, isTimedOut: boolean) => {
    if (!session || !startTime) return

    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    setSession({
      ...session,
      answers,
      timeSpent,
      isTimedOut,
    })

    setAppState('review')
  }

  const handleRetake = () => {
    setAppState('setup')
    setSession(null)
    setStartTime(null)
  }

  return (
    <div className="bg-slate-950 min-h-screen">
      {appState === 'setup' && (
        <SetupScreen
          totalQuestions={(quizData as QuizQuestion[]).length}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {appState === 'quiz' && session && (
        <QuizScreen
          questions={session.questions}
          timeLimitSeconds={session.timeLimitSeconds}
          onSubmit={handleSubmitQuiz}
        />
      )}

      {appState === 'review' && session && (
        <ReviewScreen
          questions={session.questions}
          answers={session.answers}
          name={session.name}
          timeSpent={session.timeSpent}
          isTimedOut={session.isTimedOut}
          onRetake={handleRetake}
        />
      )}
    </div>
  )
}

export default App
