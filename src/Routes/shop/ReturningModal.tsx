import React from 'react'
import styles from './ReturningModal.module.scss'
import { Mode as StargateMode } from 'Utilities/Hooks/useStargate'
import Modal, { BrandColors, ActionType, ButtonAlignment } from 'Components/Modals/Modal'

type Props = {
  isOpen: boolean
  onRequestClose: () => void
  mode?: StargateMode
  handleButton: (button: 'employee' | 'logout' | 'employer') => void
}

const ReturningModal: React.FC<Props> = ({ isOpen, onRequestClose, mode, handleButton }) => {
  return <Modal
    gaModalName={ReturningModal.name}
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentClassName={styles.content}
    header='What are you here for today?'
    footerButtons={[{
      gaButtonName: `Sign Out (${ReturningModal.name})`,
      content: 'Sign Out',
      color: BrandColors.gray,
      onClick: () => handleButton('logout'),
      actionType: ActionType.secondary,
      alignment: ButtonAlignment.left
    }, {
      gaButtonName: `Employer (${ReturningModal.name})`,
      content: 'Employer',
      color: BrandColors.navyBlue,
      onClick: () => handleButton('employer'),
      actionType: ActionType.primary
    }, {
      gaButtonName: `Employee (${ReturningModal.name})`,
      content: 'Employee',
      color: BrandColors.purple,
      onClick: () => handleButton('employee'),
      actionType: ActionType.primary
    }]}
  >
    <div className={styles.container}>
      {(mode === StargateMode.both || mode === StargateMode.employer) && (
        <div className={styles.employer}>
          Employer Experience
          <p>Looking to create a benefits package for your business?</p>
          <button className='link-button' onClick={() => handleButton('employer')}>
            Build Benefits Package
          </button>
        </div>
      )}
      {(mode === StargateMode.both || mode === StargateMode.employee) && (
        <div className={styles.employee}>
          Employee Experience
          <p>Looking to sign-up or waive healthcare benefits?</p>
          <button className='link-button' onClick={() => handleButton('employee')} >
            Elect Benefits
          </button>
        </div>
      )}
    </div>
  </Modal>
}

export default ReturningModal
