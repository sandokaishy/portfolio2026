// Resolve a public-folder asset against Vite's base URL so absolute paths
// work both in dev (base "/") and on GitHub Pages (base "/portfolio2026/").
// Hardcoded string paths like "/play/foo.png" are NOT rewritten by Vite —
// only built/imported assets are — so they must go through this helper.
//   asset('/play/foo.png') -> '/portfolio2026/play/foo.png' (build)
//                          -> '/play/foo.png'               (dev)
export function asset(path) {
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`
}
