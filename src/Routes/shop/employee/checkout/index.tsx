/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react'
import PaymentForm from './PaymentForm'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import UHOne, { ReturnEvent } from '../../../../Components/Stargate/Underwriting/UHOne'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import queryString from 'query-string'
import { isProduction } from 'Utilities/config'

const stripePromise = loadStripe((() => {
  return isProduction()
    ? 'pk_live_R8DLKCQtN9FBLyvjfyCpeiRu'
    : 'pk_test_X0f91gROjpk6ZHTG5sGGAH31'
})())

const Payment: React.FC<PrivateWizardPageProps> = ({ onwards, stargate }) => {
  useEffect(() => {
    const el = document.getElementById('content')!
    el.style.paddingLeft = '0'
    el.style.paddingRight = '0'
    el.style.maxWidth = 'unset'
    return () => {
      el.style.removeProperty('padding-left')
      el.style.removeProperty('padding-right')
      el.style.removeProperty('max-width')
    }
  })
  const { showUnderwritingPage, group, groupMember, payment } = stargate
  /*
    Not using useToggle to avoid accidentally setting it to false.
    Managing this state locally to avoid fetching stargate again, would be better if we could asyncRetry just the payment object instead.
    Really only using it for the first time payment is made.
  */

  const [allowPaymentEntry, setAllowPaymentEntry] = useState(!payment.paymentInfoReceived)

  const parsedQuery = queryString.parse(window.location.search)
  const event = groupMember?.medical_underwriting_complete
    ? ReturnEvent.SIGNING_COMPLETE
    : parsedQuery.event as ReturnEvent

  const allowProgress = showUnderwritingPage
    ? event === ReturnEvent.SIGNING_COMPLETE && !allowPaymentEntry
    : !allowPaymentEntry

  const header = showUnderwritingPage ? 'User Agreement and Payment' : 'Payment Info'
  const subHeader = showUnderwritingPage
    ? 'Submit payment information and sign the user agreement for your new plan!'
    : 'Plan selection confirmed! Submit payment information for your new plan!'

  return <Elements stripe={stripePromise}>
    <h1 className='shop-h1-periwinkle'>{header}</h1>
    <h2 className='shop-h2-navy'>{subHeader}</h2>
    <PaymentForm
      payment={payment}
      allowPaymentEntry={allowPaymentEntry}
      setAllowPaymentEntry={setAllowPaymentEntry}
      showPlaid={false}
    />
    {showUnderwritingPage &&
      <UHOne
        groupID={group!.id}
        state={event}
        paymentInfoReceived={!allowPaymentEntry}
      />
    }
    <button
      style={{ marginTop: '2.5rem' }}
      className='shop-next-button'
      onClick={() => onwards(Promise.resolve())}
      disabled={!allowProgress}
    >
      Finish
    </button>
  </Elements>
}

export default Payment
