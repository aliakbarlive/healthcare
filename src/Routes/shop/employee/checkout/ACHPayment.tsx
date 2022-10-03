/* eslint-disable camelcase */

import React from 'react'
import styles from './index.module.scss'
import Error from 'Components/Primitives/Error'
import { usePlaidLink } from 'react-plaid-link'
import useToast from 'Utilities/Hooks/useToast'
import * as api from 'Utilities/pharaoh'
import { isProduction } from 'Utilities/config'

const PLAID_ENV = isProduction()
  ? 'production'
  : 'sandbox'

const PLAID_KEY = 'a4811e9023001711bb44c378e5fb7e'

interface Props {
  setAllowPaymentEntry?(allowPaymentEntry: boolean): void
  groupID?: string
  cleanUp?(): void
  wrapperClassName?: string
}

const ACHPayment: React.FC<Props> = ({ setAllowPaymentEntry, groupID, cleanUp, wrapperClassName }) => {
  const addToast = useToast()
  const onSuccess = (publicToken: string, metadata: any) => {
    const { account_id } = metadata
    if (account_id) {
      if (setAllowPaymentEntry) {
        api.v3.users().payments.ach({ plaidToken: publicToken, accountId: account_id })
          .then(() => setAllowPaymentEntry(false))
          .catch(addToast)
      } else if (groupID && cleanUp) {
        // toggleShowPlaidForm()
        api.v3.groups(groupID).payments.ach.PUT({ plaidToken: publicToken, accountId: account_id })
          .then(cleanUp)
          .catch(addToast)
      }
    } else {
      addToast('No bank account selected.', 'error')
    }
  }

  const onExit = (error: { error_code: string, error_message: string, display_message: string | null } | null) => {
    if (error) {
      const msg = error.display_message || error.error_message
      addToast(msg, 'error')
    }
  }

  const config = {
    clientName: 'Candor USA',
    env: PLAID_ENV,
    product: ['auth', 'transactions'],
    publicKey: PLAID_KEY,
    onSuccess: onSuccess,
    onExit: onExit
  }

  const { open, ready, error } = usePlaidLink(config)
  const onClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault()
    open()
  }

  return error
    ? <Error error={error} />
    : <div className={wrapperClassName}>
      <button className={styles.paymentButton} onClick={onClick} disabled={!ready}>Connect to your Bank Account</button>
      <p>Your payment information is processed via <a href='https://plaid.com/' target='_blank' rel="noopener noreferrer">Plaid</a> and is confidential.<br/>We will not have access to your username & password or account information.</p>
    </div>
}

export default ACHPayment
