import React, { useState } from 'react'
import { v1, clearLocalStorage, setToken } from 'Utilities/pharaoh'
import { useHistory, RouteComponentProps, Link, Redirect } from 'react-router-dom'
import useToast from 'Utilities/Hooks/useToast'
import { useForm } from 'react-hook-form'
import { Route } from 'Utilities/Route'
import styles from './account.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { useWhiteLabelFromSearchParams } from 'Utilities/Hooks/useWhiteLabel'
import { obeliskMode } from 'Utilities/config'

type Props = RouteComponentProps

/// props via a <Redirect />’s location.state
interface ReceivedProps {
  email: string | undefined
  name: string | undefined
  terminus: string | undefined
}

const SignIn: React.FC<Props> = (props) => {
  const { email, name, terminus } = (props.location?.state || {}) as ReceivedProps
  const { register, handleSubmit } = useForm()
  const history = useHistory()
  const addToast = useToast()
  const [disabled, setDisabled] = useState(false)
  const label = useWhiteLabelFromSearchParams()

  if (label) { localStorage.label = label.url }

  const [token, redirect, overrideGroupID] = extractParameters()
  if (token) {
    clearLocalStorage() // mostly for the overrideGroupID type stuff
    setToken(token)
    if (overrideGroupID) localStorage.overrideGroupID = overrideGroupID
    return <Redirect to={redirect || '/'} />
  }

  return <form className={styles.accountForm} onSubmit={handleSubmit(onSubmit)}>
    {welcome()}
    <fieldset disabled={disabled}>
      <CandorInput
        name="email"
        ref={register}
        type="email"
        placeholder="Email"
        defaultValue={email}
        required
      />
      <CandorInput
        name="password"
        ref={register}
        type="password"
        placeholder="Password"
        required={true}
      />
      <span>Email or password trouble? <Link to={Route.forgotPassword}>Click here!</Link></span>
      <input type="submit" value={disabled ? 'Signing In…' : 'Sign In'} />
    </fieldset>
    <h2 style={{ margin: '4rem 0 0 0' }}>Looking for the Shop?</h2>
    {shopCopy()}
  </form>

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      await v1.users.sessions.POST(data.email, data.password)
      history.replace(terminus || Route.landing)
    } catch (error) {
      addToast(error)
      setDisabled(false)
    }
  }

  function welcome() {
    if (name) {
      return <h1>Welcome Back {name}!</h1>
    } else {
      return <h1>Welcome Back!</h1>
    }
  }

  function extractParameters(): [string | null, string | null, string | null] {
    const pp = new URLSearchParams(window.location.search)
    return [pp.get('token'), pp.get('redirect'), pp.get('overrideGroupID')]
  }

  function shopCopy() {
    if (label && !obeliskMode(label.url)) {
      return <p style={{ textAlign: 'center' }}><Link to='/shop/employer'>Click here</Link></p>
    }
    return <p style={{ textAlign: 'center' }}><Link to='/shop/myhealthily'>Click here</Link></p>
  }
}

export default SignIn
