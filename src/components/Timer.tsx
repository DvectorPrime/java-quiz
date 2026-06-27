import { useEffect, useState } from 'react'
import { formatTime } from '../utils'

interface TimerProps {
  initialSeconds: number
  onTimeUp: () => void
  isActive: boolean
}

export function Timer({ initialSeconds, onTimeUp, isActive }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTimeUp])

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
