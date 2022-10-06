import React from 'react'
import { Route, Redirect, useLocation, RouteProps, RouteComponentProps } from 'react-router-dom'
import { isAuthenticated } from 'Utilities/pharaoh'
import { Route as RaRoute } from 'Utilities/Route'

const PrivateRoute: React.FC<RouteProps> = ({ component: Component, render, ...rest }) => {
  const terminus = useLocation().pathname

  if (!Component && !render) return null

  return <Route {...rest} render={(props: RouteComponentProps<any>) =>
    isAuthenticated()
      ? Component
        ? <Component {...props} />
        : render!(props)
      : <Redirect to={{
        pathname: RaRoute.signIn,
        state: { terminus }
      }} />
  }/>
}

export default PrivateRoute
