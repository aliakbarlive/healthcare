/* eslint-disable camelcase */

export interface Contact {
  id?: string
  email?: string
  name?: string
  phone?: string
  cell_phone?: string
  contact_method?: string
}

export interface Group {
  id: string
  name: string
  todo: GroupToDos
  dates: {
    effective?: Date
    contacted?: Date
    renewal?: Date
  }
  status?: PipelineStatus
  address: Address
  contacts: Contact[]
  flagged: boolean
  members: {
    total: number
    enrolled: number
    inProgress: number
    noActionTaken: number
    waived: number
    averageAge?: number
  }
  identifiers: {
    ein?: string
    sic?: number
  }
  associations?: Association[]
  contributions: {
    medical: {value: string, isEquitable: boolean}
    dental: {value: string, isEquitable: boolean}
    vision: {value: string, isEquitable: boolean}
  }
  waitingPeriod: number
  hasPaymentInfo: boolean
}

export interface PartialGroup extends Partial<Omit<Group, 'contributions'>> {
  contributions?: {
    medical?: {value: string, isEquitable: boolean}
    dental?: {value: string, isEquitable: boolean}
    vision?: {value: string, isEquitable: boolean}
  }
}

export interface GroupToDos {
  manager: boolean
  billing: boolean
  invites: boolean
  census: boolean
  plans: boolean
}

export enum PipelineStatus {
  suspect = 'suspect',
  prospect = 'prospect',
  proposed = 'proposed',
  lead = 'lead',
  processing = 'processing',
  enrolled = 'enrolled',
  archived = 'archived'
}

export interface Address {
  street1?: string
  street2?: string
  state?: string
  city?: string
  zip?: string
  county?: {id: string, name?: string}
}

export enum MaritalStatus {
  single = 'single',
  married = 'married',
  domesticPartner = 'domesticPartner',
  divorced = 'divorced',
  widowed = 'widowed',
  separated = 'separated'
}

export interface Member {
  id: string
  dob?: Date
  ssn?: string
  tier: Tier
  dates: { hire?: Date, effective?: Date, termination?: Date }
  group: {id: string, name: string}
  gender?: Gender
  status: EnrollmentStatus
  contact: Contact
  address: Address
  isWaived: boolean
  privilege: Privilege
  dependents?: Dependent[]
  signUpLink?: string
  qualifyingEvents?: QualifyingEvent[]
  isMedicallyUnderwritten: boolean
  isFlagged: boolean
  groups?: {id: string, name: string, privilege: Privilege}[]
  measures?: Measures
  maritalStatus?: MaritalStatus
  acceptedTermsAndConditions?: boolean
  taxStatus?: TaxStatus
  jobTitle?: string
  hoursPerWeek?: number
}

interface TaxStatus {
  code: TaxStatusCode
  value: TaxStatusValue
}

export enum TaxStatusValue {
  w2 = 'W2',
  tenNinetyNine = '1099',
  ownerOrPartner = 'Owner/Partner'
}

export enum TaxStatusCode {
  w2,
  tenNinetyNine,
  ownerOrPartner
}

interface Measures {
  height?: number
  weight?: number
}

export interface QualifyingEvent {
  id: string
  event: QualifyingEventType
  other?: string
  date: Date
}

export enum QualifyingEventType {
  coverageThroughEmployer = 'Other group coverage through a different employer',
  coverageThroughSpouseParent = 'Other group coverage through a spouse or parent',
  individualCoverage = 'Individual coverage',
  coverageThroughEmployerDependent = 'Enrolling as a dependent in your employer\'s group health plan',
  coverageMedicare = 'Coverage through Medicare, Medicade, Tricare or other Gov.',
  divorce = 'Divorce',
  marriage = 'Marriage',
  birthAdoption = 'Birth or Adoption',
  foster = 'Fostering',
  death = 'Death',
  noLongerWant = 'No longer want',
  changingZip = 'Change of zip code',
  termination = 'Loss of job/termination',
  hire = 'New hire/job',
  other = 'Other'
}

export enum Privilege {
  standard = 'standard',
  manager = 'manager',
  invitedToManage = 'invitedToManage'
}

export enum EnrollmentStatus {
  notInvited = 'notInvited',
  notStarted = 'notStarted',
  awaitingMedicalUnderwriting = 'awaitingMedicalUnderwriting',
  awaitingElections = 'awaitingElections',
  waived = 'waived',
  complete = 'complete'
}

export interface Association {
  id: string
  name: string
}

export interface Ticket {
  mode: TicketMode
  name?: string
  email: string
  venue: Venue
  resetToken?: string
}

export interface TicketPayload {
  name: string
  email: string
  venue: Venue
  venueID: string
}

export enum TicketMode {
  redirect = 'redirect',
  signIn = 'signIn',
  signUp = 'signUp',
  resetPassword = 'resetPassword',
}

export interface ToastCollectorPayload {
  error: string
  localStorage: string
  browserIdentity: string
  url: string
  body?: string
}

export enum Venue {
  group = 0,
  association = 1,
  employee = 2,
  agency = 3,
  eeDashboard = 4,
  erDashboard = 5
}

export enum Tier {
  individual = 'individual',
  couple = 'couple',
  singleParent = 'singleParent',
  family = 'family'
}

export type TieredRates = { [key in Tier]: string }

export interface Dependent {
  id: string
  dob: Date
  ssn?: string
  name?: string
  gender: Gender
  relationship: Relationship
  terminationDate?: Date
}

export enum Gender {
  male = 'male',
  female = 'female'
}

export enum Relationship {
  spouse = 'spouse',
  child = 'child',
  lifePartner = 'life_partner'
}

export interface BasePlan {
  id: string
  groupPlanID?: string
  name: string
  carrier: string
}

export interface MedicalPlan extends BasePlan {
  type: PlanType
  premium: Premium
  memberPremiums?: {
    id: string
    quoteID: string
    premiums: MemberPremium[]
  }
  deductible: string
  oopMax: string
  coinsurance: string
  copay: Copay
  prescription: Rx
  isLevelFunded: boolean
  oonCoverage: boolean
  sbc?: string // It's a url but we don't initialize it as a url object anywhere so leaving it as a string
  preexistingConditionsCovered: boolean
  isRenewalPlan: boolean
  priorYearsPlan?: boolean
  available?: boolean
}

export enum PlanType {
  PPO = 'PPO',
  HMO = 'HMO',
  EPO = 'EPO',
// Indemnity = 'Indemnity',  // unloved
  POS = 'POS',
  FixedBenefitNoNetwork = 'FixedBenefitNoNetwork'
}

interface Premium {
  employer: string
  employee: { [key in Tier]: string }
}

interface MemberPremium {
  id: string
  planID: string
  quoteID: string
  memberID: string
  total_premium: string
  insured_premium: string
  spouse_premium: string
  children_premium: string
  created_at: Date
  updated_at: Date
}

interface Copay {
  primaryCarePhysician: string
  urgentCare: string
  specialist: string
  conditional?: string
}

interface Rx {
  generic: string
  preferredBrand: string
  specialty: string
  conditional?: string
}

export interface Note {
  id: string
  content: string
  targetID: string
  ownerID: string
  created_at: Date
  updated_at: Date
}

export interface Appointment {
  id: string
  targetId: string
  state: string
  carrier: string
  agentNumber: string
  userName?: string
  password?: string
  loginUrl?: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date
}

export interface SidecarProfile {
  id: string
  email: string
  accountUuid: string
  memberUuid: string
  dependentUuids: any // TODO fix
  applicationUuid?: string
  application: boolean
  policy: boolean
  policyId?: string
}

export interface StandaloneProsper {
  signedUp: boolean
  signedUpRate?: string
  currentRate: string
}
