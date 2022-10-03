import React from 'react'
import styles from './RenewalPlanModal.module.scss'
import Modal from 'Components/Modals/Modal'
import { RenewalPlansPayload } from '.'
import numeral from 'numeral'
import { markupValue } from 'Utilities/etc'

type Props = {
  isOpen: boolean
  onSubmit: (payload: RenewalPlansPayload) => Promise<void>
  onRequestClose(): void
  payload: RenewalPlansPayload
}

const RenewalPlanModal: React.FC<Props> = ({ payload, isOpen, onSubmit, onRequestClose }) => {
  return <Modal
    gaModalName={RenewalPlanModal.name}
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    header='Confirm Your Rates'
    className={styles.modalContainer}
  >
    <>
      <p>Please confirm that these are the correct rates and values for the group’s current plan and renewal.</p>
      <table className={styles.compareTable}>
        <thead>
          <tr>
            <th>Premiums</th>
            <th className={styles.currentPlan}>Current</th>
            <th className={styles.currentPlan}>Renewal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Individual</th>
            <td>{markupPremium(payload.current.premium.individual)}</td>
            <td>{markupPremium(payload.renewal.premium.individual)}</td>
          </tr>
          <tr>
            <th>Couple</th>
            <td>{markupPremium(payload.current.premium.couple)}</td>
            <td>{markupPremium(payload.renewal.premium.couple)}</td>
          </tr>
          <tr>
            <th>Employee + Child</th>
            <td>{markupPremium(payload.current.premium.singleParent)}</td>
            <td>{markupPremium(payload.renewal.premium.singleParent)}</td>
          </tr>
          <tr>
            <th>Family</th>
            <td>{markupPremium(payload.current.premium.family)}</td>
            <td>{markupPremium(payload.renewal.premium.family)}</td>
          </tr>
          <tr>
            <th>Total</th>
            <td>{markupPremium(payload.current.premium.total)}</td>
            <td>{markupPremium(payload.renewal.premium.total)}</td>
          </tr>
          <tr><th>Copay</th><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr>
            <th>Primary</th>
            <td>{markupValue(payload.current.copay.primary)}</td>
            <td>{markupValue(payload.renewal.copay.primary)}</td>
          </tr>
          <tr>
            <th>Specialist</th>
            <td>{markupValue(payload.current.copay.specialist)}</td>
            <td>{markupValue(payload.renewal.copay.specialist)}</td>
          </tr>
          <tr>
            <th>Urgent Care</th>
            <td>{markupValue(payload.current.copay.urgentCare)}</td>
            <td>{markupValue(payload.renewal.copay.urgentCare)}</td>
          </tr>
          <tr><th>RX Costs</th><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr>
            <th>Generic</th>
            <td>{markupValue(payload.current.rx.generic)}</td>
            <td>{markupValue(payload.renewal.rx.generic)}</td>
          </tr>
          <tr>
            <th>Preferred</th>
            <td>{markupValue(payload.current.rx.preferred)}</td>
            <td>{markupValue(payload.renewal.rx.preferred)}</td>
          </tr>
          <tr>
            <th>Specialty</th>
            <td>{markupValue(payload.current.rx.specialty)}</td>
            <td>{markupValue(payload.renewal.rx.specialty)}</td>
          </tr>
        </tbody>
      </table>
      <input type='button' onClick={() => onSubmit(payload).then(() => onRequestClose())} className={styles.confirmButton} value='Confirm Rates' />
      <input type='button' onClick={onRequestClose} className={styles.cancelButton} value='Edit Rates' />
    </>
  </Modal>
}

function markupPremium(premium: string | undefined): string {
  if (!premium) return '-'
  return numeral(premium).format('$0') + '/mo'
}

export default RenewalPlanModal
