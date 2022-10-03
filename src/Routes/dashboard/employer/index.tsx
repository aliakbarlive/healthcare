import React, { useEffect } from 'react'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import TodoList from 'Components/Anubis/TodoList'
import useGroupManager from 'Utilities/Hooks/useGroupManager'
import HealthCareNews from './News'
import styles from './index.module.scss'
import moment from 'moment'
import { PipelineStatus, GroupToDos } from 'Utilities/pharaoh.types'
import { useToggle } from 'react-use'
import InviteEmployeesModal from 'Components/Modals/Anubis/InviteEmployeesModal'
import Annotation from 'Components/Rudimentary/Annotation'
import { GAButton } from 'Components/Tracking'

const DashboardEmployer: React.SFC = () => {
  const async = useGroupManager(async r => r)

  useEffect(() => {
    if (async.loading) return
    const el = document.getElementById('content')
    if (!el) return
    el.style.paddingTop = '0'
    return () => { el.style.paddingTop = '' }
  }, [async.loading])

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const group = async.value!

  return <div className={styles.container}>
    <header>
      <h1>{group.name}</h1>
      <p><b>Welcome to your companion app</b> for all your
        care benefits. View and manage benefits,
        update payment information, add and remove
        employees, plan employee’s <Annotation id='carrier' definition='Family and Medical Leave Act'>FMLA</Annotation>, and more!
      </p>
    </header>
    <Invite
      effectiveDate={group.dates.effective}
      status={group.status}
      todos={group.todo}
      groupID={group.id} />
    <HealthCareNews/>
    <TodoList id={group.id} className={styles.todo}/>
  </div>
}

interface InviteProps {
  effectiveDate?: Date
  status?: PipelineStatus
  todos: GroupToDos
  groupID: string
}

const Invite: React.FC<InviteProps> = ({ effectiveDate, status, todos, groupID }) => {
  const [isOpen, toggle] = useToggle(false)

  let inner
  switch (status) {
  case PipelineStatus.enrolled:
    return <></>
  case PipelineStatus.suspect:
  case PipelineStatus.prospect:
  case PipelineStatus.proposed:
  case PipelineStatus.lead:
  case PipelineStatus.mqsent:
  case PipelineStatus.sent:
  case PipelineStatus.archived:
  case undefined: {
    let cutoff = 30
    if (effectiveDate) {
      // 14 business days for Candor to process the group
      cutoff = moment(effectiveDate).diff(moment(), 'days') - 14
    }
    if (cutoff < 0) {
      inner = <>
        <h2>Employee sign-up is overdue</h2>
        <p>Please contact support</p>
      </>
    } else {
      const invite = todos.invites
        ? <>
          <p>Click to send invitation email:</p>
          <GAButton analytics={`INVITE Employees! (${DashboardEmployer.name})`} onClick={toggle}>INVITE Employees!</GAButton>
        </>
        : <p>Your employees have been invited to elect benefits.</p>

      inner = <>
        <h2>Employee sign‑up ends in <b>{cutoff}</b> Days!</h2>
        {invite}
      </>
    }
    break
  }
  }

  return <div className={styles.inviteContainer}>
    {inner}
    <InviteEmployeesModal groupID={groupID} isOpen={isOpen} onRequestClose={toggle} />
  </div>
}

export default DashboardEmployer
