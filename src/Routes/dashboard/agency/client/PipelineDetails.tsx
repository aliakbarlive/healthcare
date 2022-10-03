import React from 'react'
import { useHistory } from 'react-router-dom'
import styles from 'Routes/dashboard/pipeline.module.scss'
import { Route } from 'Utilities/Route'
import { Table, Alignment } from 'Components/Rudimentary/Table'
import { utcMidnightToLocalMidnight } from 'Utilities/pharaoh'
import ProfileSection, { ShowAll } from 'Components/Anubis/ProfileSection'
import { stages } from './PipelineSettings'
import { PipelineStatus } from 'Utilities/pharaoh.types'
import { Filter } from './index'
import moment from 'moment'

export interface Pipe {
  name: string
  group: any
  pipelineStatus: PipelineStatus
  effectiveDate: Date | null
  contacted: Date | null
  enrolled: string
  monthlyPremium: string
  monthlyCommissions: string
}

interface Props {
  pipes: Pipe[]
  filter?: Filter
  query?: string
}

const PipelineDetails: React.FC<Props> = props => {
  const pipes = props.pipes.filter(queryFilter).map((pipe, i) => ({ id: pipe.group.id + i, ...pipe }))
  const filtering = props.filter !== undefined
  const filterLabel = stages.find(stage => stage.key === props.filter)?.label
  const history = useHistory()
  const [showReportBtn] = React.useState(true)
  const pipesCount = pipes.length || 0
  const name = filterLabel ? `${filterLabel} Details` : `Clients and Prospects (${pipesCount})`
  return <ProfileSection expanded name={name}>
    <ShowAll onChange={() => { history.push(Route.agencyDashboardClient) }} checked={!filtering}/>
    <Table
      data={pipes}
      showReportBtn={showReportBtn}
      content={(key, value) => {
        switch (key) {
        case 'effectiveDate':
          return utcMidnightToLocalMidnight(value)
        case 'group':
          return value.name
        case 'pipelineStatus':
          switch (value) {
          case 'lead':
            return <div className={styles.pipelineTableTextWordWrap}>Qualifying Lead</div>
          case 'proposed':
            return <div className={styles.pipelineTableTextWordWrap}>Plans Proposed</div>
          case 'mqsent':
            return <div className={styles.pipelineTableTextWordWrap}>Medical Questionnaires Sent</div>
          case 'sent':
            return <div className={styles.pipelineTableTextWordWrap}>Enrollment Sent To Employees</div>
          case 'enrolled':
            return <div className={styles.pipelineTableText}>Enrolled</div>
          case 'suspect':
            return <div className={styles.pipelineTableText}>Suspect</div>
          case 'prospect':
            return <div className={styles.pipelineTableText}>Prospect</div>
          case 'archived':
            return <div className={styles.pipelineTableText}>Archived</div>
          }
        }
      }
      }
      alignment={key => {
        switch (key) {
        case 'pipelineStatus':
        case 'effectiveDate':
          return Alignment.center
        default:
          return Alignment.left
        }
      }}
      heading={key => {
        switch (key) {
        case 'name':
          return 'Contact'
        case 'pipelineStatus':
          return 'Status'
        case 'monthlyPremium':
          return 'Bound total monthly premium'
        case 'monthlyCommissions':
          return 'Bound total monthly commissions'
        case 'group':
          return 'Client Name'
        case 'effectiveDate':
          return 'effective date'
        case 'enrolled':
          return '# enrolled'
        }
      }}
      width={key => {
        switch (key) {
        case 'name':
          return '26%'
        case 'group':
          return '27%'
        case 'pipelineStatus':
          return '15%'
        case 'effectiveDate':
          return '15%'
        case 'enrolled':
          return '15%'
        case 'monthlyPremium':
          return '15%'
        case 'monthlyCommissions':
          return '15%'
        }
      }}
      defaultSort='effectiveDate'
      selectAction={row =>
        history.push(`${Route.agencyDashboardClients}/${row.group.id}`)
      }
      selectable={(row) => !!row.id}
      sortable={['group', 'name', 'pipelineStatus', 'effectiveDate', 'enrolled', 'monthlyPremium', 'monthlyCommissions']}
      order={(() => {
        const keys: Array<keyof Pipe> = ['group', 'name', 'pipelineStatus', 'effectiveDate', 'enrolled', 'monthlyPremium', 'monthlyCommissions']
        return keys
      })()}
      sortValue={(key, value) => {
        switch (key) {
        case 'group':
          return value.name
        case 'effectiveDate':
          return moment(value).valueOf()
        }
      }}
      reportFileBasename='pipeline'
    />
  </ProfileSection>

  function queryFilter(pipe: Pipe): boolean {
    if (!props.query) return true
    const query = props.query.toLowerCase()

    return pipe.group.name.toLowerCase().includes(query) || pipe.name.toLowerCase().includes(query)
  }
}

export default PipelineDetails
