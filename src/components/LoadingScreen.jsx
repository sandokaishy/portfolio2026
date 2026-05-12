import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './LoadingScreen.css'

// Headline copy. Cycling is done entirely in CSS — no setInterval, no React
// rerenders — so the rhythm is unaffected by main-thread blocks.
const STAGES = ['Adapt to fit', 'Shape to evolve', 'Build to impact']

function LoadingScreen({ visible, progress }) {
  const safeProgress = Number.isFinite(progress) ? progress : 0

  // Bump the content `key` AND reset the displayed percent to 0 every time
  // the overlay transitions hidden → visible — that way the CSS keyframes
  // restart from t=0 and the percent counter starts fresh on each new
  // cycle. useLayoutEffect runs synchronously before paint, so the reset
  // applies in the same commit and we never see a single frame of stale
  // state.
  const prevVisibleRef = useRef(visible)
  const [showId, setShowId] = useState(0)
  const [displayed, setDisplayed] = useState(safeProgress)
  useLayoutEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setShowId((n) => n + 1)
      setDisplayed(0)
    }
    prevVisibleRef.current = visible
  }, [visible])

  // Internal eased smoothing for the displayed percent. The upstream
  // `progress` value (from App.jsx) can update in bursts when the main
  // thread is briefly busy (Three.js shader compile etc.) — the displayed
  // number would then sit on one value, then jump several at once.
  // Easing here means the rendered digit walks forward at a steady pace
  // even when the source value lurches. We deliberately don't reset
  // `displayed` when the loader hides so that the 0.35s fade-out shows
  // "100%" all the way to invisibility instead of snapping back to 0.
  const targetRef = useRef(safeProgress)
  targetRef.current = safeProgress
  useEffect(() => {
    if (!visible) return
    let raf = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000))
      last = now
      setDisplayed((prev) => {
        const target = targetRef.current
        // Snap the moment we've hit completion so the user always reads
        // 100% before the fade-out — easing alone can't catch up inside
        // HOLD_MS.
        if (target >= 100) return 100
        const diff = target - prev
        if (Math.abs(diff) < 0.05) return target
        // Frame-rate-independent ease; ~150ms time constant.
        const k = 1 - Math.exp(-dt * 6.5)
        return prev + diff * k
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  return (
    <div
      className={`loading-screen${visible ? '' : ' loading-screen--hidden'}`}
      aria-busy={visible}
      aria-hidden={!visible}
    >
      <div className="loading-content" key={showId}>
        <div className="loading-headline-slot">
          {STAGES.map((text, i) => (
            <h1
              key={i}
              className={`loading-headline loading-headline--${i}`}
            >
              {text}
            </h1>
          ))}
        </div>
        <div className="loading-percent">{Math.floor(displayed)}%</div>
      </div>
    </div>
  )
}

export default LoadingScreen
