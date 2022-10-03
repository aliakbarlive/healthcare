import { logoFor } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import React from 'react'
import { TieredRates } from 'Utilities/pharaoh.types'
import { AncillaryPlanUnion } from 'Utilities/Plans/ContributionCalculator'
import PlanProposal, { enrollInfo, tablePlanHeader, tableRow } from './PlanProposal/PlanProposal'
import { calculatePremiumFigures, TierCount } from './Proposal'

export const DentalPlanProposal: React.FC<{ dentalPlans: AncillaryPlanUnion[], enrollCount: TierCount, groupName: string, groupEffectiveDate?: Date, counts: string[] }> = ({ dentalPlans, enrollCount, groupName, groupEffectiveDate, counts }) => {
  const dPlans = dentalPlans.map(plan => plan as {rate: TieredRates, plan: any})
  return <PlanProposal groupName={groupName} groupEffectiveDate={groupEffectiveDate} tablePlanHeaders={tablePlanHeaders(counts, dPlans[0], dPlans[1], dPlans[2], dPlans[3], dPlans[4])} proposalHeader='Dental Plan Proposal' tableRows={tableRows(enrollCount, dPlans[0], dPlans[1], dPlans[2], dPlans[3], dPlans[4])} enrollmentInfo={enrollInfo(enrollCount)}/>
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

function tableRows(enrollCount: TierCount, current: {rate: TieredRates, plan: any}, proposedA?: {rate: TieredRates, plan: any}, proposedB?: {rate: TieredRates, plan: any}, proposedC?: {rate: TieredRates, plan: any}, proposedD?: {rate: TieredRates, plan: any}) {
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
    {tableRow('Plan type', 0, dentalPlanType(current.plan.name), proposedA ? dentalPlanType(proposedA.plan.name) : undefined, proposedB ? dentalPlanType(proposedB.plan.name) : undefined, proposedC ? dentalPlanType(proposedC.plan.name) : undefined, proposedD ? dentalPlanType(proposedD.plan.name) : undefined)}
    {tableRow('IN-NETWORK', 1, '', proposedA ? '' : undefined, proposedB ? '' : undefined, proposedC ? '' : undefined, proposedD ? '' : undefined)}
    {tableRow('deductible', 2, current.plan.data.preventativeDeductibleInNetwork, proposedA ? proposedA.plan.data.preventativeDeductibleInNetwork : undefined, proposedB ? proposedB.plan.data.preventativeDeductibleInNetwork : undefined, proposedC ? proposedC.plan.data.preventativeDeductibleInNetwork : undefined, proposedD ? proposedD.plan.data.preventativeDeductibleInNetwork : undefined)}
    {tableRow('annual max', 3, current.plan.data.preventativeMaxInNetwork, proposedA ? proposedA.plan.data.preventativeMaxInNetwork : undefined, proposedB ? proposedB.plan.data.preventativeMaxInNetwork : undefined, proposedC ? proposedC.plan.data.preventativeMaxInNetwork : undefined, proposedD ? proposedD.plan.data.preventativeMaxInNetwork : undefined)}
    {tableRow('major', 4, current.plan.data.majorCoinsuranceInNetwork, proposedA ? proposedA.plan.data.majorCoinsuranceInNetwork : undefined, proposedB ? proposedB.plan.data.majorCoinsuranceInNetwork : undefined, proposedC ? proposedC.plan.data.majorCoinsuranceInNetwork : undefined, proposedD ? proposedD.plan.data.majorCoinsuranceInNetwork : undefined)}
    {tableRow('RATES', 5, '', proposedA ? '' : undefined, proposedB ? '' : undefined, proposedC ? '' : undefined, proposedD ? '' : undefined)}
    {tableRow('employee', 6, current.rate.individual, proposedA ? proposedA.rate.individual : undefined, proposedB ? proposedB.rate.individual : undefined, proposedC ? proposedC.rate.individual : undefined, proposedD ? proposedD.rate.individual : undefined)}
    {tableRow('employee + spouse', 7, current.rate.couple, proposedA ? proposedA.rate.couple : undefined, proposedB ? proposedB.rate.couple : undefined, proposedC ? proposedC.rate.couple : undefined, proposedD ? proposedD.rate.couple : undefined)}
    {tableRow('employee + child', 8, current.rate.singleParent, proposedA ? proposedA.rate.singleParent : undefined, proposedB ? proposedB.rate.singleParent : undefined, proposedC ? proposedC.rate.singleParent : undefined, proposedD ? proposedD.rate.singleParent : undefined)}
    {tableRow('family', 9, current.rate.family, proposedA ? proposedA.rate.family : undefined, proposedB ? proposedB.rate.family : undefined, proposedC ? proposedC.rate.family : undefined, proposedD ? proposedD.rate.family : undefined)}
    {tableRow('monthly premium', 10, `${premiumsCurr.monthly}`, premiumsA.monthly ? `${premiumsA.monthly}` : undefined, premiumsB.monthly ? `${premiumsB.monthly}` : undefined, premiumsC.monthly ? `${premiumsC.monthly}` : undefined, premiumsD.monthly ? `${premiumsD.monthly}` : undefined)}
    {tableRow('annual premium', 11, `${premiumsCurr.annual}`, premiumsA.annual ? `${premiumsA.annual}` : undefined, premiumsB.annual ? `${premiumsB.annual}` : undefined, premiumsC.annual ? `${premiumsC.annual}` : undefined, premiumsD.annual ? `${premiumsD.annual}` : undefined)}
  </>
}

function dentalPlanType(planName: any) {
  let planType = 'PPO'
  if (planName.includes('HMO')) planType = 'HMO'
  if (planName.includes('EPO')) planType = 'EPO'
  return planType
}
