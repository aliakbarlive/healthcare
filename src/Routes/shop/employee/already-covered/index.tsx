import React, { useEffect } from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { useForm } from 'react-hook-form'
import styles from './index.module.css'
import useCenteredContent from 'Utilities/Hooks/useCenteredContent'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { CandorDatePicker as DatePicker } from 'Components/Anubis/CandorForm'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'

import api from 'Utilities/Deprecated/api'
import effectiveDateFilter from 'Utilities/Plans/effectiveDateFilter()'
import { useToggle } from 'react-use'
import { post } from 'Utilities/fetch++'
import useToast from 'Utilities/Hooks/useToast'
import EmployeeInfoWaiveModal from 'Components/Stargate/Waiving/EmployeeInfoWaiveModal'
import { GAButton } from 'Components/Tracking'

const HavePlan: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const [isWaiveModalOpen, toggleWaiveCoverageModal] = useToggle(false)
  const addToast = useToast()
  const defaultValues = stargate.userMetadata || {} as any
  defaultValues.alreadyHasPlan = defaultValues.alreadyHasPlan === true ? 'true' : 'false' // lol

  const { handleSubmit, register, watch, control } = useForm({ defaultValues: defaultValues })
  const have = watch('alreadyHasPlan')
  useCenteredContent()
  useEffect(() => {
    const ele = document.getElementById('content')
    if (!ele) return
    ele.style.backgroundColor = '#F3FFFC'
    ele.style.maxWidth = 'unset'
    ele.style.display = ''
    return () => {
      ele.style.backgroundColor = ''
      ele.style.maxWidth = ''
    }
  })
  return <>
    <div className={styles.benifitEnrolment}>
      <p className={styles.employeBenift}>Employee Benefits Enrollment</p>
    </div>
    <form className={styles.container} onSubmit={handleSubmit(save)}>
      <EmployeeInfoWaiveModal
        isOpen={isWaiveModalOpen}
        onRequestClose={toggleWaiveCoverageModal}
        callback={(reason) => waiveCallback(true, reason)}
      />
      {stargate.group?.individualExperience || <>
        <h1 className='shop-h1-periwinkle'>Do you want to waive coverage?</h1>
        <div className={styles.buttonsContainer}>
          <GAButton
            type='button'
            analytics={`Waive Coverage (${HavePlan.name})`}
            style={{ marginTop: 20, marginBottom: 20 }}
            className={styles.button}
            onClick={toggleWaiveCoverageModal}
          >
            Yes
          </GAButton>
          <button
            className={styles.button}
            type='button'
            onClick={() => waiveCallback(false).then(() => addToast('You\'re no longer waived from health coverage', { appearance: 'success' }))}
          >
            No
          </button>
        </div>
      </>}
      <h1 className='shop-h1-periwinkle'>Do you already have a plan?</h1>
      <h2 className='shop-h2-navy'>This is how we can tell if you are eligible now.</h2>
      <div>
        <label className={styles.radioContainer}>
          <input name='alreadyHasPlan' type="radio" value='true' ref={register} required />
          Yes
          <span className={styles.radio} ></span>
        </label >
        <label className={styles.radioContainer}>
          <input name='alreadyHasPlan' type="radio" value='false' ref={register} required />
          No
          <span className={styles.radio}></span>
        </label>
      </div>
      <div className={styles.renewalContainer} style={{ display: have === 'true' ? 'block' : 'none' }}>
        <h2 className={styles.currentPlanMessage}>Can you tell us about your current plan?</h2>
        <div className={styles.planContainer}>
          <div className={styles.full}>
            <CandorInput placeholder="Current Carrier" name="currentMedicalPlanCarrier" ref={register} />
          </div>
          <div className={styles.left}>
            <CandorInput placeholder="Current Plan Name" name="currentMedicalPlanName" ref={register} />
          </div>
          <div className={styles.right}>
            <CandorInput placeholder="Current Plan Number" name="currentMedicalPlanMemberID" ref={register} />
          </div>
          <span className={styles.inputLabel}>Renewal Date</span>
          <DatePicker
            placeholder='Renewal Date'
            name="currentMedicalPlanRenewalDate"
            autoComplete="off"
            className="candor spacing"
            showYearDropdown
            dropdownMode="select"
            control={control}
            filterDate={effectiveDateFilter}
          />
        </div>
      </div>
      <input type='submit' value='Next' style={{ marginTop: 50 }} />
    </form>
  </>
  async function save(data: any) {
    data.alreadyHasPlan = data.alreadyHasPlan === 'true'
    data.currentMedicalPlanRenewalDate = localMidnightToPharaohFormat(data.currentMedicalPlanRenewalDate)
    // FIXME renewal date is not saved
    onwards(api.updateUser(data).then(() => stargate.showUnderwritingPage))
  }

  function waiveCallback(isWaiving: boolean, waiveReason?: string) {
    return post(`/groups/${stargate.group?.id}/users/waive`, {
      waiveReason,
      isWaiving
    }).then(() => toggleWaiveCoverageModal(false)).catch(addToast)
  }
}

export default HavePlan
