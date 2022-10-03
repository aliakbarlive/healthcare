import React from 'react'
import ProfileSection from 'Components/Anubis/ProfileSection'
import * as api from 'Utilities/pharaoh'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { useAsync } from 'react-use'
import EmployerPlansBreakdown from 'Components/Anubis/EmployerPlansBreakdown'
import { Contributions, GroupPlanType, MemberPlus } from 'Utilities/Plans/ContributionCalculator'
import { isDental } from 'Components/Plans/DentalPlan/index.helpers'
import { isVision } from 'Components/Plans/VisionPlan/index.helpers'

type Props = {
  id: string
  contributions: Contributions
  members: MemberPlus[]
}

const GroupsProfileAncillaryPlansSection: React.FC<Props> = ({ id, contributions, members }) => {
  const async = useAsync(() => api.v3.groups(id).plans.options.ancillary.selected(), [id])

  return (
    <ProfileSection name="Ancillary Plans" expanded={false}>
      {content()}
    </ProfileSection>
  )

  function content() {
    if (async.loading) return <Loader />
    if (async.error) return <Error error={async.error}/>
    const dentalPlans = async.value!.filter(isDental)
    const visionPlans = async.value!.filter(isVision)

    if (!members.length) {
      return <p>Please add an employee to see available ancillary plans </p>
    }

    return <>
      <h3 style={{ textAlign: 'left', fontWeight: 800 }}>Dental Plans</h3>
      <EmployerPlansBreakdown type={GroupPlanType.dental} plans={dentalPlans} contributions={contributions} members={members} reportFileBasename='dental-benefits-breakdown' />
      <h3 style={{ textAlign: 'left', fontWeight: 800, marginTop: '2rem' }}>Vision Plans</h3>
      <EmployerPlansBreakdown type={GroupPlanType.vision} plans={visionPlans} contributions={contributions} members={members} reportFileBasename='vision-benefits-breakdown' />
    </>
  }
}

export default GroupsProfileAncillaryPlansSection
