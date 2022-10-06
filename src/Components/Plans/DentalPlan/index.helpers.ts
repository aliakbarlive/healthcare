import { BasePlan } from 'Utilities/pharaoh.types'
import { GroupPlanType } from 'Utilities/Plans/ContributionCalculator'

export default interface DentalPlan extends BasePlan {
  type: GroupPlanType.dental
  data: Data
}

type Data = D1 | D2

export interface D1 {
  dentalAllocationOfServicesInNetwork?: string
  dentalAllocationOfServicesOutOfNetwork?: string
  dentalBasicInNetwork?: string
  dentalBasicOutOfNetwork?: string
  dentalChildOrthodontics?: string // Not sure if this is necessary, but just incase
  dentalChildOrthodonticsInNetwork?: string
  dentalChildOrthodonticsOutOfNetwork?: string
  dentalInNetworkReimbusement?: string
  dentalMajorInNetwork?: string
  dentalMajorOutOfNetwork?: string
  dentalOrthodonticsLifetimeMaximumInNetwork?: string
  dentalOrthodonticsLifetimeMaximumOutOfNetwork?: string
  dentalOutOfNetworkReimbusement?: string
  dentalPreventativeInNetwork?: string
  dentalPreventativeOutOfNetwork?: string
  familyInNetworkCarrierPayOutMaximum?: string
  familyInNetworkDeductible?: string
  familyOutOfNetworkCarrierPayOutMaximum?: string
  familyOutOfNetworkDeductible?: string
  individualInNetworkCarrierPayOutMaximum?: string
  individualOutOfNetworkCarrierPayOutMaximum?: string
  individualInNetworkDeductible?: string
  individualOutOfNetworkDeductible?: string
  sbc?: string
}

export interface D2 {
  version: '2'
  preventativeCoinsuranceInNetwork: string
  preventativeCoinsuranceOutOfNetwork?: string
  preventativeDeductibleInNetwork: string
  preventativeDeductibleOutOfNetwork?: string
  preventativeMaxInNetwork: string
  preventativeMaxOutOfNetwork?: string
  basicCoinsuranceInNetwork: string
  basicCoinsuranceOutOfNetwork?: string
  basicDeductibleInNetwork: string
  basicDeductibleOutOfNetwork?: string
  basicMaxInNetwork: string
  basicMaxOutOfNetwork?: string
  majorCoinsuranceInNetwork: string
  majorCoinsuranceOutOfNetwork?: string
  majorDeductibleInNetwork: string
  majorDeductibleOutOfNetwork?: string
  majorMaxInNetwork: string
  majorMaxOutOfNetwork?: string
  familyDeductibleMaximum?: string
  deductibleCombined: string
  maxCombined: string
  sbc?: string
}

// Not guaranteed that the rest of the plan data will match the interface... YOLO
export function isD1(data: any): data is D1 {
  return 'dentalBasicInNetwork' in data
}

export function isD2(data: any): data is D2 {
  return data.version === '2'
}

export function isDental(plan: any): plan is DentalPlan {
  return plan.type === 'dental' || plan?.plan?.type === 'dental'
}

// Relies on consistent naming convention of in and out of network specs
export function specsFor(prefix: string, data: Data) {
  const inNetwork = data[(`${prefix}InNetwork`) as keyof Data] as string | undefined
  const outOfNetwork = data[(`${prefix}OutOfNetwork`) as keyof Data] as string | undefined
  return { inNetwork, outOfNetwork }
}
