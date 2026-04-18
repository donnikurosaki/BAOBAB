import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1800, trigger = true): number {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let raf = 0
    let start: number | null = null

    const tick = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(target * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, trigger])

  return val
}
