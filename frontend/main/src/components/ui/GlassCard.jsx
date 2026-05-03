import { useState, useCallback } from 'react'

export default function GlassCard({ children, className = '', hover3d = true, ...props }) {
  const [transform, setTransform] = useState('')
  const [isTouch] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )

  const handleMouseMove = useCallback((e) => {
    if (!hover3d || isTouch) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10
    setTransform(`perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`)
  }, [hover3d, isTouch])

  const handleMouseLeave = useCallback(() => {
    setTransform('')
  }, [])

  return (
    <div
      className={`glass-card card-3d p-7 ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  )
}
