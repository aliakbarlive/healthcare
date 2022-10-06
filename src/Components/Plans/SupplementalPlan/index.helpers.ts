import { BasePlan } from 'Utilities/pharaoh.types'
import { GroupPlanType } from 'Utilities/Plans/ContributionCalculator'

export default interface SupplementalPlan extends BasePlan {
  type: GroupPlanType.accident | GroupPlanType.cancer | GroupPlanType.criticalIllness | GroupPlanType.hospital | GroupPlanType.std | GroupPlanType.life
  data: Data
}

type Data = {
  accidentalDeathBenefit: string
  accidentHospitalConfinementBenefit: string
  initialAccidentHospitalizationBenefit: string
  subsequentCriticalIllnessEvent: string
  benefitsIndividual: string
  majorCriticalIllnessEvent:string
  suddenCardiacArrestBenefit:string
  benefitAmount: string
  stemCellAndBoneMarrowTransplant: string
  hospiceCare: string
  planTerm: string
  surgicalAndAnesthesia: string
  monthlyBenefitPayment: string
  benefitPeriod:string
  eliminationPeriod: string
  hospitalConfinementBenefit:string | any
  emergencyRoomBenefit:string
  hospitalShortStay:string
  sbc: string
}

export function isSupplemental(plan: any): plan is SupplementalPlan {
  const types = [GroupPlanType.accident, GroupPlanType.cancer, GroupPlanType.criticalIllness, GroupPlanType.hospital, GroupPlanType.std, GroupPlanType.life]
  return types.includes(plan.type) || types.includes(plan?.plan?.type)
}
