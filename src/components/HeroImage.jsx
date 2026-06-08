import { useEffect, useRef, useState } from 'react'
import { asset } from '../utils/asset.js'

// Hero media for project pages. Reserves the image's aspect via width/height
// attributes (so there's no layout shift and the skeleton box is correctly
// sized), shows a shimmer skeleton until the image decodes, fades it in, and
// marks it fetchpriority="high" so this LCP image downloads ahead of the
// rest of the page's media.
export default function HeroImage({ src, alt, width, height }) {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // A cached image can finish loading before React attaches onLoad, which
  // would leave it stuck hidden. Catch that case on mount.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [])

  return (
    <div className={`pp-hero pp-hero--skeleton${loaded ? ' is-loaded' : ''}`}>
      <img
        ref={ref}
        className={`pp-hero-image${loaded ? ' is-loaded' : ''}`}
        src={asset(src)}
        alt={alt}
        width={width}
        height={height}
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
