import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import './projects/MobileRouter.css'

function Projects() {
  return (
    <>
      <Helmet>
        <title>Projects | Portfolio</title>
        <meta name="description" content="My projects" />
      </Helmet>
      <main style={{ padding: '2rem' }}>
        <h1>Projects</h1>
        <p>Projects page content goes here.</p>
        <Link to="/" className="back-link" aria-label="Back to home">←</Link>
      </main>
    </>
  )
}

export default Projects
