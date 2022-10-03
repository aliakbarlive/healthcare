import React, { useState } from 'react'
import styles from './index.module.css'
import Tstyles from '../../../../Components/Rudimentary/Table.module.scss'
import * as api from 'Utilities/pharaoh'
import AddNewClient from 'Components/Anubis/AddNewClient'
import ProfileSection, { ShowAll } from 'Components/Anubis/ProfileSection'
import { useHistory, Link, useParams } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import { useAsyncRetry } from 'react-use'
import { AsyncTable, SortDirection } from 'Components/Rudimentary/Table'
import _ from 'lodash'
import SearchBar from 'Components/Anubis/SearchBar'
import { Contact, PipelineStatus } from 'Utilities/pharaoh.types'
import Stage from 'Components/Anubis/Stage'
import RouteStyle from 'Routes/dashboard/pipeline.module.scss'
import { stages } from '../client/PipelineSettings'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { $enum } from 'ts-enum-util'
import { GAButton } from 'Components/Tracking'

interface Props {
  flagged: boolean
}
enum ComboStatus {
  inProgress = 'in-progress',
  active = 'active'
}
type Filter = PipelineStatus | ComboStatus

const DashboardAgencyGroups: React.FC<Props> = ({ flagged }) => {
  const groups = useAsyncRetry(async() => (await api.v2.brokers.groups().GET(PipelineStatus.enrolled)).groups as Group[])
  const [query, setQuery] = useState('')
  const history = useHistory()

  const { loading, error, value: data, retry } = useAsyncRetry(api.v2.brokers.pipeline)
  const { filter } = useParams() as { filter: Filter | undefined }

  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const counts = data.counts as StagesProps

  const countInProgress = counts.suspect + counts.prospect + counts.lead
  const countActive = counts.proposed + counts.mqsent + counts.sent + counts.enrolled
  const count = groups.value ? `(${filterInp(groups.value).length})` : ''
  return <div className={styles.mainContainer}>
    <div className={styles.head}>
      <div>
        <h1>Clients and Prospects</h1>
        <AddNewClient refresh={retry}/>
      </div>
      <SearchBar
        placeholder='Search Clients and Prospects'
        query={query}
        setQuery={setQuery}
      />
    </div>
    <div className={RouteStyle.stages}>
      <Stages {...counts} filter={filter} />
    </div>
    <div className={RouteStyle.completion}>
      <Link to={`${Route.agencyDashboardClients}/${ComboStatus.inProgress}`} className={RouteStyle.inProgress}>
        <span className={RouteStyle.inProgressLabel}><b>#{countInProgress}</b> In-progress Clients</span>
      </Link>
      <Link to={`${Route.agencyDashboardClients}/${ComboStatus.active}`} className={RouteStyle.activeGroups}>
        <span className={RouteStyle.activeLabel}><b>#{countActive}</b> Active Clients</span>
      </Link>
    </div>
    <div className={styles.clientDisclaimer}>
      <label className={styles.discTxt}>In order to update the pipeline status of each prospect or client, please change manually on the client’s profile. Automatic pipeline status changes include when employee medical questionnaires are sent, enrollment shop invites have been sent to employees, and the group has been successfully enrolled with the carrier.</label>
    </div>
    <ProfileSection name={`Clients and Prospects ${count}`} expanded style={{ marginTop: 0 }}>
      <ShowAll onChange={() => { setQuery('') }} checked={!query}/>
      <AsyncTable
        async={groups}
        mangle={filterInp}
        content={(key, value) => {
          switch (key) {
          case 'renewal':
            return api.utcMidnightToLocalMidnight(value)
          case 'associations':
            return value.map((ass: any) => ass.name)
          case 'pipelineStatus':
          case 'applicationStatus':
            return _.startCase(value)
          case 'name':
            return value || <i>Unnamed</i>
          }
        }}
        selectAction={row => push(row.id)}
        selectable={(row) => !!row.id}
        order={order()}
        heading={key => {
          switch (key) {
          case 'contact':
            return 'Client / Lead Name'
          case 'name':
            return 'Group'
          case 'pipelineStatus':
            return 'Status'
          case 'applicationStatus':
            return 'App. Status'
          case 'flagged':
            return 'Flagged'
          case 'eeCount':
            return '# EEs'
          }
        }}
        truncate={key => {
          switch (key) {
          case 'contact':
          case 'name':
            return true
          default:
            return false
          }
        }}
        width={key => {
          switch (key) {
          case 'contact':
          case 'name':
          case 'associations':
            return '20%'
          case 'renewal':
          case 'pipelineStatus':
            return '10%'
          case 'applicationStatus':
            return '13%'
          case 'flagged':
            return '7%'
          case 'eeCount':
            return '5%'
          }
        }}
        headerToolTip={key => {
          switch (key) {
          case 'applicationStatus':
            return 'Carrier Application Status'
          case 'pipelineStatus':
            return _.startCase(key)
          }
        }}
        sortable={['contact', 'name', 'pipelineStatus', 'applicationStatus', 'renewal', 'eeCount', 'flagged']}
        defaultSort='name'
        defaultSortDirection={key => {
          switch (key) {
          case 'renewal':
          case 'contacted':
          case 'eeCount':
            return SortDirection.descending
          default:
            return SortDirection.ascending
          }
        }}
        reportFileBasename='clients'
        reportContent={(key, value) => {
          switch (key) {
          case 'associations':
            return value.map((ass: any) => ass.codename || ass.name).join(', ')
          case 'flagged':
            return value
          }
        }}
      />
    </ProfileSection>
    <div className={styles.reporting_container}>
      <h1 style={{ fontSize: '24px', marginBottom: '40px' }}>Reporting</h1>
      <div className= {styles.reporting_inner_cont}>
        <div className={styles.repName}>
          <label>report name </label>
        </div>
        <div className={styles.innerReport}>
          <div>
            <label className={styles.innerSideLabel}>Expiration Report</label>
          </div>
          <div>
            <GAButton analytics={'Download Report'}
              style={{ background: '' }}
              className={Tstyles.downloadReport}>
              generate report</GAButton>
          </div>
        </div>
        <div className={styles.innerReport}>
          <div>
            <label className={styles.innerSideLabel}>New Business Report</label>
          </div>
          <div>
            <GAButton analytics={'Download Report'}
              style={{ background: '' }}
              className={Tstyles.downloadReport}>
              generate report</GAButton>
          </div>
        </div>
        <div className={styles.innerReport}>
          <div>
            <label className={styles.innerSideLabel}>Book of Business Report</label>
          </div>
          <div>
            <GAButton analytics={'Download Report'}
              style={{ background: '' }}
              className={Tstyles.downloadReport}>
              generate report</GAButton>
          </div>
        </div>
      </div>
    </div>

  </div>

  function filterInp(input: Group[]) {
    return input.filter((group: Group) => {
      if (flagged && !group.flagged) return false
      if (!query.trim()) return true
      const name = group.name.toLowerCase()
      const regex = RegExp(`.*${query}.*`)
      return regex.test(name)
    })
  }

  function push(id: string) {
    history.push({
      pathname: `${Route.agencyDashboardClients}/${id}`,
      state: { group: groups.value!.find((g: any) => g.id === id) }
    })
  }

  function order() {
    const keys: Array<keyof Group> = ['contact', 'name', 'applicationStatus', 'renewal']
    keys.push('associations')
    return keys.concat(['eeCount', 'flagged'])
  }
}

interface Group {
  id: string
  name: string
  contact?: Contact
  associations: [{id: string, name: string, acronym?: string}]
  contacted: Date | null
  renewal: Date | null
  pipelineStatus: string
  applicationStatus: string
  flagged: boolean
  eeCount: number
}
function statusesForFilter(filter: Filter | undefined): Set<PipelineStatus> {
  switch (filter) {
  case PipelineStatus.suspect:
  case PipelineStatus.prospect:
  case PipelineStatus.lead:
  case PipelineStatus.proposed:
  case PipelineStatus.mqsent:
  case PipelineStatus.sent:
  case PipelineStatus.enrolled:
  case PipelineStatus.archived:
    return new Set([filter])
  case undefined: {
    const set = new Set($enum(PipelineStatus).getValues())
    set.delete(PipelineStatus.archived)
    return set
  }
  case ComboStatus.inProgress:
    return new Set([PipelineStatus.suspect, PipelineStatus.prospect, PipelineStatus.lead])
  case ComboStatus.active:
    return new Set([PipelineStatus.proposed, PipelineStatus.mqsent, PipelineStatus.sent, PipelineStatus.enrolled])
  }
}
type StagesProps = {
  suspect: number
  prospect: number
  lead: number
  proposed: number
  mqsent: number
  sent: number
  enrolled: number
  archived: number

  filter: Filter | undefined
}

const Stages: React.FC<StagesProps> = ({ filter, ...props }) => {
  return <>{stages.map((stage, index) => {
    let to = `${Route.agencyDashboardClients}/${stage.key}`
    let active = false
    if (filter && statusesForFilter(filter).has(stage.key)) {
      if (PipelineStatus[filter as keyof typeof PipelineStatus]) {
        // act like a toggle but only if we’re not a combo-filter
        to = Route.agencyDashboardClients
      }
      active = true
    }
    return <Link key={stage.key} to={to}>
      <Stage
        key={stage.key}
        activeStage={active}
        stage={{ quantity: (props as any)[stage.key], ...stage, index: stages.length - index }}
      />
    </Link>
  })}</>
}

export default DashboardAgencyGroups
