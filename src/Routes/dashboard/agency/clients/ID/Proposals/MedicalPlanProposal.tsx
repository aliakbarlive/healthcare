import { logoFor } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import React from 'react'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import PlanProposal, { enrollInfo, tablePlanHeader, tableRow, tableRowCopayOrRx } from './PlanProposal/PlanProposal'
import { calculatePremiumFigures, TierCount } from './Proposal'

export const MedicalPlanProposal: React.FC<{ medicalPlan: MedicalPlan[], enrollCount: TierCount, groupName: string, groupEffectiveDate?: Date, counts: string[] }> = ({ medicalPlan, enrollCount, groupName, groupEffectiveDate, counts }) => {
  return <PlanProposal groupName={groupName} groupEffectiveDate={groupEffectiveDate} tablePlanHeaders={tablePlanHeaders(counts, medicalPlan[0], medicalPlan[1], medicalPlan[2], medicalPlan[3], medicalPlan[4])} proposalHeader='Medical Plan Proposal' tableRows={tableRows(enrollCount, medicalPlan[0], medicalPlan[1], medicalPlan[2], medicalPlan[3], medicalPlan[4])} enrollmentInfo={enrollInfo(enrollCount)}/>
}

function tablePlanHeaders(counts: string[], current: MedicalPlan, renewal?: MedicalPlan, planA?: MedicalPlan, planB?: MedicalPlan, planC?: MedicalPlan) {
  return <>
    {tablePlanHeader(counts[0], current.name, 0, logoFor(current.carrier))}
    {renewal && tablePlanHeader(counts[1], renewal.name, 1, logoFor(renewal.carrier))}
    {planA && tablePlanHeader(counts[2], planA ? planA.name : '', 2, logoFor(planA.carrier))}
    {planB && tablePlanHeader(counts[3], planB ? planB.name : '', 3, logoFor(planB.carrier))}
    {planC && tablePlanHeader(counts[4], planC ? planC.name : '', 4, logoFor(planC.carrier))}
  </>
}

function tableRows(enrollCount: TierCount, current: MedicalPlan, renewal?: MedicalPlan, planA?: MedicalPlan, planB?: MedicalPlan, planC?: MedicalPlan) {
  let premiumsA: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  let premiumsB: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  let premiumsC: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  let premiumsRen: { monthly?: string, annual?: string} = { monthly: '', annual: '' }
  const premiumsCurr = calculatePremiumFigures(
    ({ premium: parseFloat(removeCommaOrDollarSign(current.premium.employee.individual)), enrolled: enrollCount.individual }),
    ({ premium: parseFloat(removeCommaOrDollarSign(current.premium.employee.couple)), enrolled: enrollCount.couple }),
    ({ premium: parseFloat(removeCommaOrDollarSign(current.premium.employee.singleParent)), enrolled: enrollCount.single }),
    ({ premium: parseFloat(removeCommaOrDollarSign(current.premium.employee.family)), enrolled: enrollCount.family })
  )

  if (renewal) {
    premiumsRen = calculatePremiumFigures(
      ({ premium: parseFloat(removeCommaOrDollarSign(renewal.premium.employee.individual)), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(removeCommaOrDollarSign(renewal.premium.employee.couple)), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(removeCommaOrDollarSign(renewal.premium.employee.singleParent)), enrolled: enrollCount.single }),
      ({ premium: parseFloat(removeCommaOrDollarSign(renewal.premium.employee.family)), enrolled: enrollCount.family })
    )
  }

  if (planA) {
    premiumsA = calculatePremiumFigures(
      ({ premium: parseFloat(removeCommaOrDollarSign(planA.premium.employee.individual)), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planA.premium.employee.couple)), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planA.premium.employee.singleParent)), enrolled: enrollCount.single }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planA.premium.employee.family)), enrolled: enrollCount.family })
    )
  }

  if (planB) {
    premiumsB = calculatePremiumFigures(
      ({ premium: parseFloat(removeCommaOrDollarSign(planB.premium.employee.individual)), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planB.premium.employee.couple)), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planB.premium.employee.singleParent)), enrolled: enrollCount.single }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planB.premium.employee.family)), enrolled: enrollCount.family })
    )
  }

  if (planC) {
    premiumsC = calculatePremiumFigures(
      ({ premium: parseFloat(removeCommaOrDollarSign(planC.premium.employee.individual)), enrolled: enrollCount.individual }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planC.premium.employee.couple)), enrolled: enrollCount.couple }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planC.premium.employee.singleParent)), enrolled: enrollCount.single }),
      ({ premium: parseFloat(removeCommaOrDollarSign(planC.premium.employee.family)), enrolled: enrollCount.family })
    )
  }

  return <>
    {tableRow('Plan Type', 0, current.type, renewal ? renewal.type : undefined, planA ? planA.type : undefined, planB ? planB.type : undefined, planC ? planC.type : undefined)}
    {tableRowCopayOrRx(false, current, renewal || undefined, planA || undefined, planB || undefined, planC || undefined)}
    {tableRow('IN-NETWORK', 2, '', renewal ? '' : undefined, planA ? '' : undefined, planB ? '' : undefined, planC ? '' : undefined)}
    {tableRow('deductible', 3, current.deductible, renewal ? renewal.deductible : undefined, planA ? planA.deductible : undefined, planB ? planB.deductible : undefined, planC ? planC.deductible : undefined)}
    {tableRow('oop max', 4, current.oopMax, renewal ? renewal.oopMax : undefined, planA ? planA.oopMax : undefined, planB ? planB.oopMax : undefined, planC ? planC.oopMax : undefined)}
    {tableRow('co-insurance', 5, current.coinsurance, renewal ? renewal.coinsurance : undefined, planA ? planA.coinsurance : undefined, planB ? planB.coinsurance : undefined, planC ? planC.coinsurance : undefined)}
    {tableRowCopayOrRx(true, current, renewal || undefined, planA || undefined, planB || undefined, planC || undefined)}
    {tableRow('RATES', 7, '', renewal ? '' : undefined, planA ? '' : undefined, planB ? '' : undefined, planC ? '' : undefined)}
    {tableRow('employee', 8, current.premium.employee.individual, renewal ? renewal.premium.employee.individual : undefined, planA ? planA.premium.employee.individual : undefined, planB ? planB.premium.employee.individual : undefined, planC ? planC.premium.employee.individual : undefined)}
    {tableRow('employee + spouse', 9, current.premium.employee.couple, renewal ? renewal.premium.employee.couple : undefined, planA ? planA.premium.employee.couple : undefined, planB ? planB.premium.employee.couple : undefined, planC ? planC.premium.employee.couple : undefined)}
    {tableRow('employee + child', 10, current.premium.employee.singleParent, renewal ? renewal.premium.employee.singleParent : undefined, planA ? planA.premium.employee.singleParent : undefined, planB ? planB.premium.employee.singleParent : undefined, planC ? planC.premium.employee.singleParent : undefined)}
    {tableRow('family', 11, current.premium.employee.family, renewal ? renewal.premium.employee.family : undefined, planA ? planA.premium.employee.family : undefined, planB ? planB.premium.employee.family : undefined, planC ? planC.premium.employee.family : undefined)}
    {tableRow('monthly premium', 12, `${premiumsCurr.monthly}`, premiumsRen.monthly ? `${premiumsRen.monthly}` : undefined, premiumsA.monthly ? `${premiumsA.monthly}` : undefined, premiumsB.monthly ? `${premiumsB.monthly}` : undefined, premiumsC.monthly ? `${premiumsC.monthly}` : undefined)}
    {tableRow('annual premium', 13, `${premiumsCurr.annual}`, premiumsRen.annual ? `${premiumsRen.annual}` : undefined, premiumsA.annual ? `${premiumsA.annual}` : undefined, premiumsB.annual ? `${premiumsB.annual}` : undefined, premiumsC.annual ? `${premiumsC.annual}` : undefined)}
  </>
}

function removeCommaOrDollarSign(s: string) {
  return s.replace('$', '').replace(',', '')
}
