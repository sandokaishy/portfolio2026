import { useEffect, useRef, useState } from 'react'
import OrganicLoader from './OrganicLoader.jsx'
import './AboutPortrait.css'

// Head tilt parameters: angle = BASE + scrollY * RATE, in degrees.
const HEAD_TILT_BASE = 10
const HEAD_TILT_RATE = 0.03

// Blob scroll-drift: moves slightly up and left as the user scrolls down.
// Capped so it doesn't drift off-stage on long pages.
const BLOB_DRIFT_RATE = 0.05  // px per scrollY px
const BLOB_DRIFT_MAX  = 60    // px

function AboutPortrait() {
  const headRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const head = headRef.current
    const stage = stageRef.current
    if (!head || !stage) return
    const update = () => {
      const y = window.scrollY
      const angle = HEAD_TILT_BASE + y * HEAD_TILT_RATE
      head.style.setProperty('--head-rotate', `${angle}deg`)
      const drift = Math.min(BLOB_DRIFT_MAX, y * BLOB_DRIFT_RATE)
      stage.style.setProperty('--blob-shift-x', `${-drift}px`)
      stage.style.setProperty('--blob-shift-y', `${-drift}px`)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Defer OrganicLoader's Three.js init so it doesn't compile shaders on
  // the same frame the loading overlay is animating in. Mirrors Home.jsx.
  const [loaderMounted, setLoaderMounted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setLoaderMounted(true), 500)
    return () => clearTimeout(id)
  }, [])

  return (
    <aside className="about-portrait" aria-hidden="true">
      <div className="portrait-stage" ref={stageRef}>
        <img className="portrait-body" src="/about/body.png" alt="" />
        <img ref={headRef} className="portrait-head" src="/about/head.png" alt="" />
        {loaderMounted && (
          <OrganicLoader
            className="portrait-blobs"
            color="#ffffff"
            cellSpawnDir={{ x: -1, y: 0, z: 0 }}
            interactive={false}
            disableTagLines
          />
        )}
      </div>
    </aside>
  )
}

export default AboutPortrait
