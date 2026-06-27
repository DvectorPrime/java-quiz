import type { ShuffledQuestion } from '../utils'

interface QuestionCardProps {
  question: ShuffledQuestion
  selectedAnswer: string | null
  onSelectAnswer: (answer: 'option_A' | 'option_B' | 'option_C' | 'option_D') => void
  isReview?: boolean
  correctAnswer?: string
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  isReview = false,
  correctAnswer,
}: QuestionCardProps) {
  const renderTextWithCode = (text: string) => {
    // Split by backticks and render code elements
    const parts = text.split(/(`[^`]+`)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        // This is code
        const code = part.slice(1, -1)
        return (
          <code key={idx} className="font-mono bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-sm">
            {code}
          </code>
        )
      }
      return <span key={idx}>{part}</span>
    })
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-100 leading-relaxed">
          {renderTextWithCode(question.question)}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.shuffledOptions.map((option) => {
          const isSelected = selectedAnswer === option.key
          const isCorrect = option.key === correctAnswer
          const isCorrectAnswer = option.key === question.correct_answer
          const showCorrect = isReview && isCorrectAnswer
          const showIncorrect = isReview && isSelected && !isCorrectAnswer

          let buttonClasses =
            'w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer font-medium'

          if (isReview) {
            if (showCorrect) {
              buttonClasses +=
                ' bg-emerald-900 border-emerald-500 text-emerald-100'
            } else if (showIncorrect) {
              buttonClasses +=
                ' bg-rose-900 border-rose-500 text-rose-100'
            } else if (isSelected) {
              buttonClasses +=
                ' bg-slate-700 border-slate-600 text-slate-300'
            } else {
              buttonClasses +=
                ' bg-slate-800 border-slate-600 text-slate-400'
            }
          } else {
            if (isSelected) {
              buttonClasses +=
                ' bg-blue-900 border-blue-500 text-blue-100 shadow-lg shadow-blue-500/20'
            } else {
              buttonClasses +=
                ' bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500 hover:bg-slate-700'
            }
          }

          return (
            <button
              key={option.key}
              onClick={() => {
                if (!isReview) {
                  onSelectAnswer(option.key)
                }
              }}
              disabled={isReview}
              className={buttonClasses}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-base pt-0.5">
                  {option.key.replace('option_', '')}
                </span>
                <span className="flex-1">{renderTextWithCode(option.text)}</span>
                {isReview && (isCorrect || showIncorrect) && (
                  <span className="text-xl">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
