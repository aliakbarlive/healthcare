import { WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import React from 'react'
import styles from './index.module.scss'
import { ReactComponent as AgencyGetStartedIllustration } from './getstarted.svg'

const AgencyGetStarted: React.FC<WizardPageProps> = props => {
  return <div className={styles.mainContainer}>
    <AgencyGetStartedIllustration className={styles.illustration}/>
    <div className={styles.leftHandSide}>
      <div className={styles.paragraphs}>
        <div className={styles.smsl}>
          <svg className={styles.purple} width="110" height="20" viewBox="0 0 110 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="110" height="20" fill="#D0CDF1"/>
          </svg>
          <h1 className={styles.h1}>Sell More, Stress Less</h1>
          <p className={styles.myHealthilyParagraph}>MyHealthily leverages the power of technology to help you quote, enroll, and manage small group health insurance profitably. Gain access to medical and ancillary rates in real time. Employees can enroll online in minutes with zero paperwork. Keep 100% of your commissions.</p>
          <p>Sign up on your own or schedule a meeting with one of our representatives at your convenience.</p>
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.scheduleCallBtn} onClick={zohoBookingsAgency}>Schedule a Call</button>
        <button className={styles.getStartedBtn} onClick={() => props.onwards(Promise.resolve())}>Let&apos;s Get Started</button>
      </div>
    </div>
  </div>
}

const zohoBookingsAgency = () => { window.open('https://healthcareadvisormeeting.zohobookings.com/#/customer/brokerschedule', '_blank') }

export default AgencyGetStarted
