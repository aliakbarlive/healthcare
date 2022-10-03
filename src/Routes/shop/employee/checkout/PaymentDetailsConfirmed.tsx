import React from 'react'
import styles from './PaymentDetailsConfirmed.module.scss'

interface POProps {
  paymentMade: boolean
  setAllowPaymentEntry(paymentInfoReceived: boolean): void
}

const PaymentDetailsConfirmed: React.FC<POProps> = ({ paymentMade, setAllowPaymentEntry }) => {
  return paymentMade
    ? <div className={styles.paymentMadeContainer}>
      <i className='material-icons'>check_circle</i>
      <h4>Payment Information Confirmed</h4>
      <p>Want to update your payment method? <button onClick={() => setAllowPaymentEntry(true)}>Click here</button></p>
    </div>
    : <></>
}

export default PaymentDetailsConfirmed
