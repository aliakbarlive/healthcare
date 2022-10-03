import React, { useEffect } from 'react'
import styles from 'Routes/shop/employer/confirm/Confirmation.module.css'
import DDR4 from 'Assets/ddr4.png'
import { ReactComponent as Confetti } from 'Assets/confetti.svg'
import { Link } from 'react-router-dom'
import { post } from 'Utilities/fetch++'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { Venue } from 'Utilities/pharaoh.types'
import { GAButton } from 'Components/Tracking'
import { Route } from 'Utilities/Route'

const EEShopConfirm: React.FC<PrivateWizardPageProps> = ({ stargate }) => {
  useEffect(() => {
    const el = document.getElementById('content')!
    el.style.padding = '0'
    el.style.maxWidth = 'unset'
    return () => {
      el.style.removeProperty('padding')
      el.style.removeProperty('max-width')
    }
  })

  const header = hasPlan() ? 'All done! You made it!' : 'Thanks for Stopping By!'
  const copy = hasPlan()
    ? <>We will be in contact as soon as possible <br/>letting you know about your new benefits.</>
    : <>We will be in contact as soon as possible <br/>about next steps.</>

  useEffect(() => {
    post('/v3/souvenir', { context: stargate.group?.id, venue: Venue.employee }).catch(console.error)
  }, [stargate.group])

  return <div className={styles.mainContainer}>
    <div className={styles.header}>
      <img className={styles.ddr4} src={DDR4} alt="People celebrating"/>
      <div>
        <div>
          <div className={styles.confirmCheck}>
            <i className="material-icons">check</i>
          </div>
          <h1>{header}</h1>
        </div>
        <p>{copy}</p>
      </div>
      <div className={styles.confetti}><Confetti/></div>
    </div>
    <div className={styles.linksContainer}>
      {cta()}
    </div>
  </div>

  function hasPlan() {
    const { groupMember, user } = stargate
    if (!groupMember) return !!user.enrolled_individual_plan_id
    return groupMember.enrolled_dental_plan_id ||
    groupMember.enrolled_disability_plan_id ||
    groupMember.enrolled_group_plan_id ||
    user.enrolled_individual_plan_id ||
    groupMember.enrolled_life_plan_id ||
    groupMember.enrolled_vision_plan_id
  }

  function cta() {
    if (hasPlan()) {
      return <div>
        <p>Check out your plans, and profile at your dashboard.</p>
        <Link to={Route.dashboardEmployee} className={styles.exploreDashboard}><GAButton analytics={`Explore my dashboard (${EEShopConfirm.name})`}>Explore my Dashboard</GAButton></Link>
      </div>
    } else {
      return <div>
        <p style={{ width: '45%' }}>If you wish to enroll or view your options again during your group&apos;s enrollment period, you can visit the shop again.</p>
        <Link to={Route.eeStargate_select} className={styles.exploreDashboard}><GAButton analytics={`Explore my Benefit Options (${EEShopConfirm.name})`}>Explore my Benefit Options</GAButton></Link>
      </div>
    }
  }
}

export default EEShopConfirm
