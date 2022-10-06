import * as api from 'Utilities/fetch++'
import { useAsync, useLocation } from 'react-use'
import { Tier, Relationship, EnrollmentStatus, MaritalStatus, Contact, MedicalPlan, StandaloneProsper, PipelineStatus } from 'Utilities/pharaoh.types'
import { Route as RaRoute } from 'Utilities/Route'
import { utcMidnightToLocalMidnight, getToken } from 'Utilities/pharaoh'
import { PowerLevel } from './useUser'
import { AsyncState } from 'react-use/lib/useAsync'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'
import { useHistory } from 'react-router-dom'
import { Label, longTitle } from 'Utilities/config'
import moment from 'moment'
import { SidecarApplicationState } from 'Routes/shop/employee/plans/application/SidecarEEApplication'
import { Contributions } from 'Utilities/Plans/ContributionCalculator'

/* eslint-disable camelcase */

// globally promise this immutable data for /dashboard/employer routes

interface RawStargateResponse {
  group?: Group
  members: Member[]
  associationIds: string[]
  planIds: string[]
  nonWaivedMemberCount?: number
  isProsperOnlyMode?: boolean
  user: User
  dependents?: Dependent[]
  groupMember?: GroupMember
  userMetadata?: UserMetadata
  consumerProfile?: ConsumerProfile
  mode: Mode
  userTier?: Tier
  splits: ContributionSplit[]
  contributions?: Contributions
  eePaymentInfoReceived: boolean
  payment: Payment
  contact: Contact

  eeSouvenirSent: boolean
  erSouvenirSent: boolean

  isLevelFundedGroup: boolean
  imqsSent: boolean
  membersCompletedTheirIMQs: boolean
  showUnderwritingPage: boolean
  showRedflagsPage: boolean
  hasActiveQLE: boolean
  hasAllstate: boolean // TODO Remove
  mqType: MQType
  selectedCarriers: string[]
  planSelectionsState: PlanSelectionsState

  groupIsStale: boolean

  carrierSpecificData?: CarrierSpecificData
  carrierApplicationData?: CarrierApplicationData

  label: Label
  obelisk: Obelisk
  agency?: Agency
}

export enum MQType {
  allstate = 'allstate',
  hba = 'hba',
  none = 'none',
}

interface Obelisk {
  logo: string
  slug: string
  name: string
}

export interface Agency {
  name: string
  legalName?: string
  phone?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  slug: string
  nipr?: string
  contactFirstName?: string
  contactLastName?: string
  contactEmail?: string
  contactPhone?: string
  deltaPSID?: string
  id: string
  landing: Landing
}

export interface Landing {
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  calendly: string
  website?: string
  additionalText?: string
  agencyId?: string
}

interface CarrierSpecificData {
  sidecar?: SidecarData
  prosper?: StandaloneProsper
}

interface SidecarData {
  applicationState: SidecarApplicationState
  medicalHistoryComplete: boolean
}

interface CarrierApplicationData {
  showDocuSignForm: boolean
  formStatus: CarrierApplicationStatus
}

export enum CarrierApplicationStatus {
  incomplete = 'incomplete',
  complete = 'complete'
}

export interface StargateConfig {
  moneyDecimals: number
  showWeeklyPayments: boolean
  support: { phone: string, email: string }
  showLifePlans: boolean
  census: {
    group: { url: string, filename: string }
    super: { url: string, filename: string }
  }
  showTaxWitholdingStatus: boolean
  showAnnualIncome: boolean
  showHireDate: boolean
  showRedflagsPage: boolean
  showExistingCoverageChapter: boolean
  showDisabilityPlan: boolean
  showHeightWeight: boolean
  label: Label
}

export interface StargateResponse extends RawStargateResponse {
  config: StargateConfig
}

export interface GroupMember {
  id: string
  group_id: string
  date_of_birth?: Date
  name?: string
  gender?: Gender
  zip_code?: string
  countyId?: string
  height?: number
  weight?: number
  is_redflagged?: boolean
  is_waived: boolean
  medical_underwriting_complete: boolean
  salary?: number
  address1?: string
  address2?: string
  city?: string
  phone_number?: string
  hireDate?: Date
  jobTitle?: string
  plan?: MedicalPlan

  enrolled_group_plan_id?: string
  enrolled_dental_plan_id?: string
  enrolled_vision_plan_id?: string
  enrolled_life_plan_id?: string
  enrolled_individual_plan_id?: string
  enrolled_disability_plan_id?: string
  supplemental_enrollments?: string[]
  last_tobacco_use_date?: Date
  email: string
  cell_phone?: string
  contact_method?: string
}

export interface ConsumerProfile {
  ssn?: string
  state_code?: string
  phone_number?: string
  address1?: string
  address2?: string
  city?: string
}

export interface UserMetadata {
  jobTitle?: string
  city?: string
  alreadyHasPlan?: boolean
  taxWithholdingStatus?: number
  householdIncome?: number
  hoursPerWeek?: number
  hireDate?: Date
  mailingAddress1?: string
  mailingAddress2?: string
  mailingCity?: string
  mailingState?: string
  mailingZIP?: string
}

export interface ContributionSplit {
  id: string
  members: string[]
  contribution?: string
  isEquitable?: boolean
  name?: string
}

export interface Group {
  id: string
  name: string
  effectiveDate?: Date
  zipCode?: string
  industrySICCode?: string
  countyID?: string
  ein?: string
  existingCoverageCarrier?: string
  existingCoverageRenewalDate?: Date
  carrierApplicationComplete: boolean
  address1?: string
  address2?: string
  city?: string
  state?: string
  ratesLocked: boolean
  approved: boolean
  ehqSubmitted: boolean
  hbaApproved: boolean
  individualExperience: boolean
  pipelineStatus: PipelineStatus
}

export interface User {
  first_name?: string
  last_name?: string
  id: string
  email: string
  power_level: PowerLevel
  acceptedTermsAndConditions: boolean
  enrolled_group_plan_id?: string
  enrolled_dental_plan_id?: string
  enrolled_vision_plan_id?: string
  enrolled_life_plan_id?: string
  enrolled_individual_plan_id?: string
  enrolled_disability_plan_id?: string
  county_id?: string
  marital_status?: MaritalStatus
  ssn?: string
}

export interface Member {
  id: string
  name: string
  email: string
  gender?: Gender
  zip?: string
  countyId?: string
  lastTobaccoDate?: Date
  dateOfBirth?: Date
  is_waived: boolean
  dependents: MemberDependent[]
  tier: Tier
  hireDate?: Date
  enrollmentStatus: EnrollmentStatus
  medical_underwriting_complete: boolean
  jobTitle?: string
}

export interface Dependent {
  id: string
  firstName: string
  lastName: string
  gender: Gender
  zipCode?: string
  countyID?: string
  lastUsedTobacco?: Date
  dateOfBirth: Date
  relationship: Relationship
  ssn?: string
  height?: number
  weight?: number
}

export interface MemberDependent {
  id: string
  firstName: string
  lastName: string
  gender: Gender
  zip?: string
  countyId?: string
  lastTobaccoDate?: Date
  dateOfBirth: Date
  relationship: Relationship
  terminationDate?: Date
}

export enum Mode {
  employee = 'employee',
  employer = 'employer',
  both = 'both'
}

export enum Gender {
  male = 'M',
  female = 'F'
}

export interface Payment {
  paymentInfoReceived: boolean
  appliedPromoCode?: string
  status?: PaymentStatus
  lastPaymentDate?: Date
  monthlyPremium?: string
  paymentAmount?: string
  nextPaymentDate?: Date
  nextPaymentAmount?: string
}

enum PaymentStatus {
  unpaid,
  pending,
  paid,
  error
}

export enum PlanSelectionsState {
  valid = 'valid',
  noPlans = 'noPlans',
  differentFundingTypes = 'differentFundingTypes',
  differentAllstateNetworks = 'differentAllstateNetworks',
  differentCarriers = 'differentCarriers',
  differentUHCPackages = 'differentUHCPackages',
  tooManyPlans = 'tooManyPlans'
}

const store: {[key: string]: Promise<StargateResponse>} = {}

export default function useStargate(): AsyncState<StargateResponse> {
  const groupID = localStorage.overrideGroupID || ''
  const location = useLocation().pathname
  const history = useHistory()
  const appMode = useAppMode()
  return useAsync(async() => {
    if (groupID in store) return await store[groupID]
    store[groupID] = (async() => {
      const rsp = await api.get(`/stargate/${groupID}`) as StargateResponse
      if (rsp.group) {
        rsp.group.effectiveDate = utcMidnightToLocalMidnight(rsp.group.effectiveDate)
        rsp.group.existingCoverageRenewalDate = utcMidnightToLocalMidnight(rsp.group.existingCoverageRenewalDate)
      }
      if (!rsp.splits?.length) {
        rsp.splits = []
      }
      if (rsp.groupMember) {
        rsp.groupMember.date_of_birth = utcMidnightToLocalMidnight(rsp.groupMember.date_of_birth)
      }
      rsp.members = rsp.members.map(member => {
        member.hireDate = utcMidnightToLocalMidnight(member.hireDate)
        member.dateOfBirth = utcMidnightToLocalMidnight(member.dateOfBirth)
        member.dependents = member.dependents.map(dep => {
          dep.dateOfBirth = utcMidnightToLocalMidnight(dep.dateOfBirth)! // bang because it is not optional on server
          return dep
        })
        return member
      })
      rsp.dependents = rsp.dependents?.map(dep => {
        dep.dateOfBirth = utcMidnightToLocalMidnight(dep.dateOfBirth)! // bang because not optional on server
        return dep
      })
      if (rsp.userMetadata) {
        rsp.userMetadata.hireDate = utcMidnightToLocalMidnight(rsp.userMetadata?.hireDate)
        // Where was this supposed to come from?
        rsp.userMetadata.alreadyHasPlan = !!(rsp.groupMember?.enrolled_dental_plan_id ||
          rsp.groupMember?.enrolled_disability_plan_id ||
          rsp.groupMember?.enrolled_group_plan_id ||
          rsp.user.enrolled_individual_plan_id ||
          rsp.groupMember?.enrolled_life_plan_id ||
          rsp.groupMember?.enrolled_vision_plan_id)
      }
      switch (rsp.user.power_level) {
      case PowerLevel.individual:
        if (appMode !== AppMode.employee && !location?.endsWith('/group-type') && !location?.endsWith('/checklist') && !location?.endsWith('/get-started')) history.push(RaRoute.landing)

        break
      case PowerLevel.groupManager:
        if (appMode === AppMode.agency) history.push(RaRoute.landing)
        break
      default:
        break
      }
      if (rsp.groupIsStale && appMode === AppMode.employer && !location?.match(/\/refresh/)) {
        history.push(RaRoute.erStargateRefresh)
      }

      addConfig(rsp)

      return rsp
    })()

    try {
      return await store[groupID]
    } finally {
      // we only cache during simultaneous executions
      // thus ensuring subsequent requests get fresh data for the new Wizard pages
      delete store[groupID]
    }
  }, [groupID, getToken(), location])
}

export function useSupportPhone(): string {
  return useStargate().value?.config.support.phone || '(888) 272‑1513'
}

export enum Census {
  standard, super
}

function censusFilename(type: Census, label: Label): string {
  let suffix = 'census.xlsx'
  switch (type) {
  case Census.standard:
    break
  case Census.super:
    suffix = `super-${suffix}`
  }
  return `${longTitle(label)}-${suffix}`
}

export function censusURL(type: Census, label: Label): string {
  const fixedLabel = label.replace(/candor\.insurance/, 'myhealthily.com')
  return `https://${fixedLabel}/${censusFilename(type, label)}`
}

function addConfig(rsp: StargateResponse) {
  rsp.config = {
    showDisabilityPlan: showDisabilityPlan(),
    moneyDecimals: rsp.label === Label.blacksmith ? 2 : 0,
    showWeeklyPayments: rsp.label === Label.blacksmith,
    support: {
      phone: rsp.label === Label.jhc ? '(888) 613‑5397' : '(888) 272‑1513',
      email: 'support@myhealthily.com'
    },
    showLifePlans: rsp.label !== Label.fbhc,
    census: {
      group: {
        url: censusURL(Census.standard, rsp.label),
        filename: censusFilename(Census.standard, rsp.label)
      },
      super: {
        url: censusURL(Census.super, rsp.label),
        filename: censusFilename(Census.super, rsp.label)
      }
    },
    showTaxWitholdingStatus: rsp.label !== Label.blacksmith,
    showAnnualIncome: rsp.label !== Label.blacksmith,
    showHireDate: rsp.label !== Label.blacksmith,
    showRedflagsPage: rsp.showRedflagsPage,
    showExistingCoverageChapter: rsp.label !== Label.blacksmith,
    showHeightWeight: false,
    label: rsp.label
  }

  function showDisabilityPlan() {
    if (rsp.label !== Label.blacksmith) return false
    const date = moment()
    // only disabling for renewal period per BS HR request
    // NOTE this is because BS only offer LTD to new hires, ideally we’d support not showing
    // the LTD plan as some kind of HR imposed option
    return date.month() < 9 && date.month() >= 1
  }
}
