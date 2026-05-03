import { useState, useEffect, useRef } from 'react'

export default function AnimatedCounter({ target, suffix = '', duration = 2200 }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = performance.now()
    const numTarget = parseFloat(target)
    const isDecimal = target.toString().includes('.')

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = eased * numTarget

      if (isDecimal) {
        setCount(parseFloat(current.toFixed(1)))
      } else {
        setCount(Math.floor(current))
      }

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        setCount(numTarget)
      }
    }

    requestAnimationFrame(update)
  }, [hasStarted, target, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}
