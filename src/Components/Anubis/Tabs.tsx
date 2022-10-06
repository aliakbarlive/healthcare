import { useLocation, Link, useHistory } from 'react-router-dom'
import styles from './Tabs.module.scss'
import React from 'react'
import { Route, getTitle } from 'Utilities/Route'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'
import { GAButton } from 'Components/Tracking'

const Tabs: React.FC = () => {
  const location = useLocation().pathname
  const history = useHistory()
  const { value: user } = useUser()
  switch (user?.powerLevel) {
  case PowerLevel.individual:
    if (location.startsWith(Route.dashboardEmployer) || location.startsWith(Route.agencyDashboardAgencies)) { history.push(Route.dashboardEmployee) }
    break
  case PowerLevel.groupManager:
    if (location.startsWith(Route.agencyDashboard)) { history.push(Route.dashboardEmployer) }
    break
  case PowerLevel.associationManager:
    throw window.Error('No dashboard access configured')
  case undefined:
  case PowerLevel.broker:
  case PowerLevel.superBroker:
  case PowerLevel.candorEmployee:
    break
  }

  const withBrokerReturn = !location.startsWith(Route.agencyDashboard) && (user?.powerLevel || PowerLevel.individual) >= PowerLevel.broker
  const showSignOut = location.startsWith(Route.agencyDashboard) || location.startsWith(Route.dashboardEmployer) || location.startsWith(Route.dashboardEmployee)
  let tabs: Route[] = []
  if (location.startsWith(Route.agencyDashboard)) {
    tabs.push(Route.agencyDashboardHome)
    tabs.push(Route.agencyDashboardClient)

    if (user && user.powerLevel >= PowerLevel.superBroker) {
      tabs.push(Route.agencyDashboardProducers)
      if (user.powerLevel >= PowerLevel.candorEmployee) {
        tabs.push(Route.agencyDashboardAgencies)
      }
    }

    tabs.push(Route.agencyDashboardAccount)
  } else if (location.startsWith(Route.dashboardEmployer)) {
    tabs = [Route.dashboardEmployer, Route.dashboardEmployerEmployees, Route.dashboardEmployerProfile]
  } else if (location.startsWith(Route.dashboardEmployee)) {
    tabs = [Route.dashboardEmployee, Route.dashboardEmployeeProfile]
  } else {
    return null
  }

  // more involved than you thought because we need to cater
  // to some routes having the same prefix as other routes that are deeper
  // NOTE this only works because we so far only order tabs in ascending depth order
  let activeTab: Route
  for (const tab of tabs) {
    if (tab === location) { activeTab = tab; break }
    if (location.startsWith(tab)) activeTab = tab
  }

  return (
    <>
      <div className={styles.tabs}>
        <div className={styles.tabContainer}>
          {tabs.map(tab =>
            <Tab key={tab} path={tab} active={activeTab === tab} title={getTitle(tab)} />)
          }
        </div>
      </div>
      {withBrokerReturn &&
        <Link to={Route.agencyDashboard}>
          <GAButton analytics={`Back to Agency Dashboard (${Tabs.name})`} className={styles.backTo}>Back to Agency Dashboard</GAButton>
        </Link>
      }
      {showSignOut && <Link to={Route.signOut}>
        <GAButton analytics={`Sign out (${Tabs.name})`} className={styles.signout}>Sign out</GAButton>
      </Link>}
    </>
  )
}

type TabProps = {
  title: string
  path: Route
  active: boolean
}

const Tab: React.FC<TabProps> = ({ title, path, active }) => {
  const tabClass = active ? `${styles.tab} ${styles.active}` : styles.tab
  return (
    <div className={tabClass}>
      <Link to={path}>{title}</Link>
    </div>
  )
}

export default Tabs
