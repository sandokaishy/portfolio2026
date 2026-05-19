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

// Tag annotations for the V1 plugin UI, ported from the Figma frame
// "Design Less V1". Container is sized 5:4 (viewBox 1200×960) with the
// plugin image scaled to 40% width centered + top:12%. Each tag's
// top-left is given in % of the canvas; the V1_LINES below are straight
// line segments in viewBox coords from a landmark on the plugin image
// to the tag's near edge.
// Edge-anchored alignment columns:
//   - LEFT tags:  CSS `right: 72%` → tag right-edge sits at 28% from the
//     container's left, which is x=336 in the 1200-wide viewBox.
//   - RIGHT tags: CSS `left: 72%`  → tag left-edge sits at 72% from the
//     container's left, which is x=864 in the viewBox.
// 28% / 72% leaves a 4%-wide breathing gap on either side of the 36%
// image (which spans 32%..68%) — clearer separation between annotation
// and subject — while still letting the widest pill (~145 CSS px) fit
// at the narrowest desktop container (~526 CSS px).
// top% values shifted down 7% from the original layout to track the
// image's new vertical center (top: 19%). Tags track UI elements on
// the plugin image, so they move together when the image moves.
const V1_TAGS = [
  { id: 'label-color',       label: 'Label Color',       side: 'left',  top: '26.00%' },
  { id: 'connector-label',   label: 'Connector Label',   side: 'right', top: '21.00%' },
  { id: 'label-background',  label: 'Label Background',  side: 'right', top: '37.00%' },
  { id: 'stroke',            label: 'Stroke',            side: 'right', top: '48.00%' },
  { id: 'connector-color',   label: 'Connector Color',   side: 'left',  top: '48.00%' },
  { id: 'connector-type',    label: 'Connector Type',    side: 'left',  top: '60.00%' },
  { id: 'start-point',       label: 'Start Point',       side: 'left',  top: '77.00%' },
  { id: 'end-point',         label: 'End Point',         side: 'right', top: '63.00%' },
  { id: 'connector-preview', label: 'Connector Preview', side: 'right', top: '81.00%' },
]

// Straight line segments. Each line ends at the corresponding tag's
// alignment column AND at the tag's vertical center. Left-side tags
// terminate at x=350 (10 units past the x=360 right-edge column, into
// the pill's interior). Right-side tags terminate at x=850 (10 units
// past the x=840 left-edge column). The opaque tag background hides the
// small overlap so the line visually meets the tag's border at its
// mid-point. Image-side coordinates target the corresponding UI element
// inside the 36%-wide image (viewBox x=384..816, y=115..708).
// Image-side Y values shifted down by 67 viewBox units (≈7% of 960) to
// track the image's new vertical center (top: 19% → image landmarks
// move with it). Tag-side Y values follow each tag's updated top%:
// tag center y = top% × 9.6 + 14.
// Each line: `from` is the landmark on the plugin image (drawn with a
// small filled circle so the connection visibly anchors to the UI
// element); `to` is the corresponding tag's alignment column with a
// 10-unit overshoot into the tag's interior (masked by the tag's
// opaque background so the line reads as terminating at the tag edge).
// Left column x=336 (28% × 1200). Right column x=874 (72% × 1200 + 10).
const V1_LINES = [
  { from: [405, 313], to: [326, 264] },   // Label Color
  { from: [600, 259], to: [874, 216] },   // Connector Label
  { from: [751, 348], to: [874, 369] },   // Label Background
  { from: [708, 461], to: [874, 475] },   // Stroke
  { from: [405, 437], to: [326, 475] },   // Connector Color
  { from: [427, 520], to: [326, 590] },   // Connector Type
  { from: [449, 597], to: [326, 753] },   // Start Point
  { from: [686, 597], to: [874, 619] },   // End Point
  { from: [600, 674], to: [874, 792] },   // Connector Preview
]

function DesignLessAnnotated() {
  return (
    <div className="annotated-diagram">
      <img
        className="annotated-diagram-img"
        src="/figarrow/figarrow-v1.jpg"
        alt="FigArrow V1 plugin UI"
      />
      <svg
        className="annotated-diagram-lines"
        viewBox="0 0 1200 960"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {V1_LINES.map((l, i) => (
          <Fragment key={i}>
            <path d={`M ${l.from[0]} ${l.from[1]} L ${l.to[0]} ${l.to[1]}`} />
            <circle cx={l.from[0]} cy={l.from[1]} r="4" />
          </Fragment>
        ))}
      </svg>
      {V1_TAGS.map((t) => {
        // Left-side tags anchor via `right: 72%` so their right edges share
        // the same column (x=336 in viewBox); right-side tags anchor via
        // `left: 72%` so their left edges share the column (x=864).
        const horizontal =
          t.side === 'left' ? { right: '72%' } : { left: '72%' }
        return (
          <span
            key={t.id}
            className="annotated-tag"
            style={{ ...horizontal, top: t.top }}
          >
            {t.label}
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
                src="/figarrow/template-capture.jpg"
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
                src="/figarrow/clipboard-write.jpg"
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
                src="/figarrow/figarrow-iteration-1.jpg"
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
                src="/figarrow/figarrow-iteration-2.jpg"
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
                <source src="/figarrow/extended.webm" type="video/webm" />
                <source src="/figarrow/extended.mp4" type="video/mp4" />
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
                <source src="/figarrow/overlaid.webm" type="video/webm" />
                <source src="/figarrow/overlaid.mp4" type="video/mp4" />
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
                src="/figarrow/figarrow-final.jpg"
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
                <source src="/figarrow/figarrow-demo.webm" type="video/webm" />
                <source src="/figarrow/figarrow-demo.mp4" type="video/mp4" />
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
