import React, { useEffect, useState } from 'react'
import styles from './Confirmation.module.css'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { PowerLevel } from 'Utilities/Hooks/useUser'
import DashboardModal from './DashboardModal'
import { Link } from 'react-router-dom'
import DDR4 from 'Assets/ddr4.png'
import { ReactComponent as Confetti } from 'Assets/confetti.svg'
import { ReactComponent as InfoIcon } from 'Assets/info_icon.svg'
import { useToggle } from 'react-use'
import ProgressButton from 'react-progress-button'
import useToast from 'Utilities/Hooks/useToast'
import * as api from 'Utilities/pharaoh'
import './ConfirmationSendButton.css'
import { post } from 'Utilities/fetch++'
import { Venue } from 'Utilities/pharaoh.types'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { GAButton } from 'Components/Tracking'

const ERShopCongratulations: React.FC<PrivateWizardPageProps> = ({ stargate }) => {
  useFullContentArea()
  useEffect(() => {
    if (stargate.user.power_level === PowerLevel.groupManager) {
      // ^^ don’t email a broker browsing their client
      post('/v3/souvenir', { context: stargate.group?.id, venue: Venue.group }).catch(console.error)
    }
  }, [stargate.user, stargate.group])

  const [buttonState, setButtonState] = useState('')
  const [isOpen, toggle] = useToggle(false)
  const addToast = useToast()
  const exploreDashCopy = 'Explore my Employer Dashboard'

  return <div className={styles.mainContainer}>
    <DashboardModal isOpen={isOpen} onRequestClose={toggle}/>
    <div className={styles.header}>
      <img className={styles.ddr4} src={DDR4} alt="People celebrating"/>
      <div>
        <div>
          <div className={styles.confirmCheck}>
            <i className="material-icons">check</i>
          </div>
          <h1>All done! You made it!</h1>
        </div>
        <p>The next step is to <b>invite your<br/>employees</b> to participate.</p>
      </div>
      <div className={styles.confetti}><Confetti/></div>
    </div>
    <div className={styles.linksContainer}>
      <div className={styles.firstRow}>
        <h3>
        Would you like to send the email now or later through your <b>Employer Dashboard?</b>
          <InfoIcon className={styles.infoIcon} onClick={toggle}/>
        </h3>
        <div className={styles.inviteButtons}>
          <ProgressButton
            durationSuccess={5000}
            durationError={5000}
            onClick={sendEmailToEmployees}
            state={buttonState}
            onSuccess={() => setButtonState('disabled')}
          >
          Send it now
          </ProgressButton>
          <GAButton analytics={`I'll do it later (${ERShopCongratulations.name})`} onClick={sendLater} className={styles.laterButton}>I’ll do it later</GAButton>
        </div>
      </div>
      <div>
        <p>Check out your Plans, Employee information, and Billing on your Employer Dashboard.</p>
        <Link to="/dashboard/employer" onClick={onLinkClick} className={styles.exploreDashboard}><GAButton analytics={`${exploreDashCopy} (${ERShopCongratulations.name})`}>{exploreDashCopy}</GAButton></Link>
      </div>
    </div>
    {/* <div style={{height: 600, width: 2}}/> */}
  </div>

  async function sendEmailToEmployees() {
    if (buttonState === 'disabled') {
      return false
    }

    setButtonState('loading')
    try {
      await api.v2.groups(stargate.group?.id).users.invite()
      setButtonState('success')
      addToast('Your employees have been notified to set up their account!')
    } catch (err) {
      setButtonState('error')
      addToast(err)
    }
  }

  function sendLater() {
    addToast('Okay, you can email them anytime from your dashboard!')
  }

  function onLinkClick() {
    if (stargate.group?.id) {
      localStorage.overrideGroupID = stargate.group?.id
    } else {
      localStorage.removeItem('overrideGroupID')
    }
  }
}

export default ERShopCongratulations
