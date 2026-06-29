import { useEffect, useState } from 'react'
import type { ShuffledQuestion, QuizAnswer, QuizQuestion } from './utils'
import {
  clearPersistedQuizState,
  loadPersistedQuizState,
  savePersistedQuizState,
  selectRandomQuestions,
  shuffleQuestionOptions,
} from './utils'
import { SetupScreen } from './components/SetupScreen'
import { QuizScreen } from './components/QuizScreen'
import { ReviewScreen } from './components/ReviewScreen'
import quizData from './data/java.json'

type AppState = 'setup' | 'quiz' | 'review'

interface QuizSession {
  name: string
  questions: ShuffledQuestion[]
  answers: Record<number, QuizAnswer | null>
  timeLimitSeconds: number
  currentQuestion: number
  remainingSeconds: number
  elapsedSeconds: number
  timeSpent: number
  isTimedOut: boolean
}

function hydrateInitialState(): { appState: AppState; session: QuizSession | null } {
  const savedState = loadPersistedQuizState()

  if (!savedState) {
    return { appState: 'setup', session: null }
  }

  return {
    appState: savedState.mode,
    session: {
      name: savedState.name,
      questions: savedState.questions,
      answers: savedState.answers,
      timeLimitSeconds: savedState.timeLimitSeconds,
      currentQuestion: savedState.currentQuestion,
      remainingSeconds: savedState.remainingSeconds,
      elapsedSeconds: savedState.elapsedSeconds,
      timeSpent: savedState.timeSpent,
      isTimedOut: savedState.isTimedOut,
    },
  }
}

function App() {
  const [appState, setAppState] = useState<AppState>(() => hydrateInitialState().appState)
  const [session, setSession] = useState<QuizSession | null>(() => hydrateInitialState().session)

  useEffect(() => {
    if (appState !== 'setup') return

    const savedState = loadPersistedQuizState()
    if (savedState?.mode !== 'quiz') return

    setSession({
      name: savedState.name,
      questions: savedState.questions,
      answers: savedState.answers,
      timeLimitSeconds: savedState.timeLimitSeconds,
      currentQuestion: savedState.currentQuestion,
      remainingSeconds: savedState.remainingSeconds,
      elapsedSeconds: savedState.elapsedSeconds,
      timeSpent: savedState.timeSpent,
      isTimedOut: savedState.isTimedOut,
    })
    setAppState('quiz')
  }, [appState])

  const handleStartQuiz = (name: string, questionCount: number, timeLimitSeconds: number) => {
    clearPersistedQuizState()

    const selectedQuestions = selectRandomQuestions(quizData as QuizQuestion[], questionCount)
    const shuffledQuestions = selectedQuestions.map((q) => shuffleQuestionOptions(q))

    const nextSession: QuizSession = {
      name,
      questions: shuffledQuestions,
      answers: {},
      timeLimitSeconds,
      currentQuestion: 0,
      remainingSeconds: timeLimitSeconds,
      elapsedSeconds: 0,
      timeSpent: 0,
      isTimedOut: false,
    }

    setSession(nextSession)
    setAppState('quiz')

    savePersistedQuizState({
      mode: 'quiz',
      name,
      questions: shuffledQuestions,
      timeLimitSeconds,
      answers: {},
      currentQuestion: 0,
      remainingSeconds: timeLimitSeconds,
      elapsedSeconds: 0,
      timeSpent: 0,
      isTimedOut: false,
    })
  }

  const handleSubmitQuiz = (
    snapshot: {
      currentQuestion: number
      answers: Record<number, QuizAnswer | null>
      remainingSeconds: number
      elapsedSeconds: number
    },
    isTimedOut: boolean
  ) => {
    if (!session) return

    const timeSpent = snapshot.elapsedSeconds

    const nextSession: QuizSession = {
      ...session,
      currentQuestion: snapshot.currentQuestion,
      answers: snapshot.answers,
      remainingSeconds: snapshot.remainingSeconds,
      elapsedSeconds: snapshot.elapsedSeconds,
      timeSpent,
      isTimedOut,
    }

    setSession(nextSession)
    setAppState('review')

    savePersistedQuizState({
      mode: 'review',
      name: nextSession.name,
      questions: nextSession.questions,
      timeLimitSeconds: nextSession.timeLimitSeconds,
      answers: nextSession.answers,
      currentQuestion: nextSession.currentQuestion,
      remainingSeconds: nextSession.remainingSeconds,
      elapsedSeconds: nextSession.elapsedSeconds,
      timeSpent: nextSession.timeSpent,
      isTimedOut: nextSession.isTimedOut,
    })
  }

  const handleRetake = () => {
    setAppState('setup')
    setSession(null)
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
          initialCurrentQuestion={session.currentQuestion}
          initialAnswers={session.answers}
          initialRemainingSeconds={session.remainingSeconds}
          initialElapsedSeconds={session.elapsedSeconds}
          name={session.name}
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
