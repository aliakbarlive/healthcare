/* eslint-disable camelcase */

import React, { useState } from 'react'
import styles from './index.module.scss'
import PaymentMethodSegmentedControl from './PaymentMethodSegmentedControl'
import PaymentDetailsConfirmed from './PaymentDetailsConfirmed'
import CreditCardPayment from './CreditCardPayment'
import ACHPayment from './ACHPayment'
import PaymentCart from './PaymentCart'
import { Payment } from 'Utilities/Hooks/useStargate'

type Props = {
  payment: Payment
  allowPaymentEntry: boolean
  setAllowPaymentEntry(paymentInfoReceived: boolean): void
  showPlaid: boolean
}

export enum PaymentMethod {
  ACH,
  CreditCard
}

const PaymentForm: React.FC<Props> = ({ payment, allowPaymentEntry, setAllowPaymentEntry, showPlaid }) => {
  /*
    Plaid production credentials are only available for RNS atm.
    If not available, hide PaymentSegmentedController and only show CreditCardPayment as the payment option
  */
  const [paymentMethod, setPaymentMethod] = useState(showPlaid ? PaymentMethod.ACH : PaymentMethod.CreditCard)

  return <section className={styles.paymentSection}>
    <div className={styles.content}>
      <h3>Payment Info</h3>
      { !allowPaymentEntry
        ? <PaymentDetailsConfirmed paymentMade={!allowPaymentEntry} setAllowPaymentEntry={setAllowPaymentEntry}/>
        : <>
          { showPlaid && <PaymentMethodSegmentedControl selected={paymentMethod} callback={setPaymentMethod}/> }
          <PaymentCart payment={payment} paymentMethod={paymentMethod}/>
          { paymentMethod === PaymentMethod.ACH
            ? <ACHPayment setAllowPaymentEntry={setAllowPaymentEntry}/>
            : <CreditCardPayment setAllowPaymentEntry={setAllowPaymentEntry}/>
          }
        </>
      }
    </div>
  </section>
}

export default PaymentForm
