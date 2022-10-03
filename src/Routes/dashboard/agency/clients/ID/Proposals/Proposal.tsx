import React from 'react'
import Landing from './Landing/Landing'
import Prosper from './Prosper/Prosper'
import { MedicalPlanProposal } from './MedicalPlanProposal'
import { DentalPlanProposal } from './DentalPlanProposal'
import { VisionPlanProposal } from './VisionPlanProposal'
import { GroupLifePlanProposal } from './GroupLifePlanProposal'
import { LegalNotice } from './LegalNotice/LegalNotice'
import { PageOneNotice } from './E+EENotices/PageOne/PageOne'
import { PageTwoNotice } from './E+EENotices/PageTwo/PageTwo'
import { PageThreeNotice } from './E+EENotices/PageThree/PageThree'
import { PageFourNotice } from './E+EENotices/PageFour/PageFour'
import { PageNineNotice } from './E+EENotices/PageNine/PageNine'
import { PageTenNotice } from './E+EENotices/PageTen/PageTen'
import { useAsync } from 'react-use'
import { Broker, MedicalPlan } from 'Utilities/pharaoh.types'
import { AncillaryPlanUnion, moneyString } from 'Utilities/Plans/ContributionCalculator'
import * as api from 'Utilities/pharaoh'
import { isDental } from 'Components/Plans/DentalPlan/index.helpers'
import { isVision } from 'Components/Plans/VisionPlan/index.helpers'
import Error from 'Components/Primitives/Error'
import _ from 'lodash'
import styles from './Proposal.module.scss'

interface ProposalProps {
  broker: Broker
  group: ProposalGroupInfo
  enrollCount: TierCount
  brokerCommission: string
  cartPlans?: MedicalPlan[]
}

export interface ProposalGroupInfo {
  name: string
  id: string
  effectiveDate?: Date
  groupState?: string
}
export interface TierCount {
  individual: number
  couple: number
  single: number
  family: number
}

const Proposal: React.FC<ProposalProps> = ({ broker, group, enrollCount, brokerCommission, cartPlans }) => {
  const { value, error, loading } = useAsync(async() => {
    const medical = await api.v3.groups(group?.id).plans.GET() as MedicalPlan[]
    let ancillary = await api.v3.groups(group?.id).plans.options.ancillary.selected() as AncillaryPlanUnion[]
    ancillary = ancillary.sort((x, y) => x.isRenewal === true ? -1 : y.isRenewal === true ? 1 : 0)
    let renewal = await api.v3.groups(group?.id).plans.renewalPlans.renewals()
    renewal = sortRenewal(renewal)
    const medicalPlanCounts: string[] = renewal.map(r => r.name.includes('Current') ? 'Current' : 'Renewal')
    let mPlansToPropose = cartPlans || medical
    mPlansToPropose = mPlansToPropose.filter(plan => !renewal.some(p => p.id === plan.id))
    mPlansToPropose.forEach((_, index) => medicalPlanCounts.push(`Proposed #${index + 1}`))
    return ({ proposedMedical: ({ arr: [...renewal, ...mPlansToPropose], headerTitles: medicalPlanCounts }), proposedAncillary: ancillary })
  })

  if (loading) return null
  if (error) return <Error error={error} />

  const plans = extractPlans()
  const dentalPlanCounts = getAncillaryPlanCount(plans.dental)
  const visionPlanCounts = getAncillaryPlanCount(plans.vision)
  const medicalPlanCounts = value!.proposedMedical.headerTitles
  const currentInsuranceCompany = plans.medical ? plans.medical.length > 0 ? plans.medical[0][0].carrier : 'Insurance Company' : 'Insurance Company'
  const planHeaders = chunkArray(medicalPlanCounts, 5)

  return <div className={styles.main}>
    <Landing broker={broker} groupName={group.name} />
    <Prosper />
    {plans.medical.length > 0 && plans.medical.map((plan, i) => <MedicalPlanProposal counts={planHeaders[i]} key={'uniquekeyMedical'} enrollCount={enrollCount} medicalPlan={plan} groupName={group.name} groupEffectiveDate={group.effectiveDate} />) }
    {plans.dental.length > 0 && plans.dental.map((plan, i) => <DentalPlanProposal counts={dentalPlanCounts[i]} key={'uniquekeyDental'} enrollCount={enrollCount} dentalPlans={plan} groupName={group.name} groupEffectiveDate={group.effectiveDate} />) }
    {plans.vision.length > 0 && plans.vision.map((plan, i) => <VisionPlanProposal counts={visionPlanCounts[i]} key={'uniquekeyVision'} enrollCount={enrollCount} visionPlans={plan} groupName={group.name} groupEffectiveDate={group.effectiveDate} />)}
    {/* GroupLifePlanProposal may be needed in the future */}
    <div style={{ display: 'none' }}><GroupLifePlanProposal groupName={group.name} groupEffectiveDate={group.effectiveDate} /></div>
    <LegalNotice brokerCommission={brokerCommission} agencyName={broker.agency!.name} employerName={group.name}/>
    <PageOneNotice />
    <PageTwoNotice companyName={group.name} insuranceCompany={currentInsuranceCompany} />
    <PageThreeNotice companyName={group.name} insuranceCompany={currentInsuranceCompany} />
    <PageFourNotice groupState={group.groupState}/>
    <PageNineNotice />
    <PageTenNotice />
  </div>

  function extractPlans() {
    return {
      medical: chunkArray(value!.proposedMedical.arr, 5) as MedicalPlan[][],
      dental: chunkArray(value!.proposedAncillary.filter(({ plan }) => isDental(plan)), 5) as AncillaryPlanUnion[][],
      vision: chunkArray(value!.proposedAncillary.filter(({ plan }) => isVision(plan)), 5) as AncillaryPlanUnion[][]
    }
  }

  function getAncillaryPlanCount(plans: AncillaryPlanUnion[][]) {
    const counts: string[][] = []
    plans.forEach((p) => {
      const arr: string[] = []
      let count = 1
      p.forEach((p1) => {
        if (p1.isRenewal) arr.push('Renewal')
        else { arr.push(`Proposed #${count}`); count++ }
      })
      counts.push(arr)
    })

    return counts
  }

  function chunkArray(array: any[], size: number) {
    const result = []
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size)
      result.push(chunk)
    }
    return result
  }

  function sortRenewal(plans: MedicalPlan[]) {
    const sortedPlans: MedicalPlan[] = []
    plans.forEach(p => p.name.includes('Current') ? sortedPlans.unshift(p) : sortedPlans.push(p))
    return sortedPlans
  }
}

interface PremiumVariables {
  premium: number
  enrolled: number
}

export function calculatePremiumFigures(individual: PremiumVariables, couple: PremiumVariables, singleParent: PremiumVariables, family: PremiumVariables) {
  const monthly = (individual.premium * individual.enrolled) + (couple.premium * couple.enrolled) + (singleParent.premium * singleParent.enrolled) + (family.premium * family.enrolled)
  const annual = monthly * 12
  return ({ monthly: moneyString(monthly, 2), annual: moneyString(annual, 2) })
}

export default Proposal
