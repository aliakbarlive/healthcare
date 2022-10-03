import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import SupplementalPlan from 'Components/Plans/SupplementalPlan/index.helpers'
import Plan, { PlanBody } from 'Components/Plans/plan-subcomponents/Plan'
import PlanTitle from 'Components/Plans/plan-subcomponents/PlanTitle'
import IndividualTier from '../EESupplementalSubComp/IndividualTier'
import { GlobalStringConstant } from 'GlobalStringConstant'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  selectHandler?(plan: SupplementalPlan): void
}
const CancerPlanEE: React.FC<Props> = (props) => {
  const { plan, selected, label, selectHandler } = props
  const sbc = plan.plan.data.sbc
  const individualTier = (plan.rate.individual).slice(1)
  const benifitAmount = plan?.plan?.data?.benefitAmount
  const stemCellAndBoneMarrowTransplant = plan?.plan?.data?.stemCellAndBoneMarrowTransplant
  const hospiceCare = plan?.plan?.data?.hospiceCare
  const surgicalAndAnesthesia = plan?.plan?.data?.surgicalAndAnesthesia
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
          <div className={styles.benefit_amount_container}>
            <div className={`${styles.section} ${styles.custom_specs}`}>
              <table className={styles.box}>
                <thead>
                  <tr>
                    <th />
                    <th />
                    <th>{GlobalStringConstant[0].benefit_amout}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div>{GlobalStringConstant[0].initial_diagnosis_benift}</div>
                    </td>
                    <td />
                    <td> {!!benifitAmount && benifitAmount} </td>
                  </tr>
                  <tr>
                    <td>
                      <div>{GlobalStringConstant[0].stem_cell_bone_marrow_transplant}</div>
                    </td>
                    <td />
                    <td>{stemCellAndBoneMarrowTransplant && stemCellAndBoneMarrowTransplant}</td>
                  </tr>
                  <tr>
                    <td>
                      <div>{GlobalStringConstant[0].hospice_care}</div>
                    </td>
                    <td />
                    <td>{hospiceCare && hospiceCare}</td>
                  </tr>
                  <tr>
                    <td>
                      <div>{GlobalStringConstant[0].surgical_anesthesia}</div>
                    </td>
                    <td />
                    <td>{surgicalAndAnesthesia && surgicalAndAnesthesia}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PlanBody>
  </Plan>
  </>
}

export default CancerPlanEE
