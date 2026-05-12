import { useEffect, useRef, useState } from 'react'

// Three floating tags. Lines are real THREE.Line objects in the 3D scene
// (line opacity is tied to lineScale in OrganicLoader, so when we drive
// lineScale to 0 the line truly disappears, not just collapses to a point).
//
// Swap timeline (TOTAL ms total). The hard GAP between OUT and EXTEND gives
// a clear "disappear → reappear" beat:
//
//   [0       → OUT_END):       tag opacity 1 → 0, line opacity 1 → 0
//   At OUT_END:                swap displayedTags + freeze NEW target positions
//   [OUT_END → EXTEND_START):  GAP — line invisible (no geometry, no opacity)
//   [EXTEND_START → EXTEND_END): line opacity 0 → 1 + grows to new frozen target
//   [EXTEND_END  → DWELL_END):  hold (line full, tag still hidden) — pacing dwell
//   [DWELL_END   → 1]:          tag fades in with a quick double-blink,
//                               staggered ~40ms per tag
const TOTAL = 850
const OUT_END       = 0.18
const EXTEND_START  = 0.30   // 96ms gap where line is fully invisible
const EXTEND_END    = 0.55
const DWELL_END     = 0.66
const STAGGER       = 0.04

function lineScaleAt(t) {
  if (t < OUT_END) return 1 - t / OUT_END                  // fade out (1 → 0)
  if (t < EXTEND_START) return 0                           // gap — line gone
  if (t < EXTEND_END) {
    const u = (t - EXTEND_START) / (EXTEND_END - EXTEND_START)
    return 1 - Math.pow(1 - u, 2)                          // ease-out grow (0 → 1)
  }
  return 1
}

function tagOpacityAt(t, i) {
  if (t < OUT_END) return 1 - t / OUT_END                  // fade out alongside line
  const blinkStart = DWELL_END + i * STAGGER
  if (t < blinkStart) return 0                             // hidden through gap/extend/dwell
  const u = (t - blinkStart) / (1 - blinkStart)
  if (u >= 1) return 1
  // Quick climb to 1, dip to 0.55, settle to 1 — a snappy double-blink.
  if (u < 0.30) return u / 0.30
  if (u < 0.50) return 1 - ((u - 0.30) / 0.20) * 0.45
  return 0.55 + ((u - 0.50) / 0.50) * 0.45
}

function OrganicLoaderTags({ loaderRef, tags }) {
  const tagRefs = useRef([null, null, null])
  // Tags currently SHOWN (may lag behind `tags` prop during a swap).
  const [displayedTags, setDisplayedTags] = useState(tags)
  const transitionRef = useRef({ active: false, start: 0, swapped: false, target: tags })

  // Detect tags prop change → kick off swap.
  useEffect(() => {
    if (tags.join('|') === displayedTags.join('|')) return
    transitionRef.current = {
      active: true,
      start: performance.now(),
      swapped: false,
      target: tags,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags])

  useEffect(() => {
    let raf = 0
    const tick = (now) => {
      const api = loaderRef.current
      if (api) {
        let lineScale = 1
        const tr = transitionRef.current
        let inTransition = false
        let transitionT = 0

        if (tr.active) {
          const t = (now - tr.start) / TOTAL
          if (t >= 1) {
            tr.active = false
          } else {
            inTransition = true
            transitionT = t
            lineScale = lineScaleAt(t)
            // Swap text + freeze new target positions at OUT_END (line is
            // already invisible by then, so the change is unseen).
            if (!tr.swapped && t >= OUT_END) {
              setDisplayedTags(tr.target)
              api.requestFreezeTagTargets?.()
              tr.swapped = true
            }
          }
        }

        for (let i = 0; i < 3; i++) {
          api.setTagLineScale?.(i, lineScale)

          const pos = api.getTagScreenPos?.(i)
          // OrganicLoader marks a tag off-screen when its projected target
          // leaves the canvas. We tie the DOM tag's opacity to this so the
          // tag disappears in lockstep with its (now hidden) connector line.
          const onScreen = api.getTagOnScreen?.(i) ?? 1
          // Per-tag mode gate (only Stretch / FigArrow uses it). 1 for the
          // other shape modes, so they're unaffected.
          const modeOpacity = api.getTagModeOpacity?.(i) ?? 1
          const tag = tagRefs.current[i]
          if (tag) {
            if (pos) {
              tag.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
            }
            const baseOpacity = inTransition ? tagOpacityAt(transitionT, i) : 1
            tag.style.opacity = String(baseOpacity * onScreen * modeOpacity)
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loaderRef])

  return (
    <div className="loader-tags-layer" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => { tagRefs.current[i] = el }}
          className="loader-tag"
        >
          {displayedTags[i]}
        </div>
      ))}
    </div>
  )
}

export default OrganicLoaderTags
