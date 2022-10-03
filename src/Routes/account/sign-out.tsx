import React from 'react'
import * as api from 'Utilities/pharaoh'
import { useAsync } from 'react-use'
import { Redirect, RouteProps } from 'react-router-dom'
import { Route } from 'Utilities/Route'

const SignOut: React.FC<RouteProps> = ({ location }) => {
  const async = useAsync(api.v1.users.sessions.DELETE)

  // NOTE we ignore errors

  if (async.loading) {
    return <h1>Signing You Out…</h1>
  } else {
    const to = (location?.state as any)?.redirect || Route.landing
    return <Redirect to={to} />
  }
}

export default SignOut
