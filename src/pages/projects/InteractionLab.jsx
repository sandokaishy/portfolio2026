import { useEffect, useState } from 'react'
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

const project = getProjectByPath('/projects/interaction-lab')

// Solo project — no team list, so the aside renders the TOC immediately
// (no team→toc cross-fade pattern needed).
const SECTIONS = [
  { id: 'why-prototypes', label: 'Why Prototypes Matter' },
  { id: 'cafe-feeds', label: 'Café Feeds' },
  { id: 'skeleton', label: 'Skeleton Loading' },
  { id: 'nav-countdown', label: 'Nav & Countdown' },
  { id: 'sticky-header', label: 'Sticky Header' },
  { id: 'birthday-lottery', label: 'Birthday Lottery' },
]

function InteractionLab() {
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
        <title>Interaction Lab | Sheng Pan</title>
        <meta
          name="description"
          content="Some experimental prototypes for micro interaction."
        />
      </Helmet>

      <article className={`pp-shell${animDone ? ' pp-shell--ready' : ''}`}>
        <aside className="pp-aside">
          <Link to="/" className="pp-back" aria-label="Back to home">←</Link>

          <header className="pp-aside-header">
            <h1 className="pp-name">Interaction Lab</h1>
            <p className="pp-tagline">
              Some experimental prototypes for micro interaction.
            </p>
            <p className="pp-eyebrow">Just For Fun, 2020</p>
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
            <Placeholder
              name="hero-interaction-lab.png"
              aspect="5/4"
              color={project.color}
            />
          </div>

          <section id="why-prototypes" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>WHY PROTOTYPES MATTER</h2></div>
              <p className="section-body">
                From static to real interaction. Static mockups can only go so
                far. To validate ideas with real users and communicate complex
                interactions to engineers, I push prototypes closer to the
                real experience — the closer it feels to the final product,
                the more honest the feedback.
              </p>
              <p className="section-body">
                Some were used in usability testing sessions, others helped
                engineers understand the exact motion and logic before
                implementing.
              </p>
            </div>
          </section>

          <section id="cafe-feeds" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>CAFÉ FEEDS</h2></div>
              <p className="section-body">
                Exploring the drag and swipe gesture.
              </p>
            </div>

            <div className="pp-block">
              <h3>Drag, Click: Interaction Inspired By Tinder</h3>
              <p>
                Like Tinder, users can swipe left or right to save café shops
                they are interested in. The interaction is made with drag,
                touch down and touch up triggers. When users drag the card,
                it triggers touch down and drag effects. The card will bound
                back to the position when users release the card if the
                position doesn't meet the condition of save or pass.
              </p>
              <p>
                Users can click the button to save or pass the suggestion. The
                button will trigger the swipe of the card.
              </p>
              <Placeholder name="cafe-drag-swipe.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Reveal Details: Click Cards To See More About The Café</h3>
              <p>
                I use jump and reset response to reveal the detail of each
                card. When users click a card, it scales up to full screen
                size and switches to another scene that contains the café
                information.
              </p>
              <Placeholder name="cafe-reveal-details.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Final Prototype</h3>
              <p>
                It's really fun and easy to make prototypes with ProtoPie. I
                can tweak the interaction behaviors in the prototype to make
                them feel more natural.
              </p>
              <Placeholder name="cafe-final-prototype.png" aspect="16/10" />
            </div>
          </section>

          <section id="skeleton" className="pp-section">
            <div className="section-heading"><h2>SKELETON LOADING</h2></div>

            <div className="pp-block">
              <h3>Reusable, Resizable Component Of Loading Effect</h3>
              <p>
                Skeleton (or partial) loading keeps users from the unease of
                waiting while data is still on the road. We had a lot of need
                for skeleton loading when we created prototypes of vertical
                e-commerce, and similar needs come up for other prototypes too
                — so I created a resizable loading prototype component in
                ProtoPie.
              </p>
              <Placeholder name="skeleton-loading.png" aspect="16/10" />
            </div>
          </section>

          <section id="nav-countdown" className="pp-section">
            <div className="section-heading"><h2>NAVIGATION AND COUNTDOWN CLOCK</h2></div>

            <div className="pp-block">
              <h3>Prototype For Vertical E-Commerce</h3>
              <p>
                I created the prototype to discuss with our engineers when we
                built vertical e-commerce websites. It includes the skeleton
                loading effect while the index page is still loading. The
                bottom navigation is hidden when users scroll down and shown
                when scrolling up. The countdown clock displays products that
                motivates users to buy within limited time.
              </p>
              <Placeholder name="nav-countdown-clock.png" aspect="16/10" />
            </div>
          </section>

          <section id="sticky-header" className="pp-section">
            <div className="section-heading"><h2>STICKY HEADER</h2></div>

            <div className="pp-block">
              <h3>Stick To The Top When Scrolling Through Sections</h3>
              <p>
                Sticky header is used for showing multiple lists with plenty
                of items. When users scroll into a different list, the title
                of the list is fixed to the top of the screen.
              </p>
              <Placeholder name="sticky-header.png" aspect="16/10" />
            </div>
          </section>

          <section id="birthday-lottery" className="pp-section">
            <div className="section-heading"><h2>BIRTHDAY LOTTERY</h2></div>

            <div className="pp-block">
              <h3>4 Lucky Winners For The Birthday Party</h3>
              <p>
                This prototype includes a simple flow for picking 4 winners.
                First, attendees see the whole list. After clicking "Start
                selection", 4 winners are picked (of course it's faked).
              </p>
              <Placeholder name="birthday-lottery.png" aspect="16/10" />
            </div>
          </section>
        </main>
      </article>
    </>
  )
}

export default InteractionLab
