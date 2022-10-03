/* eslint-disable camelcase */
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { $enum } from 'ts-enum-util'
import componentForRoute from 'Utilities/componentForRoute()'
import { Route as RaRoute } from 'Utilities/Route'
import ErrorBoundary from 'Components/Primitives/ErrorBoundary'
import Header from './Header'
import Menu, { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'
import Tabs from 'Components/Anubis/Tabs'
import FourOhFour from 'Components/Rudimentary/404'
import Titler from 'Components/Titler'
import useContentMode from 'Utilities/Hooks/useContentMode'
import { isProduction, Label, obeliskMode } from 'Utilities/config'
import { useWhiteLabel, labelShortCode } from 'Utilities/Hooks/useWhiteLabel'
import Tracking, { PageSenseSnippet } from 'Components/Tracking'
import { getToken } from 'Utilities/pharaoh'

const App: React.FC = () => {
  useContentMode()
  const label = useWhiteLabel().label
  const host = window.location.host

  if (isProduction() && host !== Label.myhealthily) {
    const token = getToken()
    const shortCode = labelShortCode(host)
    const pathname = location.pathname === '/shop/myhealthily' && !obeliskMode(Label[shortCode]) ? '/shop' : location.pathname
    const path = 'https://app.myhealthily.com' +
      (token
        ? `/sign-in?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(pathname)}&`
        : `${pathname}?`) +
      `label=${shortCode}`
    window.location.assign(path)
  }

  const isLanding = useAppMode() === AppMode.landing

  return <ErrorBoundary>
    {!isLanding && (<Header>
      <Tabs />
      <Menu />
    </Header>)}
    <div id="content">
      <Switch>
        {/* standard routes */}
        {$enum(RaRoute).map(componentForRoute)}

        {/* deprecated redirects so old emailed links work */}
        <Route exact path={[
          '/sign-up/token/:token',
          '/dashboard/sign-up/token/:token'
        ]} render={props => <Redirect to={`${RaRoute.signUp}/${props.match.params.token}`} /> }/>
        <Route exact path='/sign-in' render={() => <Redirect to={RaRoute.signIn} />} />
        <Route exact path='/sign-out' render={() => <Redirect to={RaRoute.signOut} />} />
        <Route path={['/employee', '/employer']} render={props => <Redirect to={`/shop${props.location.pathname}`} />} />
        <Route exact path='/get-started' render={() => {
          window.location.assign('/shop/agency')
          return null
        }} />
        <Route exact path='/shop/employee/plans/health/waive' render={() => <Redirect to={RaRoute.eeStargate_confirm}/>} />
        {/* catch all 404 */}
        <Route component={FourOhFour} />
      </Switch>
      {bs()}
    </div>
    <Tracking />
    <PageSenseSnippet whiteLabel={label}></PageSenseSnippet>
    <Titler />
  </ErrorBoundary>

  function bs() {
    if (label !== Label.blacksmith) return null
    // NOTE shows EVERYWHERE but woteva
    // FIXME gross to pollute App.ts with this but we have no <Footer/>
    return <div style={{ margin: '2rem' }}>
      <h2>Blacksmith Automotive Management, Inc. Employee Links</h2>
      <ul>
        <li><a target="_blank" rel="noopener noreferrer" href='https://candor-public.s3.amazonaws.com/blacksmith/Blacksmith+Automotive++2022+Open+Enrollment+Guide.pdf'>Blacksmith Automotive Management, Inc. Renewal Guide</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href='https://candor-public.s3.amazonaws.com/blacksmith/Website+Assistance+Guide.mp4'>Website Assistance Guide</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href='https://candor-public.s3.amazonaws.com/blacksmith/Password+Reset+Instructions.docx'>Password Reset Instructions</a></li>
      </ul>
    </div>
  }
}

export default App
