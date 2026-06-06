import { useEffect, useState } from 'react'
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

const project = getProjectByPath('/projects/tree-point')

const TEAM = [
  { role: 'My Role', who: 'Primary Product Designer' },
  { role: 'Product Owner', who: 'Ouyang' },
  { role: 'UX Researcher', who: 'Shan Huang' },
]

const SECTIONS = [
  { id: 'background', label: 'Background & Objective' },
  { id: 'ideation-1', label: 'Ideation 1: Wallet' },
  { id: 'ideation-2', label: 'Ideation 2: Simple' },
  { id: 'release', label: 'Official Release' },
  { id: 'outcome', label: 'Outcome' },
]

function TreePoint() {
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
        <title>TreePoint | Sheng Pan</title>
        <meta
          name="description"
          content="Designing the redemption experience for new reward points and legacy points."
        />
      </Helmet>

      <article className={`pp-shell${animDone ? ' pp-shell--ready' : ''}`}>
        <aside className="pp-aside">
          <Link to="/" className="pp-back" aria-label="Back to home">←</Link>

          <header className="pp-aside-header">
            <h1 className="pp-name">TreePoint</h1>
            <p className="pp-tagline">
              Designing the redemption experience for new reward points and
              legacy points.
            </p>
            <p className="pp-eyebrow">Cathay Financial Holdings, 2019</p>
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
            <img
              className="pp-hero-image"
              src={asset('/treepoint/hero-treepoint.jpg')}
              alt="Tree Point hero"
            />
          </div>

          <section id="background" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>BACKGROUND</h2></div>
              <p className="section-body">
                A new reward point for the united reward program. Cathay
                Financial Group is the top 5 Financial enterprise in Taiwan.
                It includes many subsidiaries — Cathay United Bank, Cathay
                Life Insurance, Cathay Century Insurance, Cathay Securities
                Corporation, and more.
              </p>
              <p className="section-body">
                A legacy rewarding point in Cathay Group named "RedPoint" is
                published by Cathay United Bank. TreePoint is a brand new
                reward point for the whole group, published by a non-financial
                subsidiary so it's free from some restrictions of financial
                laws.
              </p>
              <p className="section-body">
                MyRewards is an app with 2 million users that offers benefits
                to clients of Cathay Bank. Users can exchange coupons with
                RedPoints and get discounts through events on the app.
              </p>
            </div>
          </section>

          <section id="objective" className="pp-section">
            <div className="section-heading"><h2>OBJECTIVE</h2></div>

            <div className="pp-block">
              <h3>Introduce TreePoint As The New Unit To Our Users</h3>
              <p>
                As the rewarding point of the whole group in the future, we
                have to change the unit for voucher redemption in MyRewards.
                However, most users have RedPoint, not TreePoint. Due to
                legality, we can't convert their points to TreePoint
                automatically. It's an important issue to let users use
                RedPoint when they don't even have any TreePoint.
              </p>
            </div>

            <div className="pp-block">
              <h3>
                Enable Smooth Redemption As TreePoint And RedPoint Coexisted
              </h3>
              <p>
                One TreePoint equals 1 New Taiwan Dollar, while 7 RedPoints
                also equal 1 NTD. During the transition, vouchers could only
                be redeemed in TreePoint units, yet many users still held
                RedPoints (legacy point). We needed to figure out a redemption
                flow that allowed users to seamlessly use RedPoints within the
                new system.
              </p>
            </div>
          </section>

          <section id="before-ideating" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>BEFORE IDEATING…</h2></div>
              <p className="section-body">
                Let's look at the current redemption flow. Users see how many
                RedPoints they have on the index of MyRewards, switching to
                the redemption tab to see all vouchers they can redeem.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/current-redemption-flow.png')}
                alt="Current redemption flow in MyRewards: RedPoint balance to voucher redemption tab"
              />
            </div>
          </section>

          <section id="ideation-1" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>IDEATION 1: POINT WALLET</h2></div>
              <p className="section-body">
                Put points together and convert to a total value. What if we
                create a wallet that contains all these points? The wallet
                calculates the value of these points and adds them up into a
                wallet value as TreePoint. Users will be able to redeem
                vouchers with the total value of the wallet.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/wallet_ideation.png')}
                alt="Point Wallet concept: bank reward points consolidated into a single TreePoint balance"
              />
            </div>

            <div className="pp-block">
              <h3>Start Using Point Wallet</h3>
              <p>
                Our service is provided by a corporate entity outside the
                financial group, so it's essential for users to activate the
                service themselves due to the law.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation1-start-wallet.png')}
                alt="Wallet activation screen: user opts in before using the Point Wallet service"
              />
            </div>

            <div className="pp-block">
              <h3>Authorize To Import RedPoint</h3>
              <p>
                We can't put users' RedPoint into the wallet automatically
                because RedPoint is the rewarding point paid by Cathay Bank.
                Users have to authorize the wallet service to acquire RedPoint
                by signing in to their MyReward account.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation1-authorize-import.png')}
                alt="Authorization flow: user signs in to MyRewards to import RedPoint into the wallet"
              />
            </div>

            <div className="pp-block">
              <h3>Wallet Page</h3>
              <p>
                Wallet balance is the sum of point values below. Point values
                are shown as cards, with values converted into TreePoint. At
                the bottom of the page is history, which shows the changes in
                the wallet value.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation1-wallet-page.png')}
                alt="Wallet page: TreePoint balance, point cards, and transaction history"
              />
            </div>

            <div className="pp-block">
              <h3>Redemption Flow</h3>
              <p>
                The redemption flow is the same but the unit is changed to
                TreePoint. Users won't be worried about how many points they
                need for exchange. The wallet calculates all kinds of points
                into one value (TreePoint), used to redeem vouchers.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation1-redemption-flow.png')}
                alt="Updated redemption flow expressed in TreePoint instead of mixed point types"
              />
            </div>

            <div className="pp-block">
              <h3>Redemption Details</h3>
              <p>
                The details page shows the total value of the wallet and the
                value after redeeming vouchers. Consumption tells users how
                many points (total value) it cost for this redemption. It also
                shows the detail of usage — how many RedPoint and TreePoint
                were used.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation1-redemption-details.png')}
                alt="Redemption details showing total wallet value, post-redemption balance, and per-point consumption"
              />
            </div>
          </section>

          <section id="validate-1" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>VALIDATE IDEATION 1</h2></div>
              <p className="section-body">
                Test the new idea with high fidelity prototypes. This new idea
                will affect 2 million users' experience. We made high fidelity
                prototypes to conduct usability testing to make sure users
                understand the wallet concept and the experience won't be bad.
                We acquired target users from MyRewards via push notifications
                with a questionnaire, selecting three kinds of users: users
                with a lot of RedPoint, users with less RedPoint, and users
                without RedPoint.
              </p>
              <div className="pp-block-row">
                <img
                  className="pp-block-image"
                  src={asset('/treepoint/validateIdeation1_01.jpg')}
                  alt="Usability testing session for the Point Wallet prototype"
                />
                <img
                  className="pp-block-image"
                  src={asset('/treepoint/validateIdeation1_02.jpg')}
                  alt="Participant interacting with the Point Wallet prototype during testing"
                />
              </div>
            </div>

            <div className="pp-block">
              <h3>High Fidelity Prototypes</h3>
              <p>
                We made prototype with ProtoPie. We designed three tasks for
                our subjects to observe how they think and do with the
                wallet concept. See the complete prototypes for usability
                testing below:
              </p>
              <div className="pp-block-row">
                <img
                  className="pp-block-image"
                  src={asset('/treepoint/validate1-prototypes_1.gif')}
                  alt="First high-fidelity prototype used in the wallet usability test"
                />
                <img
                  className="pp-block-image"
                  src={asset('/treepoint/validate1-prototypes_2.gif')}
                  alt="Second high-fidelity prototype used in the wallet usability test"
                />
              </div>
            </div>

            <div className="pp-block">
              <h3>Findings</h3>
              <div className="challenge-grid">
              <div className="challenge-option">
                <span className="challenge-option-num challenge-option-num--warning" aria-hidden="true">!</span>
                <div className="challenge-option-body">
                  <h4>Don't know what TreePoint is</h4>
                  <p>
                    Users don't know what TreePoint is or what the
                    difference is between RedPoint and TreePoint.
                  </p>
                </div>
              </div>

              <div className="challenge-option">
                <span className="challenge-option-num challenge-option-num--warning" aria-hidden="true">!</span>
                <div className="challenge-option-body">
                  <h4>Users are confused about the wallet concept</h4>
                  <p>
                    Users are not only confused about the unit of the total
                    balance but also the consumption mechanism (which point
                    will be consumed first). Most users care about the
                    order of consumption — they want to decide which point
                    to use when exchanging coupons. However, TreePoint is
                    always the first consumed due to the system mechanism.
                  </p>
                </div>
              </div>

              <div className="challenge-option">
                <span className="challenge-option-num challenge-option-num--warning" aria-hidden="true">!</span>
                <div className="challenge-option-body">
                  <h4>
                    The authorization to import legacy points is inevitably
                    lengthy
                  </h4>
                  <p>
                    If users want to use RedPoint and TreePoint together,
                    they have to authorize the wallet to access their
                    RedPoint by signing in to their account due to
                    legality. It makes users confused and annoyed because
                    they didn't need to do it before.
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div className="pp-block">
              <h3>Brainstorming</h3>
              <p>
                We conducted brainstorming to figure out a new idea, because
                the wallet makes users confused and creates barriers to
                understanding. How might users exchange coupons with RedPoint
                when they don't have enough TreePoint? We need a new solution
                based on the findings.
              </p>
            </div>
          </section>

          <section id="ideation-2" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>IDEATION 2: KEEP IT SIMPLE</h2></div>
              <p className="section-body">
                Use RedPoint automatically when TreePoint is not sufficient.
                What if we removed the wallet and preserved RedPoint and
                TreePoint as independent cards on the MyReward homepage? Users
                don't have to add points into a wallet before using. They can
                still redeem vouchers with RedPoint if they don't have
                sufficient TreePoint.
              </p>
            </div>

            <div className="pp-block">
              <h3>Introduce TreePoint In Onboarding Flow</h3>
              <p>
                Information about TreePoint is revealed on onboarding pages
                the first time users open MyRewards. We indicate that RedPoint
                has been replaced with TreePoint as the redemption unit and
                explain how to get TreePoints.
              </p>
              <p>
                Like other points on MyRewards, a card tells users how many
                TreePoints they have. Users can see history of TreePoint by
                clicking the card and switch to other points with a single
                fling.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation2-onboarding.gif')}
                alt="Onboarding flow introducing TreePoint as the new redemption unit"
              />
            </div>

            <div className="pp-block">
              <h3>New Redemption Flow</h3>
              <p>
                We added a confirmation step to the current redemption
                experience.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation2-new-redemption.png')}
                alt="Updated redemption flow with a confirmation step before voucher exchange"
              />
            </div>

            <div className="pp-block">
              <h3>Confirm What Point Will Cost Before Redeem</h3>
              <p>
                The confirmation draws users' attention before they redeem
                vouchers.
              </p>
              <p>
                When users have RedPoint but inadequate TreePoint, they see a
                tip letting them know RedPoints will be consumed for
                insufficiency of TreePoint.
              </p>
              <p>
                Clicking details reveals the consumption of RedPoint and
                TreePoint for this redemption.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/ideation2-confirm-cost.gif')}
                alt="Confirmation drawer detailing how RedPoint and TreePoint will be consumed in a redemption"
              />
            </div>
          </section>

          <section id="validate-2" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>VALIDATE AGAIN</h2></div>
              <p className="section-body">
                What if we cracked the wallet and preserve RedPoint and
                TreePoint as independent cards on the MyReward homepage.
                Users don’t have to add points into wallet before using.
                They can still redeem voucher with RedPoint if they don’t
                have sufficient TreePoint.
              </p>
            </div>

            <div className="pp-block">
              <h3>High Fidelity Prototype</h3>
              <p>
                This time, we make a really high fidelity prototype to do
                usability testing. We make onboarding pages introduce
                TreePoint and tips to indicate TreePoint as the new unit to
                exchange.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/validate2-prototype-01.gif')}
                alt="Second-round prototype: onboarding pages introducing TreePoint"
              />
              <img
                className="pp-block-image"
                src={asset('/treepoint/validate2-prototype-02.gif')}
                alt="Second-round prototype: redemption flow with confirmation tips"
              />
            </div>

            <div className="pp-block">
              <h3>Findings</h3>
              <div className="challenge-grid">
              <div className="challenge-option">
                <span className="challenge-option-num challenge-option-num--success" aria-hidden="true">✓</span>
                <div className="challenge-option-body">
                  <h4>
                    Our onboarding helps users better understand how
                    TreePoint works
                  </h4>
                  <p>
                    Users know TreePoint is a new point and that all units
                    have been changed to TreePoint in MyReward after going
                    through onboarding. They also understand that
                    TreePoint is different from RedPoint.
                  </p>
                </div>
              </div>

              <div className="challenge-option">
                <span className="challenge-option-num challenge-option-num--success" aria-hidden="true">✓</span>
                <div className="challenge-option-body">
                  <h4>Users redeem vouchers seamlessly</h4>
                  <p>
                    Though we put the confirmation drawer in the redemption
                    flow, it didn't become a barrier for them to complete
                    the task. They all got vouchers successfully and
                    understood that it costs RedPoint when TreePoint is
                    not enough.
                  </p>
                </div>
              </div>

              <div className="challenge-option">
                <span className="challenge-option-num challenge-option-num--warning" aria-hidden="true">!</span>
                <div className="challenge-option-body">
                  <h4>
                    Redemption Details in confirmation drawer is a bit
                    confusing
                  </h4>
                  <p>
                    The confirmation drawer successfully catches users'
                    attention and indicates the point consumption.
                    However, the redemption details are a bit confusing.
                    It shows the TreePoint and RedPoint balances, but
                    users are unsure whether the values shown are before
                    or after redemption.
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div className="pp-block">
              <h3>Look Deeper Into The Problem</h3>
              <p>
                The current balance of TreePoint and RedPoint seems redundant.
                We could display how many points cost for this redemption and
                have more detailed information on the result page.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/validate2-deeper-problem.png')}
                alt="Annotated balance area showing redundant TreePoint and RedPoint values in the confirmation drawer"
              />
            </div>
          </section>

          <section id="release" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>OFFICIAL RELEASE</h2></div>
              <p className="section-body">
                Revised based on findings. We revised the information in the
                confirmation drawer and added tips about the consumption rule
                on the redemption page.
              </p>
              <img
                className="pp-block-image"
                src={asset('/treepoint/official-release-01.gif')}
                alt="Released confirmation drawer with revised point-consumption information"
              />
              <img
                className="pp-block-image"
                src={asset('/treepoint/official-release-02.gif')}
                alt="Released redemption page with consumption-rule tips"
              />
            </div>
          </section>

          <section id="outcome" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>OUTCOME</h2></div>
              <p className="section-body">
                After TreePoint was revealed, over 70% of MyRewards users
                owned TreePoint (the activation event gave users 10
                TreePoints) within 6 months. About 15 million RedPoints were
                consumed alongside TreePoint by November.
              </p>
            </div>
            <div className="outcome-stats">
              <div className="stat-card">
                <h3>15M+</h3>
                <p>Legacy points consumed with TreePoint.</p>
              </div>
              <div className="stat-card">
                <h3>70%+</h3>
                <p>Users start using TreePoint to redeem.</p>
              </div>
            </div>
          </section>

          <section id="takeaway" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>TAKEAWAY</h2></div>
              <p className="section-body">
                Sometimes, keeping the original is a better idea. After two
                user tests, I learned the power of users' habits. Don't ignore
                the experience users get used to, and don't try to push new
                features in front of users by making big changes. Sometimes,
                keeping the original experience is better than innovating a
                new one.
              </p>
            </div>
          </section>
        </main>
      </article>
    </>
  )
}

export default TreePoint
