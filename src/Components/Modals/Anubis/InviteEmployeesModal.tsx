import React from 'react'
import AnubisModal, { Props as ModalProps } from 'Components/Anubis/AnubisModal'
import { useAsync, useToggle } from 'react-use'
import { get, post } from 'Utilities/fetch++'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import useToast from 'Utilities/Hooks/useToast'
import Annotation from '../../Rudimentary/Annotation'
import styles from './InviteEmployeesModal.module.scss'
import { GAButton } from 'Components/Tracking'

interface Props extends ModalProps {
  groupID: string
  onRequestClose(): void
}

const InviteEmployeesModal: React.FC<Props> = ({ groupID, ...props }) => {
  const { loading, value, error } = useAsync(() => get(`/groups/${groupID}`))
  const addToast = useToast()
  const [disabled, setDisabled] = useToggle(false)

  return <AnubisModal
    {...props}
    name={InviteEmployeesModal.name}
    shouldCloseOnOverlayClick={true}
  >
    <div style={{ maxWidth: '400px' }}>
      <h1>Invite Your Employees</h1>
      <p>
      Your employees will be each emailed a unique link inviting them
      to visit <b>MyHealthily</b> and pick their benefits or
      to <Annotation id='waive' definition={Annotation.waive}>waive</Annotation>.
      </p>
      <p>
      We advise sending this as soon as you are comfortable so that there
      is more than enough time before the effective date you have selected
      to finalize their choices with
      the <Annotation id='carrier' definition={Annotation.carrier}>carriers</Annotation>.
      </p>
      <p>
        Please ensure your employee emails are entered correctly before sending the invites.
      </p>
      {button()}
      <p>
        Each employee’s link is available here on your dashboard should you need them at a later time.
      </p>
    </div>
  </AnubisModal>

  async function go() {
    try {
      setDisabled(true)
      addToast('Sending Invites')
      await post(`/v2/groups/${groupID}/users/invite`)
      props.onRequestClose()

      // FIXME we need to update all ToDo lists and this is easiest
      // probs needs a useToDos() hook to make components that use them refresh
      window.location.reload()
    } catch (error) {
      addToast(error)
      setDisabled(false)
    }
  }

  function button() {
    if (loading) return <Loader />
    if (error) return <Error error={error} />

    const n = value.member_count
    if (n <= 0) {
      return <p><b>You need to add some employees to your group first.</b></p>
    } else {
      return <GAButton analytics={`Send Invitation (${InviteEmployeesModal.name})`} className={styles.button} disabled={disabled} onClick={go}>Send {n} Invitation{n !== 1 && 's'}</GAButton>
    }
  }
}

export default InviteEmployeesModal
