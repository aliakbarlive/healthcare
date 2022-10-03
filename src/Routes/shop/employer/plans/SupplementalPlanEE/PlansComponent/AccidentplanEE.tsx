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
  showWeeklyPayments: boolean
}

const AccidentplanEE: React.FC<Props> = (props) => {
  const { plan, selected, label, selectHandler } = props
  const initialHospitalBenefit = GetStringNumber(plan.plan.data.initialAccidentHospitalizationBenefit)
  const initialHospitalConfinement = (plan.plan.data.initialAccidentHospitalizationBenefit).split(' ').slice(-2)
  const accidentHospitalConfinementBenefit = (plan.plan.data.accidentHospitalConfinementBenefit).slice(1)
  const benefitAmout = (plan.plan.data.accidentalDeathBenefit).slice(1)
  const sbc = plan.plan.data.sbc
  const individualTier = (plan.rate.individual).slice(1)
  return <> <Plan selected={!!selected}>
    <PlanTitle
      id={plan.plan.id}
      planName={plan.plan.name}
      carrier= {plan.plan.carrier}
      selected={selected}
      includesProsperBenefits={false}
      planType={GroupPlanType.accident}
      label={label}
      sbc={sbc}
      selectHandler={selectHandler && (() => selectHandler(plan.plan))}
    />
    <PlanBody>
      <div className={styles.planBodyContainer}>
        <div className = {styles.ee_aflac_accident_plan_module_Cont}>
          <IndividualTier individualTierRate = {individualTier}/>
          <BenefitComp amountLabel= '' name={GlobalStringConstant[0].accident_death_benefit} benefitAmount = {benefitAmout}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].initial_accident_hospitalization_benefit}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <span className={benefitStyle.dolar}>$</span><span className={benefitStyle.amount}>{initialHospitalBenefit?.[0]}</span>
                  </div>
                  <div className={benefitStyle.hospital_confinement} >{initialHospitalConfinement}</div>
                </div>
              </div>
            </BenefitAmountContainer>
            <BenefitAmountContainer>
              <div className={benefitStyle.frame_821_jud2lB}>
                <div className={benefitStyle.initial_accident_hospitalization_benefit}>{GlobalStringConstant[0].accident_hospital_confinement}</div>
                <div className={benefitStyle.frame_823_YMhAWx}>
                  <div className={`${benefitStyle.accidental_death_price} ${benefitStyle.hospital_benifit_amoutn}`}>
                    <sup className={benefitStyle.dolar}>{GlobalStringConstant[0].dolar}</sup><span className={benefitStyle.amount}>{accidentHospitalConfinementBenefit}</span>
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

export default AccidentplanEE
