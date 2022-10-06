import { BasePlan } from 'Utilities/pharaoh.types'
import { GroupPlanType } from 'Utilities/Plans/ContributionCalculator'

export default interface VisionPlan extends BasePlan {
  type: GroupPlanType.vision
  data: Data
}

type Data = {
  comprehensiveVisionExamFrequencyInMonths?: string
  comprehensiveVisionExamInNetwork?: string
  comprehensiveVisionExamOutOfNetwork?: string
  contactLensesFrequencyInMonths?: string
  contactLensesInNetwork?: string
  contactLensesOutOfNetwork?: string
  framesAllowanceFrequencyInMonths?: string
  framesAllowanceInNetwork?: string
  framesAllowanceOutOfNetwork?: string
  materialsLensesFramesAndContactsFrequencyInMonths?: string
  materialsLensesFramesAndContactsInNetwork?: string
  materialsLensesFramesAndContactsOutOfNetwork?: string
  standardCorrectiveLensesFrequencyInMonths?: string
  standardCorrectiveLensesInNetwork?: string
  standardCorrectiveLensesOutOfNetwork?: string
  sbc?: string
}

export function isVision(plan: any): plan is VisionPlan {
  return plan.type === 'vision' || plan?.plan?.type === 'vision'
}
