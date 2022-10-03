import React, { useState, useEffect } from 'react'
import styles from './SignInModal.module.scss'
import api from 'Utilities/Deprecated/api'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import { v1 } from 'Utilities/pharaoh'
import Modal, { ActionType, BrandColors, ButtonAlignment, ModalProps } from 'Components/Modals/Modal'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { capitalize } from 'lodash'

interface Props extends Omit<ModalProps, 'gaModalName' | 'header'> {
  email: string | undefined
  onRequestClose?: () => void
  callback?: () => void
}

enum Mode {
  forgot = 'forgot', signIn = 'signIn'
}

const SignInModal: React.FC<Props> = ({ email, ...props }) => {
  const [mode, setMode] = useState(Mode.signIn)
  const { register, handleSubmit, reset } = useForm({ defaultValues: { email } })
  const [disabled, setDisabled] = useState(false)
  const addToast = useToast()

  // defaultValues passed to useForm only work on first render, and we exist even though we aren’t visible, so…
  useEffect(() => reset({ email }), [email, reset])

  return <Modal
    {...props}
    gaModalName={SignInModal.name}
    header={mode === Mode.signIn ? 'Hi, Welcome Back!' : 'Reset Password'}
    footerButtons={[{
      value: mode === Mode.signIn ? 'Sign-In' : 'Reset Password',
      inputType: 'submit',
      formId: 'auth-form',
      actionType: ActionType.primary,
      color: BrandColors.blue
    }, {
      gaButtonName: `${capitalize(mode)} ${SignInModal.name}`,
      content: mode === Mode.signIn ? 'Forgot password or didn’t set one up?' : 'Back to Sign‑In',
      onClick: () => mode === Mode.signIn ? setMode(Mode.forgot) : setMode(Mode.signIn),
      actionType: ActionType.link,
      alignment: ButtonAlignment.left,
      color: BrandColors.blue
    }]}
  >
    <form
      onSubmit={handleSubmit(go)}
      className={styles.form}
      id='auth-form'
    >
      <fieldset disabled={disabled}>
        <div>
          {(mode === Mode.signIn || mode === Mode.forgot) && (
            <CandorInput
              type="email"
              name="email"
              placeholder="Email"
              ref={register}
              required
              autoFocus={!email}
            />
          )}
          {mode === Mode.signIn && (
            <CandorInput
              type="password"
              name="password"
              placeholder="Password"
              ref={register}
              autoFocus={!!email}
            />
          )}
        </div>
      </fieldset>
    </form>
  </Modal>

  async function go(data: any) {
    const { email, password } = data
    try {
      setDisabled(true)
      switch (mode) {
      case Mode.forgot:
        resetPassword(email)
        if (props.onRequestClose) props.onRequestClose()
        break
      case Mode.signIn:
        await v1.users.sessions.POST(email, password)
        addToast('Welcome back!', 'info')
        if (props.callback) await props.callback()
      }
    } catch (error) {
      if ((error as any).response?.status === 422) {
        const msg: JSX.Element = <>
          <p>Looks like you haven&apos;t set a password yet.</p>
          <p>Click the link in your welcome email or&nbsp;
            <button className='link-button' onClick={() => resetPassword(email)}>
              request a new password
            </button>
            &nbsp;to access your account
          </p>
        </>
        addToast(msg, 'info')
      } else {
        addToast(error)
      }
    } finally {
      setDisabled(false)
    }
  }

  async function resetPassword(email: string) {
    try {
      await api.resetPassword({ email })
      addToast('Reset password email has been sent.', 'success')
    } catch (error) {
      addToast(error)
    }
  }
}

export default SignInModal
