import React from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import styles from './index.module.scss'
import Error from 'Components/Primitives/Error'
import SidecarEEApplication from './SidecarEEApplication'

const Application: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { members, groupMember } = stargate
  if (!groupMember) return <Error error='Please complete earlier steps'/>

  return <div className={styles.mainContainer}>
    <h1 className='shop-h1-periwinkle'>Application</h1>
    <h2 className='shop-h2-navy'>We need a little more information to complete your enrollment</h2>
    <SidecarEEApplication member={members.filter(m => m.id === groupMember.id)[0]} onwards={onwards}/>
  </div>
}

export default Application
