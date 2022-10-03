import React from 'react'
import styles from './index.module.scss'
import TodoList from 'Components/Anubis/TodoList'
import USAMap from './USAMap'
import * as api from 'Utilities/pharaoh'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { useAsync } from 'react-use'
import { Table, Alignment, SortDirection } from 'Components/Rudimentary/Table'
import useUser from 'Utilities/Hooks/useUser'

import billingStub from 'Assets/Stubs/BillingStub.svg'
import commissionsStub from 'Assets/Stubs/CommissionsStub.svg'
import { classNames } from 'Utilities/etc'
import { ComboStatus } from '../client'
import { Route } from 'Utilities/Route'
import path from 'path'
import { Link, Redirect } from 'react-router-dom'

interface Response {
  states: string[]
  counts: {
    inProgress: number
    active: number
    flagged: number
    enrolled: number
  }
  agencyReports: AgencyReport[]
  agencyID: string
  agencyName: string
  variant: Variant
}

enum Variant {
  whiteLabel = 'whiteLabel',
  agency = 'agency',
  producer = 'producer'
}

interface AgencyReport {
  id: string
  carrierName: string
  groupCount: number
  eeCount: number
  premium: string
}

const AgencyDashboardReports: React.FC = () => {
  const { loading, error, value } = useAsync(async() => await api.v2.brokers.reports() as Response)
  const { value: user, loading: loadingUser } = useUser()

  if (loading || loadingUser) return <Loader />
  if (error) return <Error error={error} />

  if (!user?.nipr) return <Redirect to={Route.agencyDashboardAccount} />

  const { states, counts, agencyReports: agencyReports_, agencyID, agencyName } = value!
  const agencyReports = agencyReports_.map(ar => ({ ...ar, id: ar.carrierName }))

  const titleString = (() => {
    switch (value!.variant) {
    case Variant.whiteLabel:
      return 'Grand'
    case Variant.agency:
      return agencyName
    case Variant.producer:
      return 'Your'
    }
  })()

  return <div className={styles.mainContainer}>
    <header className={styles.header}>
      <h1>{titleString} Overview</h1>
    </header>
    <div className={styles.content}>
      <div className={styles.row}>
        <div className={styles.status}>
          <div className={styles.row}>
            <Link to={path.join(Route.agencyDashboardClient, ComboStatus.inProgress)} className={`${styles.statusBox} ${styles.statusPurple}`}>
              <span className={styles.statusNumber}>{counts.inProgress}</span>
              <span className={styles.statusCopy}>In‑progress Clients</span>
            </Link>
            <Link to={path.join(Route.agencyDashboardClient, ComboStatus.active)} className={`${styles.statusBox} ${styles.statusGreen}`}>
              <span className={styles.statusNumber}>{counts.active}</span>
              <span className={styles.statusCopy}>Active Clients</span>
            </Link>
          </div>
          <div className={styles.row}>
            <Link to={path.join(Route.agencyDashboardClients, 'flagged')} className={`${styles.statusBox} ${styles.statusOrange}`}>
              <span className={styles.statusNumber}>{counts.flagged}</span>
              <span className={styles.statusCopy}>Flagged</span>
            </Link>
            <div className={`${styles.statusBox} ${styles.statusBlue}`}>
              <span className={styles.statusNumber}>{counts.enrolled}</span>
              <span className={styles.statusCopy}>Employees Enrolled</span>
            </div>
          </div>
        </div>
        <div className={styles.todos}>
          <TodoList className={styles.todoList} id={agencyID} />
        </div>
      </div>
      <div className={styles.row} style={{ display: 'none' }}>
        {/* <div className={`${styles.box} ${styles.boxOrange}`}> */}
        <img src={billingStub} alt='Billing' />
        {/* </div> */}
        {/* <div className={`${styles.box} ${styles.boxGrey}`}> */}
        <img src={commissionsStub} alt='Commissions' />
        {/* </div> */}
      </div>
      <div className={styles.row}>
        <div className={styles.agencyLocations}>
          <div className={classNames(styles.box, styles.boxBlue, styles.seamlessBox)}>
            <h2>Agency Reports ({agencyReports.length})</h2>
            <AgencyReportsTable data={agencyReports} />
          </div>
          <div className={classNames(styles.locations, styles.box, styles.boxBlue)}>
            <h2>Your Locations ({states.length})</h2>
            <USAMap
              clickable={false}
              selectedStates={states}
              height='100%'
              width='100%'
            />
          </div>
        </div>
      </div>
      {zoho()}
    </div>
  </div>

  function zoho() {
    if (!user || (user.agencyID !== user.whiteLabelAgencyID)) return null
    return <div className={styles.zoho}>
      <h1>General Reports</h1>
      <iframe className={`${styles.box} ${styles.boxGrey}`} title="Zoho" frameBorder="0" src="https://analytics.zoho.com/open-view/1708821000001410774/f872e2b7d53c483bbbe84fffff4d6d37" />
    </div>
  }
}

const AgencyReportsTable: React.SFC<{data: AgencyReport[]}> = ({ data }) =>
  <Table
    scrollable={true}
    heading={key => {
      switch (key) {
      case 'carrierName':
        return 'Carrier'
      case 'groupCount':
        return 'Clients'
      case 'eeCount':
        return ' Members'
      case 'premium':
        return 'Premiums'
      }
    }}
    width={key => {
      switch (key) {
      case 'carrierName':
        return '35%'
      case 'groupCount':
        return '20%'
      case 'eeCount':
        return '22%'
      case 'premium':
        return '20%'
      case 'id':
        return ''
      }
    }}
    data={data}
    order={['carrierName', 'groupCount', 'eeCount', 'premium']}
    alignment={key => {
      switch (key) {
      case 'carrierName':
        return Alignment.left
      case 'groupCount':
      case 'eeCount':
        return Alignment.center
      case 'premium':
      case 'id':
        return Alignment.right
      }
    }}
    defaultSort='eeCount'
    defaultSortDirection={key => {
      switch (key) {
      case 'carrierName':
      case 'id':
        return SortDirection.ascending
      case 'groupCount':
      case 'eeCount':
      case 'premium':
        return SortDirection.descending
      }
    }}
    secondarySort={() => ['premium', 'eeCount', 'groupCount', 'carrierName']}
    headerToolTip={key => {
      switch (key) {
      case 'premium':
        return 'Monthly Premium'
      case 'eeCount':
        return 'Number of Employees'
      case 'groupCount':
        return 'Number of Groups'
      default:
        return null
      }
    }}
    reportFileBasename='agency-report'
  />

export default AgencyDashboardReports
