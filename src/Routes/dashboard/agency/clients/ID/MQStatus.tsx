import React from 'react'
import styles from './MQStatus.module.scss'
import summaryStyles from 'Components/Anubis/ProfileSection.module.scss'
import { useAsync, useToggle } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { EnrollmentStatus } from 'Utilities/pharaoh.types'
import { Member } from 'Utilities/Hooks/useStargate'
import MQStats from './MQStats'
import { Link } from 'react-router-dom'
import { Route } from 'Utilities/Route'

type Props = {
  groupID: string
}

const MQStatus: React.FC<Props> = ({ groupID }) => {
  const { loading, error, value } = useAsync(async() => await api.v3.groups(groupID).users().GET() as Member[])
  const [expanded, setExpanded] = useToggle(true)

  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const members = value!

  const isNotStarted = (m: Member) => [EnrollmentStatus.notInvited, EnrollmentStatus.notStarted].includes(m.enrollmentStatus) && !m.medical_underwriting_complete
  const notStarted = members.filter(isNotStarted)
  const incomplete = members.filter(m => !m.medical_underwriting_complete && !notStarted.some(ns => ns.id === m.id)).length
  const complete = members.filter(m => m.medical_underwriting_complete && !m.is_waived).length
  const waived = members.filter(m => m.medical_underwriting_complete && m.is_waived).length

  const stats = { notStarted: notStarted.length, incomplete, complete, waived }

  function setGroupID() {
    localStorage.overrideGroupID = groupID
  }

  return <div className={styles.container}>
    <div
      style={{ width: '100%', lineHeight: '20px' }}
      className={`${summaryStyles.summary} ${expanded ? summaryStyles.expanded : ''}`}
      onClick={setExpanded}
    >
        Medical Questionnaire Status
    </div>
    <div style={{ display: expanded ? 'grid' : 'none' }} className={styles.content}>
      <MQStats stats={stats}/>
    </div>
    <Link className={styles.links} to={Route.erStargate_IMQs} onClick={setGroupID}>See Details</Link>
  </div>
}

export default MQStatus
