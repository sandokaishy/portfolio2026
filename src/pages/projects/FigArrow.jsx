import { Fragment, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getProjectByPath } from '../../data/projects.js'
import './MobileRouter.css'

function Placeholder({ name, aspect = '16/9', color }) {
  return (
    <div className="placeholder" style={{ aspectRatio: aspect, backgroundColor: color }}>
      <span>{name}</span>
    </div>
  )
}

const PROCESS_STEPS = [
  'Exploration',
  'Feasibility Check',
  'MVP',
  'Design Ver.1',
  'Iteration',
  'Confident Ver.',
]

// Indices < LOOP_UNTIL render as iteration loops (curved back-and-forth);
// the rest are straight forward arrows. Reflects the body text:
// "jumping back and forth between ideation and feasibility checks…
// once the core logic was proven viable, [the linear progression began]."
const LOOP_UNTIL = 2

function ProcessDiagram() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`process-diagram${visible ? ' is-visible' : ''}`}
      role="img"
      aria-label="Process flow: Exploration ↔ Feasibility Check ↔ MVP → Design Ver.1 → Iteration → Confident Ver."
    >
      {PROCESS_STEPS.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <div className="process-connector" style={{ '--i': i - 1 }}>
              {i <= LOOP_UNTIL ? <LoopArrow /> : <StraightArrow />}
            </div>
          )}
          <div className="process-step" style={{ '--i': i }}>
            <span>{label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function LoopArrow() {
  // viewBox is normalized; preserveAspectRatio=none stretches the curve to
  // fit any flex width. vector-effect keeps stroke weight stable.
  return (
    <svg
      className="process-svg process-svg--loop"
      viewBox="0 0 80 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* upper forward arc */}
      <path
        className="process-arc process-arc--forward"
        d="M 2 22 C 18 2, 62 2, 78 22"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      {/* lower return arc */}
      <path
        className="process-arc process-arc--back"
        d="M 78 22 C 62 42, 18 42, 2 22"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      {/* perpetual "iteration" runner traveling around the loop */}
      <path
        className="process-arc-runner"
        d="M 2 22 C 18 2, 62 2, 78 22 C 62 42, 18 42, 2 22"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    </svg>
  )
}

function StraightArrow() {
  return (
    <svg
      className="process-svg process-svg--line"
      viewBox="0 0 80 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        className="process-line"
        x1="2"
        y1="10"
        x2="74"
        y2="10"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        className="process-line-head"
        points="68,6 76,10 68,14"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    </svg>
  )
}

const project = getProjectByPath('/projects/figarrow')

// Solo side project — no team list, so the aside renders the TOC directly.
const SECTIONS = [
  { id: 'background', label: 'Background' },
  { id: 'feasibility', label: 'Feasibility' },
  { id: 'right-question', label: 'Right Question' },
  { id: 'v1', label: 'Design-less V1' },
  { id: 'expanding', label: 'Expanding Features' },
  { id: 'takeaways', label: 'Takeaways' },
]

function FigArrow() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const [animDone, setAnimDone] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setAnimDone(true), 720)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!animDone) return
    const observers = []
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (!el) continue
      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) setActiveId(s.id)
          }
        },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [animDone])

  return (
    <>
      <Helmet>
        <title>FigArrow: Figma Plugin | Sheng Pan</title>
        <meta
          name="description"
          content="Building a Figma plugin from 0 to 1 with AI — inserting FigJam connectors, shapes, and cursors into Figma."
        />
      </Helmet>

      <article className={`pp-shell${animDone ? ' pp-shell--ready' : ''}`}>
        <aside className="pp-aside">
          <Link to="/" className="pp-back" aria-label="Back to home">←</Link>

          <header className="pp-aside-header">
            <h1 className="pp-name">FigArrow</h1>
            <p className="pp-tagline">
              Building a Figma plugin from 0 to 1 with AI — inserting FigJam
              connectors, shapes, and cursors into Figma.
            </p>
            <p className="pp-eyebrow">Side Project, 2025</p>
          </header>

          <div className="pp-aside-meta">
            <ul className="pp-toc">
              {SECTIONS.map((s, i) => (
                <li
                  key={s.id}
                  className={`pp-toc-item${s.id === activeId ? ' is-active' : ''}`}
                  style={{ '--i': i }}
                >
                  <a href={`#${s.id}`}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="pp-main">
          <div className="pp-hero">
            <img
              className="pp-hero-image"
              src="/figarrow/hero-figarrow.jpg"
              alt="FigArrow hero"
            />
          </div>

          <section id="background" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>BACKGROUND</h2></div>
              <p className="section-body">
                To maintain a clear view of user flows, I've always relied on
                the <strong>Give me FigJam Connector</strong> plugin to add
                connectors between mockups in Figma. However, one day the
                plugin suddenly stopped working, which threw a wrench in my
                daily workflow. While the Figma community has no shortage of
                alternative connector plugins, I saw this as the perfect
                opportunity to try building my own tool from scratch with the
                help of AI.
              </p>
              <p className="section-body">
                This article documents my experience collaborating with AI to
                bring a Figma plugin from 0 to 1.
              </p>
            </div>
          </section>

          <section id="tools" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>THE TOOLS I USE</h2></div>
              <ul className="section-list">
                <li>
                  <strong>Claude Code (Opus 4.6)</strong> — An MCP Client,
                  referred to as "Claude" moving forward.
                </li>
                <li>
                  <strong>Figma Console MCP</strong> (Powered by Southleft)
                </li>
                <li>
                  <strong>Figma Desktop Bridge</strong> → Figma Plugin
                  (Powered by Southleft)
                </li>
              </ul>
            </div>
          </section>

          <section id="process" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>THE PROCESS</h2></div>
              <p className="section-body">
                Instead of having a solid functional spec, the process moved
                at a high tempo, jumping back and forth between ideation and
                feasibility checks. Once the core logic was proven viable, I
                began designing the initial UI and interactions on the MVP
                Claude had built. From there, we entered a continuous cycle
                of iteration, adding features until the full version was
                ready.
              </p>
              <ProcessDiagram />
            </div>
          </section>

          <section id="feasibility" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>EVALUATING FEASIBILITY</h2></div>
              <p className="section-body">
                Initially, I didn't have a concrete spec, just a simple
                concept: a plugin that lets me insert FigJam connectors
                between two objects in Figma. I pitched this simple idea to
                Claude.
              </p>
              <p className="section-body">
                Claude began by "reading" the Figma plugin documentation and
                drafting a development plan. We immediately hit our first
                roadblock:{' '}
                <strong>
                  Figma's plugin API does not expose a CreateConnector method.
                </strong>{' '}
                Given this constraint, Claude proposed two workarounds:
              </p>
            </div>

            <div className="challenge-grid">
              <div className="pp-block">
                <h3>Option 1: Standard Figma APIs</h3>
                <p>
                  Create a connector using standard Figma APIs (not a native
                  FigJam connector). Highly customizable, but it lacks the
                  "snapping" behavior — if a user moves a frame, the plugin
                  must be triggered again to update the connector's position.
                </p>
              </div>
              <div className="pp-block">
                <h3>Option 2: The "Template" Approach</h3>
                <p>
                  Have the user copy a FigJam connector into the file first,
                  then use the plugin to grab that connector and link it to
                  selected frames. Full access to native FigJam connector
                  behavior, but users have to perform a "setup" in every new
                  file.
                </p>
              </div>
            </div>

            <p className="section-body">
              The second option was exactly how <em>Give me FigJam Connector</em>{' '}
              operated. But I wanted more. If I could "carry" a custom
              connector within the plugin across different files, it would
              save the user the trouble of manual setup while offering
              flexibility in styling. I decided to double down on the second
              direction, specifically aiming to "output" native FigJam
              connectors.
            </p>
          </section>

          <section id="pushing" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>
                PUSHING THE BOUNDARIES OF CONSTRAINTS
              </h2></div>
              <p className="section-body">
                Knowing I couldn't directly call a "create" command, I tried
                describing my vision from different angles: Can the plugin
                "remember" a FigJam connector's style and paste it whenever
                the user needs it? Can the plugin simulate the "Copy from
                FigJam, Paste to Figma" behavior? We kept hitting walls —
                plugins can't natively "create" these connectors, store them
                as assets to be "pasted," or fully control the system
                clipboard in that specific way.
              </p>
            </div>
          </section>

          <section id="right-question" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>
                RETURNING TO THE SOURCE: ASKING THE RIGHT QUESTION
              </h2></div>
              <p className="section-body">
                I took a step back. What I really wanted was a FigJam
                connector. When we copy something from FigJam and paste it
                into Figma, that data must exist in the clipboard in a
                specific format that Figma recognizes. So, I asked:
              </p>
              <ul className="section-list">
                <li>
                  What exactly is being copied when I copy a FigJam connector?
                </li>
                <li>
                  If Figma can recognize a connector from the clipboard, can
                  we pre-store that data structure within the plugin and
                  write it to the clipboard for the user?
                </li>
              </ul>
              <p className="section-body">
                Claude then built a few internal "mini-tools" to help me
                inspect the connector's data format and verify if we could
                write that data back to the clipboard.
              </p>
            </div>

            <div className="pp-block">
              <h3>Deconstructing the Clipboard Data</h3>
              <p>
                Claude wrote a simple inspector page to reveal the underlying
                HTML/data structure of a FigJam connector when copied.
              </p>
              <Placeholder name="capture-clipboard.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Validating the "Capture & Write" Logic</h3>
              <p>
                We needed to see if we could store this "captured" structure
                and successfully re-write it to the clipboard. Claude set up
                a test to compare the structure of a re-written connector
                against an original FigJam connector. The results were
                identical! This proved we could "capture" the essence of a
                FigJam connector, store it in the plugin, and deploy it on
                demand.
              </p>
              <Placeholder name="capture-write-validation.png" aspect="16/10" />
            </div>
          </section>

          <section id="v1" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>THE "DESIGN-LESS" V1</h2></div>
              <p className="section-body">
                Once the logic was validated, I fed the HTML structure
                captured by my "FigArrow Capture Template" to Claude. This
                stage had no design mocks — only vague requirements: ability
                to set connector color and text labels, a "Copy" button to
                write the configured connector to the clipboard, and
                selecting two frames to have the connector automatically
                link them upon pasting.
              </p>
              <Placeholder name="figarrow-v1.png" aspect="16/10" />
            </div>
          </section>

          <section id="ui-refinement" className="pp-section">
            <div className="section-heading"><h2>
              UI REFINEMENT & DIRECT IMPLEMENTATION
            </h2></div>

            <div className="pp-block">
              <h3>Quick Iteration with Figma Console MCP</h3>
              <p>
                With the core functionality verified, I designed the initial
                plugin UI. Using Figma Desktop Bridge and Figma Console MCP,
                the workflow became incredibly fluid: select the design
                components in Figma → tell Claude my requirements → the MCP
                identifies the selected layers → Claude interprets and
                implements the code. This allowed me to adjust the UI and
                even fine-tune icons with precision without ever needing to
                share a file link.
              </p>
              <Placeholder name="figarrow-iteration-1.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Navigating UI Constraints & Trade-offs</h3>
              <p>
                I eventually ran into a technical limitation: to keep the
                "FigArrow" aesthetic, I opted for custom color pickers and
                dropdowns instead of native browser inputs. However, because
                these custom containers are nested within the plugin window,
                they would get clipped by the window borders. Claude
                suggested a compromise: dynamically resizing the plugin
                window to accommodate the open dropdowns/pickers.
              </p>
              <Placeholder name="figarrow-iteration-2.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Reducing "UI Jitter" and Screen Real Estate</h3>
              <p>
                After testing the first version, the constant window resizing
                felt "jittery" and took up too much space in the Figma
                workspace. I decided to pivot the UI pattern, opting for a
                more compact layout for style and color selection to keep
                the experience seamless.
              </p>
              <Placeholder name="figarrow-final-ui.png" aspect="16/10" />
            </div>
          </section>

          <section id="expanding" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>EXPANDING THE FEATURE SET</h2></div>
              <p className="section-body">
                When drawing flows, we often use shapes to represent logic or
                conditions. Since I had already proven the "capture" method
                worked, I applied it to <strong>FigJam Shapes</strong> and{' '}
                <strong>Containers</strong>.
              </p>
              <p className="section-body">
                Why not just generate shapes via the standard Plugin API?
                While the API can create shapes easily, FigJam Shapes behave
                like "child components" when pasted into Figma — they don't
                show layer name labels, making for a much cleaner UI flow.
                This "cleanliness" is why I insisted on capturing the native
                FigJam versions. Finally, I added a{' '}
                <strong>Cursor</strong> feature to let users describe
                interactions more clearly.
              </p>
              <Placeholder name="figarrow-full-version.png" aspect="16/10" />
            </div>
          </section>

          <section id="takeaways" className="pp-section">
            <div className="section-heading"><h2>TAKEAWAYS</h2></div>

            <div className="pp-block">
              <h3>
                1. AI validates ideas fast; human imagination breaks the
                "Doc Prison"
              </h3>
              <p>
                For designers who don't code, Claude Code drastically
                shortens the time between "What if?" and "It works." It
                helps us evaluate technical feasibility early, preventing us
                from over-designing impossible features. While AI knows the
                "rules" of the documentation, we provide the "creative
                sparks" to find the gaps in those walls.
              </p>
            </div>

            <div className="pp-block">
              <h3>
                2. Ask the right questions (Domain knowledge still matters)
              </h3>
              <p>
                Much of the early struggle was due to a lack of knowledge
                regarding how the Clipboard API works. We spent time
                wandering until we hit the right terminology. The more
                technical context a designer has, the faster they can guide
                the AI out of the fog.
              </p>
            </div>

            <div className="pp-block">
              <h3>
                3. Break down requirements: focus on the core, then
                satellite functions
              </h3>
              <p>
                When evaluating feasibility, I initially threw all my
                requirements at Claude at once. Claude tried to satisfy
                every condition by making certain trade-offs, which resulted
                in a technically feasible solution that didn't actually meet
                the experience I wanted. I learned that it's better to
                break down the requirements: focus on the core function
                first — like ensuring the plugin can "hold" a connector —
                and only then start adding instructions for auto-linking
                and customization.
              </p>
            </div>

            <div className="pp-block">
              <h3>4. Figma Console MCP is a game-changer</h3>
              <p>
                The bidirectional communication between Figma and Claude
                Code is incredible. Being able to point at a layer and say
                "Make the plugin look like this" or "Adjust this
                interaction" makes the development process feel like a
                natural extension of the design process. A huge "thumbs
                up" to TJ Pitre for this tool!
              </p>
            </div>
          </section>
        </main>
      </article>
    </>
  )
}

export default FigArrow
