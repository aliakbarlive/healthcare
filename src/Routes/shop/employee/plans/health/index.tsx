/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import styles from 'Routes/shop/employer/plans/ShowPlans.module.scss'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { useAsync, useToggle } from 'react-use'
import { get, post, delete_ } from 'Utilities/fetch++'
import Error from 'Components/Primitives/Error'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import Loader from 'Components/Rudimentary/Loader'
import useToast from 'Utilities/Hooks/useToast'
import EEMedicalPlan from 'Components/Plans/EEMedicalPlan'
import headerStyles from 'Components/Stargate/ShowPlans/Components/ShowPlansHeader.module.scss'
import EmployeeInfoWaiveModal from 'Components/Stargate/Waiving/EmployeeInfoWaiveModal'
import CompareModal from 'Components/Stargate/ShowPlans/Components/CompareModal'
import { GAButton } from 'Components/Tracking'
import Heading from 'Components/Stargate/Heading'

const EEShopPlansHealth: React.FC<PrivateWizardPageProps> = ({ stargate, ...props }) => {
  const { group, userTier, splits, groupMember, user, contributions, members } = stargate
  const [isWaiveModalOpen, toggleWaiveCoverageModal] = useToggle(false)
  // TODO: this is super broken. selectedPlanID is a MedicalPlanModel.id and the user IDs are GroupPlan.ids.
  // We can't translate between them that I can see here. So this page will never show the user's existing
  // plan on load, but will be right thereafter.
  const [selectedPlanID, setSelectedPlanID] = useState<string>()
  const [disabled, setDisabled] = useToggle(false)
  const [isCompareModalOpen, toggleCompare] = useToggle(false)
  const member = members.find(m => m.id === groupMember?.id)
  const addToast = useToast()
  useFullContentArea()
  const { value: plans, loading, error } = useAsync(async() =>
    await get(`/v3/groups/${group?.id}/users/${groupMember?.id}/plans`) as MedicalPlan[]
  )

  // Use the planID instead of the groupPlanID as the initial value
  useEffect(() => {
    if (plans) {
      setSelectedPlanID(plans!.find(({ id, groupPlanID }) => ((groupPlanID && groupMember?.enrolled_group_plan_id === groupPlanID) || id === user.enrolled_individual_plan_id))?.id)
    }
  }, [plans, groupMember?.enrolled_group_plan_id, groupMember?.enrolled_individual_plan_id])

  if (!group || !userTier || !groupMember || !member || !contributions) return <Error error='Please complete earlier steps'/>
  if (error) return <Error error={error} />
  if (loading) return <Loader />

  const selectedPlan = plans!.find(({ id, groupPlanID }) => id === selectedPlanID || (groupPlanID && groupPlanID === selectedPlanID))
  const isNextButtonDisabled = selectedPlan === undefined
  const selectPlanCopy = isNextButtonDisabled ? 'Waive Coverage' : 'Next Step'

  return <>
    <Heading innerclassname={headerStyles.eeHeading}>
      <div>
        <h1>Select Your Plan</h1>
        <GAButton analytics={`${selectPlanCopy} (${EEShopPlansHealth.name})`} className='shop-next-button' onClick={isNextButtonDisabled ? toggleWaiveCoverageModal : onwards} disabled={disabled}>
          {selectPlanCopy}
        </GAButton>
      </div>
    </Heading>
    <div className={styles.mainContainer}>
      <section>
        <div className ={styles.planSelect}>
          <p>It’s time to select healthcare plans offered by your employer.</p>
        </div>
      </section>
      <div className={styles.plansAndFilter} style={{ display: 'block' }}>
        <div className={styles.plansListContainer}>
          <GAButton analytics={`Compare Plans (${EEShopPlansHealth.name})`} className={styles.compare} onClick={toggleCompare}>Compare Plans</GAButton>
          {plans!.map(plan => <EEMedicalPlan
            plan={plan}
            splits={splits}
            contributions={contributions}
            member={member}
            selected={selectedPlan === plan}
            selectHandler={onPlanSelectToggled}
            key={plan.id}
            showWeeklyPayments={stargate.config.showWeeklyPayments}
            label={stargate.config.label}
          />)}
        </div>
      </div>
    </div>
    <EmployeeInfoWaiveModal
      isOpen={isWaiveModalOpen}
      onRequestClose={toggleWaiveCoverageModal}
      callback={waiveCallback}
    />
    <CompareModal
      isOpen={isCompareModalOpen}
      onRequestClose={toggleCompare}
      plans={plans || []}
      contributions={contributions}
      members={members}
      splits={splits}
      userID={user.id}
      group={group}
    />
  </>

  async function onPlanSelectToggled(plan: MedicalPlan) {
    if (disabled) return
    const oldSelectedPlanId = selectedPlanID
    setDisabled(true)
    try {
      await delete_(`/v2/groups/${group?.id}/users/plans`)
      if (plan.id === oldSelectedPlanId) {
        setSelectedPlanID(undefined)
      } else {
        setSelectedPlanID(plan.id)
        await post(`/v2/groups/${group?.id}/users/plans/${plan.id}`)
      }
    } catch (error) {
      addToast(error)
      setSelectedPlanID(oldSelectedPlanId)
    } finally {
      setDisabled(false)
    }
  }

  function onwards() {
    props.onwards(Promise.resolve(group?.individualExperience))
  }

  function waiveCallback(waiveReason: string) {
    post(`/groups/${group?.id}/users/waive`, {
      waiveReason,
      isWaiving: true
    }).then(onwards).catch(addToast)
  }
}

export default EEShopPlansHealth
