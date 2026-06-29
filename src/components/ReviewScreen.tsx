import { useState } from 'react'
import type { ShuffledQuestion } from '../utils'
import { calculateScore } from '../utils'
import { QuestionCard } from './QuestionCard'

interface ReviewScreenProps {
  questions: ShuffledQuestion[]
  answers: Record<number, string | null>
  name: string
  timeSpent: number
  isTimedOut: boolean
  onRetake: () => void
}

export function ReviewScreen({
  questions,
  answers,
  name,
  timeSpent,
  isTimedOut,
  onRetake,
}: ReviewScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isNavigatorVisible, setIsNavigatorVisible] = useState(true)

  const score = calculateScore(questions, answers)

  // Determine question states for navigator
  const questionStates: Array<'correct' | 'incorrect' | 'unanswered'> = questions.map(
    (q, idx) => {
      const answer = answers[idx]
      if (!answer) return 'unanswered'
      return answer === q.correct_answer ? 'correct' : 'incorrect'
    }
  )

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header with Score */}
      <div className="bg-linear-to-r from-blue-900 via-slate-900 to-cyan-900 border-b border-slate-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-slate-400 text-sm mb-2">Quiz Review</div>
          {name && <h1 className="text-3xl font-bold text-slate-100 mb-4">{name}</h1>}

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Score</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-cyan-400">
                  {score.correct}
                </span>
                <span className="text-slate-500">/ {score.total}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Percentage</div>
              <div className="text-3xl font-bold text-blue-400">{score.percentage}%</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Time Taken</div>
              <div className="text-lg font-bold text-slate-100">
                {isTimedOut ? (
                  <span className="text-amber-400">Time's up</span>
                ) : (
                  formatTimeSpent(timeSpent)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left: Question Detail */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <QuestionCard
              question={questions[currentQuestion]}
              selectedAnswer={answers[currentQuestion] ?? null}
              onSelectAnswer={() => {}}
              isReview={true}
              correctAnswer={questions[currentQuestion].correct_answer}
            />

            {/* Explanation */}
            <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Explanation
              </h3>
              <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">
                {questions[currentQuestion].explanation.split(/(`[^`]+`)/g).map((part, idx) => {
                  if (part.startsWith('`') && part.endsWith('`')) {
                    const code = part.slice(1, -1)
                    return (
                      <code key={idx} className="font-mono bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded text-sm">
                        {code}
                      </code>
                    )
                  }
                  return <span key={idx}>{part}</span>
                })}
              </p>
            </div>

            {/* Status Badge */}
            <div className="mt-6 flex justify-center">
              {answers[currentQuestion] === questions[currentQuestion].correct_answer ? (
                <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 px-4 py-2 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <span className="text-emerald-400 font-semibold">Correct</span>
                </div>
              ) : answers[currentQuestion] ? (
                <div className="inline-flex items-center gap-2 bg-rose-900/30 border border-rose-700 px-4 py-2 rounded-lg">
                  <span className="text-2xl">✗</span>
                  <span className="text-rose-400 font-semibold">Incorrect</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg">
                  <span className="text-slate-400 font-semibold">Unanswered</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Navigator & Retake */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
          {/* Toggle for mobile */}
          <div className="md:hidden p-4 border-b border-slate-700">
            <button
              onClick={() => setIsNavigatorVisible(!isNavigatorVisible)}
              className="w-full py-2 bg-slate-800 border border-slate-600 rounded text-slate-300 hover:border-slate-500 transition-colors text-sm"
            >
              {isNavigatorVisible ? 'Hide' : 'Show'} All Questions
            </button>
          </div>

          {/* Navigator */}
          {isNavigatorVisible && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                Question Navigator
              </div>
              <div className="grid grid-cols-5 gap-2">
                {questionStates.map((state, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`aspect-square rounded font-semibold text-sm transition-all ${
                      idx === currentQuestion ? 'ring-2 ring-cyan-400' : ''
                    } ${
                      state === 'correct'
                        ? 'bg-emerald-600 text-white'
                        : state === 'incorrect'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                    }`}
                    aria-current={idx === currentQuestion}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-600"></div>
                  <span className="text-slate-400">Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rose-600"></div>
                  <span className="text-slate-400">Incorrect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-700"></div>
                  <span className="text-slate-400">Unanswered</span>
                </div>
              </div>
            </div>
          )}

          {/* Retake Button */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={onRetake}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
