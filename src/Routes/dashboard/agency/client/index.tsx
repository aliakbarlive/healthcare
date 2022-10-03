import React from 'react'
import styles from 'Routes/dashboard/pipeline.module.scss'
import PipelineDetails, { Pipe } from './PipelineDetails'
import Loader from 'Components/Rudimentary/Loader'
import * as api from 'Utilities/pharaoh'
import { useAsyncRetry } from 'react-use'
import Error from 'Components/Primitives/Error'
import Stage from 'Components/Anubis/Stage'
import { stages } from './PipelineSettings'
import { Link, useParams } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import { PipelineStatus } from 'Utilities/pharaoh.types'
import { $enum } from 'ts-enum-util'
import AddNewClient from 'Components/Anubis/AddNewClient'
import SearchBar from 'Components/Anubis/SearchBar'
import { GAButton } from 'Components/Tracking'
import useToast from 'Utilities/Hooks/useToast'

export enum ComboStatus {
  inProgress = 'in-progress',
  active = 'active'
}

export type Filter = PipelineStatus | ComboStatus

const agencyDashboardClient: React.FC = () => {
  const { filter } = useParams() as { filter: Filter | undefined }
  const { loading, error, value: data, retry } = useAsyncRetry(filter === PipelineStatus.archived ? api.v2.brokers.pipeline_archived : api.v2.brokers.pipeline)
  const [query, setQuery] = React.useState('')
  const addToast = useToast()

  React.useEffect(() => {
    if (filter === PipelineStatus.archived) { retry() } else {
      if (data && data.isArchivedData) { retry() }
    }
  }, [filter])

  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const counts = data?.counts as StagesProps
  const pipes = data?.pipes as Pipe[]
  const countInProgress = counts.suspect + counts.prospect + counts.lead + counts.proposed + counts.mqsent
  const countActive = counts.sent + counts.enrolled

  return <>
    <div className={styles.mainContainer}>
      <div className={styles.head}>
        <div>
          <h1>Clients and Prospects</h1>
          <AddNewClient refresh={retry} />
        </div>
        <SearchBar
          placeholder='Search Clients and Prospects'
          query={query}
          setQuery={setQuery}
        />
      </div>
    </div>
    <div className={styles.stages}>
      <Stages {...counts} filter={filter} archiveStage={data.isArchivedData} />
    </div>
    <div className={styles.completion}>
      <Link to={`${Route.agencyDashboardClient}/${ComboStatus.inProgress}`} className={styles.inProgress}>
        <span className={styles.inProgressLabel}><b>#{countInProgress}</b> In-progress Clients</span>
      </Link>
      <Link to={`${Route.agencyDashboardClient}/${ComboStatus.active}`} className={styles.activeGroups}>
        <span className={styles.activeLabel}><b>#{countActive}</b> Active Clients</span>
      </Link>
    </div>
    <div className={styles.clientDisclaimer}>
      <label className={styles.discTxt}>In order to update the pipeline status of each prospect or client, please change manually on the client’s profile. Automatic pipeline status changes include when employee medical questionnaires are sent, enrollment shop invites have been sent to employees, and the group has been successfully enrolled with the carrier.</label>
    </div>
    <PipelineDetails pipes={filteredPipes()} filter={filter} query={query} />
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
              className={styles.downloadReport}
              onClick={() => { addToast('Implementation coming soon!', 'info') }}>
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
              className={styles.downloadReport}
              onClick={() => { addToast('Implementation coming soon!', 'info') }}>
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
              className={styles.downloadReport}
              onClick={() => { addToast('Implementation coming soon!', 'info') }}>
               generate report</GAButton>
          </div>
        </div>
      </div>
    </div>

  </>

  function filteredPipes() {
    const set = statusesForFilter(filter)
    return pipes.filter(({ pipelineStatus }) => set.has(pipelineStatus))
  }
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
    return new Set([PipelineStatus.suspect, PipelineStatus.prospect, PipelineStatus.lead, PipelineStatus.proposed, PipelineStatus.mqsent])
  case ComboStatus.active:
    return new Set([PipelineStatus.sent, PipelineStatus.enrolled])
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
  archiveStage: boolean
}

const Stages: React.FC<StagesProps> = ({ filter, archiveStage, ...props }) => {
  const archivedStage = stages.find(s => s.key === PipelineStatus.archived)
  return <>{!archiveStage && stages.filter(s => s !== archivedStage).map((stage, index) => {
    let to = `${Route.agencyDashboardClient}/${stage.key}`
    let active = false
    if (filter && statusesForFilter(filter).has(stage.key)) {
      if (PipelineStatus[filter as keyof typeof PipelineStatus]) {
        // act like a toggle but only if we’re not a combo-filter
        to = Route.agencyDashboardClient
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
  })}
  <div>
    {archiveStage && <>
      <svg width="6" height="13" viewBox="0 0 6 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 0.5L5.24537e-07 6.5L6 12.5L6 0.5Z" fill="#686868"></path></svg>
      <Link className={styles.backToClientsBtn} to={`${Route.agencyDashboardClient}`}>Back to Clients</Link>
    </>
    }
    { archivedStage && <Link key={archivedStage.key} to={`${Route.agencyDashboardClient}/${archivedStage.key}`} style={archiveStage ? { pointerEvents: 'none' } : {}} >
      <Stage
        key={archivedStage.key}
        activeStage={statusesForFilter(filter).has(archivedStage.key)}
        stage={{ quantity: (props as any)[archivedStage.key], ...archivedStage, index: 0 }}
        archiveStage={archiveStage}
      />
    </Link>
    }
  </div>
  </>
}

export default agencyDashboardClient
