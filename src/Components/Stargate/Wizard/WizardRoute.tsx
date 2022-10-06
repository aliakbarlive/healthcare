import React, { ReactElement, useState } from 'react'
import { Route, RouteProps, useHistory } from 'react-router-dom'
import { Route as RaRoute } from 'Utilities/Route'
import PrivateRoute from 'Components/Primitives/PrivateRoute'
import useStargate, { StargateResponse as Stargate } from 'Utilities/Hooks/useStargate'
import useToast from 'Utilities/Hooks/useToast'
import Error from 'Components/Primitives/Error'
import Interstitial from 'Components/Stargate/Wizard/Interstitial'
import { AsyncState } from 'react-use/lib/useAsync'
import { State as InterstitialState } from './Interstitial'

type LoadedStargate = Omit<AsyncState<Stargate>, 'loading'>

interface AbstractWizardPageProps<T> {
  /// triggers the next interstitial, on error shows a toast and returns to you,
  /// if you handle the error, you don’t get a toast, either way error is handled
  onwards: (api: Promise<any>) => Promise<void>
  /// provides the result of the async operation you requested, *and* stargate
  stargate: T
}

export type WizardPageProps = AbstractWizardPageProps<LoadedStargate>
export type PrivateWizardPageProps = AbstractWizardPageProps<Stargate>

interface AbstractWizardRouteProps extends Omit<RouteProps, 'render'> {
  /// where to go next?
  onwards: RaRoute | ((obj: any) => RaRoute)
  /// sets this key on successful onwards direction
  localStorageKey?: string

  /// Entry Interstitial text
  entry?: ReactElement | string
}

interface WizardRouteProps<T> extends AbstractWizardRouteProps {
  /// return what you want in this route
  component?: React.FC<AbstractWizardPageProps<T>>
  /// or render it
  render?: (props: RouteProps & AbstractWizardPageProps<T>) => ReactElement
}

export const WizardRoute: React.FC<WizardRouteProps<LoadedStargate>> = ({ component: Component, entry, render, onwards, ...props }) =>
  <Route {...props} render={props =>
    <WizardComponentWrapper onwards={onwards} entry={entry} content={(async, go) => {
      if (Component) {
        return <Component onwards={go} stargate={async} {...props} />
      } else {
        return render!({ onwards: go, stargate: async, ...props })
      }
    }} />
  } />

export const PrivateWizardRoute: React.FC<WizardRouteProps<Stargate>> = ({ component: Component, render, entry, onwards, localStorageKey, ...props }) =>
  <PrivateRoute {...props} render={props =>
    <WizardComponentWrapper onwards={onwards} localStorageKey={localStorageKey} entry={entry} content={(async, go) => {
      if (async.error) {
        return <Error error={async.error} />
      } else if (Component) {
        return <Component onwards={go} stargate={async.value!} {...props} />
      } else {
        return render!({ onwards: go, stargate: async.value!, ...props })
      }
    }} />
  } />

interface WizardComponentWrapperProps<T> extends AbstractWizardRouteProps {
  content: (stargate: T, go: (api: Promise<void>) => Promise<void>) => any
}

const WizardComponentWrapper: React.FC<WizardComponentWrapperProps<LoadedStargate>> = ({ content, onwards, entry, localStorageKey }) => {
  const async = useStargate()
  const history = useHistory()
  const addToast = useToast()
  const [exiting, setExiting] = useState(false)
  const state = async.loading ? InterstitialState.loading : exiting ? InterstitialState.exiting : InterstitialState.ready

  return <>
    <Interstitial state={state}>
      {exiting ? null : entry}
    </Interstitial>
    {async.loading || content(async, go)}
  </>

  async function go(api: Promise<void>): Promise<void> {
    try {
      setExiting(true)
      const obj = await api
      if (localStorageKey) localStorage[localStorageKey] = true
      const dst = typeof onwards === 'function' ? onwards(obj) : onwards
      history.push(dst)
    } catch (error) {
      addToast(error)
    } finally {
      setExiting(false)
    }
  }
}
