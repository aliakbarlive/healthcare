/* eslint-disable camelcase */
import React from 'react'
import Select from 'Components/Rudimentary/Select'
import styles from './CarrierApplication.module.scss'
import Input from 'Components/Rudimentary/CandorInput'
import { FormProvider } from 'react-hook-form'
import { host, Host } from 'Utilities/config'
import usePersistableForm from 'Utilities/Hooks/usePersistableForm'
import useToast from 'Utilities/Hooks/useToast'
import useContentAdjustment from 'Utilities/Hooks/useContentAdjustment'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import * as api from 'Utilities/pharaoh'

const business_types = [
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'C-Corp', label: 'C-Corp' },
  { value: 'S-Corp', label: 'S-Corp' },
  { value: 'Non-Profit', label: 'Non-Profit' }
]

interface Props {
  cancelCallback?: () => void
  groupID: string
  callback?: () => void
  asyncCallback?: (api: Promise<void>) => void
}

const CarrierApplication: React.FC<Props> = props => {
  const form = usePersistableForm(`group/${props.groupID}/carrier-application`)
  const { handleSubmit, watch, register } = form
  const multipleLocations = watch('multiple_locations')
  const addToast = useToast()
  useContentAdjustment({ paddingTop: 0 })

  return <FormProvider {...form}>
    <div className={styles.applicationComponent}>
      <h1>Information for the carrier</h1>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className={styles.form2col}>

        <h3>Company</h3>
        <Select
          options={business_types}
          name="business_type"
          placeholder="Business Type"
          required={required()} />

        <p>How long has the company been<br />in business?</p>
        <div className={styles.threeCol}>
          <div className={styles.colItem}>
            <Input ref={register({ valueAsNumber: true })} type="number" placeholder='Years' name="business_age" />
          </div>
        </div>

        <div className={styles.threeCol}>
          <h3>Billing Contact</h3>
          <div className={styles.colItem}>
            <Input autoComplete="name" name="billing_name" placeholder="Name" required={required()} />
          </div>
          <div className={styles.colItem}>
            <PhoneInput autoComplete="tel-national" name="business_phone" placeholder="Phone Number" required={required()} />
          </div>
          <div className={styles.colItem}>
            <Input autoComplete="email" name="business_email" placeholder="Email" required={required()} />
          </div>
        </div>

        <div className={styles.threeCol}>
          <h3>HR Contact</h3>
          <div className={styles.colItem}>
            <Input autoComplete="name" name="hr_name" placeholder="Name" />
          </div>
          <div className={styles.colItem}>
            <PhoneInput required={false} autoComplete="tel-national" name="hr_phone" placeholder="Phone Number" />
          </div>
          <div className={styles.colItem}>
            <Input autoComplete="email" name="hr_email" placeholder="Email" />
          </div>
        </div>

        <h3>Waiting Period</h3>
        <p className={styles.noTopMargin}>The length of time that future employees must be employed before becoming eligible for coverage.</p>
        <p className={styles.noTopMargin} style={{ fontSize: 13 }}>Note: The effective date is the first day of the month following an employee&apos;s waiting period. However, the employee must enroll within 30 days prior to the end of the waiting period. Failure to do so will result in the employee being automatically waived and forced to wait until the next open enrollment period for the group.</p>
        <Select name="waiting_period" options={[
          { value: '0 days', label: '0 days' },
          { value: '30 days', label: '30 days' },
          { value: '60 days', label: '60 days' },
          { value: '90 days', label: '90 days' }
        ]} />

        <h3>General</h3>
        <p className={styles.noTopMargin}>Did you employ 20 or more full-time equivalent employees for at least 50% of the previous calendar year?</p>
        <Select name="employed_20" options={[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }

        ]} />
        <p>Is your company subject to the requirements of COBRA?</p>
        <Select name="cobra_select" options={[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ]} />
        <p>Do you want to offer COBRA if your current or future group size does not require this?</p>
        <Select name="offer_optional_cobra" options={[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ]} />
        <p>Does your company have other business organizations under common ownership or more than one Federal Tax ID?</p>
        <Select name="other_business_organizations" options={[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ]} />
        <p>Does your business have more than one physical location?</p>
        <Select name="multiple_locations" required={required()} options={[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ]} />
        {multipleLocations === 'true' && <>
          <p>If yes what are the addresses of your other businesses?</p>
          <textarea autoComplete="street-address" className={styles.candorInput} name="other_business_addresses" ref={register} />
        </>}
        <p>Will you be or are you offering another group medical plan in addition to those you selected?</p>
        <Select name="offering_another_group_medical" options={[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ]} />

        <div className={styles.twoCol} style={{ marginTop: '3em' }}>
          <div className={styles.colItem}>
            <p className={styles.noTopMargin}>Full-time employees</p>
            <Input ref={register({ valueAsNumber: true })} type="number" name="full_time_percent" placeholder="Number of employees" required={required()} />
          </div>
          <div className={styles.colItem}>
            <p className={styles.noTopMargin}>Part-time employees</p>
            <Input ref={register({ valueAsNumber: true })} type="number" name="part_time_percent" placeholder="Number of Employees" required={required()} />
          </div>
          <input className={styles.nextButton} type='submit' value='Submit' />
          {props.cancelCallback &&
          <button type='button' className={styles.nextButton} onClick={e => { e.preventDefault(); props.cancelCallback!() }}>Cancel</button>
          }
        </div>
      </form>
    </div>
  </FormProvider>

  function onSubmit(data: any) {
    if (props.cancelCallback) {
      addToast('Submitting…')
    }

    ['employed_20',
      'cobra_select',
      'offer_optional_cobra',
      'other_business_organizations',
      'multiple_locations',
      'offering_another_group_medical'
    ].forEach(key => (data[key] = data[key] === 'true'))

    const promise = () => api.v3.groups(props.groupID).carrierApplication.POST({ ...data, group_id: props.groupID }).then(props.callback)

    if (props.asyncCallback) {
      props.asyncCallback(promise())
    } else {
      promise()
    }
  }

  function required() {
    switch (host()) {
    case Host.localhost:
    case Host.cd:
    case Host.develop:
      return false
    case Host.staging:
    case Host.production:
      return true
    }
  }
}

export default CarrierApplication
