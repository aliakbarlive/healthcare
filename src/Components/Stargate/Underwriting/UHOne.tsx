import React, { useState } from 'react'
import styles from './UHOne.module.scss'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import useToast from 'Utilities/Hooks/useToast'

/* Possible returned event values from docusign
 * access_code_failed: Recipient used incorrect access code.
 * cancel: Recipient canceled the signing operation, possibly by using the Finish Later option.
 * decline: Recipient declined to sign.
 * exception: A system error occurred during the signing process.
 * fax_pending: Recipient has a fax pending.
 * id_check_failed: Recipient failed an ID check.
 * session_timeout: The session timed out. An account can control this timeout by using the Signer Session Timeout option.
 * signing_complete: The recipient completed the signing ceremony.
 * ttl_expired: The Time To Live token for the envelope has expired. After being successfully invoked, these tokens expire after 5 minutes or if the envelope is voided.
 * viewing_complete: The recipient completed viewing an envelope that is in a read-only/terminal state, such as completed, declined, or voided.
 */

export enum ReturnEvent {
  ACCESS_CODE_FAILED = 'access_code_failed',
  CANCEL = 'cancel',
  DECLINE = 'decline',
  EXCEPTION = 'exception',
  FAX_PENDING = 'fax_pending',
  ID_CHECK_FAILED = 'id_check_failed',
  SESSION_TIMEOUT = 'session_timeout',
  SIGNING_COMPLETE = 'signing_complete',
  TTL_EXPIRED = 'ttl_expired',
  VIEWING_COMPLETE = 'viewing_complete'
}

type Props = {
  groupID: string
  state?: ReturnEvent
  paymentInfoReceived: boolean
}

const UHOne: React.FC<Props> = ({ groupID, state, paymentInfoReceived }) => {
  const [loading, setLoading] = useState(false)
  const addToast = useToast()

  async function getUHOneLink() {
    if (!paymentInfoReceived) {
      addToast('Please fill out your payment details before signing the user Agreement')
      return
    }
    setLoading(true)
    try {
      const uhone = await api.v2.groups(groupID).users.uhone()
      if (uhone.docuSignUrl) {
        window.location.href = uhone.docuSignUrl
      }
    } catch (error) {
      addToast(error)
    } finally {
      setLoading(false)
    }
  }

  return <DocusignButton generateLink={getUHOneLink} state={state} loading={loading}/>
}

interface DBProps {
  generateLink(): Promise<void>
  loading: boolean
  state?: ReturnEvent
}

const DocusignButton: React.FC<DBProps> = ({ generateLink, state, loading }) => {
  function docusignClassName() {
    switch (state) {
    case ReturnEvent.SIGNING_COMPLETE:
      return styles.complete
    case ReturnEvent.EXCEPTION:
    case ReturnEvent.DECLINE:
      return styles.declined
    default:
      if (loading) { return styles.loading }
      return styles.normal
    }
  }

  function content() {
    switch (state) {
    case ReturnEvent.SIGNING_COMPLETE:
      return <>
        <i className='material-icons'>check_circle</i>
        <span>User Agreement Signed</span>
      </>
    case ReturnEvent.EXCEPTION:
    case ReturnEvent.DECLINE:
      return <>
        <i className='material-icons'>cancel</i>
        <span>User Agreement Declined</span>
      </>
    default:
      if (loading) { return <><Loader/><span>Generating User Agreement</span></> }
      return <div onClick={generateLink}>Sign User Agreement</div>
    }
  }

  return <div className={styles.docusignContainer}>
    <h3>User Agreement</h3>
    <p>After submitting your payment info, click the button below to verify the information you provided is accurate and sign your user agreement form. Your application will not be complete until this agreement has been signed. </p>
    <div className={docusignClassName()}>
      {content()}
    </div>
  </div>
}

export default UHOne
