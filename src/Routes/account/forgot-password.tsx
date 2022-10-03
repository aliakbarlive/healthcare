import React, { useState } from 'react'
import * as api from 'Utilities/pharaoh'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import styles from './account.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { Route } from 'Utilities/Route'
import { Link } from 'react-router-dom'

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit } = useForm()
  const [disabled, setDisabled] = useState(false)
  const addToast = useToast()
  const contactHref = 'mailto:support@myhealthily.com?Subject=[Request]%20Forgot%20Username'

  return <form onSubmit={handleSubmit(onSubmit)} className={styles.accountForm}>
    <h1>No worries, it happens</h1>
    <fieldset disabled={disabled}>
      <CandorInput
        name="email"
        ref={register}
        type="email"
        placeholder="Email"
        required
      />
      <span>Forgot which email you used? <a href={contactHref}>Contact Us</a></span>
      <input type="submit" value="Reset Password" />
      <span><Link to={Route.signIn}>Back to Sign-in</Link></span>
    </fieldset>
  </form>

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      await api.v1.users.resetPassword(data)
      addToast('Password reset link sent, please check your email')
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }
}

export default ForgotPassword
