import React, { useState, useEffect } from 'react'
import styles from './EmployeeInfoWaiveModal.module.scss'
import { BaseSelect } from 'Components/Rudimentary/Select'
import Modal, { ActionType, BrandColors, ButtonAlignment, ModalActionButton } from 'Components/Modals/Modal'
import useToast from 'Utilities/Hooks/useToast'

interface EE {
  id: string
  name: string
}

interface Props {
  waivingEmployee?: EE
  isOpen: boolean
  onRequestClose: () => void
  callback: (waiveReason: string, ee?: EE) => void
}

const EmployeeInfoWaiveModal: React.FC<Props> = ({ waivingEmployee, isOpen, onRequestClose, callback }) => {
  const addToast = useToast()
  const [waiveReason, setWaiveReason] = useState<string | undefined>()

  useEffect(() => {
    setWaiveReason(undefined)
  }, [waivingEmployee])

  return <Modal
    gaModalName={EmployeeInfoWaiveModal.name}
    header={header()}
    isOpen={isOpen}
    contentClassName={styles.container}
    footerButtons={footerButtons()}
    onRequestClose={onRequestClose}
  >
    <BaseSelect placeholder="Reason for waiving" options={waiveReasons} onChange={setWaiveReason} value={waiveReason}/>
  </Modal>

  function header() {
    return <header>
      Waive Healthcare Coverage
      <p className={styles.text}>Please select your reason for waiving coverage.</p>
    </header>
  }

  function footerButtons(): ModalActionButton[] {
    return [{
      actionType: ActionType.primary,
      content: 'Waive healthcare coverage',
      color: BrandColors.blue,
      gaButtonName: `Waive ${EmployeeInfoWaiveModal.name}`,
      onClick: handleSubmit
    }, {
      actionType: ActionType.link,
      content: <>I don&apos;t want to waive</>,
      alignment: ButtonAlignment.left,
      color: BrandColors.gray,
      gaButtonName: `Do Not Waive ${EmployeeInfoWaiveModal.name}`,
      onClick: onRequestClose
    }]
  }

  function handleSubmit() {
    if (waiveReason) {
      callback(waiveReason, waivingEmployee)
    } else {
      addToast('Please select a waive reason')
    }
  }
}

const waiveReasons = [
  {
    value: 'spouseInsured',
    label: 'Spousal Coverage'
  },
  {
    value: 'govInsured',
    label: 'Government Insured'
  },
  {
    value: 'medicare',
    label: 'Medicare'
  },
  {
    value: 'other',
    label: 'Other'
  }
]

export default EmployeeInfoWaiveModal
