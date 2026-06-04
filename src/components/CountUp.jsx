import { useEffect, useRef, useState } from 'react'

// Counts from 0 up to `end` once its element scrolls into view, then holds.
// `end` is the numeric target; `suffix` is appended after the formatted
// number (e.g. "+ Devices", "%+"). Honours prefers-reduced-motion by
// jumping straight to the final value.
export default function CountUp({ end, suffix = '', duration = 1600 }) {
  const ref = useRef(null)
  const startedRef = useRef(false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const run = () => {
      if (startedRef.current) return
      startedRef.current = true
      if (reduce) {
        setValue(end)
        return
      }
      const t0 = performance.now()
      const step = (now) => {
        const p = Math.min((now - t0) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        setValue(Math.round(end * eased))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run()
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [end, duration])

  return (
    <span ref={ref}>
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
