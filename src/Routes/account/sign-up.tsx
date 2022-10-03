import React, { useState } from 'react'
import * as api from 'Utilities/pharaoh'
import { Route } from 'Utilities/Route'
import { useForm } from 'react-hook-form'
import { useAsync } from 'react-use'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import useToast from 'Utilities/Hooks/useToast'
import { Redirect, useParams } from 'react-router-dom'
import { TicketMode as Mode, Venue } from 'Utilities/pharaoh.types'
import styles from './account.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { Mode as ResetPasswordMode } from './reset-password'
import path from 'path'
import { compact } from 'lodash'

// TESTEXAMPLE http://localhost:3000/account/sign-up/dEDNHbAVZu3cJAUGdPj5QKAppZuJrNOJ7I6snKwl6dw

const SignUp: React.FC = () => {
  const { register, handleSubmit } = useForm()
  const [disabled, setDisabled] = useState(false)
  const { token: encodedToken } = useParams() as { token: string }
  const async = useAsync(api.v3.tickets(encodedToken).GET)
  const addToast = useToast()

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const ticket = async.value!

  switch (ticket.mode) {
  case Mode.redirect:
    return <Redirect to={destination()} />
  case Mode.signIn:
    return <Redirect to={{ pathname: Route.signIn, state: propsForOtherAccountPages() }} />
  case Mode.resetPassword:
    return <Redirect
      to={{
        pathname: `${Route.resetPassword}/${ticket.resetToken}`,
        state: { ...propsForOtherAccountPages(), mode: ResetPasswordMode.newUser }
      }} />
  case Mode.signUp:
    return <form className={styles.accountForm} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h1>Welcome {ticket.name}</h1>
        <h2>Please Sign‐Up</h2>
      </div>
      <fieldset disabled={disabled}>
        <CandorInput
          name="email"
          ref={register}
          type="email"
          defaultValue={ticket.email}
          readOnly
        />
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
        <input type="submit" value="Sign Up" />
      </fieldset>
    </form>
  }

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      const token = decodeURIComponent(encodedToken)
      await api.v3.users().POST({ token, ...data })

      // temporarily forcing page refresh because Stargate is embedded in a shit way
      // history.push(destination() as string)

      window.location.pathname = path.join.apply(null, compact([process.env.PUBLIC_URL, destination()]))
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }

  function destination() {
    if (ticket.groupID) { localStorage.overrideGroupID = ticket.groupID }
    switch (ticket.venue) {
    case Venue.group:
      return `${Route.stargate}/employer`
    case Venue.employee:
      return `${Route.stargate}/employee`
    case Venue.agency:
      return Route.agencyDashboard
    case Venue.eeDashboard:
      return Route.dashboardEmployee
    case Venue.erDashboard:
      return Route.dashboardEmployer
    }
    throw new TypeError('Unhandled venue')
  }

  function propsForOtherAccountPages() {
    return {
      email: ticket.email,
      name: ticket.name,
      terminus: destination()
    }
  }
}

export default SignUp
