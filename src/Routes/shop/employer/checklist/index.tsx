import { WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import React from 'react'
import styles from './index.module.scss'
import { ReactComponent as ChecklistIllustration } from './checklist.svg'

const Checklist: React.FC<WizardPageProps> = props => {
  const url = props.stargate.value?.config?.census?.group?.url
  return <div className={styles.mainContainer}>
    <ChecklistIllustration className={styles.illustration}/>
    <div>
      <h1>What You’ll Need</h1>
      <h2>In order to speed up the process, please have ready the following information:</h2>
      <ul>
        <li>All employees’ basic information including name, number of family members, and tobacco use.</li>
        <li>Your existing coverage end date and carrier (if applicable), and your desired effective date of your new coverage.</li>
        <li>Basic company information including contact details and industry type.</li>
      </ul>
      <p>Download our <a href={url} download>census template</a>. Fill it out now. Upload later.</p>
      <button className='shop-next-button' onClick={() => props.onwards(Promise.resolve())}>Next</button>
    </div>
  </div>
}

export default Checklist
