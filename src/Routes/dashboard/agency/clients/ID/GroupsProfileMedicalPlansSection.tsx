import React from 'react'
import ProfileSection from 'Components/Anubis/ProfileSection'
import * as api from 'Utilities/pharaoh'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { useAsync } from 'react-use'
import { useHistory } from 'react-router-dom'
import { get } from 'Utilities/fetch++'
import EmployerPlansBreakdown from 'Components/Anubis/EmployerPlansBreakdown'
import { Route } from 'Utilities/Route'
import { Contributions, GroupPlanType, MemberPlus } from 'Utilities/Plans/ContributionCalculator'
import { ContributionSplit } from 'Utilities/Hooks/useStargate'

type Props = {
  id: string
  contributions: Contributions
  members: MemberPlus[]
  splits?: ContributionSplit[]
}

export const healthcareDetailsTitle = 'Healthcare Plans'

const GroupsProfileMedicalPlansSection: React.FC<Props> = ({ id, contributions, members, splits }) => {
  const async = useAsync(() =>
    Promise.all([
      get(`/v3/groups/${id}/plans`),
      api.v1.groups(id).users.GET()
    ]), [id])
  const history = useHistory()

  const children = () => {
    if (async.loading) return <Loader />
    if (async.error) return <Error error={async.error} />
    const [plans] = async.value!
    if (plans.length === 0) return <p>No plans selected.</p>

    return <EmployerPlansBreakdown type={GroupPlanType.medical} plans={plans} contributions={contributions} splits={splits} members={members} reportFileBasename='health-benefits-breakdown' />
  }

  return <ProfileSection
    name={ healthcareDetailsTitle }
    addButtonName="Shop Healthcare Plans"
    expanded={false}
    onAddButton={() => {
      localStorage.overrideGroupID = id
      history.push(Route.erStargate_Plans)
    }}
  >
    { children() }
  </ProfileSection>
}

export default GroupsProfileMedicalPlansSection
