import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import AboutPortrait from '../components/AboutPortrait.jsx'
import './About.css'

const experience = [
  {
    period: '2022 – Present',
    role: 'Sr. Product Designer',
    company: 'Ubiquiti Inc. @ Taipei',
    paragraphs: [
      'I lead the design for software of our Mobile Routers, covering the whole experience from unboxing and setup to managing the device on web and mobile apps. I work closely with overseas firmware developers on the LCD interface to ensure our products launch on schedule.',
      'Besides hardware products, I am responsible for the UI/UX of the UniFi Connect mobile app, where I focus on building intuitive device automation features. At the same time, I lead the design for our audio app, UniFi Play, making sure the setup and the managing experience is both easy to use and looks great.',
      'I also lead the redesign of our payment and subscription pages to make the checkout and account management process much smoother, which directly helps improve user conversion and the overall experience for our customers.',
    ],
  },
  {
    period: '2019 – 2022',
    role: 'UX Designer',
    company: 'Cathay Financial Holdings @ Taipei',
    paragraphs: [
      "I led the design for the TreePoint loyalty redemption experience, focusing on making the points journey simple and clear for users. I also helped create 'Insurance Composer' for Cathay Insurance, a tool that allows customers to build and customize their own insurance bundles from scratch. Additionally, I served as a consultant for the official website redesign to improve the overall user experience.",
    ],
  },
  {
    period: '2018 – 2019',
    role: 'UX Designer',
    company: '91APP Inc. @ Taipei',
    paragraphs: [
      "I worked closely with a senior UX designer to build and refine our CMS editor, ensuring a better management experience for our users. To improve our team's efficiency, I also created a custom script tool that automatically transforms icons into importable font files for both our mobile apps and website, streamlining the handover process between design and engineering.",
    ],
  },
  {
    period: '2013 – 2016',
    role: 'Product Designer',
    company: 'Sudo Recruit @ Taipei',
    paragraphs: [
      'I handled the end-to-end experience and interface design for the Sudo Recruiting Platform, making the product intuitive for both job seekers and recruiters. I also took charge of building our branding and marketing assets from scratch. Beyond design, I guided a design intern to successfully deliver an experimental product for the company.',
    ],
  },
]

function About() {
  return (
    <>
      <Helmet>
        <title>About | Sheng Pan</title>
        <meta
          name="description"
          content="A Senior Product designer with 10+ years experience. Currently works on mobile product and IoT platform at Ubiquiti."
        />
      </Helmet>
      <main className="about">
        <Link to="/" className="about-back" aria-label="Back to home">←</Link>

        <section className="about-intro">
          <header className="about-hero">
            <h1 className="about-name">Sheng Pan</h1>
            <p className="about-subtitle">
              A Senior Product designer with 10+ years experience. Currently works on
              mobile product and IoT platform at Ubiquiti.
            </p>
          </header>
          <div className="about-bio">
            <div className="about-bio-block">
              <p>
                Hello, I&rsquo;m Sheng. A Sr. Product Designer at Ubiquiti, previously
                UX Designer at Cathay Financial Holdings.
              </p>
              <p>
                I love exploring the space within ambiguous needs and bringing ideas to
                life as products that truly matter.
              </p>
            </div>
            <p>
              At Ubiquiti, I have driven the design for zero-to-one products, most
              notably the Mobile Router, where I managed the full user journey and LCD
              development with global teams. Currently, my work focuses on the UI/UX
              design for the Connect mobile app, supporting the growth of our IoT
              product management platform.
            </p>
            <p>
              Before joining the team at Ubiquiti, I spent 3+ years at Cathay Financial
              Group as a UX Designer. I was the design owner for TreePoint&rsquo;s
              redemption experience and a core member of the team that built Cathay
              Insurance&rsquo;s &lsquo;Insurance Composer&rsquo;.
            </p>
          </div>
        </section>

        <AboutPortrait />

        <section className="about-experience">
          <p className="about-eyebrow">Experience</p>
          <ul className="experience-list">
            {experience.map((item) => (
              <li key={item.period} className="experience-item">
                <div className="experience-time">{item.period}</div>
                <div className="experience-detail">
                  <div className="experience-head">
                    <h2 className="experience-role">{item.role}</h2>
                    <p className="experience-company">{item.company}</p>
                  </div>
                  <div className="experience-content">
                    {item.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}

export default About
