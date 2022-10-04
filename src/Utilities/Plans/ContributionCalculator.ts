import { MedicalPlan, Tier, TieredRates, Relationship } from 'Utilities/pharaoh.types'
import { Member, ContributionSplit } from 'Utilities/Hooks/useStargate'
import DentalPlan, { isDental } from 'Components/Plans/DentalPlan/index.helpers'
import VisionPlan, { isVision } from 'Components/Plans/VisionPlan/index.helpers'
import LifePlan, { isLife } from 'Components/Plans/LifePlan/index.helpers'
import LTDPlan, { isLTD } from 'Components/Plans/LTDPlan/index.helpers'
import { centsFormat, dollarsFormat, isDollar, isPercentage } from './PlanCostUtils'
import { reduce, flatten, zip, meanBy } from 'lodash'
import numeral from 'numeral'
import { getPlanIDFrom, typeOfPlan } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { $enum } from 'ts-enum-util'

export enum EnrolleeType {
  employee = 'employee',
  spouse = 'spouse',
  children = 'children'
}

export enum GroupPlanType {
  medical = 'medical',
  dental = 'dental',
  vision = 'vision',
  life = 'life',
  disability = 'disability',
  prosper = 'prosper'
}

export type Contributions = {
  baseContributions: BaseContributions
  splitContributions?: SplitContribution[]
  planContributions: GroupPlanContributions[]
}

type Contribution = {
  fixed: string
  [EnrolleeType.employee]?: never
  [EnrolleeType.spouse]?: never
  [EnrolleeType.children]?: never
} | {
  fixed?: never
  [EnrolleeType.employee]?: string
  [EnrolleeType.spouse]?: string
  [EnrolleeType.children]?: string
 }

export type BaseContributions = {
  medical?: string
  medicalEquitable: boolean
  dental?: string
  dentalEquitable: boolean
  vision?: string
  visionEquitable: boolean
  life?: string
  lifeEquitable: boolean
  disability?: string
  disabilityEquitable: boolean
  majorCancer?: string
  majorCancerEquitable: boolean
  accident?: string
  accidentEquitable: boolean
  allAncillary?: string
}

type SplitContribution = {
  id: string
  baseContributions: BaseContributions
  planContributions: GroupPlanContributions[]
}

export type GroupPlanContributions = {
  id?: string
  groupID: string
  groupPlanID: string
  splitID?: string
  planType: GroupPlanType
  [Tier.individual]?: string
  [Tier.couple]?: string
  [Tier.singleParent]?: string
  [Tier.family]?: string
  [EnrolleeType.employee]?: string
  [EnrolleeType.spouse]?: string
  [EnrolleeType.children]?: string
}

type Premium = {
  total: number
  er: number
  ee: number
}

export type MemberPlus = Member & {
  ssn?: string
  medical?: PlanUnion
  dental?: PlanUnion
  vision?: PlanUnion
  life?: PlanUnion
  disability?: PlanUnion
  prosper?: string
}

export type AncillaryPlanUnion = { rate: TieredRates, plan: DentalPlan | VisionPlan | LifePlan | LTDPlan }
export type PlanUnion = AncillaryPlanUnion | MedicalPlan
type NumberMemberPremium = { [key in EnrolleeType]?: number }

export default class ContributionsCalculator {
  medicalPlans: MedicalPlan[]
  dentalPlans: AncillaryPlanUnion[]
  visionPlans: AncillaryPlanUnion[]
  lifePlans: AncillaryPlanUnion[]
  disabilityPlans: AncillaryPlanUnion[]
  contributions: Contributions
  splits: ContributionSplit[]
  members: Member[]
  nonWaivedMembers: Member[]
  precision: number
  applyCustomPlanContributions: boolean // Use this if you want to ignore any applicable customPlanContributions

  constructor(plans: PlanUnion[], contributions: Contributions, splits: ContributionSplit[], members: Member[], precision = 0, applyCustomPlanContributions = true) {
    this.contributions = contributions
    this.splits = splits
    this.members = members
    this.nonWaivedMembers = members.filter(m => !m.is_waived)
    this.precision = precision
    this.applyCustomPlanContributions = applyCustomPlanContributions

    this.medicalPlans = plans.filter(isMedical) as MedicalPlan[]
    const ancillaryPlans = plans.filter(isAncillaryPlanUnion) as AncillaryPlanUnion[]
    this.dentalPlans = ancillaryPlans.filter(p => isDental(p.plan))
    this.visionPlans = ancillaryPlans.filter(p => isVision(p.plan))
    this.lifePlans = ancillaryPlans.filter(p => isLife(p.plan))
    this.disabilityPlans = ancillaryPlans.filter(p => isLTD(p.plan))
  }

  baseContributions = (plan: PlanUnion, split?: ContributionSplit): BaseContributions => {
    if (isAncillaryPlanUnion(plan) || !split) return this.contributions.baseContributions
    const base = this.contributions.splitContributions?.find(s => s.id === split?.id)?.baseContributions
    const defaultBase = {
      medical: '0%',
      medicalEquitable: false,
      dentalEquitable: false,
      visionEquitable: false,
      lifeEquitable: false,
      disabilityEquitable: false,
      majorCancerEquitable: false,
      accidentEquitable: false
    }

    return base || defaultBase
  }

  shouldUseTiered = (plan: PlanUnion, split?: ContributionSplit) => {
    const base = this.baseContributions(plan, split)
    const planType = typeOfPlan(plan)

    switch (planType) {
    case GroupPlanType.medical:
      return showTier(base.medicalEquitable, base.medical)
    case GroupPlanType.dental:
      return showTier(base.dentalEquitable, base.dental)
    case GroupPlanType.vision:
      return showTier(base.visionEquitable, base.vision)
    case GroupPlanType.life:
      return showTier(base.lifeEquitable, base.life)
    case GroupPlanType.disability:
      return showTier(base.disabilityEquitable, base.disability)
    }

    function showTier(isEquitable: boolean, contribution?: string): boolean {
      return isDollar(contribution) || isEquitable
    }
  }

  premiums = (plans: PlanUnion[], onlyNonSplitMembers = true, members = this.nonWaivedMembers, split?: ContributionSplit): Premium => {
    members = this.filterSplits(members, split, onlyNonSplitMembers)
    if (!members.length) return this.premium(0, 0)

    const total = this.sum(flatten(members.map(m => plans.map(p => this.premiumForMemberForPlan(m, p)))))
    const er = this.sum(flatten(members.map(m => plans.map(p => this.applyContributionForMemberForPlan(m, p)))))
    return this.premium(total, er)
  }

  avgPremiums = (plans: PlanUnion[], onlyNonSplitMembers = true, members = this.nonWaivedMembers, split?: ContributionSplit): Premium => {
    if (!members.length) { return this.premium(0, 0) }
    const premium = this.premiums(plans, onlyNonSplitMembers, members, split)
    const total = premium.total / members.length
    const er = premium.er / members.length
    return this.premium(total, er)
  }

  premiumsForMedical = (split?: ContributionSplit, onlyNonSplitMembers = true): Premium => {
    if (!this.medicalPlans.length) { return this.premium(0, 0) }
    const premium = this.premiums(this.medicalPlans, onlyNonSplitMembers, this.nonWaivedMembers, split)
    const total = premium.total / this.medicalPlans.length
    const er = premium.er / this.medicalPlans.length
    return this.premium(total, er)
  }

  // TODO use `allAncillaryContributionEligibleLines` here
  premiumsForAncillary = () => {
    const { allAncillary } = this.contributions.baseContributions

    if (allAncillary) {
      const premiums = this.nonWaivedMembers.map(m => {
        const dental = this.dentalPlans.map(p => this.premiums([p], false, [m]))
        const vision = this.visionPlans.map(p => this.premiums([p], false, [m]))
        const life = this.lifePlans.map(p => this.premiums([p], false, [m]))
        const disability = this.disabilityPlans.map(p => this.premiums([p], false, [m]))

        let eligibleTotal = meanBy(dental, p => p.total) || 0
        eligibleTotal += meanBy(vision, p => p.total) || 0

        let total = eligibleTotal
        total += meanBy(life, p => p.total) || 0
        total += meanBy(disability, p => p.total) || 0

        let er = eligibleTotal < moneyNumber(allAncillary) ? eligibleTotal : moneyNumber(allAncillary)
        er += meanBy(life, p => p.er) || 0
        er += meanBy(disability, p => p.er) || 0

        return this.premium(total, er)
      })

      return this.premium(this.sum(premiums.map(p => p.total)), this.sum(premiums.map(p => p.er)))
    }

    const dental = this.dentalPlans.map(p => this.premiums([p], false))
    const vision = this.visionPlans.map(p => this.premiums([p], false))
    const life = this.lifePlans.map(p => this.premiums([p], false))
    const disability = this.disabilityPlans.map(p => this.premiums([p], false))

    let total = meanBy(dental, p => p.total) || 0
    total += meanBy(vision, p => p.total) || 0
    total += meanBy(life, p => p.total) || 0
    total += meanBy(disability, p => p.total) || 0

    let er = meanBy(dental, p => p.er) || 0
    er += meanBy(vision, p => p.er) || 0
    er += meanBy(life, p => p.er) || 0
    er += meanBy(disability, p => p.er) || 0

    return this.premium(total, er)
  }

  premiumsForPlanForTier = (plan: PlanUnion, tier: Tier, split?: ContributionSplit, onlyNonSplitMembers = true): Premium =>
    this.premiums([plan], onlyNonSplitMembers, this.nonWaivedMembers.filter(m => m.tier === tier), split)

  avgPremiumsForPlanForTier = (plan: PlanUnion, tier: Tier, split?: ContributionSplit, onlyNonSplitMembers = true): Premium => {
    const members = this.filterSplits(this.nonWaivedMembers.filter(m => m.tier === tier), split, onlyNonSplitMembers)
    if (!members.length) { return this.premium(0, 0) }
    const premiums = this.premiumsForPlanForTier(plan, tier, split, onlyNonSplitMembers)
    return this.premium(premiums.total / members.length, premiums.er / members.length)
  }

  premiumsForPlanForEnrolleeType = (plan: PlanUnion, enrolleeType: EnrolleeType, split?: ContributionSplit, onlyNonSplitMembers = true): Premium => {
    const members = this.filterSplits(this.nonWaivedMembers, split, onlyNonSplitMembers)
    if (!members.length) return this.premium(0, 0)
    const contributions = members.map(m => this.contributionForMemberForPlan(m, plan)).map(c => c[enrolleeType])
    const memberPremiums = members.map(m => this.memberPremiumForPlan(m, plan)).map(mp => mp[enrolleeType])
    const total = this.sum(memberPremiums)
    const er = this.sum(zip(contributions, memberPremiums).map(z => this.percent(z[0], z[1])))

    return this.premium(total, er)
  }

  avgPremiumsForPlanForEnrolleeType = (plan: PlanUnion, enrolleeType: EnrolleeType, split?: ContributionSplit, onlyNonSplitMembers = true): Premium => {
    const members = this.numberOf(enrolleeType, split, onlyNonSplitMembers)
    if (!members) return this.premium(0, 0)
    const premiums = this.premiumsForPlanForEnrolleeType(plan, enrolleeType, split, onlyNonSplitMembers)

    return this.premium((premiums?.total || 0) / members, (premiums?.er || 0) / members)
  }

  premiumsFor = (member: MemberPlus) => {
    if (!this.members.some(m => m.id === member.id)) {
      console.error('Member not found in members roster')
      return
    }

    const premiumForType = (member: MemberPlus, plan?: PlanUnion): Premium | undefined => {
      if (!plan) return
      const planType = typeOfPlan(plan)
      const { allAncillary } = this.contributions.baseContributions

      if (allAncillaryContributionEligibleLines().has(planType) && allAncillary) {
        const contribution = moneyNumber(allAncillary)
        let dentalCost = 0
        if (member.dental) {
          const dentalPlan = member.dental
          dentalCost = dentalPlan ? this.premiums([dentalPlan], false, [member]).total : 0
        }

        if (planType === GroupPlanType.dental) {
          return dentalCost > contribution
            ? this.premium(dentalCost, contribution)
            : this.premium(dentalCost, contribution - dentalCost)
        } else {
          const visionCost = this.premiums([plan], false, [member]).total
          return dentalCost > contribution
            ? this.premium(visionCost, 0)
            : dentalCost + visionCost > contribution
              ? this.premium(visionCost, dentalCost + visionCost - contribution)
              : this.premium(visionCost, visionCost)
        }
      }

      return this.premiums([plan], false, [member])
    }

    return {
      medical: premiumForType(member, member.medical),
      dental: premiumForType(member, member.dental),
      vision: premiumForType(member, member.vision),
      life: premiumForType(member, member.life),
      disability: premiumForType(member, member.disability),
      prosper: member.medical ? this.premium(0, 0) : member.prosper ? this.premium(moneyNumber(member.prosper), 0) : undefined
    }
  }

  numberOf = (type: EnrolleeType | Tier, split?: ContributionSplit, onlyNonSplitMembers = true) => {
    const members = this.filterSplits(this.nonWaivedMembers, split, onlyNonSplitMembers)
    if ($enum(Tier).isKey(type)) {
      return members.filter(m => m.tier === type).length || 0
    } else {
      let enrolleeCount = 0
      if (type === EnrolleeType.employee) {
        enrolleeCount = members.length
      } else if (type === EnrolleeType.spouse) {
        enrolleeCount = members.filter(m => m.dependents.some(d => d.relationship !== Relationship.child)).length
      } else if (type === EnrolleeType.children) {
        members.forEach(m => (enrolleeCount += m.dependents.filter(d => d.relationship === Relationship.child).length))
      }
      return enrolleeCount
    }
  }

  filterSplits = (members: Member[], split?: ContributionSplit, onlyNonSplitMembers = true) => {
    if (split) return members.filter(m => split.members.some(sm => sm === m.id))
    if (onlyNonSplitMembers) return members.filter(m => !this.splits.some(s => s.members.some(sm => sm === m.id)))
    return members
  }

  premiumForMemberForPlan = (member: Member, plan: PlanUnion): number =>
    reduce(this.memberPremiumForPlan(member, plan), (sum, next) => sum + (next || 0), 0)

  memberPremiumForPlan = (member: Member, plan: PlanUnion): NumberMemberPremium => {
    if (isMedical(plan)) {
      const mp = plan.memberPremiums?.premiums.find(mp => mp.memberID === member.id)
      return mp
        ? {
          employee: moneyNumber(mp.insured_premium, this.precision),
          spouse: moneyNumber(mp.spouse_premium, this.precision),
          children: moneyNumber(mp.children_premium, this.precision)
        }
        : memberPremiumFromTieredRates(plan.premium.employee, this.precision)
    }
    return memberPremiumFromTieredRates(plan.rate, this.precision)

    function memberPremiumFromTieredRates(rates: TieredRates, precision = 0): NumberMemberPremium {
      const hasSpouse = member.dependents.some(d => d.relationship !== Relationship.child)
      const hasChildren = member.dependents.some(d => d.relationship === Relationship.child)

      const individual = moneyNumber(rates.individual, precision)
      const couple = moneyNumber(rates.couple, precision)
      const singleParent = moneyNumber(rates.singleParent, precision)
      const family = moneyNumber(rates.family, precision)

      let employee = 0
      let spouse = 0
      let children = 0

      /*
        Fuck these edge cases, but the alternative is showing them wildly incorrect or negative amounts.
        These situations usually only come up if the plan has MemberPremiums but we don't have access to them
        so you should mostly never have to deal with them, but who the hell knows. Lets try to get closeish.
      */

      // Assumption: if a group has members in a certain tier, we have a rate for them.
      if (hasSpouse && hasChildren) { // Family
        if (individual && couple && singleParent && individual < couple && individual < singleParent) {
          const total = couple + singleParent - individual // reduced version of ee + sp - ee + ch - ee
          const factor = (family - individual) / (total - individual) // Accounting for differences between lower 3 tiered rates and family rates
          employee = individual // Do not apply factor to employee amount so the same so that it shows the same contribution value for all tiers when applying %employee math
          spouse = (couple - individual) * factor
          children = (singleParent - individual) * factor
        } else {
          employee = family / 3
          spouse = family / 3
          children = family / 3
        }
      } else if (hasSpouse) { // Couple
        if (individual < couple) { // If individual rate is more expensive than couple rate
          employee = individual
          spouse = couple - individual
        } else {
          employee = couple / 2
          spouse = couple / 2
        }
      } else if (hasChildren) { // EE + Child(ren)
        if (individual < singleParent) { // If individual is more expensive than singleParent rate
          employee = individual
          children = singleParent - individual
        } else {
          employee = singleParent / 2
          children = singleParent / 2
        }
      } else { // Individual
        employee = individual
      }

      return { employee, spouse, children }
    }
  }

  contributionForMemberForPlan = (member: Member, plan: PlanUnion): Contribution => {
    const planType = typeOfPlan(plan)
    const planID = getPlanIDFrom(plan)

    const split = planType === GroupPlanType.medical ? this.splits.find(s => s.members.some(m => m === member.id)) : undefined
    const sc = this.contributions.splitContributions?.find(s => s.id === split?.id)
    const bc = this.baseContributions(plan, split)
    const gpc = split ? sc?.planContributions || [] : this.contributions.planContributions
    const custom = this.applyCustomPlanContributions ? gpc.find(p => p.groupPlanID === planID) : undefined

    // if the line is eligible for All Ancillary, the amount ER Share is $0 because the amount is dependent on other lines
    // That math is done in `premiumsForAncillary`
    if (bc.allAncillary && allAncillaryContributionEligibleLines().has(planType)) return { fixed: '$0' }

    let contribution: Contribution

    switch (planType) {
    case GroupPlanType.medical:
      contribution = this.mangleContribution(member, bc?.medical, !!bc?.medicalEquitable, custom)
      break
    case GroupPlanType.dental:
      contribution = this.mangleContribution(member, bc?.dental, !!bc?.dentalEquitable, custom)
      break
    case GroupPlanType.vision:
      contribution = this.mangleContribution(member, bc?.vision, !!bc?.visionEquitable, custom)
      break
    case GroupPlanType.life:
      contribution = this.mangleContribution(member, bc?.life, !!bc?.lifeEquitable, custom)
      break
    case GroupPlanType.disability:
      contribution = this.mangleContribution(member, bc?.disability, !!bc?.disabilityEquitable, custom)
      break
    }

    return contribution
  }

  mangleContribution = (member: Member, base = '0%', baseEquitable: boolean, custom?: GroupPlanContributions): Contribution => {
    const def = isDollar(base) ? '$0' : '0%'

    // Need to do this so we know we "have" a custom group plan contribution on the `/contributions` page
    const hasCustom = shouldApplyCustom(custom, base, baseEquitable)

    if (!hasCustom) {
      if (isDollar(base)) return { fixed: base }
      return {
        employee: base,
        spouse: baseEquitable ? base : def,
        children: baseEquitable ? base : def
      }
    }

    if (isPercentage(base) && !baseEquitable) {
      return {
        employee: custom?.employee || '0%',
        spouse: custom?.spouse || '0%',
        children: custom?.children || '0%'
      }
    }

    if (isDollar(base)) {
      return { fixed: custom ? custom[member.tier] : def }
    }

    switch (member.tier) {
    case Tier.individual:
      return { employee: custom?.individual || def }
    case Tier.singleParent:
      return {
        employee: custom?.singleParent || def,
        children: custom?.singleParent || def
      }
    case Tier.couple:
      return {
        employee: custom?.couple || def,
        spouse: custom?.couple || def
      }
    case Tier.family:
      return {
        employee: custom?.family || def,
        spouse: custom?.family || def,
        children: custom?.family || def
      }
    }
  }

  applyContributionForMemberForPlan = (member: Member, plan: PlanUnion) => {
    if (member.is_waived) return 0

    const contribution = this.contributionForMemberForPlan(member, plan)
    const memberPremium = this.memberPremiumForPlan(member, plan)

    let amountContributed: number
    const total = this.sum([memberPremium.employee, memberPremium.spouse, memberPremium.children])

    if (isDollar(contribution.fixed)) {
      amountContributed = numeral(contribution.fixed).value()
    } else {
      amountContributed = this.percent(contribution.employee, memberPremium.employee) +
        this.percent(contribution.spouse, memberPremium.spouse) +
        this.percent(contribution.children, memberPremium.children)
    }

    if (amountContributed < 0) amountContributed = 0
    if (total < amountContributed) return total
    return amountContributed
  }

  percent = (amount = '0%', premium = 0) => {
    if (!isPercentage(amount)) amount = '0%'
    return numeral(amount).multiply(premium).value()
  }

  sum = (nums: (number | undefined)[]) => reduce(nums, (total, next) => total + (next || 0), 0)

  premium = (total: number, er: number): Premium => ({ total, er, ee: total - er })

  hasCustomPlanContributionFor = (plan: PlanUnion) => {
    return this.applyCustomPlanContributions && hasCustomPlanContributionFor(plan, this.contributions)
  }

  customPlanContributionFor = (plan: PlanUnion, split?: ContributionSplit) => {
    const id = getPlanIDFrom(plan)
    if (split) {
      const sc = this.contributions.splitContributions?.find(sc => sc.id === split.id)
      const spc = sc?.planContributions.find(spc => spc.groupPlanID === id)
      return spc
    }
    return this.contributions.planContributions.find(pc => pc.groupPlanID === id)
  }
}

export function isAncillaryPlanUnion(obj: PlanUnion): obj is AncillaryPlanUnion {
  return !!(obj as any)?.plan
}

export function isMedical(obj: PlanUnion): obj is MedicalPlan {
  return !isAncillaryPlanUnion(obj)
}

export function moneyString(rawInput: string | number | undefined, precision = 0) {
  if (rawInput === 0) {
    return '$0'
  }
  const value = moneyNumber(rawInput, precision)
  const format = precision === 0 ? dollarsFormat : centsFormat
  const outputStr = numeral(value).format(format)

  return outputStr
}

export function moneyWeekly(rawInput: string | number | undefined, precision = 0) {
  return moneyString(moneyNumber(rawInput, precision) * 12 / 52, precision)
}

export function moneyNumber(rawInput: string | number | undefined, precision = 0): number {
  if (rawInput === undefined || rawInput === null || rawInput === '') return 0
  let value
  const tenPower = Math.pow(10, precision)
  value = numeral(rawInput).multiply(tenPower).value()
  value = Math.ceil(value) / tenPower
  return value
}

export function contributionFor(type: GroupPlanType, base?: BaseContributions) {
  return {
    contribution: base ? (base as any)[`${type}`] : '0%',
    equitable: base ? (base as any)[`${type}Equitable`] : false
  }
}

export function allAncillaryContributionEligibleLines() {
  return new Set([GroupPlanType.dental, GroupPlanType.vision])
}

export function hasCustomPlanContributionFor(plan: PlanUnion, contributions: Contributions) {
  const id = getPlanIDFrom(plan)
  if (isAncillaryPlanUnion(plan) && contributions.baseContributions.allAncillary) return false
  const basePC = contributions.planContributions.find(pc => pc.groupPlanID === id)
  if (basePC) {
    const base = contributionFor(typeOfPlan(plan), contributions.baseContributions)
    return shouldApplyCustom(basePC, base.contribution, base.equitable)
  }

  const pcs = (contributions.splitContributions || []).map(sc => {
    const base = contributionFor(typeOfPlan(plan), sc.baseContributions)
    const scp = sc.planContributions.find(scp => scp.groupPlanID === id)
    return shouldApplyCustom(scp, base.contribution, base.equitable)
  })
  return pcs.some(pc => !!pc)
}

function shouldApplyCustom(custom?: GroupPlanContributions, base = '0%', baseEquitable = false) {
  let hasCustom = !!custom
  if (hasCustom) {
    if (!baseEquitable && !isDollar(base)) {
      hasCustom = [custom?.employee, custom?.spouse, custom?.children].some(c => isPercentage(c))
    } else {
      const contributions = [custom?.individual, custom?.couple, custom?.singleParent, custom?.family]
      if (
        (isDollar(base) && !contributions.some(c => isDollar(c))) ||
        (baseEquitable && !contributions.some(c => isPercentage(c)))
      ) {
        hasCustom = false
      }
    }
  }
  return hasCustom
}

export function formatAllAncillaryInput(input: string) {
  const value = numeral(input).value()
  return value != null && value >= 0 ? input : ''
}
