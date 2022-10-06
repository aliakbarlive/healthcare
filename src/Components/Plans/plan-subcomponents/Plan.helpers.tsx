import React from 'react'
import { kebabCase, uniq } from 'lodash'
import * as api from 'Utilities/pharaoh'
import { Img } from 'react-image'
import { MedicalPlan, Tier } from 'Utilities/pharaoh.types'
import { Member, PlanSelectionsState } from 'Utilities/Hooks/useStargate'
import { PlanUnion, isAncillaryPlanUnion, GroupPlanType, moneyString } from 'Utilities/Plans/ContributionCalculator'
import { isDental } from '../DentalPlan/index.helpers'
import { isVision } from '../VisionPlan/index.helpers'
import { isLife } from '../LifePlan/index.helpers'
import { isLTD } from '../LTDPlan/index.helpers'
import { isSupplemental } from '../SupplementalPlan/index.helpers'

/*
  IMPORTANT
  If you are adding new cases make sure that
   a) They remain in alphabetical order
   b) Make sure the carrier logo image is formatted as such `${kebabCase(carrier)}-logo` and placed in public/carrier-logos
   c) Don't forget to add the height for the logo
*/

export enum Carriers {
  'ABC Insurance Trust' = 'ABC Insurance Trust',
  'Aetna' = 'Aetna',
  'Aflac' = 'Aflac',
  'Alliant Health Plans' = 'Alliant Health Plans',
  'AllWays Health Partners' = 'AllWays Health Partners',
  'Allstate Benefits' = 'Allstate Benefits',
  'AmeriHealth' = 'AmeriHealth',
  'Anthem' = 'Anthem',
  'Apex Management Group' = 'Apex Management Group',
  'AultCare Insurance' = 'AultCare Insurance',
  'AvMed' = 'AvMed',
  'Beam' = 'Beam',
  'Blue Cross Blue Shield' = 'Blue Cross Blue Shield',
  'BEST Life and Health Insurance Company' = 'BEST Life and Health Insurance Company',
  'BMC HealthNet' = 'BMC HealthNet',
  'Bright Health Plan' = 'Bright Health Plan',
  'CalChoice' = 'CalChoice',
  'Capital Health Plan' = 'Capital Health Plan',
  'CareFirst' = 'CareFirst',
  'Chinese Community Health Plan' = 'Chinese Community Health Plan',
  'Cigna' = 'Cigna',
  'Coventry' = 'Coventry',
  'Cox Health Systems Insurance Company' = 'Cox Health Systems Insurance Company',
  'CoveredCA' = 'CoveredCA',
  'EmblemHealth' = 'EmblemHealth',
  'Fallon Health' = 'Fallon Health',
  'Friday Health Plans' = 'Friday Health Plans',
  'FirstCarolinaCare Insurance Company' = 'FirstCarolinaCare Insurance Company',
  'Group Health Cooperative' = 'Group Health Cooperative',
  'Guardian' = 'Guardian',
  'Health Benefit Alliance' = 'Health Benefit Alliance',
  'Harvard Pilgrim' = 'Harvard Pilgrim',
  'HealthFirst' = 'HealthFirst',
  'HealthKeepers' = 'HealthKeepers',
  'HealthPartners' = 'HealthPartners',
  'Health First Health Plans' = 'Health First Health Plans',
  'Health Net' = 'Health Net',
  'HNE' = 'HNE',
  'Humana' = 'Humana',
  'Innovation Health' = 'Innovation Health',
  'Kaiser Permanente' = 'Kaiser Permanente',
  'Medi-Excel' = 'Medi-Excel',
  'Medica' = 'Medica',
  'Medical Mutual' = 'Medical Mutual',
  'MercyCare Health Plans' = 'MercyCare Health Plans',
  'MetLife' = 'MetLife',
  'MetroPlus Health Plan' = 'MetroPlus Health Plan',
  'Minuteman Health' = 'Minuteman Health',
  'Optima Health' = 'Optima Health',
  'Oscar' = 'Oscar',
  'Oxford' = 'Oxford',
  'Paramount Insurance' = 'Paramount Insurance',
  'Piedmont HealthCare' = 'Piedmont HealthCare',
  'Principal' = 'Principal',
  'Prosper' = 'Prosper',
  'Renaissance Life & Health Insurance Company of America' = 'Renaissance Life & Health Insurance Company of America',
  'Sharp Health Plan' = 'Sharp Health Plan',
  'Sidecar Health' = 'Sidecar Health',
  'SummaCare' = 'SummaCare',
  'Sutter Health Plus' = 'Sutter Health Plus',
  'The Health Plan' = 'The Health Plan',
  'Tufts Health Plan' = 'Tufts Health Plan',
  'United Healthcare' = 'United Healthcare',
  'UnitedHealthcare' = 'UnitedHealthcare',
  'Unum' = 'Unum',
  'Western Health Advantage' = 'Western Health Advantage',
  'WMI Mutual Insurance Company' = 'WMI Mutual Insurance Company'
}

export function isAllstate(carrier: string): boolean {
  return carrier === Carriers['Allstate Benefits']
}

function isApex(carrier: string): boolean {
  return carrier === Carriers['Apex Management Group']
}

export function isHBA(carrier: string): boolean {
  return carrier === Carriers['Health Benefit Alliance']
}

export function isABC(carrier: string): boolean {
  return carrier === Carriers['ABC Insurance Trust']
}

export function extractPlanNameAndCarrier(plan: PlanUnion) {
  let name: string
  let carrier: string
  if (isAncillaryPlanUnion(plan)) {
    name = plan.plan.name
    carrier = plan.plan.carrier
  } else {
    name = plan.name
    carrier = plan.carrier
  }
  return { name: massagedPlanName(name, carrier), carrier }
}

export function massagedPlanName(planName: string, carrier: string) {
  if (isAllstate(carrier)) {
    let p = planName
    // Separating this incase plan names change for some reason in the future
    p = p.replace('National General ', '')
    p = p.replace('Benefits Solutions ', '')
    p = p.replace('Benefit Solutions ', '')
    return p
  }

  return planName
}

export function getPlanIDFrom(plan: PlanUnion) {
  return isAncillaryPlanUnion(plan) ? plan.plan.id : plan.id
}

export function typeOfPlan(plan: PlanUnion) {
  if (isAncillaryPlanUnion(plan)) {
    if (isDental(plan.plan)) return GroupPlanType.dental
    if (isVision(plan.plan)) return GroupPlanType.vision
    if (isLife(plan.plan)) return GroupPlanType.life
    if (isLTD(plan.plan)) return GroupPlanType.disability
    if (isSupplemental(plan.plan)) return plan.plan.type
  }
  return GroupPlanType.medical
}

export function logoFor(carrier: string, planName?: string) {
  // Assuming that a logo has been added for every entry in Carriers and is named correctly
  if (carrier in Carriers) {
    const src = `${process.env.PUBLIC_URL}/carrier-logos/${kebabCase(carrier)}-logo`
    const carrierLabel = planName && planName.match(/^AllSavers/) && 'Medically Underwritten'
    const alt = carrierLabel ? `${carrier} ${carrierLabel}` : ''
    const height = logoHeightFor(carrier as Carriers)
    return <span data-carrier-label={carrierLabel} style={{ display: 'inline-block' }}><Img src={[src + '.svg', src + '.png']} height={height} width='auto' alt={alt}/></span>
  }
  api.v3.panic({ msg: `No logo for carrier: ${carrier}` }).catch(console.error)
  return undefined
}

enum AllstateNetwork {
  posII = 'Aetna Choice POS II',
  signaturesAdministrators = 'Aetna Signature Administrators',
  oap = 'Cigna OAP',
  noNetwork = 'No network'
}

function networkForAllstatePlan(carrier: string, planName: string) {
  if (carrier !== Carriers['Allstate Benefits']) { return }
  planName = planName.toUpperCase().replace(/\s+/g, '')
  switch (true) {
  case planName.includes(Carriers.Aetna.toUpperCase()) && (planName.includes('POSII') || planName.includes('POS2')) :
    return AllstateNetwork.posII
  case planName.includes(Carriers.Aetna.toUpperCase()) && planName.includes(['Signature', 'Administrators'].join('').toUpperCase()):
    return AllstateNetwork.signaturesAdministrators
  case planName.includes(Carriers.Cigna.toUpperCase()) && planName.includes('OAP') :
    return AllstateNetwork.oap
  default:
    return AllstateNetwork.noNetwork // Incase we have plan without a network case
  }
}

function allstateNetworks(plans: MedicalPlan[]) {
  const allstatePlans = plans.filter(p => p.carrier === Carriers['Allstate Benefits'])
  return new Set(allstatePlans.map(p => networkForAllstatePlan(p.carrier, p.name)).sort())
}

function logoHeightFor(carrier: Carriers): number {
  switch (carrier) {
  case Carriers['BEST Life and Health Insurance Company']:
  case Carriers.Oscar:
    return 18
  case Carriers.Aetna:
  case Carriers.Anthem:
  case Carriers.CareFirst:
  case Carriers['Kaiser Permanente']:
  case Carriers.Medica:
  case Carriers.MetLife:
    return 20
  case Carriers['Blue Cross Blue Shield']:
  case Carriers.Guardian:
  case Carriers.HealthFirst:
  case Carriers.HNE:
  case Carriers.Humana:
  case Carriers['MercyCare Health Plans']:
  case Carriers.Unum:
    return 25
  case Carriers['AllWays Health Partners']:
  case Carriers['Apex Management Group']:
  case Carriers.CalChoice:
  case Carriers.Cigna:
  case Carriers['Cox Health Systems Insurance Company']:
  case Carriers['FirstCarolinaCare Insurance Company']:
  case Carriers['Friday Health Plans']:
  case Carriers['Group Health Cooperative']:
  case Carriers['Harvard Pilgrim']:
  case Carriers.HealthPartners:
  case Carriers['MetroPlus Health Plan']:
  case Carriers['Minuteman Health']:
  case Carriers['Optima Health']:
  case Carriers.Oxford:
  case Carriers['Renaissance Life & Health Insurance Company of America']:
  case Carriers['Sutter Health Plus']:
  case Carriers['Tufts Health Plan']:
  case Carriers.UnitedHealthcare:
  case Carriers['United Healthcare']:
    return 30
  case Carriers['Alliant Health Plans']:
    return 40
  case Carriers['Allstate Benefits']:
  case Carriers['Fallon Health']:
  case Carriers['Health Benefit Alliance']:
    return 45
  case Carriers.Principal:
  case Carriers.Prosper:
  default:
    return 35
  }
}

export enum FundingType {
  mec = 'Minimum Essential Coverage', // Minimum Essential Coverage Plans such as Apex plans
  levelFunded = 'Medically Underwritten', // Level Funded Plans such as NatGen plans
  fullyFunded = 'Fully Insured', // Fully Funded Plans, your usual plans
  alternative = 'Alternative', // Sidecar, others?
  hsa = 'HSA', // Plans that are HSA-eligible
}

export function fundingTypeFor(plan: MedicalPlan) {
  if (plan.isLevelFunded) {
    return FundingType.levelFunded
  } else if (isApex(plan.carrier) || (isHBA(plan.carrier) && plan.name.includes('MEC'))) {
    return FundingType.mec
  } else if (plan.carrier === Carriers['Sidecar Health']) {
    return FundingType.alternative
  } else {
    return FundingType.fullyFunded
  }
}

export interface PremiumSplits {
  er: string
  ee: string
}

export function tierMarketingCopy(tier: Tier) {
  switch (tier) {
  case Tier.individual:
    return 'Individual'
  case Tier.singleParent:
    return 'Employee/Child'
  case Tier.couple:
    return 'Couple'
  case Tier.family:
    return 'Family'
  }
}

export function extractPremiumsByTier(plan: PlanUnion) {
  if (!isAncillaryPlanUnion(plan)) return { individual: '', couple: '', singleParent: '', family: '' }

  return {
    individual: moneyString(plan.rate.individual, 0),
    couple: moneyString(plan.rate.couple, 0),
    singleParent: moneyString(plan.rate.singleParent, 0),
    family: moneyString(plan.rate.family, 0)
  }
}

const areSameCarrier = (plans: MedicalPlan[]) => uniq(plans.map(p => p.carrier)).length < 2
const areSameFundingType = (plans: MedicalPlan[]) => uniq(plans.map(fundingTypeFor)).length < 2
const maxERPlansAllowed = (carrier: string, memberCount: number) => isAllstate(carrier) ? memberCount < 3 ? 1 : 2 : 3

export function planSelectionStateFor(plans: MedicalPlan[], members: Member[]): { state: PlanSelectionsState, message?: string | React.ReactNode } {
  if (!plans.length) return { state: PlanSelectionsState.noPlans, message: 'You must select a plan to continue.' }
  const selectedTypes = uniq(plans.map(fundingTypeFor))
  if (!areSameFundingType(plans)) {
    const fundingTypesCopy = selectedTypes.slice(0, selectedTypes.length - 1).join(', ') + ', and ' + selectedTypes.slice(-1)
    return {
      state: PlanSelectionsState.differentFundingTypes,
      message: `You cannot pick ${fundingTypesCopy} plans simultaneously.`
    }
  }
  if (!areSameCarrier(plans)) {
    return {
      state: PlanSelectionsState.differentCarriers,
      message: 'Plans must be from the same carrier.'
    }
  }
  const networks = allstateNetworks(plans)
  if (networks.size > 1) {
    const n = Array.from(networks)
    const networksCopy = n.slice(0, n.length - 1).join(', ') + ', or ' + n.slice(-1)
    return {
      state: PlanSelectionsState.differentAllstateNetworks,
      message: `Plans must be from one of the following: ${networksCopy}.`
    }
  }

  const selectedCarrier = plans[0].carrier
  const maxPlansAllowed = maxERPlansAllowed(selectedCarrier, members.filter(m => !m.is_waived).length)
  if (plans.length > maxPlansAllowed) {
    const plansCopy = `plan${maxPlansAllowed !== 1 ? 's' : ''}`
    if (isAllstate(selectedCarrier)) {
      return {
        state: PlanSelectionsState.tooManyPlans,
        message: <>Due to your group size, you can select at most <span>{maxPlansAllowed} {plansCopy}</span> from <span>{selectedCarrier}</span>.</>
      }
    } else {
      return {
        state: PlanSelectionsState.tooManyPlans,
        message: <>You can select at most <span>{maxPlansAllowed} {plansCopy}</span> from <span>{selectedCarrier}</span>.</>
      }
    }
  }

  return { state: PlanSelectionsState.valid }
}
