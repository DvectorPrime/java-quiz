import { useEffect, useRef } from 'react'

interface QuestionNavigatorProps {
  totalQuestions: number
  currentQuestion: number
  onQuestionSelect: (index: number) => void
  questionStates: Array<'answered' | 'unanswered' | 'correct' | 'incorrect'>
  isReview?: boolean
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  onQuestionSelect,
  questionStates,
  isReview = false,
}: QuestionNavigatorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll the current question into view
    const currentButton = scrollContainerRef.current?.querySelector(
      '[data-current="true"]'
    )
    if (currentButton) {
      currentButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentQuestion])

  return (
    <div className="w-full bg-slate-900 border-t border-slate-700 p-4">
      <div className="mb-2 text-xs uppercase tracking-wider text-slate-400">
        Question Navigator
      </div>
      <div
        ref={scrollContainerRef}
        className="flex flex-wrap gap-2 overflow-x-auto pb-2"
      >
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const state = questionStates[index]
          const isCurrent = index === currentQuestion
          let buttonClasses =
            'min-w-[2.5rem] h-10 rounded font-semibold text-sm transition-all flex items-center justify-center'

          if (isCurrent) {
            buttonClasses += ' ring-2 ring-cyan-400'
          }

          if (isReview) {
            if (state === 'correct') {
              buttonClasses += ' bg-emerald-600 text-white'
            } else if (state === 'incorrect') {
              buttonClasses += ' bg-rose-600 text-white'
            } else {
              buttonClasses += ' bg-slate-700 text-slate-400'
            }
          } else {
            if (state === 'answered') {
              buttonClasses += ' bg-blue-600 text-white'
            } else {
              buttonClasses += ' bg-slate-700 text-slate-400 border border-slate-600'
            }
          }

          return (
            <button
              key={index}
              data-current={isCurrent}
              onClick={() => onQuestionSelect(index)}
              className={buttonClasses}
              aria-current={isCurrent}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
