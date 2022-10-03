import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import SupplementalPlan from 'Components/Plans/SupplementalPlan/index.helpers'
import Plan, { PlanBody } from 'Components/Plans/plan-subcomponents/Plan'
import PlanTitle from 'Components/Plans/plan-subcomponents/PlanTitle'
import IndividualTierForVTLEE from '../EESupplementalSubComp/IndividualTierForVTLEE'
import BenefitAmountContainer from '../EESupplementalSubComp/BenefitAmountContainer'
import benefitStyle from '../EESupplementalSubComp/EESupplementalSubComp.module.scss'
import { GlobalStringConstant } from 'GlobalStringConstant'
import { GetStringNumber } from './CriticalIllnessEE'
import BenefitCompVtl from '../EESupplementalSubComp/BenefitCompVtl'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  selectHandler?(plan: SupplementalPlan): void
  showWeeklyPayments: boolean
}

const VTLEE: React.FC<Props> = (props) => {
  const { plan, selected, label, selectHandler } = props
  const sbc = plan.plan.data.sbc
  const individualTier = (plan.rate.individual).slice(1)

  return <> <Plan selected={!!selected}>
    <div className={benefitStyle.remindAll}>
      <p>Voluntary Term Life is intended to be an employee paid benefit, meaning that an employer is unlikely to contribute. You may take this policy with you after your employment ends.</p>

    </div>
    <PlanTitle
      id={plan.plan.id}
      planName={plan.plan.name}
      carrier= {plan.plan.carrier}
      selected={selected}
      includesProsperBenefits={false}
      planType={GroupPlanType.life}
      label={label}
      sbc={sbc}
      selectHandler={selectHandler && (() => selectHandler(plan.plan))}
    />

    <PlanBody>

      <div className={styles.planBodyContainer}>
        <div className = {styles.ee_aflac_accident_plan_module_Cont}>
          <IndividualTierForVTLEE individualTierRate = {individualTier}/>
          <BenefitCompVtl amountLabel= {GlobalStringConstant[0].face_value} name={GlobalStringConstant[0].benefit_amout} benefitAmount = {GetStringNumber(plan?.plan?.data?.benefitsIndividual)?.toString()}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit + ' ' + benefitStyle.initial_accident_hospitalization_benefit_vtl}>{GlobalStringConstant[0].plan_term}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.amount}>{plan?.plan?.data?.planTerm + ' term'}</span>
                  </div>
                </div>
              </div>
            </BenefitAmountContainer>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit + ' ' + benefitStyle.initial_accident_hospitalization_benefit_vtl}>{GlobalStringConstant[0].portability}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.spanval}>You are able to take the policy with you after your employment ends.</span>
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

export default VTLEE
