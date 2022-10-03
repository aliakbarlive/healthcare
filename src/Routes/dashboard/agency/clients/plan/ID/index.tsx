import React from 'react'
import styles from './index.module.scss'
import cbStyles from 'Components/Plans/plan-subcomponents/Checkboxes.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import { FormSectionHeader, FormInputWrapper, FormRow, FormSection } from 'Components/Rudimentary/FormComponents'
import * as api from 'Utilities/pharaoh'
import { get as _get } from 'lodash'
import { FetchError } from 'Utilities/fetch++'
import BackTo from 'Components/Anubis/BackTo'
import { Route } from 'Utilities/Route'
import { useHistory } from 'react-router'
import Select, { SelectProps } from 'Components/Rudimentary/Select'
import { useAsync, useToggle } from 'react-use'
import { CandorFormCheckbox } from 'Components/Anubis/CandorForm'
import { PlanType } from 'Utilities/pharaoh.types'
import RenewalPlanModal from './RenewalPlanModal'
import { maskMoneyInput } from 'Utilities/etc'

/* eslint-disable camelcase */

interface Props {
  id: string
}

const DashboardAgencyGroupsPlan: React.FC<Props> = ({ id }) => {
  const addToast = useToast()
  const history = useHistory()

  return <div className={styles.mainContainer}>
    <BackTo analytics={'Back to Associations (DashboardAgencyGroup)'} route={`${Route.agencyDashboardClients}/${id}`}>Back to Client Profile</BackTo>
    <h1 className='shop-h1-periwinkle'>Add Current and Renewal Rates</h1>
    <p>To build a comprehensive proposal, please enter the group’s current plan information and renewal rates. This plan and renewal will be included in your proposal. This plan is for comparison only and does not guarantee your group’s enrollment and issuance via our platform.</p>
    <Form callback={save} />
  </div>

  function save(data: RenewalPlansPayload): Promise<void> {
    return api.v3.groups(id).plans.POST(data).then(() => {
      addToast('Data successfully saved', 'success')
      history.push(`${Route.agencyDashboardClients}/${id}`)
    }).catch(addToast)
  }
}

interface FormProps {
  callback: (payload: RenewalPlansPayload) => Promise<void>
}

interface PlanDescription {
  premium: {
    individual?: string
    couple?: string
    singleParent?: string
    family?: string
    total?: string
  }
  copay: {
    primary?: string
    specialist?: string
    urgentCare?: string
  }
  rx: {
    generic?: string
    preferred?: string
    specialty?: string
  }
}

export interface RenewalPlansPayload {
  name: string
  carrier: string
  type: PlanType
  deductible: string
  oopMax: number
  coinsurance: string
  isLevelFunded: boolean
  oonCoverage: boolean
  sbc: string
  current: PlanDescription
  renewal: PlanDescription
}

const defaultValues: RenewalPlansPayload = {
  name: '',
  carrier: '',
  type: PlanType.HMO,
  deductible: '',
  oopMax: 0,
  coinsurance: '',
  isLevelFunded: false,
  oonCoverage: false,
  sbc: '',
  current: {
    premium: {},
    copay: { primary: '', specialist: '', urgentCare: '' },
    rx: { generic: '', preferred: '', specialty: '' }
  },
  renewal: {
    premium: {},
    copay: { primary: '', specialist: '', urgentCare: '' },
    rx: { generic: '', preferred: '', specialty: '' }
  }
}

const Form: React.FC<FormProps> = ({ callback }) => {
  const form = useForm({ defaultValues })
  const addToast = useToast()
  const [showConfirmModal, toggleConfirmModal] = useToggle(false)
  const formData = form.watch() as RenewalPlansPayload

  const planTypes = [
    { value: 'PPO', label: 'PPO' },
    { value: 'HMO', label: 'HMO' },
    { value: 'POS', label: 'POS' },
    { value: 'EPO', label: 'EPO' },
    { value: 'Indemnity', label: 'Indemnity' },
    { value: 'FixedBenefitNoNetwork', label: 'Fixed Benefit - No Network' },
    { value: 'Reference-Based Pricing', label: 'Reference-Based Pricing' }
  ]

  return <>
    {formData && <RenewalPlanModal isOpen={showConfirmModal} onSubmit={callback} onRequestClose={toggleConfirmModal} payload={formData} />}
    <FormProvider {...form} >
      <form className={styles.formContainer} onSubmit={form.handleSubmit(go)}>
        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Plan Details</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='name'>
              <CandorInput required name='name' placeholder='Plan Name' />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <CarrierPicker name='carrier' required />
          </FormRow>
          <FormRow>
            <Select style={{ width: '50%' }} name='type' placeholder='Plan Type' options={planTypes} required />
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Deductible</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='deductible'>
              <CandorInput style={{ width: '50%' }} required name='deductible' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>OOP Max</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='oopMax'>
              <CandorInput style={{ width: '50%' }} required name='oopMax' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Co-Insurance</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='coinsurance'>
              <CandorInput style={{ width: '50%' }} required name='coinsurance' placeholder='%'
                onBlur={input => {
                  input.currentTarget.value = input.currentTarget.value ? (input.currentTarget.value.replaceAll('%', '') + '%') : ''
                }}
              />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Level-Funded?</FormSectionHeader>
          <FormRow>
            <CandorFormCheckbox className={cbStyles.blueCheckmark} name='isLevelFunded' checked={false} />
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Out-of-Network Coverage?</FormSectionHeader>
          <FormRow>
            <CandorFormCheckbox className={cbStyles.blueCheckmark} name='oonCoverage' checked={false} />
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>SBC</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='sbc'>
              <CandorInput style={{ width: '50%' }} required name='sbc' placeholder='https://' />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Premiums</FormSectionHeader>
            <FormSectionHeader className={styles.formSectionHeader}>Current</FormSectionHeader>
            <FormSectionHeader className={styles.formSectionHeader}>Renewal</FormSectionHeader>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Individual</FormSectionHeader>
            <FormInputWrapper name='current.premium.individual'>
              <CandorInput name='current.premium.individual' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.premium.individual'>
              <CandorInput name='renewal.premium.individual' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Couple</FormSectionHeader>
            <FormInputWrapper name='current.premium.couple'>
              <CandorInput name='current.premium.couple' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.premium.couple'>
              <CandorInput name='renewal.premium.couple' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Employee + Child</FormSectionHeader>
            <FormInputWrapper name='current.premium.singleParent'>
              <CandorInput name='current.premium.singleParent' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.premium.singleParent'>
              <CandorInput name='renewal.premium.singleParent' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Family</FormSectionHeader>
            <FormInputWrapper name='current.premium.family'>
              <CandorInput name='current.premium.family' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.premium.family'>
              <CandorInput name='renewal.premium.family' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Total</FormSectionHeader>
            <FormInputWrapper name='current.premium.total'>
              <CandorInput name='current.premium.total' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.premium.total'>
              <CandorInput name='renewal.premium.total' placeholder='Cost per Month' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Copay</FormSectionHeader>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Primary</FormSectionHeader>
            <FormInputWrapper name='current.copay.primary'>
              <CandorInput name='current.copay.primary' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.copay.primary'>
              <CandorInput name='renewal.copay.primary' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Specialist</FormSectionHeader>
            <FormInputWrapper name='current.copay.specialist'>
              <CandorInput name='current.copay.specialist' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.copay.specialist'>
              <CandorInput name='renewal.copay.specialist' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Urgent Care</FormSectionHeader>
            <FormInputWrapper name='current.copay.urgentCare'>
              <CandorInput name='current.copay.urgentCare' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.copay.urgentCare'>
              <CandorInput name='renewal.copay.urgentCare' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>RX Costs</FormSectionHeader>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Generic</FormSectionHeader>
            <FormInputWrapper name='current.rx.generic'>
              <CandorInput name='current.rx.generic' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.rx.generic'>
              <CandorInput name='renewal.rx.generic' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Preferred</FormSectionHeader>
            <FormInputWrapper name='current.rx.preferred'>
              <CandorInput name='current.rx.preferred' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.rx.preferred'>
              <CandorInput name='renewal.rx.preferred' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <FormSectionHeader className={styles.formSectionHeader}>Specialty</FormSectionHeader>
            <FormInputWrapper name='current.rx.specialty'>
              <CandorInput name='current.rx.specialty' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
            <FormInputWrapper name='renewal.rx.specialty'>
              <CandorInput name='renewal.rx.specialty' placeholder='$' onBlur={maskMoneyInput} />
            </FormInputWrapper>
          </FormRow>
        </FormSection>

        <input type='submit' value='submit' style={{ marginLeft: 'auto', background: 'linear-gradient(180deg, #71C6FC 0%, #3F8FC1 100%)' }} />
      </form>
    </FormProvider>
  </>

  function go(data: RenewalPlansPayload) {
    if (data.current.premium.individual === '') delete data.current.premium.individual
    if (data.renewal.premium.individual === '') delete data.renewal.premium.individual
    if (data.current.premium.couple === '') delete data.current.premium.couple
    if (data.renewal.premium.couple === '') delete data.renewal.premium.couple
    if (data.current.premium.singleParent === '') delete data.current.premium.singleParent
    if (data.renewal.premium.singleParent === '') delete data.renewal.premium.singleParent
    if (data.current.premium.family === '') delete data.current.premium.family
    if (data.renewal.premium.family === '') delete data.renewal.premium.family
    if (data.current.premium.total === '') delete data.current.premium.total
    if (data.renewal.premium.total === '') delete data.renewal.premium.total
    try {
      toggleConfirmModal()
    } catch (error) {
      addToast(error as FetchError)
    }
  }
}

const CarrierPicker: React.FC<Omit<SelectProps, 'options'>> = ({ ...props }) => {
  const control = props.control || useFormContext().control
  const carriers = useAsync(async() => await api.v1.carriers()).value?.map((carrier: string) => ({ value: carrier, label: carrier }))

  return <Select
    {...props}
    placeholder='Carrier'
    options={carriers}
    isSearchable
    onChange={props.onChange}
    className={props.className}
    name={props.name}
    control={control}
  >
  </Select>
}

export default DashboardAgencyGroupsPlan
