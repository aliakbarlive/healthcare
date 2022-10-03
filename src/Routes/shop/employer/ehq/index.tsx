import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import React from 'react'
import styles from './index.module.scss'
import { ReactComponent as EHQIllustration } from './ehq.svg'
import { useToggle } from 'react-use'
import EHQQuestions from './EHQQuestions'
// import { PowerLevel } from 'Utilities/Hooks/useUser'

const EREHQ: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const [ehqSubmitted, toggleEHQSubmitted] = useToggle(stargate?.group?.ehqSubmitted || false)
  // eslint-disable-next-line camelcase
  // const isBroker = (stargate?.user.power_level || PowerLevel.individual) >= PowerLevel.broker
  const isBroker = false

  if (stargate?.group?.hbaApproved || isBroker) { onwards(Promise.resolve()) }

  return ehqSubmitted
    ? <div className={styles.mainContainer}>
      <div>
        <div className={styles.innerBox}>
          <h1>Complete Forms to Proceed</h1>
          <p>Because you have selected a medical plan under The Health Benefit Alliance, it is required that you complete an Employer Health Questionnaire and Intent to Implement form and submit to the carrier for approval before proceeding.</p>
          <p>These forms will be sent to you via an email from Zoho Sign. If you have any questions, please contact your producer directly. Thank you for your patience!</p>
        </div>
        <p className={styles.footnote}>Please note that the Employer Health Questionnaire and Intent to Implement form must be completed 45 days before the intended effective date.</p>
      </div>
      <EHQIllustration className={styles.illustration}/>
    </div>
    : <EHQQuestions groupID={stargate.group!.id} callback={toggleEHQSubmitted}/>
}

export default EREHQ
