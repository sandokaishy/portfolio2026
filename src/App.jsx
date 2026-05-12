import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import MobileRouter from './pages/projects/MobileRouter.jsx'
import Poweramp from './pages/projects/Poweramp.jsx'
import TreePoint from './pages/projects/TreePoint.jsx'
import InteractionLab from './pages/projects/InteractionLab.jsx'
import FigArrow from './pages/projects/FigArrow.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

const MIN_DISPLAY_MS = 1500  // minimum loading display
const FINISH_MS = 200        // 90 → 100% sweep once `resolved`
const HOLD_MS = 100          // hold at 100% before fade-out

// Project pages that use the .pp-shell flip-in/out animation. Stable
// module-scope constant so React doesn't see a fresh Set every render.
const PP_SHELL_PATHS = new Set([
  '/projects/mobile-router',
  '/projects/poweramp',
  '/projects/tree-point',
  '/projects/interaction-lab',
  '/projects/figarrow',
])

// Deep-link redirect happens at module load — BEFORE React Router mounts.
// We swap the URL to "/" via the native History API so that when Router
// initializes, it reads "/" as the starting location and the home-loading
// flow runs without any awkward navigate-inside-useLayoutEffect dance
// (which can race with React Router v7's render scheduling and leave the
// loading effect stuck on the wrong pathname). The captured target lives
// in module scope and is consumed by the App component once loading
// completes, then released via setBootSequenceActive(false) on the
// pp-shell-enter animationend. Module-scope state survives React 18
// StrictMode dev double-mounts, which useRef / useState do not reliably.
let INITIAL_DEEP_LINK = null
if (
  typeof window !== 'undefined' &&
  PP_SHELL_PATHS.has(window.location.pathname)
) {
  INITIAL_DEEP_LINK = window.location.pathname
  window.history.replaceState(window.history.state, '', '/')
}
let deepLinkConsumed = false

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // Live ref to the current pathname so the click capture handler can read
  // it without re-binding on every navigation.
  const currentPathRef = useRef(location.pathname)
  useEffect(() => { currentPathRef.current = location.pathname }, [location.pathname])

  // One-shot flag: set true when initiating the reverse-flip back to '/'
  // so the next pathname-change effect skips the loading overlay. Read AND
  // reset inside the effect so the skip lasts exactly one navigation —
  // refreshing on '/' won't accidentally inherit it.
  const skipNextLoadingRef = useRef(false)

  // Boot-sequence override for LoadingScreen.visible. While this is true,
  // the overlay stays up regardless of `loading`, covering the entire
  // deep-link choreography (Home load → navigate → pp-shell flip-in).
  // Released only when pp-shell-enter completes (with a safety timeout).
  // Lazy initializer is called once per mount; using module-level state
  // means re-mounts read the latest `deepLinkConsumed` correctly.
  const [bootSequenceActive, setBootSequenceActive] = useState(
    () => INITIAL_DEEP_LINK !== null && !deepLinkConsumed
  )

  // Deep-link choreography. When loading flips to false at "/", consume the
  // deep link by navigating to the target. bootSequenceActive keeps the
  // loading screen up across the navigation and pp-shell-enter. The
  // animation listener and fallback live PAST this effect's lifetime by
  // design (no cleanup): navigate(target) changes pathname which would
  // tear them down before pp-shell-enter ever fires.
  useEffect(() => {
    if (deepLinkConsumed || !INITIAL_DEEP_LINK) return
    if (loading || location.pathname !== '/') return
    deepLinkConsumed = true
    const target = INITIAL_DEEP_LINK
    let fallback
    const onAnimEnd = (e) => {
      if (e.animationName !== 'pp-shell-enter') return
      document.removeEventListener('animationend', onAnimEnd)
      clearTimeout(fallback)
      setBootSequenceActive(false)
    }
    fallback = setTimeout(() => {
      document.removeEventListener('animationend', onAnimEnd)
      setBootSequenceActive(false)
    }, 1500)
    document.addEventListener('animationend', onAnimEnd)
    navigate(target)
  }, [loading, location.pathname, navigate])

  // Capture-phase click handler. Two jobs:
  // 1. Reverse-flip the pp-shell out when navigating from a project page
  //    back to '/'. Home is already mounted behind the project page (see
  //    renderHome below), so during the rotation the user sees Home appear
  //    naturally — no loading overlay needed; we tag the navigation with
  //    state.skipLoading so the loading effect honors that.
  // 2. For Home / About routes (both mount Three.js scenes), preempt the
  //    navigation with the loading overlay: setLoading(true) → wait two
  //    rAFs (one paint cycle) so loading is actually painted → THEN
  //    navigate, so the heavy mount happens beneath a visible overlay.
  useEffect(() => {
    const onClickCapture = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      if (e.defaultPrevented) return

      let a = e.target
      while (a && a.tagName !== 'A') a = a.parentElement
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      if (a.target === '_blank' || a.hasAttribute('download')) return
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return

      const path = href.split(/[?#]/)[0]

      // Project page → home: reverse-flip out, then navigate. Home is
      // already mounted behind so the rotating shell reveals it directly.
      if (
        currentPathRef.current.startsWith('/projects/') &&
        (path === '/' || path === '')
      ) {
        e.preventDefault()
        e.stopPropagation()
        const shell = document.querySelector('.pp-shell')
        if (shell) {
          // Pin the rotation pivot so its VIEWPORT position matches the
          // entry animation (which always runs at scrollY=0 with
          // transform-origin: 0% 100% → pivot at element-bottom-left,
          // distance `elementHeight - viewportHeight` below the viewport).
          // Without this compensation, scrolling moves the static pivot up
          // inside the viewport, so the reverse flip rotates around a
          // visually different axis after the user has scrolled (e.g. via
          // a pp-toc-item click).
          const pivotElementY = shell.offsetHeight + window.scrollY
          shell.style.transformOrigin = `0px ${pivotElementY}px`
          const onEnd = (ev) => {
            if (ev.animationName !== 'pp-shell-exit') return
            shell.removeEventListener('animationend', onEnd)
            skipNextLoadingRef.current = true
            navigate('/')
          }
          shell.addEventListener('animationend', onEnd)
          shell.classList.add('pp-shell--exiting')
        } else {
          // Older project pages don't use the flip — just skip loading.
          skipNextLoadingRef.current = true
          navigate('/')
        }
        return
      }

      if (path === '/' || path === '' || path === '/about') {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        setProgress(0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            navigate(href)
          })
        })
      }
    }
    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [navigate])

  // Loading overlay only fires when the destination is Home or About —
  // every other route renders fast enough to skip it. useLayoutEffect (not
  // useEffect) so the setLoading(true) flushes BEFORE the browser paints
  // for these routes; otherwise the new route would flash for one frame
  // before the overlay covers it.
  // Hybrid progress: the timer ramps target toward 90% over MIN_DISPLAY_MS,
  // and `document.fonts.ready` (real signal) is what unlocks 100%. Whichever
  // is later wins, so the bar never finishes before fonts are actually loaded.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    const path = location.pathname
    // One-shot skip set by the reverse-flip back-to-home flow: Home was
    // already revealed behind the rotating shell during the exit animation,
    // so showing a loading overlay on top of it would be a regression.
    // Consume the flag here so it never carries past a single navigation
    // (refresh, deep-link, etc. always see the normal loader).
    const skipLoading = skipNextLoadingRef.current
    skipNextLoadingRef.current = false
    const needsLoader = (path === '/' || path === '/about') && !skipLoading
    if (!needsLoader) {
      // Routes that don't need the overlay: hide it. The route component
      // handles its own entry animation (e.g. .pp-shell on the project
      // page swings up from its bottom-left pivot).
      //
      // Critically: do NOT setProgress(0) here. During the deep-link flow,
      // the loading screen stays visible (bootSequenceActive=true) AFTER
      // loading flips to false — and resetting progress mid-flow would make
      // the LoadingScreen's smoothed counter animate 100% → 0%. Progress
      // resetting on the next loading cycle is handled by setProgress(0)
      // at the top of the loader branch below, plus LoadingScreen's own
      // visible-transition reset.
      setLoading(false)
      return
    }
    const isHome = path === '/'

    setLoading(true)
    setProgress(0)

    let cancelled = false
    let raf = 0
    let resolvedAt = 0
    const start = performance.now()

    // `document.fonts.ready` can hang in HMR / on a font 404 / on slow network,
    // so we cap it at 3s — after that we don't care, just finish loading.
    const fontsReady = Promise.race([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((r) => setTimeout(r, 3000)),
    ])
    const minTimePassed = new Promise((r) => setTimeout(r, MIN_DISPLAY_MS))

    // Visual-ready gate. Hold the loading screen until OrganicLoader
    // dispatches `organic-loader-ready` so the user never lands on a blank
    // Home while shaders are still compiling. Home re-mounts each time
    // the user lands on '/' (since we tear it down between visits to save
    // GPU), so the event fires naturally on every visit. 3s fallback in
    // case the event never fires (WebGL context lost, etc.).
    const visualReady = new Promise((resolve) => {
      let timer
      const handler = () => {
        window.removeEventListener('organic-loader-ready', handler)
        clearTimeout(timer)
        resolve()
      }
      window.addEventListener('organic-loader-ready', handler)
      timer = setTimeout(() => {
        window.removeEventListener('organic-loader-ready', handler)
        resolve()
      }, 3000)
    })

    Promise.all([fontsReady, minTimePassed, visualReady]).then(() => {
      resolvedAt = performance.now()
    })

    function step(now) {
      if (cancelled) return
      const elapsed = Math.max(0, now - start)

      // Compute progress directly from elapsed time — no accumulator, so the
      // value is always a finite number derived from a curve.
      //   0..MIN_DISPLAY_MS      → 0 .. 90 (power curve, ≈ near-linear)
      //   resolved..FINISH_MS    → 90 .. 100 (linear, fast)
      let pct
      if (!resolvedAt) {
        const u = Math.min(1, elapsed / MIN_DISPLAY_MS)
        pct = 90 * Math.pow(u, 0.85)
      } else {
        const since = Math.max(0, now - resolvedAt)
        pct = 90 + Math.min(10, (since / FINISH_MS) * 10)
      }
      pct = Math.max(0, Math.min(100, pct))
      setProgress(pct)

      if (resolvedAt && pct >= 100) {
        setProgress(100)
        setTimeout(() => {
          if (!cancelled) setLoading(false)
        }, HOLD_MS)
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [location.pathname])

  const isOnHome = location.pathname === '/'
  const isOnFlipPage = PP_SHELL_PATHS.has(location.pathname)
  // Keep Home mounted on '/' AND on pp-shell project pages so the flip
  // animations have something to reveal/cover. Older .project-page pages
  // (solid background) and /about don't need it — Home stays torn down to
  // free GPU.
  const renderHome = isOnHome || isOnFlipPage
  return (
    <>
      {renderHome && (
        <div
          className={`app-home-layer${isOnHome ? '' : ' app-home-layer--behind'}`}
          aria-hidden={isOnHome ? 'false' : 'true'}
        >
          <Home />
        </div>
      )}
      <Routes>
        <Route path="/" element={null} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/mobile-router" element={<MobileRouter />} />
        <Route path="/projects/poweramp" element={<Poweramp />} />
        <Route path="/projects/tree-point" element={<TreePoint />} />
        <Route path="/projects/interaction-lab" element={<InteractionLab />} />
        <Route path="/projects/figarrow" element={<FigArrow />} />
      </Routes>
      <LoadingScreen visible={loading || bootSequenceActive} progress={progress} />
    </>
  )
}

export default App
