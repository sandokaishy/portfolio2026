import { useEffect, useRef, useState } from 'react'

// Keep in sync with the 700ms pp-shell-enter animation in MobileRouter.css.
const ENTRY_SETTLE_MS = 720

export default function useProjectNavigation(sections, { hasTeam = false } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState(sections[0].id)
  const [animDone, setAnimDone] = useState(false)
  const tocRef = useRef(null)

  // Remove the entry transform before measuring sections or using sticky layout.
  useEffect(() => {
    const id = setTimeout(() => setAnimDone(true), ENTRY_SETTLE_MS)
    return () => clearTimeout(id)
  }, [])

  // Team projects swap their team list for the TOC after half a viewport.
  useEffect(() => {
    if (!hasTeam) return
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasTeam])

  // Observe only after the page settles so the rotating shell cannot skew
  // section bounds. Sections are defined outside each page component.
  useEffect(() => {
    if (!animDone) return
    const observers = []
    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (!el) continue
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActiveId(section.id)
          }
        },
        { rootMargin: '-30% 0px -60% 0px' },
      )
      observer.observe(el)
      observers.push(observer)
    }
    return () => observers.forEach((observer) => observer.disconnect())
  }, [animDone, sections])

  // Center the active item in this page's mobile TOC without scrolling the page.
  useEffect(() => {
    const toc = tocRef.current
    const active = toc?.querySelector('.pp-toc-item.is-active')
    if (!toc || !active) return
    const tocRect = toc.getBoundingClientRect()
    const itemRect = active.getBoundingClientRect()
    const offset =
      (itemRect.left + itemRect.width / 2) -
      (tocRect.left + tocRect.width / 2)
    if (Math.abs(offset) > 1) {
      toc.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }, [activeId])

  return { scrolled, activeId, animDone, tocRef }
}
