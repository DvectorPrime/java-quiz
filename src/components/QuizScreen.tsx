import { useEffect, useRef, useState } from 'react'
import type { QuizAnswer, ShuffledQuestion } from '../utils'
import { savePersistedQuizState } from '../utils'
import { Timer } from './Timer'
import { QuestionCard } from './QuestionCard'

interface QuizScreenProps {
  questions: ShuffledQuestion[]
  timeLimitSeconds: number
  initialCurrentQuestion: number
  initialAnswers: Record<number, QuizAnswer | null>
  initialRemainingSeconds: number
  initialElapsedSeconds: number
  name: string
  onSubmit: (
    snapshot: {
      currentQuestion: number
      answers: Record<number, QuizAnswer | null>
      remainingSeconds: number
      elapsedSeconds: number
    },
    isTimedOut: boolean
  ) => void
}

export function QuizScreen({
  questions,
  timeLimitSeconds,
  initialCurrentQuestion,
  initialAnswers,
  initialRemainingSeconds,
  initialElapsedSeconds,
  name,
  onSubmit,
}: QuizScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(initialCurrentQuestion)
  const [answers, setAnswers] = useState<Record<number, QuizAnswer | null>>(initialAnswers)
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNavigatorVisible, setIsNavigatorVisible] = useState(true)
  const hasAutoSubmittedRef = useRef(false)

  const hasTimeLimit = timeLimitSeconds > 0
  const unansweredCount = questions.length - Object.values(answers).filter((a) => a !== null && a !== undefined).length

  useEffect(() => {
    savePersistedQuizState({
      mode: 'quiz',
      name,
      questions,
      timeLimitSeconds,
      answers,
      currentQuestion,
      remainingSeconds,
      elapsedSeconds,
      timeSpent: elapsedSeconds,
      isTimedOut: false,
    })
  }, [answers, currentQuestion, elapsedSeconds, name, questions, remainingSeconds, timeLimitSeconds])

  useEffect(() => {
    if (!hasTimeLimit) return

    const interval = setInterval(() => {
      setRemainingSeconds((prevRemaining) => {
        if (prevRemaining <= 1) {
          clearInterval(interval)
          return 0
        }

        return prevRemaining - 1
      })

      setElapsedSeconds((prevElapsed) => prevElapsed + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [hasTimeLimit])

  useEffect(() => {
    if (hasTimeLimit && remainingSeconds === 0 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true
      onSubmit(
        {
          currentQuestion,
          answers,
          remainingSeconds,
          elapsedSeconds,
        },
        true
      )
    }
  }, [answers, currentQuestion, elapsedSeconds, hasTimeLimit, onSubmit, remainingSeconds])

  const handleSelectAnswer = (answer: QuizAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    if (unansweredCount > 0) {
      setShowConfirm(true)
    } else {
      onSubmit(
        {
          currentQuestion,
          answers,
          remainingSeconds,
          elapsedSeconds,
        },
        false
      )
    }
  }

  const handleConfirmSubmit = () => {
    setShowConfirm(false)
    onSubmit(
      {
        currentQuestion,
        answers,
        remainingSeconds,
        elapsedSeconds,
      },
      false
    )
  }

  const questionStates: Array<'answered' | 'unanswered'> = questions.map(
    (_, idx) => (answers[idx] ? 'answered' : 'unanswered')
  )

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm text-slate-400 mb-1">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-linear-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {hasTimeLimit && (
            <div className="shrink-0">
              <Timer
                secondsLeft={remainingSeconds}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left: Question */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <QuestionCard
              question={questions[currentQuestion]}
              selectedAnswer={answers[currentQuestion] ?? null}
              onSelectAnswer={handleSelectAnswer}
            />

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 justify-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2 bg-slate-800 border border-slate-600 text-slate-300 rounded hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className="px-6 py-2 bg-slate-800 border border-slate-600 text-slate-300 rounded hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right: Navigator & Submit */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
          {/* Toggle for mobile */}
          <div className="md:hidden p-4 border-b border-slate-700">
            <button
              onClick={() => setIsNavigatorVisible(!isNavigatorVisible)}
              className="w-full py-2 bg-slate-800 border border-slate-600 rounded text-slate-300 hover:border-slate-500 transition-colors"
            >
              {isNavigatorVisible ? 'Hide' : 'Show'} Questions ({questionStates.filter((s) => s === 'answered').length}/{questions.length})
            </button>
          </div>

          {/* Navigator */}
          {isNavigatorVisible && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                  Question Navigator
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questionStates.map((state, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`aspect-square rounded font-semibold text-sm transition-all ${
                        idx === currentQuestion
                          ? 'ring-2 ring-cyan-400'
                          : ''
                      } ${
                        state === 'answered'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}
                      aria-current={idx === currentQuestion}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Submit Quiz
            </button>
            {unansweredCount > 0 && (
              <p className="text-xs text-amber-400 mt-2 text-center">
                {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Submit Quiz?</h2>
            <p className="text-slate-400 mb-6">
              You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}. Submit anyway?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-slate-800 border border-slate-600 text-slate-300 rounded hover:border-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
