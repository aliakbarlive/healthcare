import React, { useState } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import useToast from 'Utilities/Hooks/useToast'
import { Table, Alignment } from 'Components/Rudimentary/Table'
import { Route } from 'Utilities/Route'
import { useHistory } from 'react-router-dom'
import AddProducerModal from './AddProducerModal'
import { useForm } from 'react-hook-form'
import ProfileSection from 'Components/Anubis/ProfileSection'
import styles from './index.module.scss'
import AddButton from 'Components/Anubis/AddButton'
import { sortBy } from 'lodash'

enum Status {
  invited = 'invited',
  confirmed = 'confirmed'
}

interface ProducersResponse {
  agencyID: string
  producers: Producer[]
}

interface Producer {
  groupCount: number
  carriers: string[]
  states: string[]
  email: string
  phone: string
  name: string
  id: string

  // not in the response but *in* the UI
  todo?: void

  status: Status
}

const DashboardAgencyProducers: React.FC = () => {
  const async = useAsyncRetry(async() =>
    await api.v2.brokers.producers().GET() as ProducersResponse
  )
  const [modalVisible, setModalVisible] = useState(false)
  const history = useHistory()

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />
  const showPremiums = true
  const data = async.value!

  return <>
    <header className={styles.header}>
      <h1>Agency Members</h1>
      <AddButton analytics={`Agency Members (${DashboardAgencyProducers.name})`} onClick={addNewBroker}>Add New Agency Member</AddButton>
    </header>
    <ProfileSection
      expanded
      name={`Agency Members (${data.producers.length})`}
      style={{ marginTop: 0 }}
    >
      <Table
        data={data.producers}
        showPremiums={showPremiums}
        heading={key => {
          switch (key) {
          case 'todo':
            return 'To Do'
          case 'groupCount':
            return '# Assigned Clients'
          }
        }}
        width={key => {
          switch (key) {
          case 'phone':
            return '11%'
          case 'states':
          case 'carriers':
            return '15%'
          case 'todo':
            return '7%'
          default:
            return ''
          }
        }}
        content={(key, value, row) => {
          switch (key) {
          case 'email':
            return <a href={`mailto:${value}`}>{value}</a>
          case 'todo':
            return row.status === Status.confirmed
              ? <button className={styles.addTodo} onClick={() => go(row.id)}><i className="material-icons">add_circle_outline</i></button>
              : undefined
          case 'groupCount':
            return row.status === Status.confirmed
              ? value
              : <i>Invitation Pending</i>
          }
        }}
        sortable={['name', 'phone', 'email']}
        order={[
          'name', 'email', 'phone', 'states', 'carriers', 'groupCount', 'todo'
        ]}
        defaultSort='name'
        selectAction={row =>
          history.push(`${Route.agencyDashboardProducers}/${row.id}`)
        }
        alignment={key => key === 'todo' ? Alignment.center : Alignment.left}
        selectable={row => row.status === Status.confirmed}
        reportFileBasename='producers'
        reportContent={(key, value, row) => {
          switch (key) {
          case 'email':
            return value
          case 'todo':
            return ''
          case 'groupCount':
            return row.status === Status.confirmed ? `${value}` : 'Invitation Pending'
          }
        }}
      />
      <h2 className={styles.h2}>Assign Producers</h2>
      <AssignProducer producers={data.producers} reload={async.retry} />
      <AddProducerModal isOpen={modalVisible} onRequestClose={onRequestClose} agencyID={data.agencyID} />
    </ProfileSection>
  </>

  function go(id: string) {
    history.push(`${Route.agencyDashboardProducers}/${id}`)
  }

  function addNewBroker() {
    setModalVisible(true)
  }

  function onRequestClose(shouldReload: boolean) {
    setModalVisible(false)
    if (shouldReload) async.retry()
  }
}

interface AssignProducerProps {
  producers: Producer[]
  reload: () => void
}

const AssignProducer: React.FC<AssignProducerProps> = ({ producers, reload }) => {
  const async = useAsync(async() => {
    const rsp: any[] = (await api.v2.brokers.groups().GET()).groups as ProducersResponse[]
    return sortBy(rsp, 'name')
  })
  const [disabled, setDisabled] = useState(false)
  const { register, handleSubmit, watch } = useForm()
  const addToast = useToast()
  const producer = watch('producer')
  const group = watch('group')

  if (async.error) return <Error error={async.error} />

  const groups = async.value ?? []

  return <form onSubmit={handleSubmit(onAssignSubmit)} className={styles.assignBrokerForm}>
    <fieldset disabled={disabled}>
      <label>
        Select Producer
        <select name='producer' ref={register} defaultValue='' className={!producer ? styles.placeholder : undefined}>
          <option value='' disabled hidden>Producer</option>
          {producers.filter(producer =>
            producer.status === Status.confirmed
          ).map(producer =>
            <option key={producer.id} value={producer.id}>{producer.name}</option>
          )}
        </select>
      </label>
      <p>To</p>
      <label>
        Select Client
        <select name='group' ref={register} defaultValue='' className={!group ? styles.placeholder : undefined}>
          {groupOptions()}
        </select>
      </label>
      <input type="submit" value="Assign" disabled={!producer || !group}/>
    </fieldset>
  </form>

  async function onAssignSubmit(data: any) {
    try {
      setDisabled(true)
      await api.v2.brokers.producers(data.producer).assign.to(data.group)
      addToast('Producer assigned to client')
      reload()
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }

  function groupOptions() {
    if (async.loading) return <option value='' disabled>Loading…</option>

    const rv = []
    rv.push(<option key='1' value='' disabled hidden>Client</option>)
    return rv.concat(groups.map(group =>
      <option key={group.id} value={group.id}>{group.name}</option>
    ))
  }
}

export default DashboardAgencyProducers
