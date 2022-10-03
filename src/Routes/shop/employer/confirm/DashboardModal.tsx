import React from 'react'
import styles from 'Components/Modals/InformationalModal/index.module.scss'
import InformationalModal from 'Components/Modals/InformationalModal'
import { ModalProps } from 'Components/Modals/Modal'

const DashboardModal: React.FC<Omit<ModalProps, 'gaModalName' | 'header'>> = props => {
  return <InformationalModal
    gaModalName={DashboardModal.name}
    header='FAQs'
    {...props}
  >
    <p className={styles.question}>Q:&nbsp;&nbsp;What can I do through the Employers Dashboard?</p>
    <p className={styles.answer}>A:&nbsp;&nbsp;Allows you to see which of your employees have gone through the system and see what plans they have chosen, send reminders to employees who have not selected a plan, invite others into the group, make payments, etc.</p>
  </InformationalModal>
}

export default DashboardModal
