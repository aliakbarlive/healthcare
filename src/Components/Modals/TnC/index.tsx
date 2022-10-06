import React from 'react'
import styles from './index.module.scss'
import TermsAndConditionsText from './TermsAndConditionsText'
import BAAText from './BAAText'
import Modal, { ActionType, BrandColors } from '../Modal'

interface Props {
  isOpen: boolean
  onClose(): void
  scrollToSection?: number
  isBAA?: boolean
}

const TermsModal: React.FC<Props> = (props) => (
  <Modal
    gaModalName={TermsModal.name}
    header={props.isBAA ? 'BAA' : 'Terms and Conditions'}
    isOpen={props.isOpen}
    onRequestClose={props.onClose}
    footerButtons={[
      {
        gaButtonName: `Close ${TermsModal.name}`,
        onClick: props.onClose,
        content: 'Close',
        color: BrandColors.navyBlue,
        actionType: ActionType.secondary
      }
    ]}
  >
    <div className={styles.container}>
      {props.isBAA && (
        <BAAText
          className={styles.terms}
          scrollToSection={props.scrollToSection}
        />
      )}
      {!props.isBAA && (
        <TermsAndConditionsText
          className={styles.terms}
          scrollToSection={props.scrollToSection}
        />
      )}
    </div>
  </Modal>
)

export default TermsModal
