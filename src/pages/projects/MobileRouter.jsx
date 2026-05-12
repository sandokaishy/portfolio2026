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

const project = getProjectByPath('/projects/mobile-router')

// Aside lower-block content. Same source for both views — team list while
// the user is on the first screen, TOC once they've scrolled past it.
const TEAM = [
  { role: 'My Role', who: 'Primary Product Designer' },
  { role: 'Design Lead', who: 'Mark Ke' },
  { role: 'FE. Dev.', who: 'Arel Lin, Otis Yang' },
  { role: 'BE. Dev.', who: 'Ray Shih, Hank Wu' },
  { role: 'Cloud Dev.', who: 'Alfredo Ruan' },
  { role: 'Product Owner', who: 'David Lin, Lynn Chao' },
]

const SECTIONS = [
  { id: 'overview-challenge', label: 'Overview & Challenge' },
  { id: 'zero-touch', label: 'Zero-Touch Setup' },
  { id: 'scalable', label: 'Scalable Config' },
  { id: 'integration', label: 'Integration with UniFi' },
  { id: 'device-insights', label: 'Insight Visualization' },
  { id: 'outcome', label: 'Outcome' },
]

function MobileRouter() {
  // Past-first-screen swap: team-info → TOC. Threshold = half viewport.
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  // Once the page-flip-in animation finishes, drop the transform from
  // .pp-shell so the sticky aside + TOC observer behave normally. We
  // also defer the IntersectionObserver registration until then so it
  // measures section positions in their final (un-rotated) layout.
  const [animDone, setAnimDone] = useState(false)

  // Match the duration in MobileRouter.css `.pp-shell` animation.
  useEffect(() => {
    const id = setTimeout(() => setAnimDone(true), 720)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section currently in the middle of the viewport. Wait
  // until the flip animation has settled — observing while the page is
  // still rotating gives nonsense bounding boxes.
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
        <title>UniFi Mobility | Sheng Pan</title>
        <meta
          name="description"
          content="Deploy secure networks for mobile and remote environments effortlessly."
        />
      </Helmet>

      <article className={`pp-shell${animDone ? ' pp-shell--ready' : ''}`}>
        <aside className="pp-aside">
          <Link to="/" className="pp-back" aria-label="Back to home">←</Link>

          <header className="pp-aside-header">
            <h1 className="pp-name">UniFi Mobility</h1>
            <p className="pp-tagline">
              Deploy secure networks for mobile and remote environments
              effortlessly.
            </p>
            <p className="pp-eyebrow">Ubiquiti, 2022 – Present</p>
          </header>

          <div className="pp-aside-meta">
            {/* Both lists render simultaneously and overlap in the same grid
                cell (see CSS). `scrolled` flips which one is opacity:1 — the
                hidden one fades out while the other fades in. TOC items have
                a staggered enter via --i in inline style. */}
            <dl
              className={`pp-team${scrolled ? ' is-hidden' : ''}`}
              aria-hidden={scrolled || undefined}
            >
              {TEAM.map((t) => (
                <div className="pp-team-row" key={t.role}>
                  <dt>{t.role}</dt>
                  <dd>{t.who}</dd>
                </div>
              ))}
            </dl>
            <ul
              className={`pp-toc${scrolled ? '' : ' is-hidden'}`}
              aria-hidden={!scrolled || undefined}
            >
              {SECTIONS.map((s, i) => (
                <li
                  key={s.id}
                  className={`pp-toc-item${s.id === activeId ? ' is-active' : ''}`}
                  style={{ '--i': i }}
                >
                  <a href={`#${s.id}`} tabIndex={scrolled ? 0 : -1}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="pp-main">

          <div className="pp-hero">
            <Placeholder
              name="hero-mobile-router.jpg"
              aspect="5/4"
              color={project.color}
            />
          </div>

          <section id="overview-challenge" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">OVERVIEW</h2>
              <p className="section-body">
                We observed a growing market opportunity in outdoor, temporary,
                and mobile network deployment scenarios. UniFi Mobile Router
                was created to address challenges in cable-unreachable areas
                and on-the-move connectivity needs, enabling reliable internet
                access for vehicles, construction sites, and surveillance
                setups.
              </p>
            </div>

            <div className="pp-section-intro">
              <h2 className="section-heading">CHALLENGE</h2>
              <div className="challenge-grid">
                <div className="pp-block">
                  <h3>Tight Schedule</h3>
                  <p>
                    The project faced significant time pressure during the
                    hardware development phase, compressing the software design
                    and implementation timeline. The team needed to make rapid
                    design decisions, validate feasibility, and stay aligned
                    across global teams.
                  </p>
                </div>
                <div className="pp-block">
                  <h3>Market Latecomer</h3>
                  <p>
                    As a latecomer to the market, UniFi Mobile Router faced the
                    challenge of achieving feature parity with established
                    competitors. A key question emerged: How could we
                    differentiate and grow in an already saturated market?
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="zero-touch" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">
                ZERO-TOUCH SETUP IN MINUTES
              </h2>
              <p className="section-body">
                We streamlined the initial setup experience from QR scan and
                auto-pairing to cloud-based adopt.
              </p>
            </div>

            <div className="pp-block">
              <h3>Scan QR Code To Activate</h3>
              <p>
                No activation code is needed. Pre-activated devices go live
                the moment they're powered on, delivering true zero-touch
                deployment so administrators and staff can stay focused on
                their core responsibilities.
              </p>
              <Placeholder name="zero-touch-qr-scan.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Guidance On Locating Activation Code</h3>
              <p>
                When users activate their device via our activation page,
                we'll provide guidance on locating the activation code
                printed on its model.
              </p>
              <Placeholder name="activation-code-guidance.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Remote Management</h3>
              <p>
                Once adoption is complete and onsite staff finish
                installation, administrators can manage the devices entirely
                through our cloud-based Mobile Routing app.
              </p>
              <Placeholder name="remote-management.png" aspect="16/10" />
            </div>
          </section>

          <section id="scalable" className="pp-section">
            <h2 className="section-heading">SCALABLE CONFIGURATION</h2>

            <div className="pp-block">
              <h3>
                Easily Push Configurations To Multiple Devices Using Reusable
                Profiles
              </h3>
              <p>
                Beyond typical remote management features, users can create
                and store Config Profiles via the Mobile Routing App and
                easily apply them across their UniFi Mobile Routers (UMRs).
              </p>
              <p>
                We observed that core functions like VPN, firewall rules,
                DDNS, and routing tend to share common configurations yet are
                often tedious to repeat. By introducing profile-based
                settings, users can save, reuse, and apply standardized
                setups at scale, simplifying network deployment and reducing
                manual errors.
              </p>
              <Placeholder name="scalable-config-overview.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>
                Example: Create A Site-To-Site VPN Profile And Apply To
                Multiple Devices
              </h3>
              <p>
                Beyond the standard remote management capabilities, the
                Mobile Routing App lets users define and store reusable
                Config Profiles, which can then be deployed across multiple
                UniFi Mobile Routers (UMRs).
              </p>
              <Placeholder name="s2s-vpn-profile.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Apply Profiles To A Single Device</h3>
              <p>
                In addition to batch management, users can flexibly apply
                settings to an individual device. From the Device List, open
                the target device's control panel and select an existing
                profile under the VPN or Firewall Rule sections to apply it
                instantly.
              </p>
              <Placeholder
                name="apply-profile-single-device.png"
                aspect="16/10"
              />
            </div>
          </section>

          <section id="integration" className="pp-section">
            <h2 className="section-heading">
              INTEGRATION WITH UNIFI ECOSYSTEM
            </h2>

            <div className="pp-block">
              <h3>Integrated Into UniFi Ecosystem To Create Synergy</h3>
              <p>
                UniFi Network is Ubiquiti's flagship platform, and most
                customers already operate a UniFi Console or compact Gateway.
                Bringing the Mobile Router into this ecosystem unlocks new
                remote-management scenarios for UniFi Network, beginning with
                seamless Site-to-Site VPN integration as the first milestone.
              </p>
            </div>

            <div className="pp-block">
              <h3>Regular Site-To-Site VPN Setup</h3>
              <p>
                In order to establish a site-to-site VPN connection, users
                have to enter the remote IP (which is the IP of the console),
                the private key of the console and the networks they want to
                access under the console. Also they generate the private key
                for Mobile Router and do the same things to the console on
                the other side.
              </p>
              <p>It's pretty frustrating. What if we could make it easier?</p>
              <Placeholder name="regular-s2s-vpn-setup.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Make S2S VPN Setup Easy</h3>
              <p>
                Users benefit from the integration with the UniFi system by
                being able to select their UniFi console as the peer device
                when setting up a site-to-site VPN.
              </p>
              <p>
                Once the console is chosen, they can easily picking the
                correct associated subnet, minimizing configuration errors.
              </p>
              <Placeholder name="easy-s2s-vpn-setup.png" aspect="16/10" />
            </div>
          </section>

          <section id="device-insights" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">DEVICE INSIGHTS VISUALIZATION</h2>
              <p className="section-body">
                The Mobile Router regularly reports its status to our cloud
                service, where historical data is aggregated and transformed
                into visual insights. This enables users to monitor network
                health, CPU status, and identify anomalies over time — even
                tracing back to when and why issues occurred.
              </p>
              <Placeholder name="device-insights-dashboard.png" aspect="16/9" />
            </div>

            <div className="pp-block">
              <h3>Locating Device On Map</h3>
              <p>
                Equipped with built-in GPS, the Mobile Router also shares its
                real-time location on a map, while storing its historical
                geolocation records. In the future, this can evolve into a
                full trace of its movement path for better operational
                visibility.
              </p>
              <p>
                If there isn't enough room to show each device's location,
                pins will cluster together. This provides a high-level
                overview, making it more convenient for users or enterprises
                managing UniFi Mobile Routers globally.
              </p>
              <Placeholder name="device-map-location.png" aspect="16/10" />
            </div>
          </section>

          <section id="outcome" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">OUTCOME</h2>
              <p className="section-body">
                Since launch, UniFi Mobile Router has been sold and deployed
                across multiple countries and regions, including North America,
                Europe, Asia, and Australia. To date, approximately 20,000
                units have been activated and are online.
              </p>
              <p className="section-body">
                About 62% of devices have subscribed to the Mobility service,
                with another 36% still in the free trial phase. This reflects
                a strong market acceptance and perceived value of our managed
                service model.
              </p>
            </div>
            <div className="outcome-stats">
              <div className="stat-card">
                <h3>20,000+ Devices</h3>
                <p>are online and activated.</p>
              </div>
              <div className="stat-card">
                <h3>62% Devices</h3>
                <p>subscribed Mobility.</p>
              </div>
              <div className="stat-card">
                <h3>89%+</h3>
                <p>Subscription retention rate.</p>
              </div>
            </div>
          </section>
        </main>
      </article>
    </>
  )
}

export default MobileRouter
