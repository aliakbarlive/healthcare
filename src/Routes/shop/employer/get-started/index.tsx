import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import formStyles from 'Components/Rudimentary/FormComponents.module.scss'
import CandorInput, { CandorInputProps } from 'Components/Rudimentary/CandorInput'
import IndustryPicker from 'Components/Rudimentary/Select/IndustryPicker'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import DateSelector from 'Components/Stargate/DateSelector'
import TermsAndConditions from 'Components/Modals/TnC/TermsAndConditions'
import moment from 'moment'
import { useAsync, useSet, useToggle } from 'react-use'
import { get } from 'Utilities/fetch++'
import { AssociationCheckbox } from 'Components/Plans/plan-subcomponents/Checkboxes'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import { WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import useToast from 'Utilities/Hooks/useToast'
import effectiveDateFilter from 'Utilities/Plans/effectiveDateFilter()'
import { PowerLevel } from 'Utilities/Hooks/useUser'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import ZipInput from 'Components/Rudimentary/ZipInput'
import { FormSectionHeader, FormInputWrapper, FormRow, FormSection } from 'Components/Rudimentary/FormComponents'
import * as api from 'Utilities/pharaoh'
import { defaultMinimumDate } from 'Utilities/etc'
import { useWhiteLabelFromSearchParams, useWhiteLabel } from 'Utilities/Hooks/useWhiteLabel'
import { Association } from 'Utilities/pharaoh.types'
import { Route as RaRoute } from 'Utilities/Route'
import { useHistory } from 'react-router'
import { get as _get } from 'lodash'
import { ErrorMessage } from '@hookform/error-message'
import { FieldError } from '@hookform/error-message/dist/types'
import IndividualModeModal from 'Components/Modals/IndividualModeModal'

/* eslint-disable camelcase */

const ERShopGetStarted: React.FC<WizardPageProps> = ({ onwards, stargate: async }) => {
  const { group, user, userMetadata, associationIds, groupMember, contact, members } = async.value || {}
  const label = useWhiteLabel().label
  const isBroker = user && user.power_level >= PowerLevel.broker
  useEffect(() => {
    const el = document.getElementById('content')
    if (!el) return
    el.style.backgroundColor = '#EDF6FB'
    el.style.maxWidth = 'unset'
    return () => {
      el.style.backgroundColor = ''
      el.style.maxWidth = ''
    }
  })
  const defaults: Payload = {
    group: {
      zip: group?.zipCode,
      fips: group?.countyID,
      ein: group?.ein,
      phone: contact?.phone,
      industry: group?.industrySICCode,
      name: group?.name,
      address1: group?.address1,
      address2: group?.address2,
      city: group?.city,
      cellPhone: contact?.cell_phone,
      contactMethod: contact?.contact_method
    },
    user: isBroker
      ? {
        email: contact?.email,
        jobTitle: members?.find(m => m.email === contact?.email)?.jobTitle,
        firstName: contact?.name?.split(' ')[0],
        lastName: contact?.name?.split(' ').slice(1).join(' '),
        acceptedTermsAndConditions: user?.acceptedTermsAndConditions || false
      }
      : {
        email: user?.email,
        jobTitle: groupMember?.jobTitle || userMetadata?.jobTitle,
        firstName: user?.first_name,
        lastName: user?.last_name,
        acceptedTermsAndConditions: user?.acceptedTermsAndConditions || false
      },
    effectiveDate: group?.effectiveDate,
    associations: associationIds,
    existingCoverage: {
      renewalDate: group?.existingCoverageRenewalDate,
      carrier: group?.existingCoverageCarrier
    }
  }

  return <>
    <div className={styles.benifitEnrolment}>
      <p>Employer Benefits Enrollment</p>
    </div>
    <div className={styles.mainContainer}>
      <h1 className='shop-h1-periwinkle'>You’re on your way to getting your personalized quote!</h1>
      <Form defaultValues={defaults} callback={save} isBroker={isBroker} />
    </div>
  </>

  function save(data: Payload): Promise<void> {
    return onwards((async() => {
      const rsp = await api.v2.groups(group?.id).POST(data, label)
      localStorage.overrideGroupID = rsp.id
    })())
  }
}

interface FormProps {
  isBroker: boolean | undefined
  defaultValues: Payload
  callback: (payload: Payload) => Promise<void>
}

interface Payload {
  user: {
    acceptedTermsAndConditions: boolean
    email?: string
    firstName?: string
    lastName?: string
    jobTitle?: string
  }
  group: {
    ein?: string
    zip?: string
    fips?: string
    name?: string
    phone?: string
    industry?: string
    address1?: string
    address2?: string
    city?: string
    cellPhone?: string
    contactMethod?: string
  }
  effectiveDate?: Date
  associations?: string[]
  existingCoverage: {
    renewalDate?: Date
    carrier?: string
  }
}

const Form: React.FC<FormProps> = ({ callback, defaultValues, isBroker }) => {
  if (defaultValues.group.name === defaultValues.user.email) { defaultValues.group.name = '' }
  const form = useForm({ defaultValues })
  const { register, formState: { dirtyFields }, watch } = form
  const watchEffectiveDate = watch('effectiveDate', defaultValues.effectiveDate)
  const [associationIDs, { toggle: toggleAssociationID }] = useSet(new Set(defaultValues.associations || []))
  const maxEffectiveDate = moment().add(3, 'quarter').endOf('quarter').toDate()
  const zip = form.watch('group.zip', defaultValues.group.zip)
  const addToast = useToast()
  const requireCopy = (field: string, type: 'fill in' | 'select' = 'fill in') => `Please ${type} your ${isBroker ? `client's ${field}` : field}`
  const label = useWhiteLabelFromSearchParams()
  const asses = useAsync(async() => get('/v2/associations', label?.url)).value as Association[]
  const associations = asses && asses.map(ass => ({ name: ass.name, id: ass.id }))

  return <FormProvider {...form} >
    <form className={styles.formContainer} onSubmit={form.handleSubmit(save)}>
      <div className= {styles.erFormSec}>
        <FormSection>
          <FormSectionHeader>First a little about your company</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='group.name'>
              <CandorInput ref={register({ required: requireCopy('Company Name') })} name='group.name' placeholder='Company Name' />
            </FormInputWrapper>
            <EIN ref={register({ required: true })} name='group.ein'/>
          </FormRow>

          <FormInputWrapper name='group.industry'>
            <IndustryPicker rules={{ required: requireCopy('Industry', 'select') }} name='group.industry' />
          </FormInputWrapper>

          <FormRow>
            <FormInputWrapper name='group.address1'>
              <CandorInput ref={register({ required: requireCopy('Address') })} name='group.address1' placeholder='Address1'/>
            </FormInputWrapper>
            <FormInputWrapper name='group.address2'>
              <CandorInput name='group.address2' placeholder='Address2'/>
            </FormInputWrapper>
          </FormRow>

          <FormRow>
            <FormInputWrapper name='group.city'>
              <CandorInput ref={register({ required: requireCopy('City') })} name='group.city' placeholder='City'/>
            </FormInputWrapper>
            <FormInputWrapper name='group.zip'>
              <ZipInput rules={{ required: requireCopy('Zip Code') }} name='group.zip' placeholder='Zip Code' />
            </FormInputWrapper>
            <FormInputWrapper name='group.fips'>
              <CountyPicker rules={{ required: zip && requireCopy('County', 'select') }} name='group.fips' zip={zip} />
            </FormInputWrapper>
          </FormRow>

          <FormSection>
            <FormSectionHeader>Now a little about you</FormSectionHeader>
            <FormRow>
              <FormInputWrapper name='user.firstName'>
                <CandorInput ref={register({ required: requireCopy('First Name') })} name='user.firstName' placeholder='First Name' />
              </FormInputWrapper>
              <FormInputWrapper name='user.lastName'>
                <CandorInput ref={register({ required: requireCopy('Last Name') })} name='user.lastName' placeholder='Last Name' />
              </FormInputWrapper>
            </FormRow>
            <FormRow>
              <FormRow>
                <FormInputWrapper name='user.jobTitle'>
                  <CandorInput ref={register({ required: requireCopy('Job Title') })} name='user.jobTitle' placeholder='Job Title' />
                </FormInputWrapper>
                <FormInputWrapper name='user.email'>
                  <CandorInput name='user.email' placeholder='Email Address' readOnly={!isBroker || !!defaultValues.user.email} />
                </FormInputWrapper>
              </FormRow>
            </FormRow>
            <FormRow>
              <FormInputWrapper name='group.phone'>
                <PhoneInput
                  rules={
                    {
                      pattern: {
                        value: /^\(\d{3}\) \d{3}-\d{4}$/,
                        message: 'Please enter a valid phone number'
                      },
                      required: requireCopy('Phone Number')
                    }
                  }
                  name='group.phone'
                  placeholder='Work Phone'
                  defaultValue={defaultValues.group.phone}
                  noValidate/> { /* Override validation in phoneInput component */ }
              </FormInputWrapper>
              <FormInputWrapper name='group.cellPhone'>
                <PhoneInput
                  rules={
                    {
                      pattern: {
                        value: /^\(\d{3}\) \d{3}-\d{4}$/,
                        message: 'Please enter a valid phone number'
                      }
                    }
                  }
                  name='group.cellPhone'
                  placeholder='Cell Phone'
                  defaultValue={defaultValues.group.cellPhone}
                  noValidate/> { /* Override validation in phoneInput component */ }
              </FormInputWrapper>
            </FormRow>
            <FormInputWrapper name='group.contactMethod'>
              <label>What is your preferred method of contact?</label><br/>
              <input ref={register({ required: requireCopy('preferred method of contact', 'select') })} name='group.contactMethod' type='radio' value='email' /> Email <br/>
              <input ref={register({ required: requireCopy('preferred method of contact', 'select') })} name='group.contactMethod' type='radio' value='phone' /> Phone <br/>
            </FormInputWrapper>
          </FormSection>

          <FormSection>
            <FormSectionHeader>When would you like your coverage to start?</FormSectionHeader>
            <FormInputWrapper name='effectiveDate' errorPosition='top'>
              <Controller
                name='effectiveDate'
                render={props => <DateSelector
                  {...props}
                  filterDate={effectiveDateFilter}
                  minDate={defaultMinimumDate()}
                  maxDate={maxEffectiveDate}
                  openToDate={defaultMinimumDate()}
                />}
                defaultValue={defaultValues.effectiveDate}
                rules={{
                  validate: () => {
                    const date = form.getValues('effectiveDate')
                    if (!date) { return requireCopy('Effective Data') }
                    if (date > maxEffectiveDate) {
                      return `Effective Date cannot be greater than ${moment(maxEffectiveDate).format('MMM Do, YYYY')}`
                    }
                    if (date < defaultMinimumDate()) {
                      return `Effective Date cannot be less than ${moment(defaultMinimumDate()).format('MMM Do, YYYY')}`
                    }
                    if (moment(date).date() !== 1/* && moment(date).date() !== 15 */) {
                    // ^^ 15th disabled for now
                      return 'Effective Date must fall on the 1st of the month'
                    }
                  }
                }}
              />
              <p className={styles.caveats}>Please note: while all available carriers will provide a quote, many carriers have
                enrollment timelines and deadlines. We encourage selecting an effective date at least 30 days from the current
                date. Please contact <a href="mailto:support@myhealthily.com">support@myhealthily.com</a> for more information.</p>
              { dirtyFields.effectiveDate && defaultValues.effectiveDate !== watchEffectiveDate &&
              <p className={styles.caveats}>
                Changing the effective date will clear any medical plans <br/>you or your employees have selected.
              </p>
              }
            </FormInputWrapper>
          </FormSection>

          <FormSection>
            <FormSectionHeader>Do you have existing healthcare coverage?</FormSectionHeader>
            <FormInputWrapper name='existingCoverage.renewalDate' errorPosition='top'>
              <p style={{ margin: '0 0 20px' }}>If so, when would it renew if you kept it?</p>
              <Controller
                name='existingCoverage.renewalDate'
                render={props => <DateSelector
                  {...props}
                  filterDate={effectiveDateFilter}
                  minDate={new Date()}
                />}
                rules={{
                  validate: () => {
                    const date: Date | undefined = form.getValues('existingCoverage.renewalDate')
                    const min = new Date()
                    if (!date || date >= min) { return true }
                    return 'Your renewal date cannot be prior to today'
                  }
                }}
                defaultValue={defaultValues.existingCoverage.renewalDate}
              />
            </FormInputWrapper>
            <FormInputWrapper name='existingCoverage.carrier'>
              <CandorInput name='existingCoverage.carrier' placeholder='Carrier'/>
              <p className={styles.caveats} style={{ margin: 6 }}>eg. UnitedHealthcare, Humana, etc.</p>
            </FormInputWrapper>
          </FormSection>

          <Associations asses={associations} selected={associationIDs} onSelected={toggleAssociationID} />
        </FormSection>
      </div>
      <TermsAndConditions name='user.acceptedTermsAndConditions' containerClassName={styles.termsContainer}/>
      <input type='submit' value='Next' />
    </form>
  </FormProvider>

  async function save(data: any) {
    try {
      if (data.effectiveDate && (data.effectiveDate < defaultMinimumDate() || data.effectiveDate > maxEffectiveDate || !effectiveDateFilter(data.effectiveDate))) throw new window.Error('Invalid effective date')
      data.group.zip = zip
      data.effectiveDate = localMidnightToPharaohFormat(data.effectiveDate)
      data.existingCoverage.renewalDate = localMidnightToPharaohFormat(data.existingCoverage?.renewalDate)
      data.associations = Array.from(associationIDs)
      if (associations.length > 0 && (data.associations && data.associations.length === 0)) throw new window.Error('Please select your association memberships')
      await callback(data)
      // form.unpersist()
    } catch (error) {
      addToast(error as Error)
    }
  }
}

interface AssociationsProps {
  selected: Set<string>
  onSelected: (id: string) => void
  asses: Association[]
}

const Associations: React.FC<AssociationsProps> = ({ selected, onSelected, asses }) => {
  if (asses && asses.length === 0) return <> </>
  const items = asses && asses.map(ass => <AssociationCheckbox
    key={ass.id}
    name={ass.name}
    label={ass.name}
    onChange={() => onSelected(ass.id)}
    value={selected.has(ass.id)}
  />)

  return <>
    <FormSectionHeader style={{ marginBottom: '-5px' }}>To which associations do you belong?</FormSectionHeader>
    <div className={`${styles.form2col} ${styles.associations} ${styles.halfWidth}`}>
      {items}
    </div>
  </>
}

const EIN = React.forwardRef<any, CandorInputProps>(({ name }, ref) => {
  const history = useHistory()
  const addToast = useToast()
  const { errors } = useFormContext()
  const einError = _get(errors, name) as FieldError
  const [showInfo, toggleShowInfo] = useToggle(false)
  const [loading, setLoading] = useState(false)

  return <div>
    <IndividualModeModal isOpen={showInfo} onRequestClose={toggleShowInfo} contentType='ein' loading={loading}/>
    <div className={styles.inputWrapper}>
      <CandorInput name={name} ref={ref} placeholder='Employer Identification Number (EIN)'/>
      <button type='button' className={styles.info} onClick={toggleShowInfo}>i</button>
    </div>
    <ErrorMessage
      name={name}
      errors={errors}
      render={err => {
        if (einError.type === 'required') {
          return <span className={formStyles.formError}>If you don’t have an EIN, you may be looking for the <a href='#' onClick={switchToIndividual}>individual shop</a>.</span>
        }
        return <span className={formStyles.formError}>{err.messages || err.message}</span>
      }}
    />
  </div>

  async function switchToIndividual() {
    try {
      setLoading(true)
      const res = await api.v3.groups().individual.POST()
      history.push(`${RaRoute.signUp}/${res.token}`)
    } catch (error) {
      addToast(error as Error)
    } finally {
      setLoading(false)
    }
  }
})

EIN.displayName = 'EIN'

export default ERShopGetStarted
