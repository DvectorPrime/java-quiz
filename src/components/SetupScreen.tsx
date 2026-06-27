import { useState } from 'react'

interface SetupScreenProps {
  totalQuestions: number
  onStartQuiz: (name: string, questionCount: number, timeLimitSeconds: number) => void
}

export function SetupScreen({ totalQuestions, onStartQuiz }: SetupScreenProps) {
  const [name, setName] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [customCount, setCustomCount] = useState('')
  const [timeLimit, setTimeLimit] = useState(0) // 0 = no limit
  const [showCustomInput, setShowCustomInput] = useState(false)

  const presetCounts = [10, 20, 30, 50]
  const presetTimes = [600, 1200, 1800, 2700, 3600] // 10, 20, 30, 45, 60 minutes
  const presetTimeLabels = ['10 min', '20 min', '30 min', '45 min', '60 min']

  const handleQuestionCountChange = (count: number | null) => {
    if (count !== null) {
      setQuestionCount(count)
      setShowCustomInput(false)
      setCustomCount('')
    } else {
      setShowCustomInput(true)
    }
  }

  const handleCustomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomCount(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0 && num <= totalQuestions) {
      setQuestionCount(num)
    }
  }

  const isValid = questionCount > 0 && questionCount <= totalQuestions

  const handleStart = () => {
    if (isValid) {
      onStartQuiz(name, questionCount, timeLimit)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            COS203 Java Quiz
          </h1>
          <p className="text-slate-400">Test your knowledge</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-8 space-y-8">
          {/* Available Questions */}
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{totalQuestions}</div>
            <p className="text-slate-400 text-sm">questions available</p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Number of Questions
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => handleQuestionCountChange(count)}
                  className={`py-2 rounded font-semibold transition-all ${
                    questionCount === count && !showCustomInput
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Custom Count Input */}
            {showCustomInput || customCount ? (
              <input
                type="number"
                min="1"
                max={totalQuestions}
                value={customCount}
                onChange={handleCustomCountChange}
                placeholder={`1 - ${totalQuestions}`}
                autoFocus
                className="w-full px-4 py-2 bg-slate-800 border border-blue-500 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <button
                onClick={() => handleQuestionCountChange(null)}
                className="w-full py-2 rounded text-slate-400 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                Custom
              </button>
            )}
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Time Limit
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetTimes.map((seconds, index) => (
                <button
                  key={seconds}
                  onClick={() => setTimeLimit(seconds)}
                  className={`py-2 rounded font-semibold text-sm transition-all ${
                    timeLimit === seconds
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {presetTimeLabels[index]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTimeLimit(0)}
              className={`w-full py-2 rounded font-semibold transition-all ${
                timeLimit === 0
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-500'
              }`}
            >
              No Time Limit
            </button>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!isValid}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
              isValid
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
