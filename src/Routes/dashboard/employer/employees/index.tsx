import React from 'react'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import moment from 'moment'
import useGroupManager from 'Utilities/Hooks/useGroupManager'
import styles from 'Routes/dashboard/pipeline.module.scss'
import * as api from 'Utilities/pharaoh'
import { Table, Alignment } from 'Components/Rudimentary/Table'
import Stage from 'Components/Anubis/Stage'
import _, { kebabCase } from 'lodash'
import { Route } from 'Utilities/Route'
import { useHistory, Link } from 'react-router-dom'
import { EnrollmentStatus } from 'Utilities/pharaoh.types'
import ProfileSection, { ShowAll } from 'Components/Anubis/ProfileSection'

interface Employee {
  id: string
  firstName: string
  lastName: string
  medical: string | null
  dependentCount: number
  dental: boolean
  vision: boolean
  waitingPeriod: number
  status: EnrollmentStatus
  renewal: Date
  qualifyingLifeEventStatus: string | null
}

export enum Stages {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  waived = 'waived',
  completed = 'completed',
  qleEntering = 'enteringQle',
  qleExiting = 'exitingQle',
  qle = 'qle'
}

interface Props {
  filter?: Stages
}

const DashboardEmployerEmployees: React.FC<Props> = ({ filter }) => {
  const async = useGroupManager(async group =>
    await api.v2.groups(group.id).users.GET() as Employee[])
  const history = useHistory()

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const allEEs = async.value!

  function eefilter(statuses: EnrollmentStatus[]): Employee[] {
    return allEEs.filter(ee => statuses.includes(ee.status))
  }

  const ees = filter ? eefilter(statusForStage(filter)) : allEEs

  function count(statuses: EnrollmentStatus[]): number {
    return eefilter(statuses).length
  }

  function statusForStage(key: Stages): EnrollmentStatus[] {
    switch (key) {
    case Stages.notStarted:
      return [EnrollmentStatus.notStarted, EnrollmentStatus.notInvited]
    case Stages.inProgress:
      return [EnrollmentStatus.awaitingMedicalUnderwriting, EnrollmentStatus.awaitingElections]
    case Stages.waived:
      return [EnrollmentStatus.waived]
    case Stages.completed:
      return [EnrollmentStatus.complete]
    case Stages.qleEntering:
    case Stages.qleExiting:
    case Stages.qle:
      return []
    }
  }

  const stageCounts: {[key in Stages]: number} = {
    notStarted: count(statusForStage(Stages.notStarted)),
    inProgress: count(statusForStage(Stages.inProgress)),
    waived: count(statusForStage(Stages.waived)),
    completed: count(statusForStage(Stages.completed)),
    enteringQle: count(statusForStage(Stages.qleEntering)),
    exitingQle: count(statusForStage(Stages.qleExiting)),
    qle: count(statusForStage(Stages.qle))
  }

  const countInProgress = stageCounts.notStarted + stageCounts.inProgress
  const countBenefitsTransition = stageCounts.enteringQle + stageCounts.exitingQle + stageCounts.qle

  const pretty = filter && _.kebabCase(filter).replace('qle', 'qualifyingEvents')
  const profileSectionTitle = pretty ? _.startCase(pretty) : 'Employees'

  return <>
    <h1 className={styles.title}>Employee Status</h1>
    <span className={styles.today}>Today: {moment().format('L')}</span>

    <div className={styles.pipelineContainer}>
      <div>
        <ProgressStages {...stageCounts} active={filter} />
        <div className={styles.inProgress}>
          <span className={styles.inProgressLabel}><b>#{countInProgress}</b> In-Progress</span>
        </div>
      </div>
      <div>
        <TransitionStages {...stageCounts} active={filter} />
        <div className={styles.activeGroups}>
          <span className={styles.activeLabel}><b>#{countBenefitsTransition}</b> Benefit Transitions</span>
        </div>
      </div>
    </div>
    <ProfileSection name={profileSectionTitle} expanded>
      <ShowAll onChange={() => { history.push(Route.dashboardEmployerEmployees) }} checked={!filter}/>
      <Table
        heading={key => {
          switch (key) {
          case 'dependentCount':
            return '# Depend.'
          case 'vision':
            return 'Eye'
          case 'waitingPeriod':
            return 'Wait Per.'
          case 'qualifyingLifeEventStatus':
            return 'QLE'
          case 'medical':
            return 'HC PLAN'
          }
        }}
        headerToolTip={key => {
          switch (key) {
          case 'vision':
            return 'Elected Vision Plan'
          case 'dental':
            return 'Elected Dental Plan'
          case 'medical':
            return 'Elected Medical Plan'
          case 'dependentCount':
          case 'qualifyingLifeEventStatus':
          case 'waitingPeriod':
            return _.startCase(key)
          }
        }}
        alignment={key => {
          switch (key) {
          case 'dependentCount':
          case 'vision':
          case 'dental':
          case 'qualifyingLifeEventStatus':
            return Alignment.center
          default:
            return Alignment.left
          }
        }}
        width={key => {
          switch (key) {
          case 'lastName':
          case 'firstName':
            return '12.5%'
          case 'medical':
            return '20%'
          case 'dependentCount':
            return '9%'
          case 'vision':
            return '4%'
          case 'dental':
            return '7%'
          case 'waitingPeriod':
            return '11%'
          case 'renewal':
            return '10%'
          case 'status':
            return '8%'
          case 'qualifyingLifeEventStatus':
            return '6%'
          }
        }}
        defaultSort='lastName'
        sortable={['lastName', 'firstName', 'medical', 'dependentCount', 'waitingPeriod', 'renewal', 'status', 'qualifyingLifeEventStatus']}
        secondarySort={() => ['lastName', 'firstName']}
        content={(key, value) => {
          switch (key) {
          case 'dependentCount':
            return value || null
          case 'waitingPeriod':
            return `${value} days`
          case 'renewal':
            return value ? new Date(value) : null
          case 'status':
            return <>{_.startCase(value).replace(/ /g, '\u00a0')}</>
          }
        }}
        order={['lastName', 'firstName', 'medical', 'dependentCount', 'vision', 'dental', 'waitingPeriod', 'renewal', 'status', 'qualifyingLifeEventStatus']}
        data={ees}
        selectAction={push}
        selectable={(row) => !!row.id}
        reportFileBasename='employees'
      />
    </ProfileSection>
  </>

  function push(row: { id: string }) {
    history.push(`${Route.dashboardEmployerEmployees}/${row.id}`)
  }
}

interface ProgressStagesProps {
  notStarted: number
  inProgress: number
  completed: number
  waived: number
  active?: Stages
}

const ProgressStages: React.FC<ProgressStagesProps> = (props) => {
  return <div>{progressStages.map((stage, index) => {
    return <Link key={stage.key} to={`${Route.dashboardEmployerEmployees}/${kebabCase(stage.key)}`}>
      <Stage
        key={stage.key}
        activeStage={props.active === stage.key}
        stage={{ quantity: (props as any)[stage.key], ...stage, index: progressStages.length - index }}
      />
    </Link>
  })}</div>
}

const progressStages = [
  {
    label: 'Not Started',
    key: Stages.notStarted,
    arrow: true,
    startColor: '#ececf5',
    endColor: '#e3e2ef'
  },
  {
    label: 'In Progress',
    key: Stages.inProgress,
    arrow: true,
    startColor: '#f0f0ff',
    endColor: '#e2e5ff'
  },
  {
    label: 'Completed',
    key: Stages.completed,
    arrow: false,
    startColor: '#daf8f6',
    endColor: '#b9efe0'
  },
  {
    label: 'Waived',
    key: Stages.waived,
    arrow: false,
    startColor: '#ebeffd',
    endColor: '#dfe9fd'
  }
]

interface TransitionStagesProps {
  enteringQle: number
  exitingQle: number
  qle: number
  active?: Stages
}

const TransitionStages: React.FC<TransitionStagesProps> = (props) =>
  <div>{transitionStages.map((stage, index) =>
    <Link key={stage.key} to={`${Route.dashboardEmployerEmployees}/${kebabCase(stage.key)}`}>
      <Stage
        key={stage.key}
        activeStage={props.active === stage.key}
        stage={{ quantity: (props as any)[stage.key], ...stage, index: progressStages.length - index }}
      />
    </Link>
  )}</div>

const transitionStages = [
  {
    label: 'Entering',
    key: Stages.qleEntering,
    arrow: false,
    startColor: '#e4e4e4',
    endColor: '#f8f8f8'
  },
  {
    label: 'Exiting',
    key: Stages.qleExiting,
    arrow: false,
    startColor: '#e4e4e4',
    endColor: '#f8f8f8'
  },
  {
    label: 'Qualifying Events',
    key: Stages.qle,
    arrow: false,
    startColor: '#e4e4e4',
    endColor: '#f8f8f8'
  }
]

export default DashboardEmployerEmployees
