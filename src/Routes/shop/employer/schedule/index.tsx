import { WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import React from 'react'
import { PowerLevel } from 'Utilities/Hooks/useUser'
import styles from './index.module.scss'
import { ReactComponent as ScheduleIllustration } from './schedule.svg'

const ERShopScheduleACall: React.FC<WizardPageProps> = ({ stargate: { value: stargate }, onwards }) => {
  const groupApproved = !!stargate?.group?.approved
  // eslint-disable-next-line camelcase
  const isBroker = (stargate?.user.power_level || PowerLevel.individual) >= PowerLevel.broker
  if (groupApproved || isBroker) { onwards(Promise.resolve()) }

  return <div className={styles.mainContainer}>
    <div>
      <h1>Make an Appointment to View Plan</h1>
      <p>Let one of our trusted advisors guide you through your options. They’ll help you find the right plans to fit your group’s needs and your budget.</p>
      <p>It’s simple to schedule at a time that is convenient for you!</p>
      <button className='shop-next-button' onClick={zohoBookings}>Schedule a Call</button>
    </div>
    <ScheduleIllustration className={styles.illustration}/>
  </div>
}

const zohoBookings = () => { window.open('https://healthcareadvisormeeting.zohobookings.com/#/customer/meetanadvisor', '_blank') }
export default ERShopScheduleACall
