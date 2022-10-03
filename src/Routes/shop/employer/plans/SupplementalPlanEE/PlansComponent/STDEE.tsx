import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import SupplementalPlan from 'Components/Plans/SupplementalPlan/index.helpers'
import Plan, { PlanBody } from 'Components/Plans/plan-subcomponents/Plan'
import PlanTitle from 'Components/Plans/plan-subcomponents/PlanTitle'
import IndividualTier from '../EESupplementalSubComp/IndividualTier'
import AmountContainer from '../EESupplementalSubComp/AmountContainer'
import BenefitAmountContainer from '../EESupplementalSubComp/BenefitAmountContainer'
import benefitStyle from '../EESupplementalSubComp/EESupplementalSubComp.module.scss'
import { GlobalStringConstant } from 'GlobalStringConstant'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  selectHandler?(plan: SupplementalPlan): void
}
const STDEE: React.FC<Props> = (props) => {
  const { plan, selected, label, selectHandler } = props
  const sbc = plan.plan.data.sbc
  const individualTier = (plan.rate.individual).slice(1)
  const benefitPeriod = (plan?.plan?.data?.benefitPeriod)
  const monthlyBenefitPayment = (plan?.plan?.data?.monthlyBenefitPayment).replaceAll('$', '')
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
          <div>
            <div className={styles.std_amount_main} style={{ display: 'flex' }}>
              <AmountContainer name={GlobalStringConstant[0].benefit_amout} amount={'X'} label={GlobalStringConstant[0].base_on_your_age_income} itemID='1' />
              <AmountContainer name={GlobalStringConstant[0].min_benefit} amount={'X'} label={GlobalStringConstant[0].your_monthly_salary} itemID='2' />
              <AmountContainer name={GlobalStringConstant[0].benefit_payment} amount={monthlyBenefitPayment} label={GlobalStringConstant[0].monthly} itemID='3' />
            </div>
            <div style={{ display: 'flex' }}>
              <BenefitAmountContainer innerclassname={styles.std_benefit_amount}>
                <div className={benefitStyle.frame_821_jud2lB}>
                  <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].benefit_period}</div>
                  <div className={benefitStyle.frame_823_YMhAWx}>
                    <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                      <span className={benefitStyle.amount}>{benefitPeriod || ''}</span>
                    </div>
                  </div>
                </div>
              </BenefitAmountContainer>
              <BenefitAmountContainer innerclassname={styles.std_benefit_amount}>
                <div className={benefitStyle.frame_821_jud2lB}>
                  <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].waiting_period}</div>
                  <div className={benefitStyle.frame_823_YMhAWx}>
                    <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                      <span className={benefitStyle.amount}>{'None'}</span>
                      <p className={benefitStyle.benefit_amount_label}>{''}</p>
                    </div>
                  </div>
                </div>
              </BenefitAmountContainer>
            </div>
          </div>
        </div>
      </div>
    </PlanBody>
  </Plan>
  </>
}

export default STDEE
