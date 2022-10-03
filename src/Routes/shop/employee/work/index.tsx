/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import styles from './index.module.css'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { useForm } from 'react-hook-form'
import CandorInput from 'Components/Rudimentary/CandorInput'
import CandorSelect from 'Components/Rudimentary/Select'
import { CandorDatePicker } from 'Components/Anubis/CandorForm'
import * as api from 'Utilities/pharaoh'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import { Member, TaxStatusCode, TaxStatusValue } from 'Utilities/pharaoh.types'
import { useAsync } from 'react-use'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'

const EEShopWorkStatus: React.FC<PrivateWizardPageProps> = ({ stargate, ...props }) => {
  const async = useAsync(api.v3.users(stargate?.groupMember?.id).GET)

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  return <Form ee={async.value!} stargate={stargate} {...props} />
}

interface FormProps {
  ee: Member
}

const Form: React.FC<FormProps & PrivateWizardPageProps> = ({ onwards, ee, stargate }) => {
  const { register, handleSubmit, control } = useForm({ defaultValues: { ...ee, taxStatus: ee.taxStatus?.code.toString() } })
  const hiddenStyle = { display: 'none' }
  const showIncome = stargate.config.showAnnualIncome || stargate?.groupMember?.salary === null
  useEffect(() => {
    const ele = document.getElementById('content')
    if (!ele) return
    ele.style.backgroundColor = '#F3FFFC'
    ele.style.maxWidth = 'unset'
    return () => {
      ele.style.backgroundColor = ''
      ele.style.maxWidth = ''
    }
  })

  return <>
    <div className={styles.benifitEnrolment}>
      <p>Employee Benefits Enrollment</p>
    </div>
    <div className={styles.mainContainer}>
      <h1 style={{ marginBottom: 4 }} className='shop-h1-periwinkle'>Let’s verify your work status</h1>
      <h2 className='shop-h2-navy'>We make getting healthcare coverage super simple.</h2>
      <div className={styles.formContainer}>
        <form autoComplete="on" onSubmit={handleSubmit(save)}>
          <div className={styles.workStatCont}>
            <input ref={register} type='hidden' name='id' />
            <input ref={register} type='hidden' name='group.id' />
            <input ref={register} type='hidden' name='group.name' />
            <input ref={register} type='hidden' name='tier' />
            <input ref={register} type='hidden' name='status' />
            <input ref={register} type='hidden' name='isWaived' />
            <input ref={register} type='hidden' name='privilege' />
            <input ref={register} type='hidden' name='gender' />
            {/* <input ref={register} type='hidden' name='contact.name' />
        <input ref={register} type='hidden' name='address.street1' /> */}
            <div className={styles.left}>
              <CandorInput name="jobTitle" ref={register} autoComplete="organization-title" placeholder="Job Title" required />
            </div>
            <div className={styles.right}>
              <CandorInput name="hoursPerWeek" ref={register} type="number" placeholder="Hours Worked Per Week" required={true} />
            </div>
            <div className={styles.left} style={stargate.config.showHireDate ? undefined : hiddenStyle}>
              <CandorDatePicker
                name='dates.hire'
                id="hireDatePickerId"
                placeholder='Hire Date'
                control={control}
                required={stargate.config.showHireDate}
                showYearDropdown
                autoComplete="off"
                maxDate={new Date()}
                dropdownMode="select"
              />
            </div>
            <div className={styles.right} style={stargate.config.showTaxWitholdingStatus ? undefined : hiddenStyle}>
              <CandorSelect
                name="taxStatus"
                control={control}
                className={styles.select}
                options={taxOptions}
                placeholder="Tax Withholding Status"
                required={stargate.config.showTaxWitholdingStatus}
              />
            </div>
            {showIncome &&
              <div className={styles.left} style={showIncome ? undefined : hiddenStyle}>
                <CandorInput name="salary" ref={register} placeholder="Annual Income" required />
              </div>
            }
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <input type='submit' value='Next' />
          </div>
        </form>
      </div>
    </div>
  </>
  async function save(data: any) {
    if (typeof data.isWaived !== 'boolean') {
      data.isWaived = ee.isWaived
    }

    if (typeof data.isMedicallyUnderwritten !== 'boolean') {
      data.isMedicallyUnderwritten = ee.isMedicallyUnderwritten
    }

    if (typeof data.taxStatus !== 'number') {
      data.taxStatus = parseInt(data.taxStatus)
    }

    if (!data.contact) {
      data.contact = {}
    }

    if (!data.address) {
      data.address = {}
    }

    data.hoursPerWeek = parseInt(data.hoursPerWeek)
    data.dates.hire = localMidnightToPharaohFormat(data.dates.hire)
    onwards(api.v3.users().PUT(data))
  }
}

const taxOptions = [
  {
    value: TaxStatusCode.w2.toString(),
    label: TaxStatusValue.w2
  },
  {
    value: TaxStatusCode.tenNinetyNine.toString(),
    label: TaxStatusValue.tenNinetyNine
  },
  {
    value: TaxStatusCode.ownerOrPartner.toString(),
    label: TaxStatusValue.ownerOrPartner
  }
]

export default EEShopWorkStatus
