import React from 'react'
import styles from './PlanCartItem.module.scss'
import { logoFor, massagedPlanName } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { MedicalPlan } from 'Utilities/pharaoh.types'

interface Props {
  plan: MedicalPlan
  remove: (plan: MedicalPlan) => void
}

const PlanCartItem: React.FC<Props> = ({ plan, remove }) => {
  const logo = logoFor(plan.carrier, plan.name)

  return (
    <div className={styles.container}>
      <i onClick={() => remove(plan)} className={`material-icons ${styles.removeButton}`}>clear</i>
      <div className={styles.infoContainer}>
        {logo || <div className={styles.planCarrier}>{plan.carrier}</div>}
        <div className={styles.planName}>{massagedPlanName(plan.name, plan.carrier)}</div>
      </div>
    </div>
  )
}

export default PlanCartItem
