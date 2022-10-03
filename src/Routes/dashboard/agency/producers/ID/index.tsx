import React, { useState } from 'react'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { useHistory } from 'react-router-dom'
import ContactSnapshot from 'Components/Anubis/ContactSnapshot'
import ContactSection from 'Components/Anubis/ContactSection'
import TodoList from 'Components/Anubis/TodoList'
import styles from './index.module.scss'
import { Route } from 'Utilities/Route'
import { AsyncTable } from 'Components/Rudimentary/Table'
import NotesSection from 'Components/Anubis/NotesSection'
import ProfileSection from 'Components/Anubis/ProfileSection'
import { Address, Contact, Association } from 'Utilities/pharaoh.types'
import { startCase, sortBy } from 'lodash'
import BackTo from 'Components/Anubis/BackTo'
import useToast from 'Utilities/Hooks/useToast'
import { useForm } from 'react-hook-form'
import { AsyncState } from 'react-use/lib/useAsync'
import useAsyncRetry, { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'
import AppointmentsSection from '../AppointmentsSection'
import { utcMidnightToLocalMidnight } from 'Utilities/pharaoh'

type Props = {
  id: string
}

interface Agency {
  id: string
  name: string
  logo?: string
}

interface Producer {
  id: string
  name: string
  email: string
  phone?: string
  agency: Agency
  address: Address
  enrollments: number
}

interface Group extends ProducerGroup {
  id: string
}

interface ProducerGroup {
  lead?: Contact
  group: Group
  eeCount: number
  effectiveDate: string
  associations: Association[]
  premium: string
  applicationStatus: string
  monthlyPremium: string
  monthlyCommission: string
}

const DashboardAgencyProducer: React.FC<Props> = ({ id }) => {
  const async = useAsync(async() => await api.v2.brokers.producers(id).GET() as Producer, [id])
  const groupsAsync = useAsyncRetry(async() => {
    const rsp = await api.v2.brokers.producers(id).groups.GET() as ProducerGroup[]
    return rsp.map(item => ({ id: item.group.id, ...item })) as Group[]
  }, [id])

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const producer = async.value!

  const contactSnapshotContent = [
    {
      before: <h2>{producer.enrollments}</h2>,
      after: <span>Total # Enrolled</span>
    }
  ]

  const data = {
    name: producer.name,
    address: producer.address,
    contact: {
      name: producer.name,
      type: 'producer',
      email: producer.email,
      phone: producer.phone
    }
  }

  return <div className={styles.container}>
    <BackTo analytics={`Back to Agency (${DashboardAgencyProducer.name})`} route={Route.agencyDashboardProducers}>Back to Agency</BackTo>
    <div className={styles.producer}>
      <ContactSnapshot content={contactSnapshotContent} name={producer.name} />
      <ContactSection data={data} />
      <div>
        <TodoList id={id} />
        <AssignGroupToProducer producer={producer} assignedGroupsAsync={groupsAsync} callback={groupsAsync.retry}/>
      </div>
    </div>
    <Groups async={groupsAsync} />
    <NotesSection targetID={id} />
    <AppointmentsSection producerId={id} />
  </div>
}

type GProps = {
  async: AsyncStateRetry<Group[]>
}

const Groups: React.FC<GProps> = ({ async }) => {
  const history = useHistory()

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  return <ProfileSection name="Clients" expanded>
    <AsyncTable
      async={async}
      content={(key, value) => {
        switch (key) {
        case 'lead':
        case 'group':
          return value.name
        case 'eeCount':
          return value.eeCount
        case 'effectiveDate':
          return utcMidnightToLocalMidnight(value)
        case 'associations':
          return value.map((value: Association) => value.name)
        case 'applicationStatus':
          return startCase(value)
        default:
          return null
        }
      }}
      width={key => {
        switch (key) {
        case 'lead':
          return '16%'
        case 'group':
          return '16%'
        case 'associations':
          return '10%'
        case 'monthlyPremium':
          return '11%'
        case 'monthlyCommission':
          return '11%'
        case 'eeCount':
          return '10%'
        case 'effectiveDate':
          return '10%'
        case 'applicationStatus':
          return '10%'
        default:
          return ''
        }
      }}
      heading={key => {
        switch (key) {
        case 'group':
          return 'Client Name'
        case 'eeCount':
          return '# Employees'
        case 'effectiveDate':
          return 'effective date'
        case 'applicationStatus':
          return 'App. Status'
        case 'lead':
          return 'contact'
        case 'monthlyPremium':
          return 'Bound total monthly premium'
        case 'monthlyCommission':
          return 'Bound total monthly commissions'
        default:
          return null
        }
      }}
      order={['group', 'lead', 'eeCount', 'effectiveDate', 'associations', 'monthlyPremium', 'monthlyCommission', 'applicationStatus']}
      defaultSort="group"
      sortable={['lead', 'group', 'eeCount', 'effectiveDate', 'monthlyPremium', 'monthlyCommission', 'applicationStatus']}
      sortValue={(key, value) => {
        switch (key) {
        case 'lead':
        case 'group':
          return value.name
        default:
          return null
        }
      }}
      selectAction={value => {
        history.push(`${Route.agencyDashboardClients}/${value.id}`)
      }}
      selectable={(row) => !!row.id}
      reportFileBasename='producers'
    />
  </ProfileSection>
}

type AGProps = {
  producer: Producer
  assignedGroupsAsync: AsyncState<Group[]>
  callback(): void
}

const AssignGroupToProducer: React.FC<AGProps> = ({ producer, assignedGroupsAsync, callback }) => {
  const async = useAsync(async() => {
    const rsp: any[] = (await api.v2.brokers.groups().GET()).groups as ProducerGroup[]
    return sortBy(rsp, 'name')
  })
  const user = useUser()
  const isSuperBroker = user.value && user.value.powerLevel === PowerLevel.superBroker
  const [disabled, setDisabled] = useState(false)
  const { register, handleSubmit, watch, reset } = useForm()
  const addToast = useToast()
  const group = watch('group')

  if (async.error || assignedGroupsAsync.error) return <Error error={async.error} />

  async function onAssignSubmit(data: any) {
    try {
      setDisabled(true)
      await api.v2.brokers.producers(producer.id).assign.to(data.group)
      reset()
      callback()
      addToast(`Client assigned to ${producer.name || 'Producer'}`)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }

  function groupOptions() {
    if (async.loading || assignedGroupsAsync.loading) return <option value='' disabled>Loading…</option>

    const groups = async.value!
    const assignedGroups = assignedGroupsAsync.value!

    const rv = []
    rv.push(<option value='' disabled hidden>Client</option>)
    return rv.concat(groups.filter(group => !assignedGroups.some(g => group.id === g.id)).map((group, i) =>
      <option key={group.id + i} value={group.id}>{group.name}</option>
    ))
  }

  return <form onSubmit={handleSubmit(onAssignSubmit)} className={styles.assignBrokerForm}>
    <fieldset disabled={disabled}>
      <label>
        { isSuperBroker ? `Assign Group to ${producer.name || 'Producer'}` : 'Assign Group' }
        <select name='group' ref={register} defaultValue='' className={!group ? styles.placeholder : undefined}>
          {groupOptions()}
        </select>
      </label>
      <input type="submit" value="Assign" disabled={!producer || !group}/>
    </fieldset>
  </form>
}

export default DashboardAgencyProducer
