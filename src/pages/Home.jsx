import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import OrganicLoader from '../components/OrganicLoader.jsx'
import OrganicLoaderTags from '../components/OrganicLoaderTags.jsx'
import { projects, defaultTags } from '../data/projects.js'
import './Home.css'

// projects[i] → blob shape index (1=Compose, 2=Orbit, 3=Extrude, 4=Sharpen, 5=Stretch).
// 0 = organic blob (default, no hover).
const PROJECT_SHAPES = [1, 2, 5, 4, 3]

function Home() {
  const loaderRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  // Mount the heavy OrganicLoader AFTER the loading screen has had time
  // to establish its CSS animations on the compositor. Without this gap,
  // Three.js's first render — which compiles shaders synchronously — runs
  // moments after mount and can pause the loading-screen animations on the
  // main/compositor thread. 500ms gives the loader's first headline cycle
  // a fully clean run before any GPU contention. Once mounted, OrganicLoader
  // dispatches `organic-loader-ready` after its first paint, which App.jsx
  // waits on before fading the loading screen — so the user still sees the
  // visual already in place when the loader hides.
  const [loaderMounted, setLoaderMounted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setLoaderMounted(true), 500)
    return () => clearTimeout(id)
  }, [])

  const handleProjectEnter = (i) => {
    setActiveIdx(i)
    loaderRef.current?.setShape(PROJECT_SHAPES[i] ?? 0)
  }
  const handleListLeave = () => {
    setActiveIdx(-1)
    loaderRef.current?.setShape(0)
  }

  const tags = activeIdx >= 0 ? projects[activeIdx].tags : defaultTags

  return (
    <>
      <Helmet>
        <title>Sheng Pan | Portfolio</title>
        <meta
          name="description"
          content="Adapting to diverse domain, designing product across IoT, Fintech and Recruiting."
        />
      </Helmet>
      <main className="home">
        {loaderMounted && (
          <>
            <OrganicLoader ref={loaderRef} className="home-visual" />
            <OrganicLoaderTags loaderRef={loaderRef} tags={tags} />
          </>
        )}

        <header className="hero">
          <h1 className="hero-title">
            Hello<br />I&rsquo;m Sheng.
          </h1>
          <p className="hero-subtitle">Product designer</p>
        </header>

        <nav
          className="project-nav"
          onMouseLeave={handleListLeave}
        >
          {projects.map((project, i) => (
            <Link
              key={project.name}
              to={project.path}
              className={`project-nav-item${activeIdx === i ? ' is-active' : ''}`}
              onMouseEnter={() => handleProjectEnter(i)}
            >
              <span className="project-nav-number" aria-hidden="true">{i + 1}</span>
              <span className="project-nav-label">{project.name}</span>
            </Link>
          ))}
        </nav>

        <p className="hero-body">
          Adapting to diverse domain,<br />
          designing product across <strong>IoT</strong>, <strong>Fintech</strong> and <strong>Recruiting</strong>.<br />
          Click <Link to="/about" className="hero-body-link">here</Link> to know more about me.
        </p>
      </main>
    </>
  )
}

export default Home
