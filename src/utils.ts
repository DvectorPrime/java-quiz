export interface QuizQuestion {
  question_id: number
  question: string
  option_A: string
  option_B: string
  option_C: string
  option_D: string
  correct_answer: 'option_A' | 'option_B' | 'option_C' | 'option_D'
  explanation: string
}

export interface ShuffledQuestion extends QuizQuestion {
  shuffledOptions: Array<{
    key: 'option_A' | 'option_B' | 'option_C' | 'option_D'
    text: string
  }>
}

export interface QuizAttempt {
  answers: Record<number, 'option_A' | 'option_B' | 'option_C' | 'option_D' | null>
  timeSpent: number
  isTimedOut: boolean
}

export type QuizAnswer = 'option_A' | 'option_B' | 'option_C' | 'option_D'

export interface QuizProgressState {
  currentQuestion: number
  answers: Record<number, QuizAnswer | null>
  remainingSeconds: number
  elapsedSeconds: number
}

export interface PersistedQuizState {
  mode: 'quiz' | 'review'
  name: string
  questions: ShuffledQuestion[]
  timeLimitSeconds: number
  answers: Record<number, QuizAnswer | null>
  currentQuestion: number
  remainingSeconds: number
  elapsedSeconds: number
  timeSpent: number
  isTimedOut: boolean
}

const STORAGE_KEY = 'cos203-java-quiz-state'

export function loadPersistedQuizState(): PersistedQuizState | null {
  if (typeof window === 'undefined') return null

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue) as PersistedQuizState
  } catch {
    return null
  }
}

export function savePersistedQuizState(state: PersistedQuizState): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearPersistedQuizState(): void {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(STORAGE_KEY)
}

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Select random questions from pool
export function selectRandomQuestions(
  questions: QuizQuestion[],
  count: number
): QuizQuestion[] {
  const shuffled = shuffle(questions)
  return shuffled.slice(0, Math.min(count, questions.length))
}

// Shuffle options for a question
export function shuffleQuestionOptions(question: QuizQuestion): ShuffledQuestion {
  const options = [
    { key: 'option_A' as const, text: question.option_A },
    { key: 'option_B' as const, text: question.option_B },
    { key: 'option_C' as const, text: question.option_C },
    { key: 'option_D' as const, text: question.option_D },
  ]

  return {
    ...question,
    shuffledOptions: shuffle(options),
  }
}

// Calculate score
export function calculateScore(
  questions: ShuffledQuestion[],
  answers: Record<number, string | null>
): { correct: number; total: number; percentage: number } {
  let correct = 0
  questions.forEach((q, index) => {
    const answer = answers[index]
    if (answer === q.correct_answer) {
      correct++
    }
  })

  const total = questions.length
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  return { correct, total, percentage }
}

// Format time display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
