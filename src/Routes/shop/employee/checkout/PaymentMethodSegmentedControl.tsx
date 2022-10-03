import React from 'react'
import styles from './PaymentMethodSegmentedControl.module.scss'
import { PaymentMethod } from './PaymentForm'

interface PSCProps {
  callback(option: PaymentMethod): void
  selected: PaymentMethod
}

const PaymentMethodSegmentedControl: React.FC<PSCProps> = ({ callback, selected }) => {
  const achStateStyling = selected === PaymentMethod.ACH ? styles.selected : ''
  const ccStateStyling = selected === PaymentMethod.CreditCard ? styles.selected : ''

  return <div className={styles.paymentSC}>
    <div
      onClick={() => callback(PaymentMethod.ACH)}
      className={achStateStyling}
    >
        Electronic Check
    </div>
    <div
      onClick={() => callback(PaymentMethod.CreditCard)}
      className={ccStateStyling}
    >
      Credit Card
    </div>
  </div>
}

export default PaymentMethodSegmentedControl
