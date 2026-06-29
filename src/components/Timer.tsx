import { formatTime } from '../utils'

interface TimerProps {
  secondsLeft: number
}

export function Timer({ secondsLeft }: TimerProps) {
  const isLow = secondsLeft < 60
  const isCritical = secondsLeft < 300 // 5 minutes
  const isRed = secondsLeft < 60 // 1 minute

  return (
    <div
      className={`text-xl font-mono font-bold transition-colors ${
        isRed
          ? 'text-red-500'
          : isCritical
            ? 'text-amber-400'
            : 'text-cyan-400'
      } ${isLow ? 'animate-pulse' : ''}`}
    >
      {formatTime(secondsLeft)}
    </div>
  )
}
