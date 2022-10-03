import React, { useState } from 'react'
import styles from 'Routes/shop/employer/plans/ShowPlans.module.scss'
import headerStyles from 'Components/Stargate/ShowPlans/Components/ShowPlansHeader.module.scss'
import { Member } from 'Utilities/Hooks/useStargate'
import useToast from 'Utilities/Hooks/useToast'
import { EnrollmentStatus } from 'Utilities/pharaoh.types'
import { classNames } from 'Utilities/etc'
import { camelCase } from 'lodash'
import { post } from 'Utilities/fetch++'
import Loader from 'Components/Rudimentary/Loader'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'

const ERIMQs: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { group, members } = stargate
  const groupID = group!.id
  const [sending, setSending] = useState(false)
  const addToast = useToast()
  const isNotStarted = (m: Member) => [EnrollmentStatus.notInvited, EnrollmentStatus.notStarted].includes(m.enrollmentStatus) && !m.medical_underwriting_complete
  const notStarted = members.filter(isNotStarted)
  const incomplete = members.filter(m => !m.medical_underwriting_complete && !notStarted.some(ns => ns.id === m.id))
  const complete = members.filter(m => m.medical_underwriting_complete && !m.is_waived)
  const waived = members.filter(m => m.medical_underwriting_complete && m.is_waived)
  const imqsComplete = notStarted.length + incomplete.length === 0
  useFullContentArea()

  return <>
    { sending && <Loader center/> }
    <div className={headerStyles.header}>
      <div className={headerStyles.titleArea}>
        <h1>Employee MQ Status</h1>
        <button className={imqsComplete ? headerStyles.nextButton : headerStyles.backButton} onClick={() => onwards(Promise.resolve({ imqsComplete }))}>
          { imqsComplete ? 'Next' : 'Return to plan selection' }
        </button>
      </div>
    </div>
    <div className={styles.mainContainer}>
      {pipeline()}
      {remindAll()}
      {table()}
    </div>
  </>

  function remindStraggler(memberId: string) {
    return post(`/groups/${groupID}/remind-stragglers/users/${memberId}`)
  }

  function pipeline() {
    return <div className={styles.pipeline}>
      <div className={styles.notStarted}>{notStarted.length}<span>Not Started</span></div>
      <div className={styles.incomplete}>{incomplete.length}<span>Incomplete</span></div>
      <div className={styles.completed}>{complete.length}<span>Completed</span></div>
      <div className={styles.waived}>{waived.length}<span>Waived</span></div>
    </div>
  }

  function remindAll() {
    return !imqsComplete && <div className={styles.remindAll}>
      <p>Would you like to send a reminder to all<br/>employees who have not completed their<br/>Medical Questionnaires?</p>
      <button
        disabled={sending}
        type='button'
        onClick={async() => {
          try {
            setSending(true)
            const promises = [...notStarted, ...incomplete].map(m => remindStraggler(m.id))
            await Promise.all(promises)
            addToast('Reminders sent', { appearance: 'success' })
          } catch (e) {
            addToast(e)
          } finally {
            setSending(false)
          }
        }}>
        Send Reminders
      </button>
    </div>
  }

  function table() {
    return <div>
      {notStarted.map(m => row(m, 'Not Started', true))}
      {incomplete.map(m => row(m, 'Incomplete', true))}
      {complete.map(m => row(m, 'Completed', false))}
      {waived.map(m => row(m, 'Waived', false))}
    </div>
  }

  function row(member: Member, status: string, canRemind: boolean) {
    return <div className={styles.imqRow}>
      <div className={styles.name}>{member.name}</div>
      <div className={classNames(styles.status, styles[camelCase(status)])}>{status}</div>
      { canRemind
        ? <button
          type='button'
          disabled={sending}
          onClick={async() => {
            try {
              setSending(true)
              await remindStraggler(member.id)
              addToast('Reminder sent', { appearance: 'success' })
            } catch (e) {
              addToast(e)
            } finally {
              setSending(false)
            }
          }}
        >
            Send Reminder
        </button>
        : <div/>
      }
    </div>
  }
}

export default ERIMQs
