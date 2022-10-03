import { logoFor } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import VisionPlan from 'Components/Plans/VisionPlan/index.helpers'
import React from 'react'
import { TieredRates } from 'Utilities/pharaoh.types'
import { AncillaryPlanUnion } from 'Utilities/Plans/ContributionCalculator'
import PlanProposal, { enrollInfo, tablePlanHeader, tableRow } from './PlanProposal/PlanProposal'
import { calculatePremiumFigures, TierCount } from './Proposal'

export const VisionPlanProposal: React.FC<{ visionPlans: AncillaryPlanUnion[], enrollCount: TierCount, groupName: string, groupEffectiveDate?: Date, counts: string[] }> = ({ visionPlans, enrollCount, groupName, groupEffectiveDate, counts }) => {
  const vPlans = visionPlans.map(plan => plan as {rate: TieredRates, plan: VisionPlan})
  return <PlanProposal groupName={groupName} groupEffectiveDate={groupEffectiveDate} tablePlanHeaders={tablePlanHeaders(counts, vPlans[0], vPlans[1], vPlans[2], vPlans[3], vPlans[4])} proposalHeader='Vision Plan Proposal' tableRows={tableRows(enrollCount, vPlans[0], vPlans[1], vPlans[2], vPlans[3], vPlans[4])} enrollmentInfo={enrollInfo(enrollCount)}/>
}

function tablePlanHeaders(counts: string[], current: any, proposedA?: any, proposedB?: any, proposedC?: any, proposedD?: any) {
  return <>
    {tablePlanHeader(counts[0], current.plan.name, 0, logoFor(current.plan.carrier))}
    {proposedA && tablePlanHeader(counts[1], proposedA?.plan?.name, 1, logoFor(proposedA?.plan?.carrier))}
    {proposedB && tablePlanHeader(counts[2], proposedB?.plan?.name, 1, logoFor(proposedB?.plan?.carrier))}
    {proposedC && tablePlanHeader(counts[3], proposedC?.plan?.name, 1, logoFor(proposedC?.plan?.carrier))}
    {proposedD && tablePlanHeader(counts[4], proposedD?.plan?.name, 1, logoFor(proposedD?.plan?.carrier))}
  </>
}

function tableRows(enrollCount: TierCount, current: {rate: TieredRates, plan: VisionPlan}, proposedA?: {rate: TieredRates, plan: VisionPlan}, proposedB?: {rate: TieredRates, plan: any}, proposedC?: {rate: TieredRates, plan: any}, proposedD?: {rate: TieredRates, plan: any}) {
  let premiumsA: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  let premiumsB: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  let premiumsC: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  let premiumsD: { monthly?: string, annual?: string} = { monthly: '', annual: '' }

  const premiumsCurr = calculatePremiumFigures(
    ({ premium: parseFloat(current.rate.individual.replace('$', '')), enrolled: enrollCount.individual }),
    ({ premium: parseFloat(current.rate.couple.replace('$', '')), enrolled: enrollCount.couple }),
    ({ premium: parseFloat(current.rate.singleParent.replace('$', '')), enrolled: enrollCount.single }),
    ({ premium: parseFloat(current.rate.family.replace('$', '')), enrolled: enrollCount.family })
  )
  if (proposedA) {
    premiumsA = calculatePremiumFigures(
      ({ premium: parseFloat(proposedA.rate.individual.replace('$', '')), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(proposedA.rate.couple.replace('$', '')), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(proposedA.rate.singleParent.replace('$', '')), enrolled: enrollCount.single }),
      ({ premium: parseFloat(proposedA.rate.family.replace('$', '')), enrolled: enrollCount.family })
    )
  }
  if (proposedB) {
    premiumsB = calculatePremiumFigures(
      ({ premium: parseFloat(proposedB.rate.individual.replace('$', '')), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(proposedB.rate.couple.replace('$', '')), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(proposedB.rate.singleParent.replace('$', '')), enrolled: enrollCount.single }),
      ({ premium: parseFloat(proposedB.rate.family.replace('$', '')), enrolled: enrollCount.family })
    )
  }
  if (proposedC) {
    premiumsC = calculatePremiumFigures(
      ({ premium: parseFloat(proposedC.rate.individual.replace('$', '')), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(proposedC.rate.couple.replace('$', '')), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(proposedC.rate.singleParent.replace('$', '')), enrolled: enrollCount.single }),
      ({ premium: parseFloat(proposedC.rate.family.replace('$', '')), enrolled: enrollCount.family })
    )
  }
  if (proposedD) {
    premiumsD = calculatePremiumFigures(
      ({ premium: parseFloat(proposedD.rate.individual.replace('$', '')), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(proposedD.rate.couple.replace('$', '')), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(proposedD.rate.singleParent.replace('$', '')), enrolled: enrollCount.single }),
      ({ premium: parseFloat(proposedD.rate.family.replace('$', '')), enrolled: enrollCount.family })
    )
  }

  return <>
    {tableRow('IN-NETWORK', 0, '', proposedA ? '' : undefined, proposedB ? '' : undefined, proposedC ? '' : undefined, proposedD ? '' : undefined)}
    {tableRow('vision exam', 1, current.plan.data.comprehensiveVisionExamInNetwork, proposedA ? proposedA.plan.data.comprehensiveVisionExamInNetwork : undefined, proposedB ? proposedB.plan.data.comprehensiveVisionExamInNetwork : undefined, proposedC ? proposedC.plan.data.comprehensiveVisionExamInNetwork : undefined, proposedD ? proposedD.plan.data.comprehensiveVisionExamInNetwork : undefined)}
    {tableRow('frame allowance', 2, current.plan.data.framesAllowanceInNetwork, proposedA ? proposedA.plan.data.framesAllowanceInNetwork : undefined, proposedB ? proposedB.plan.data.framesAllowanceInNetwork : undefined, proposedC ? proposedC.plan.data.framesAllowanceInNetwork : undefined, proposedD ? proposedD.plan.data.framesAllowanceInNetwork : undefined)}
    {tableRow('contact lenses', 3, current.plan.data.contactLensesInNetwork, proposedA ? proposedA.plan.data.contactLensesInNetwork : undefined, proposedB ? proposedB.plan.data.contactLensesInNetwork : undefined, proposedC ? proposedC.plan.data.contactLensesInNetwork : undefined, proposedD ? proposedD.plan.data.contactLensesInNetwork : undefined)}
    {tableRow('RATES', 4, '', proposedA ? '' : undefined, proposedB ? '' : undefined, proposedC ? '' : undefined, proposedD ? '' : undefined)}
    {tableRow('employee', 5, current.rate.individual, proposedA ? proposedA.rate.individual : undefined, proposedB ? proposedB.rate.individual : undefined, proposedC ? proposedC.rate.individual : undefined, proposedD ? proposedD.rate.individual : undefined)}
    {tableRow('employee + spouse', 6, current.rate.couple, proposedA ? proposedA.rate.couple : undefined, proposedB ? proposedB.rate.couple : undefined, proposedC ? proposedC.rate.couple : undefined, proposedD ? proposedD.rate.couple : undefined)}
    {tableRow('employee + child', 7, current.rate.singleParent, proposedA ? proposedA.rate.singleParent : undefined, proposedB ? proposedB.rate.singleParent : undefined, proposedC ? proposedC.rate.singleParent : undefined, proposedD ? proposedD.rate.singleParent : undefined)}
    {tableRow('family', 8, current.rate.family, proposedA ? proposedA.rate.family : undefined, proposedB ? proposedB.rate.family : undefined, proposedC ? proposedC.rate.family : undefined, proposedD ? proposedD.rate.family : undefined)}
    {tableRow('monthly premium', 9, `${premiumsCurr.monthly}`, premiumsA.monthly ? `${premiumsA.monthly}` : undefined, premiumsB.monthly ? `${premiumsB.monthly}` : undefined, premiumsC.monthly ? `${premiumsC.monthly}` : undefined, premiumsD.monthly ? `${premiumsD.monthly}` : undefined)}
    {tableRow('annual premium', 10, `${premiumsCurr.annual}`, premiumsA.annual ? `${premiumsA.annual}` : undefined, premiumsB.annual ? `${premiumsB.annual}` : undefined, premiumsC.annual ? `${premiumsC.annual}` : undefined, premiumsD.annual ? `${premiumsD.annual}` : undefined)}
  </>
}
