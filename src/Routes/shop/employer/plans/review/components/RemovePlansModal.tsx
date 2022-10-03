import React from 'react'
import styles from './RemovePlansModal.module.scss'
import { logoFor, massagedPlanName, planSelectionStateFor } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import { classNames } from 'Utilities/etc'
import usePivot, { Side } from 'Utilities/Hooks/usePivot'
import ERShopPlansReview from '..'
import Modal, { ActionType, BrandColors, ModalActionButton } from 'Components/Modals/Modal'
import { Member, PlanSelectionsState } from 'Utilities/Hooks/useStargate'

interface Props {
  planIDsToRemove: Set<string>
  plans: MedicalPlan[]
  members: Member[]
  isOpen: boolean
  onClose: () => void
  handleRemoveContinue: (ids: string[]) => void
}

const RemovePlansModal: React.FC<Props> = ({ plans, isOpen, onClose, handleRemoveContinue: callback, ...props }) => {
  const planIDsToKeep = new Set(plans.filter(({ id }) => !props.planIDsToRemove.has(id)).map(p => p.id))
  const [[removes], [keeps], { side, slot, reset }] = usePivot<string>({ left: props.planIDsToRemove, right: planIDsToKeep })

  const plansToKeep = plans.filter(({ id }) => keeps.has(id))
  const planSelectionState = planSelectionStateFor(plansToKeep, props.members)
  const removingAll = keeps.size === 0

  return <Modal
    gaModalName={RemovePlansModal.name}
    header={
      <div className={styles.header}>
        Remove plans
        {modalSubheader()}
      </div>
    }
    footerButtons={[button()]}
    isOpen={isOpen}
    onRequestClose={onClose}
    onAfterOpen={reset}
    contentClassName={styles.removePlansContainer}
  >
    {plans.sort((a, b) => a.carrier.localeCompare(b.carrier)).map((plan) => {
      return <PlanToRemove
        plan={plan}
        toggle={slot}
        side={side(plan.id)}
        confirmedRemovingAll={removingAll}
        key={plan.id}
      />
    })}
  </Modal>

  function button(): ModalActionButton {
    let disabled: boolean
    let text: string
    let color: BrandColors
    if (removingAll) {
      disabled = false
      text = 'Back to Plans'
      color = BrandColors.green
    } else {
      text = 'Continue'
      disabled = planSelectionState.state !== PlanSelectionsState.valid
      color = BrandColors.blue
    }

    return {
      actionType: ActionType.primary,
      gaButtonName: `${text} (${ERShopPlansReview.name})`,
      onClick,
      disabled,
      content: text,
      color
    }

    function onClick() {
      callback(Array.from(removes))
    }
  }

  function modalSubheader() {
    if (removingAll) {
      return <p>You must keep at least <span>one plan</span> to continue</p>
    } else if (planSelectionState.state === PlanSelectionsState.valid) {
      return <p>{`Are you sure you want to remove ${plans.length > 1 ? 'these plans' : 'this plan'}?`}</p>
    } else {
      return <p><span>Cannot continue with current selections.</span><br/>{planSelectionState.message}</p>
    }
  }
}

interface Props2 {
  plan: MedicalPlan
  side: Side | undefined
  confirmedRemovingAll: boolean
  toggle: (id: string, to: Side) => void
}

const PlanToRemove: React.FC<Props2> = ({ plan, side, confirmedRemovingAll, toggle }) => {
  const activeStyle = confirmedRemovingAll ? styles.removingAllActive : styles.active

  return <div className={styles.planToRemove}>
    <div>
      { logoFor(plan.carrier, plan.name) || <h3 className={styles.carrierName}>{plan.carrier}</h3> }
      <p className={styles.planName}>{massagedPlanName(plan.name, plan.carrier)}</p>
    </div>
    <div className={styles.buttonContainer}>
      <button className={classNames(side === Side.left && activeStyle)} onClick={() => toggle(plan.id, Side.left)}>
        Remove
      </button>
      <button className={classNames(side === Side.right && activeStyle)} onClick={() => toggle(plan.id, Side.right)}>
        Keep
      </button>
    </div>
  </div>
}

export default RemovePlansModal
