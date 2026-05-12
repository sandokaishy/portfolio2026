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

const project = getProjectByPath('/projects/poweramp')

const TEAM = [
  { role: 'My Role', who: 'Product Designer' },
  { role: 'Design Lead', who: 'Mark Ke, Jerrica Ang' },
  { role: 'Product Owner', who: 'Damon Hung' },
  { role: 'iOS Dev.', who: 'Green Chu' },
  { role: 'Android Dev.', who: 'Travis Tsai, Martin Wang, Sam Li' },
]

const SECTIONS = [
  { id: 'overview', label: 'Overview & Vision' },
  { id: 'setup', label: 'Simple Setup' },
  { id: 'lcd', label: 'LCD Status' },
  { id: 'streaming', label: 'Audio Streaming' },
  { id: 'broadcast', label: 'Wired Broadcast' },
  { id: 'switch-networks', label: 'Network Switch' },
  { id: 'announcing', label: 'Public Announcing' },
  { id: 'outcome', label: 'Outcome' },
  { id: 'takeaway', label: 'Takeaway' },
]

function Poweramp() {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const [animDone, setAnimDone] = useState(false)

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
        <title>UniFi Play | Sheng Pan</title>
        <meta
          name="description"
          content="Ubiquiti's debut in audio appliances, seamlessly integrating with the UniFi ecosystem."
        />
      </Helmet>

      <article className={`pp-shell${animDone ? ' pp-shell--ready' : ''}`}>
        <aside className="pp-aside">
          <Link to="/" className="pp-back" aria-label="Back to home">←</Link>

          <header className="pp-aside-header">
            <h1 className="pp-name">UniFi Play</h1>
            <p className="pp-tagline">
              Ubiquiti's debut in audio appliances, seamlessly integrating with
              the UniFi ecosystem.
            </p>
            <p className="pp-eyebrow">Ubiquiti, 2024 End – 2025</p>
          </header>

          <div className="pp-aside-meta">
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
              name="hero-unifi-play.png"
              aspect="5/4"
              color={project.color}
            />
          </div>

          <section id="overview" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">WHY WE BUILT UNIFI PLAY</h2>
              <p className="section-body">
                We discovered that UniFi users were encountering compatibility
                issues between third-party amplifiers and the UniFi network
                system. Even with software optimizations, third-party devices
                and firmware remain beyond our control. Therefore, we decided
                to develop an amplifier product deeply compatible with the
                UniFi ecosystem. UniFi PowerAmp is the first hardware offering
                under UniFi Play.
              </p>
            </div>

            <div className="pp-section-intro">
              <h2 className="section-heading">WHAT SHOULD WE BUILD?</h2>
              <p className="section-body">
                The UniFi ecosystem already includes multiple web and mobile
                apps that center around the Console to deliver comprehensive
                system management platforms. When planning UniFi Play, we
                asked ourselves: should we invest in the same full-scale
                features, batch configuration and all-around monitoring, from
                the start? Or should we focus on the core user experience,
                enabling fast setup and immediate playback through a
                lightweight mobile app?
              </p>
              <p className="section-body">
                Ultimately, we chose the latter, validating market interest in
                UniFi Play as quickly and frictionlessly as possible.
              </p>
              <Placeholder name="what-should-we-build.png" aspect="16/7" />
            </div>
          </section>

          <section id="setup" className="pp-section">
            <h2 className="section-heading">
              KEEP SETUP SIMPLE, REDUCE FRICTIONS
            </h2>

            <div className="pp-block">
              <h3>Plug In The Device And You're Ready To Go</h3>
              <p>
                We aimed to reduce every unnecessary step in the setup process.
                For wireless setup, users simply power on the device, grant the
                app Bluetooth and local network permissions, and enter their
                Wi-Fi credentials. For wired setup, it's even simpler: just
                plug in an Ethernet cable and the device is ready to go.
              </p>
              <Placeholder name="setup-plug-and-play.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Deal With Incomplete Permission For Setup</h3>
              <p>
                Incomplete app permissions can silently break the setup flow.
                Rather than throwing an error after a user denies a permission,
                we proactively explain why each permission is needed, giving
                users the context to make an informed decision before granting
                access.
              </p>
              <Placeholder name="setup-permissions.png" aspect="16/10" />
            </div>

            <div className="pp-block">
              <h3>Optional Permission: Location Access</h3>
              <p>
                When location access is granted, the app can detect the Wi-Fi
                network the phone is currently connected to and pass it
                directly to the device, ensuring both are on the same network.
                If the user chooses not to grant location access, we fall back
                to presenting a Wi-Fi list for them to manually select, keeping
                setup completable regardless of their choice.
              </p>
              <Placeholder name="setup-location-permission.png" aspect="16/10" />
            </div>
          </section>

          <section id="lcd" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">
                REAL-TIME STATUS ON THE POWERAMP LCD
              </h2>
              <p className="section-body">
                The PowerAmp's LCD screen reflects the settings you make in
                the UniFi Play app. As you control your Play devices through
                the mobile interface, the device's onboard display updates in
                real time to show its current status.
              </p>
              <Placeholder name="poweramp-lcd-status.png" aspect="16/9" />
            </div>
          </section>

          <section id="streaming" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">
                AUDIO STREAMING THROUGH DEVICE AND ZONE
              </h2>
              <p className="section-body">
                Users can stream music to not only individual devices but also
                through a zone. A zone is a virtual group of devices that can
                be discovered by streaming apps. To start streaming, users
                simply select the created zone in the app, and the music will
                begin streaming to all devices in that zone.
              </p>
              <Placeholder name="audio-streaming-zone.png" aspect="16/9" />
            </div>
          </section>

          <section id="broadcast" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">BROADCAST WIRED SOURCE</h2>
              <p className="section-body">
                Users can play music through zone streaming. What about playing
                music from a wired source? Imagine listening to a vinyl record
                across your entire home. To start broadcasting, users simply
                select a host device and set the source, and it will stream
                audio from the wired source to all zone members.
              </p>
              <Placeholder name="broadcast-wired-source.png" aspect="16/9" />
            </div>
          </section>

          <section id="switch-networks" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">
                SWITCH NETWORKS WITHOUT STARTING OVER
              </h2>
              <p className="section-body">
                Simplifying network setup when relocating your device. Play
                devices may experience connection failure when the Wi-Fi SSID
                changes or when devices are relocated to a different
                environment. To address this, the devices will show
                "Reconnect" when they are disconnected from the network. This
                makes it more flexible to relocate Play devices — users only
                need to reconfigure the Wi-Fi network and all existing
                settings will be preserved.
              </p>
              <Placeholder name="switch-networks.png" aspect="16/10" />
            </div>
          </section>

          <section id="announcing" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">PUBLIC ANNOUNCING</h2>
              <p className="section-body">
                An experimental feature for extending UniFi Play beyond audio
                playback. In addition to media playback, we developed a
                lightweight Public Announcing feature that enables Play
                devices to serve as a flexible voice broadcasting system.
                Users can record messages via the app and broadcast them to
                individual devices or entire zones, ideal for announcements.
              </p>
              <p className="section-body">
                This feature was designed with future integration in mind,
                particularly with UniFi's Alarm Manager and Talk app. For
                example, admins can initiate live announcements from the Talk
                microphone and broadcast voice messages across the network
                using UniFi Play.
              </p>
              <Placeholder name="public-announcing.png" aspect="16/10" />
            </div>
          </section>

          <section id="outcome" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">OUTCOME AND OBSERVATION</h2>
              <p className="section-body">
                As our first product in the audio domain, there are still
                several features that can be improved. However, overall sales
                continue to grow, which shows there is still opportunity for
                us in the market.
              </p>
              <p className="section-body">
                We've developed a lightweight product, such as the Audio Port,
                for users who don't need a professional-grade amplifier. For
                non-professional users, we also plan to develop a PoE speaker
                in the future.
              </p>
            </div>
            <div className="outcome-stats">
              <div className="stat-card">
                <h3>3,000+ Devices</h3>
                <p>set up and online in 6 months.</p>
              </div>
              <div className="stat-card">
                <h3>75% Devices</h3>
                <p>connected via ethernet.</p>
              </div>
            </div>
          </section>

          <section id="takeaway" className="pp-section">
            <div className="pp-section-intro">
              <h2 className="section-heading">TAKEAWAY</h2>
              <p className="section-body">
                Throughout this project, I not only gained valuable knowledge
                in the audio domain but also faced challenges caused by
                hardware limitations. One of the key design considerations was
                how to reduce users' cognitive load and simplify setup and
                operation within the constraints of the technology.
              </p>
              <p className="section-body">
                When designing the features, we aimed to make the setup
                experience intuitive for general users while still offering
                advanced configuration options for more technical users.
                Striking the right balance between professional control and
                ease of use became the core design goal for this project.
              </p>
            </div>
          </section>
        </main>
      </article>
    </>
  )
}

export default Poweramp
