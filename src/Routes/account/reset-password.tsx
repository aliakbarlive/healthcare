import React, { useState } from 'react'
import * as api from 'Utilities/pharaoh'
import { Route } from 'Utilities/Route'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import { useHistory, RouteComponentProps, useParams } from 'react-router-dom'
import styles from './account.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { firstName } from 'Utilities/etc'

interface ReceivedProps {
  name: string | undefined
  email: string | undefined
  terminus: string | undefined
  mode: Mode
}

export enum Mode {
  existingUser,
  newUser
}

const ResetPassword: React.FC<Pick<RouteComponentProps, 'location'>> = ({ location }) => {
  const { email, name, terminus, mode } = (location?.state || {}) as ReceivedProps
  const { register, handleSubmit } = useForm()
  const [disabled, setDisabled] = useState(false)
  const addToast = useToast()
  const history = useHistory()
  const { token } = useParams() as { token: string }

  return <form className={styles.accountForm} onSubmit={handleSubmit(onSubmit)}>
    <div>
      <h1>{welcome()}</h1>
      <h2>{h2()}</h2>
    </div>
    <fieldset disabled={disabled}>
      {emailElements()}
      <CandorInput
        name="password"
        ref={register}
        type="password"
        placeholder="Password"
        required
      />
      <CandorInput
        name="confirmPassword"
        ref={register}
        type="password"
        placeholder="Confirm Password"
        required
      />
      <p>Passwords must be at least 8 characters containing at least 1 uppercase letter, 1 lowercase letter and 1 symbol.</p>
      <input type="submit" value="Save Password" />
    </fieldset>
  </form>

  function welcome() {
    const greeting = firstName(name)
    switch (mode) {
    case Mode.newUser:
      return greeting ? `Welcome ${greeting}!` : 'Welcome!'
    case Mode.existingUser:
      return `We’re glad you’re back ${greeting}!`
    }
  }

  function h2() {
    switch (mode) {
    case undefined:
    case Mode.newUser:
      return 'Let’s secure your account.'
    case Mode.existingUser:
      return 'Let’s change your password'
    }
  }

  function emailElements() {
    if (!email) return null
    return <>
      <CandorInput
        name="email"
        ref={register}
        type="email"
        defaultValue={email}
        disabled
      />
    </>
  }

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      await api.v1.users.resetPassword(data, token)
      history.push(terminus || Route.landing)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }
}

export default ResetPassword
