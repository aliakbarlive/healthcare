import { BasePlan } from 'Utilities/pharaoh.types'
import { GroupPlanType } from 'Utilities/Plans/ContributionCalculator'

export default interface LifePlan extends BasePlan {
  type: GroupPlanType.life
  data: {
    benefitsSpouse?: string
    benefitsPerChild?: string
    benefitsIndividual?: string
    disabilityProvision?: string
    'supplementalAD&DIncluded?': string
    willPreparationAndEstateResolutionServices?: string
    sbc?: string
  }
}

export function isLife(plan: any): plan is LifePlan {
  return plan.type === 'life' || plan?.plan?.type === 'life'
}
