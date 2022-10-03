import React, { useState } from 'react'
import styles from './PaymentCart.module.scss'
import * as api from 'Utilities/pharaoh'
import { toUpper } from 'lodash'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import { Payment } from 'Utilities/Hooks/useStargate'
import { PaymentMethod } from './PaymentForm'
import { moneyNumber, moneyString } from 'Utilities/Plans/ContributionCalculator'
import moment from 'moment'

interface Props {
  payment: Payment
  paymentMethod: PaymentMethod
}

interface PlanCost {
  code?: string
  dueToday?: number
  nextPaymentAmount?: number
  nextPaymentDate?: Date
}

const PaymentCart: React.FC<Props> = ({ payment, paymentMethod }) => {
  const { register, handleSubmit, watch } = useForm()
  const addToast = useToast()
  const { appliedPromoCode, nextPaymentAmount, paymentAmount, nextPaymentDate } = payment
  const defaultPlanCost: PlanCost = {
    code: appliedPromoCode,
    dueToday: moneyNumber(paymentAmount),
    nextPaymentAmount: moneyNumber(nextPaymentAmount),
    nextPaymentDate: nextPaymentDate
  }

  const [planCost, setPlanCost] = useState(defaultPlanCost)
  const promo = watch('promo')

  // Shouldn't happen, but who the fuck knows
  if (!planCost.dueToday && planCost.dueToday !== 0) {
    console.warn('No payment amount set!')
    return <></>
  }

  return <>
    <div className={styles.cart}>
      <div>Total due today {planCost.code && <>with promo code <span>{toUpper(planCost.code)}</span></>}</div>
      <div className={styles.amt}>{moneyString(planCost.dueToday + surcharge(planCost.dueToday))}</div>
      { (planCost.nextPaymentAmount && planCost.nextPaymentDate)
        ? <div>Your next charge will be {moneyString(planCost.nextPaymentAmount + surcharge(planCost.nextPaymentAmount))} on {moment(planCost.nextPaymentDate).format('MMM Do YYYY')}</div>
        : <></>
      }
    </div>
    <form onSubmit={handleSubmit(onSubmit)} className={styles.promoCodeForm}>
      <div>Have a promo code?</div>
      <input ref={register} type='text' name='promo' placeholder='Promo code' />
      <input type='submit' value='Apply' disabled={!promo}/>
    </form>
  </>

  async function onSubmit(data: any) {
    try {
      const { promocode, nextPaymentDate, nextPaymentAmount, paymentAmount } = await api.v3.users().payments.promocodes({ promocode: data.promo })
      addToast(`Promo Code ${promo} successfully applied`, 'success')
      const newPlanCost: PlanCost = {
        code: promocode,
        dueToday: moneyNumber(paymentAmount),
        nextPaymentAmount: moneyNumber(nextPaymentAmount),
        nextPaymentDate: nextPaymentDate
      }
      setPlanCost(newPlanCost)
    } catch (error) {
      addToast(error)
    }
  }

  function surcharge(premium: number) {
    // Candor swallows any cost associated with plaid ach payments
    if (paymentMethod === PaymentMethod.ACH || !premium) { return 0 }

    // Stripe credit card processing fee is passed onto the customer
    // If you do edit the formula, make sure you update the copy in CreditCardPayment.tsx
    // Current surcharge is 2.9% + 30 cents
    return premium * 0.029 + 0.30
  }
}

export default PaymentCart
