import { BasePlan } from 'Utilities/pharaoh.types'
import { GroupPlanType } from 'Utilities/Plans/ContributionCalculator'

export default interface LTDPlan extends BasePlan {
  type: GroupPlanType.disability
  data: {
    conversion?: string
    workLifeAssistance?: string
    survivorBenefit?: string
    monthlyBenefit?: string
    continuityOfCoverage?: string
    eliminationPeriodInDays?: string
    sbc?: string
  }
}

export function isLTD(plan: any): plan is LTDPlan {
  return plan.type === 'disability' || plan?.plan?.type === 'disability'
}
