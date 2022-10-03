import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import SupplementalPlan from 'Components/Plans/SupplementalPlan/index.helpers'
import Plan, { PlanBody } from 'Components/Plans/plan-subcomponents/Plan'
import PlanTitle from 'Components/Plans/plan-subcomponents/PlanTitle'
import IndividualTier from '../EESupplementalSubComp/IndividualTier'
import BenefitComp from '../EESupplementalSubComp/BenefitComp'
import BenefitAmountContainer from '../EESupplementalSubComp/BenefitAmountContainer'
import benefitStyle from '../EESupplementalSubComp/EESupplementalSubComp.module.scss'
import { GlobalStringConstant } from 'GlobalStringConstant'
import { GetStringNumber } from './CriticalIllnessEE'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  selectHandler?(plan: SupplementalPlan): void
}
const HospitalEE: React.FC<Props> = (props) => {
  const { plan, selected, label, selectHandler } = props
  const sbc = plan.plan.data.sbc
  const individualTier = (plan.rate.individual).slice(1)
  const hospitalConfinementBenefit = GetStringNumber(plan?.plan?.data?.hospitalConfinementBenefit)
  const emergencyRoomBenefit = GetStringNumber(plan?.plan?.data?.emergencyRoomBenefit)
  const hospitalShortStay = GetStringNumber(plan?.plan?.data?.hospitalShortStay)
  return <> <Plan selected={!!selected}>
    <PlanTitle
      id={plan.plan.id}
      planName={plan.plan.name}
      carrier={plan.plan.carrier}
      selected={selected}
      includesProsperBenefits={false}
      planType={GroupPlanType.accident}
      label={label}
      sbc={sbc}
      selectHandler={selectHandler && (() => selectHandler(plan.plan))}
    />
    <PlanBody>
      <div className={styles.planBodyContainer}>
        <div className={styles.ee_aflac_accident_plan_module_Cont}>
          <IndividualTier individualTierRate={individualTier} />
          <BenefitComp amountLabel={GlobalStringConstant[0].onceper_calendar_year} name={GlobalStringConstant[0].hospital_confinement_benefit} benefitAmount={hospitalConfinementBenefit?.[0]} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].emergency_room_benefit}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.dolar}>$</span><span className={benefitStyle.amount}>{emergencyRoomBenefit?.[0] || '0'}</span>
                    <p className={benefitStyle.benefit_amount_label}>{GlobalStringConstant[0].payment_max_per_calendar_year}</p>
                  </div>
                </div>
              </div>
            </BenefitAmountContainer>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].hospital_short_stay}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.dolar}>$</span><span className={benefitStyle.amount}>{hospitalShortStay?.[0] || '0'}</span>
                    <p className={benefitStyle.benefit_amount_label}>{GlobalStringConstant[0].payment_max_per_calendar_year}</p>
                  </div>
                </div>
              </div>
            </BenefitAmountContainer>
          </div>
        </div>
      </div>
    </PlanBody>
  </Plan>
  </>
}

export default HospitalEE
