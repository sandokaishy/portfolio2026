import { Fragment, useEffect, useRef, useState } from 'react'
import { asset } from '../../utils/asset.js'
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

  // Vertical flow: pill, then connector, then pill, repeat. The first
  // connector (between Exploration and Feasibility) is the "iteration"
  // one — two straight arrows side by side (down + up). All others are
  // a single down arrow.
  return (
    <div
      ref={ref}
      className={`process-diagram${visible ? ' is-visible' : ''}`}
      role="img"
      aria-label="Process flow: Exploration ↔ Feasibility Check → MVP → Design Ver.1 → Iteration → Confident Ver."
    >
      {PROCESS_STEPS.map((label, i) => (
        <Fragment key={label}>
          <div className="process-step" style={{ '--i': i * 2 }}>
            <span>{label}</span>
          </div>
          {i < PROCESS_STEPS.length - 1 && (
            <div
              className={
                'process-connector' +
                (i === 0 ? ' process-connector--iteration' : '')
              }
              // --i drives the staggered draw-in; --bob-i drives the
              // ongoing chevron animation's phase offset so all five
              // connectors (iteration + four below-feasibility) take
              // turns moving through their respective arrows.
              style={{ '--i': i * 2 + 1, '--bob-i': i }}
            >
              {i === 0 ? (
                <>
                  <ProcessArrow direction="down" />
                  <ProcessArrow direction="up" />
                </>
              ) : (
                <ProcessArrow direction="down" />
              )}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}

function ProcessArrow({ direction }) {
  // 12×28 viewBox: stem from y=2→22 with a chevron at y=20..26 (down) or
  // stem from y=6→26 with a chevron at y=2..8 (up). 1px stem and 1.2px
  // chevron stroke keep the line crisp at small sizes.
  return (
    <svg
      className={`process-arrow process-arrow--${direction}`}
      viewBox="0 0 12 28"
      aria-hidden="true"
    >
      {direction === 'down' ? (
        <>
          {/* Line ends exactly where the chevron vertex sits so they read
              as one continuous mark. */}
          <line x1="6" y1="2" x2="6" y2="26" />
          <path d="M 2 22 L 6 26 L 10 22" fill="none" />
        </>
      ) : (
        <>
          <line x1="6" y1="2" x2="6" y2="26" />
          <path d="M 2 6 L 6 2 L 10 6" fill="none" />
        </>
      )}
    </svg>
  )
}

// Tag annotations for the V1 plugin UI, ported 1:1 from the Figma frame
// "Design Less V1" (node 179:923, a 1200×800 canvas). The SVG below uses
// that exact 1200×800 viewBox so every coordinate is the Figma coordinate.
// The plugin image occupies the same rect as Figma's "image 22"
// (x381 y103, 437×600 → left 31.75%, top 12.875%, width 36.417%); the
// figarrow-v1.jpg screenshot shares that aspect (1748×2402 ≈ 0.728), so
// the connector dots land precisely on the UI elements they point to.
//
// Each connector is an orthogonal (elbow) polyline matching the Figma
// VECTOR nodes. `dot` is the UI-side anchor — a pulsing ring sits there
// permanently to invite hover. `points` run UI-side → tag-side; corners are
// rounded by roundedPath() and the dashes march from the dot toward the tag
// on hover. Tag-side X is snapped to the shared edge column (left tags
// right-edge x=284, right tags left-edge x=923) so the line meets the tag
// border; `cy` is the tag's vertical center, used to position it so the
// line connects mid-edge.
const V1_CONNECTORS = [
  { id: 'label-color',       label: 'Label Color',       side: 'left',  cy: 170.5, dot: [407, 271],     points: [[407, 271], [340.5, 271], [340.5, 170.5], [284, 170.5]] },
  { id: 'connector-color',   label: 'Connector Color',   side: 'left',  cy: 318.5, dot: [416, 361],     points: [[416, 361], [337, 361], [337, 318.5], [284, 318.5]] },
  { id: 'connector-type',    label: 'Connector Type',    side: 'left',  cy: 464.5, dot: [406, 434],     points: [[406, 434], [335.5, 434], [335.5, 464.5], [284, 464.5]] },
  { id: 'start-point',       label: 'Start Point',       side: 'left',  cy: 610,   dot: [406, 511],     points: [[406, 511], [345.5, 511], [345.5, 610], [284, 610]] },
  { id: 'connector-label',   label: 'Connector Label',   side: 'right', cy: 173,   dot: [512.5, 202.5], points: [[512.5, 202.5], [859.5, 202.5], [859.5, 173], [923, 173]] },
  { id: 'label-background',  label: 'Label Background',  side: 'right', cy: 274,   dot: [787, 274],     points: [[787, 274], [923, 274]] },
  { id: 'stroke',            label: 'Stroke',            side: 'right', cy: 360,   dot: [787, 360],     points: [[787, 360], [923, 360]] },
  { id: 'end-point',         label: 'End Point',         side: 'right', cy: 474.5, dot: [761.5, 503],   points: [[761.5, 503], [869.5, 503], [869.5, 474.5], [923, 474.5]] },
  { id: 'connector-preview', label: 'Connector Preview', side: 'right', cy: 586,   dot: [787, 586],     points: [[787, 586], [923, 586]] },
]

// Build an SVG path from a polyline, rounding each interior corner. The
// corner radius is `frac` (20%) of the shorter of the two segments meeting
// at that corner, so bends stay proportional regardless of leg length.
function roundedPath(points, frac = 0.2) {
  if (points.length < 3) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`
  }
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]
    const [cx, cy] = points[i]
    const [nx, ny] = points[i + 1]
    const l1 = Math.hypot(px - cx, py - cy)
    const l2 = Math.hypot(nx - cx, ny - cy)
    const r = Math.min(l1, l2) * frac
    const a = [cx + ((px - cx) / l1) * r, cy + ((py - cy) / l1) * r]
    const b = [cx + ((nx - cx) / l2) * r, cy + ((ny - cy) / l2) * r]
    d += ` L ${a[0]} ${a[1]} Q ${cx} ${cy} ${b[0]} ${b[1]}`
  }
  const last = points[points.length - 1]
  d += ` L ${last[0]} ${last[1]}`
  return d
}

// Shared edge columns (% of the 1200-wide canvas) the tags anchor to.
const LEFT_TAG_RIGHT = `${((1200 - 284) / 1200) * 100}%`  // left tags: right edge
const RIGHT_TAG_LEFT = `${(923 / 1200) * 100}%`           // right tags: left edge

function DesignLessAnnotated() {
  // Which annotation is revealed. Connectors are hidden by default and
  // draw in only while their tag is hovered (or keyboard-focused).
  const [active, setActive] = useState(null)

  return (
    <div className="annotated-diagram">
      <h4 className="annotated-hint">Hover to see details</h4>
      <img
        className="annotated-diagram-img"
        src={asset('/figarrow/figarrow-v1.jpg')}
        alt="FigArrow V1 plugin UI"
      />
      <svg
        className="annotated-diagram-lines"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {V1_CONNECTORS.map((c, i) => (
          <g
            key={c.id}
            className={`annot-conn${active === c.id ? ' is-active' : ''}`}
            onMouseEnter={() => setActive(c.id)}
            onMouseLeave={() => setActive((cur) => (cur === c.id ? null : cur))}
          >
            {/* Permanent pulsing ring at the UI anchor — the hover hint.
                Staggered so the nine dots don't pulse in unison. */}
            <circle
              className="annot-ripple"
              cx={c.dot[0]}
              cy={c.dot[1]}
              r="7"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
            {/* Rounded-corner elbow; dashes march dot→tag while active. */}
            <path className="annot-line" d={roundedPath(c.points)} />
            <circle className="annot-dot" cx={c.dot[0]} cy={c.dot[1]} r="7" />
            {/* Invisible, larger hit target so the dot is easy to hover. */}
            <circle
              className="annot-hit"
              cx={c.dot[0]}
              cy={c.dot[1]}
              r="18"
            />
          </g>
        ))}
      </svg>
      {V1_CONNECTORS.map((c) => {
        const horizontal =
          c.side === 'left'
            ? { right: LEFT_TAG_RIGHT }
            : { left: RIGHT_TAG_LEFT }
        const clear = () => setActive((cur) => (cur === c.id ? null : cur))
        return (
          <span
            key={c.id}
            className={`annotated-tag${active === c.id ? ' is-active' : ''}`}
            style={{ ...horizontal, top: `${(c.cy / 800) * 100}%` }}
            tabIndex={0}
            onMouseEnter={() => setActive(c.id)}
            onMouseLeave={clear}
            onFocus={() => setActive(c.id)}
            onBlur={clear}
          >
            {c.label}
          </span>
        )
      })}
    </div>
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

  // Keep the active TOC item centered inside the horizontally-scrollable
  // .pp-toc bar (relevant on mobile where the TOC is fixed bottom and may
  // overflow). Scrolls only the bar, never the page.
  useEffect(() => {
    const toc = document.querySelector('.pp-toc')
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
              src={asset('/figarrow/hero-figarrow.jpg')}
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
              <div className="challenge-option">
                <span className="challenge-option-num" aria-hidden="true">1</span>
                <div className="challenge-option-body">
                  <h4>Standard Figma APIs</h4>
                  <p>
                    Create a connector using standard Figma APIs (not a
                    native FigJam connector). Highly customizable, but it
                    lacks the "snapping" behavior — if a user moves a
                    frame, the plugin must be triggered again to update
                    the connector's position.
                  </p>
                </div>
              </div>
              <div className="challenge-option">
                <span className="challenge-option-num" aria-hidden="true">2</span>
                <div className="challenge-option-body">
                  <h4>The "Template" Approach</h4>
                  <p>
                    Have the user copy a FigJam connector into the file
                    first, then use the plugin to grab that connector and
                    link it to selected frames. Full access to native
                    FigJam connector behavior, but users have to perform a
                    "setup" in every new file.
                  </p>
                </div>
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
              <div className="conversation-list">
                <div className="conversation">
                  <span className="conversation-quote" aria-hidden="true">“</span>
                  <span className="conversation-text">
                    What exactly is being copied when I copy a FigJam
                    connector?
                  </span>
                  <span className="conversation-quote" aria-hidden="true">”</span>
                </div>
                <div className="conversation">
                  <span className="conversation-quote" aria-hidden="true">“</span>
                  <span className="conversation-text">
                    If Figma can recognize a connector from the clipboard,
                    can we pre-store that data structure within the plugin
                    and write it to the clipboard for the user?
                  </span>
                  <span className="conversation-quote" aria-hidden="true">”</span>
                </div>
              </div>
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
              <img
                className="pp-block-image"
                src={asset('/figarrow/template-capture.jpg')}
                alt="Template Capture — inspector showing the FigJam connector's clipboard data structure"
              />
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
              <img
                className="pp-block-image"
                src={asset('/figarrow/clipboard-write.jpg')}
                alt="Clipboard Write — re-written connector matches the original FigJam structure"
              />
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
              <DesignLessAnnotated />
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
              <img
                className="pp-block-image"
                src={asset('/figarrow/figarrow-iteration-1.jpg')}
                alt="Iterating on the FigArrow plugin UI via Figma Console MCP"
              />
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
              <img
                className="pp-block-image"
                src={asset('/figarrow/figarrow-iteration-2.jpg')}
                alt="Dynamic plugin-window resize accommodating custom dropdown/picker overlays"
              />
            </div>

            <div className="pp-block">
              <h3>Reducing "UI Jitter" and Screen Real Estate</h3>
              <p>
                After testing the first version, the constant window
                resizing felt "jittery" and took up too much space in the
                Figma workspace.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Extended dropdown state in the final FigArrow plugin UI"
              >
                <source src={asset('/figarrow/extended.webm')} type="video/webm" />
                <source src={asset('/figarrow/extended.mp4')} type="video/mp4" />
              </video>
            </div>

            <div className="pp-block">
              <p>
                I decided to pivot the UI pattern, opting for a more
                compact layout for style and color selection to keep the
                experience seamless.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Overlaid picker state in the final FigArrow plugin UI"
              >
                <source src={asset('/figarrow/overlaid.webm')} type="video/webm" />
                <source src={asset('/figarrow/overlaid.mp4')} type="video/mp4" />
              </video>
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
              <img
                className="pp-block-image"
                src={asset('/figarrow/figarrow-final.jpg')}
                alt="FigArrow plugin showing the full feature set"
              />
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="FigArrow plugin demo: inserting connectors, shapes, and cursors"
              >
                <source src={asset('/figarrow/figarrow-demo.webm')} type="video/webm" />
                <source src={asset('/figarrow/figarrow-demo.mp4')} type="video/mp4" />
              </video>
              <a
                className="pp-cta"
                href="https://www.figma.com/community/plugin/1613174355365041755"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try it on Figma →
              </a>
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
