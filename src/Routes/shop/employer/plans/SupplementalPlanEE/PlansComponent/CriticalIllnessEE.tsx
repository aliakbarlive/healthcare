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

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  selectHandler?(plan: SupplementalPlan): void
}

const CriticalIllnessEE: React.FC<Props> = (props) => {
  const { plan, selected, label, selectHandler } = props
  const sbc = plan.plan.data.sbc
  const subSequentAmount = GetStringNumber(plan.plan.data.subsequentCriticalIllnessEvent)
  const suddenCardiacArrestBenefit = GetStringNumber(plan.plan.data.suddenCardiacArrestBenefit)
  const criticleIllnessEventPrice = GetStringNumber(plan.plan.data.majorCriticalIllnessEvent)
  const individualTier = (plan.rate.individual).slice(1)
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
          <BenefitComp amountLabel={GlobalStringConstant[0].payable_one_per_lifetime} name={GlobalStringConstant[0].major_criticalIllness_event} benefitAmount={criticleIllnessEventPrice?.[0]} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].subsequent_critical_illness_event}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.dolar}>$</span><span className={benefitStyle.amount}>{subSequentAmount?.[0]}</span>
                  </div>
                  <div className={benefitStyle.hospital_confinement} >{''}</div>
                </div>
              </div>
            </BenefitAmountContainer>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].sudden_cardiac_arrest_benefit}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.dolar}>$</span><span className={benefitStyle.amount}>{suddenCardiacArrestBenefit?.[0]}</span>
                    <p className={benefitStyle.benefit_amount_label}>{GlobalStringConstant[0].payable_one_per_lifetime}</p>
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

export const GetStringNumber = (str: string) => {
  return str.replace(/,/g, '').match(/\d+/g)?.map(item => {
    const num = parseFloat(item)
    return num.toLocaleString('en-US')
  })
}

export default CriticalIllnessEE
