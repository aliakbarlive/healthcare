import React, { FormEvent, useState } from 'react'
import styles from './SidecarPaymentModal.module.scss'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Modal, { ActionType, BrandColors, ModalProps } from 'Components/Modals/Modal'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import useToast from 'Utilities/Hooks/useToast'

type Props = Omit<ModalProps, 'gaModalName' | 'header' | 'footerButtons'> & {
  groupId: string
  onwards(): void
  member?: never
  sidecarProfile?: never
}

const SidecarPaymentModal: React.FC<Props> = ({ groupId, member, onwards, ...props }) => {
  const { value: key, loading: fetching, error } = useAsync(async() => api.v3.integrations.sidecar.stripeKey().then(res => res.text()))
  const [disabled, setDisabled] = useState(false)
  const formId = `${SidecarPaymentModal.name}-form`
  return <Modal
    gaModalName={SidecarPaymentModal.name}
    header={groupId ? 'Payment Details' : 'Sidecar Application'}
    footerButtons={[{
      actionType: ActionType.primary,
      color: BrandColors.blue,
      inputType: 'submit',
      formId,
      value: 'Save Payment Information',
      disabled: fetching || disabled
    }]}
    {...props}>
    {fetching
      ? <Loader center/>
      : error
        ? <Error error={error} />
        : <Elements stripe={loadStripe(key)}>
          { disabled && <div className={styles.loadingContainer}><Loader center/></div> }
          <EmployerPaymentForm groupId={groupId} id={formId} onwards={onwards} setDisabled={setDisabled} />
        </Elements>
    }
  </Modal>
}

interface EmployerPaymentFormProps {
  groupId: string
  id: string
  onwards(): void
  setDisabled(state: boolean): void
}

const EmployerPaymentForm: React.FC<EmployerPaymentFormProps> = props => {
  const stripe = useStripe()
  const elements = useElements()
  const addToast = useToast()

  return <form onSubmit={submit} className={styles.paymentForm} id={props.id}>
    <p>Enter your Payment Details</p>
    <SidecarStripeCard showCaption/>
  </form>

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    props.setDisabled(true)
    try {
      const card = elements?.getElement(CardElement)
      if (!stripe || !card) throw window.Error('Stripe is not initialized')
      const { error, token } = await stripe.createToken(card)
      if (error) throw error
      if (!token) throw window.Error('Something went wrong, please try again')
      await api.v3.integrations.sidecar.group(props.groupId).POST(token.id)
      props.onwards()
    } catch (error) {
      addToast(error)
    } finally {
      props.setDisabled(false)
    }
  }
}

export const SidecarStripeCard: React.FC<React.HTMLAttributes<HTMLDivElement> & { showCaption?: boolean }> = ({ showCaption, ...props }) =>
  <div {...props}>
    <div className={styles.cardElementContainer}><CardElement options={CARD_ELEMENT_OPTIONS} /></div>
    { showCaption && <p>I authorize Sidecar Health Insurance Solutions to send instructions to the financial institution that issued my card to take payments from my card account in accordance with the terms of my agreement</p> }
  </div>

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#48A3DB',
      iconColor: '#48A3DB',
      fontFamily: 'proxima-nova, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '1rem',
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

export default SidecarPaymentModal
