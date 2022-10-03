/* eslint-disable camelcase */

import React, { FormEvent, useState, useEffect } from 'react'
import styles from './index.module.scss'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'

interface Props {
  setAllowPaymentEntry(allowPaymentEntry: boolean): void
}

const CreditCardPayment: React.FC<Props> = ({ setAllowPaymentEntry }) => {
  const [clientSecret, setClientSecret] = useState('')
  const stripe = useStripe()
  const elements = useElements()
  const addToast = useToast()

  useEffect(() => {
    api.v3.users().payments.GET().then(a => setClientSecret(a.clientSecret))
  }, [])

  // If you change the surcharge copy here, remember to update Cart.tsx

  return <form onSubmit={handleSubmit}>
    <div className={styles.cardElementContainer}><CardElement options={CARD_ELEMENT_OPTIONS}/></div>
    <p>I authorize MyHealthily to send instructions to the financial institution that issued my card to take payments from my card account in accordance with the terms of my agreement with you.<br/><i><b>Note: Payment will include a 2.9% + 30 cents surcharge.</b></i></p>
    <input type='submit' className={styles.paymentButton} disabled={!stripe} value='Authorize payment!' />
  </form>

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements || clientSecret === '') { return }

    const card = elements.getElement(CardElement)
    if (card === null) { return }

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: card }
    })

    if (result.error?.message) {
      addToast(result.error.message, 'error')
    } else {
      try {
        await api.v3.users().payments.POST({ paymentID: result.setupIntent?.payment_method })
        setAllowPaymentEntry(false)
      } catch (error) {
        addToast(error)
      }
    }
  }
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#3564B9',
      iconColor: '#3564B9',
      fontFamily: 'proxima-nova, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '20px',
      '::placeholder': {
        color: '#A2A2A2'
      }
    },
    empty: {
      iconColor: '#A2A2A2'
    },
    invalid: {
      color: '#FCA976',
      iconColor: '#fa755a'
    }
  }
}

export default CreditCardPayment
