import React from 'react'
import styles from './index.module.scss'
import cbStyles from 'Components/Plans/plan-subcomponents/Checkboxes.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import TermsAndConditions from 'Components/Modals/TnC/TermsAndConditions'
import { useToggle } from 'react-use'
import { FormProvider, useForm } from 'react-hook-form'
import { WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import useToast from 'Utilities/Hooks/useToast'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import { FormSectionHeader, FormInputWrapper, FormRow, FormSection } from 'Components/Rudimentary/FormComponents'
import * as api from 'Utilities/pharaoh'
import { get as _get } from 'lodash'
import ZipInput from 'Components/Rudimentary/ZipInput'
import StatePicker from 'Components/Rudimentary/Select/StatePicker'
import { Checkbox } from 'Components/Plans/plan-subcomponents/Checkboxes'
import Tooltip from 'Components/Stargate/ToolTip/Tooltip'
import { classNames } from 'Utilities/etc'
import { Route } from 'Utilities/Route'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import { FetchError } from 'Utilities/fetch++'

/* eslint-disable camelcase */

const AgencySignUp: React.FC<WizardPageProps> = ({ onwards, stargate: async }) => {
  const { user, agency } = async.value || {}
  const addToast = useToast()

  const defaults: Payload = {
    agency: {
      name: agency?.name,
      legalName: agency?.legalName,
      phone: agency?.phone,
      address1: agency?.address1,
      address2: agency?.address2,
      city: agency?.city,
      state: agency?.state,
      zip: agency?.zip,
      slug: agency?.slug,
      nipr: agency?.nipr
    },
    user: {
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
      acceptedTermsAndConditions: user?.acceptedTermsAndConditions || false
    },
    contact: {
      firstName: agency?.contactFirstName,
      lastName: agency?.contactLastName,
      email: agency?.contactEmail,
      phone: agency?.contactPhone
    },
    password: undefined,
    confirmPassword: undefined,
    saveOnly: false
  }

  return <div className={styles.mainContainer}>
    <h1 className='shop-h1-periwinkle'>Welcome to the Future of Small Group Health Insurance</h1>
    <Form defaultValues={defaults} callback={save} />
  </div>

  function save(data: Payload): Promise<void> {
    return api.v3.agency.POST(data).then(rsp => {
      localStorage.token = localStorage.token || rsp.token
      if (!data.saveOnly) return onwards(Promise.resolve())
      else addToast('Data successfully saved', 'success')
    })
  }
}

interface FormProps {
  defaultValues: Payload
  callback: (payload: Payload) => Promise<void>
}

interface Contact {
  acceptedTermsAndConditions?: boolean
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

interface Payload {
  user: Contact
  contact: Contact
  password?: string
  confirmPassword?: string
  agency: {
    name?: string
    legalName?: string
    phone?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    slug?: string
    nipr?: string
  }
  saveOnly: boolean
}

const Form: React.FC<FormProps> = ({ callback, defaultValues }) => {
  const form = useForm({ defaultValues })
  const [sameAdmin, toggleAdmin] = useToggle(!defaultValues.contact.firstName)
  const { register } = form
  const addToast = useToast()
  const requireCopy = (field: string, type: 'fill in' | 'select' = 'fill in') => `Please ${type} your ${field}`

  return <FormProvider {...form} >
    <form className={styles.formContainer} onSubmit={form.handleSubmit(data => go(data, false))}>
      <FormSection>
        <FormSectionHeader className={styles.formSectionHeader}>Nice to meet you!</FormSectionHeader>
        <FormRow>
          <FormInputWrapper name='user.firstName'>
            <CandorInput ref={register({ required: requireCopy('First Name') })} name='user.firstName' placeholder='First Name' />
          </FormInputWrapper>
          <FormInputWrapper name='user.lastName'>
            <CandorInput ref={register({ required: requireCopy('Last Name') })} name='user.lastName' placeholder='Last Name' />
          </FormInputWrapper>
        </FormRow>
      </FormSection>

      <FormSection>
        <FormSectionHeader className={styles.formSectionHeader}>Tell us a little more about you and your agency</FormSectionHeader>
        <FormRow>
          <FormInputWrapper name='agency.nipr'>
            <div className={styles.inputWrapper}>
              <CandorInput ref={register({ required: requireCopy('Agency NPN') })} name='agency.nipr' placeholder='Agency NPN' />
              <button type='button' className={styles.info} data-tip data-for='npnTooltip'>i</button>
              <Tooltip
                id='npnTooltip'
                place='bottom'
                offset={{ top: 0, right: 0 }}
                delayHide={100}
                backgroundColor='linear-gradient(135deg, #0B4BF7 0%, #8B17BB 100%)'
              >
                <span>You can look up your business’ National Producer Number on <a href='https://nipr.com' target='_blank' rel='noreferrer'>NIPR.com</a>.</span>
              </Tooltip>
            </div>
          </FormInputWrapper>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='user.email'>
            <CandorInput name='user.email' placeholder='Email Address' ref={!defaultValues.user.email ? register({ required: requireCopy('Email') }) : undefined} disabled={!!defaultValues.user.email} />
          </FormInputWrapper>
          <FormInputWrapper name='agency.phone'>
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
              name='agency.phone'
              placeholder='Phone'
              defaultValue={defaultValues.agency.phone}
              noValidate/>
          </FormInputWrapper>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='agency.legalName'>
            <CandorInput ref={register({ required: requireCopy('Legal Business Name') })} name='agency.legalName' placeholder='Legal Business Name' />
          </FormInputWrapper>
          <FormInputWrapper name='agency.name'>
            <CandorInput name='agency.name' placeholder='Business Name' />
          </FormInputWrapper>
        </FormRow>
        <FormRow>
          <p></p>
          <p className={styles.caveats}>If different from your legal business name</p>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='agency.address1'>
            <CandorInput ref={register({ required: requireCopy('Business Address') })} name='agency.address1' placeholder='Business Address1'/>
          </FormInputWrapper>
          <FormInputWrapper name='agency.address2'>
            <CandorInput name='agency.address2' placeholder='Business Address 2'/>
          </FormInputWrapper>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='agency.city'>
            <CandorInput ref={register({ required: requireCopy('City') })} name='agency.city' placeholder='City'/>
          </FormInputWrapper>
          <FormInputWrapper name='agency.state'>
            <StatePicker ref={register({ required: requireCopy('State ') })} name='agency.state' placeholder='State' required />
          </FormInputWrapper>
          <FormInputWrapper name='agency.zip'>
            <ZipInput rules={{ required: requireCopy('Zip Code') }} name='agency.zip' placeholder='Zip Code' />
          </FormInputWrapper>
        </FormRow>
      </FormSection>

      <FormSection>
        <FormSectionHeader className={styles.formSectionHeader}>HR or administrator details (if that&apos;s not you)</FormSectionHeader>
        <Checkbox
          label='Same as Above'
          labelClassName={cbStyles.termsLabel}
          checked={sameAdmin}
          onChange={toggleAdmin}
        />
        { !sameAdmin && <>
          <FormRow>
            <FormInputWrapper name='contact.firstName'>
              <CandorInput ref={register({ required: requireCopy('First Name') })} name='contact.firstName' placeholder='First Name' />
            </FormInputWrapper>
            <FormInputWrapper name='contact.lastName'>
              <CandorInput ref={register({ required: requireCopy('Last Name') })} name='contact.lastName' placeholder='Last Name' />
            </FormInputWrapper>
          </FormRow>

          <FormRow>
            <FormInputWrapper name='contact.email'>
              <CandorInput ref={register({ required: requireCopy('Email') })} name='contact.email' placeholder='Email Address' />
            </FormInputWrapper>
            <FormInputWrapper name='contact.phone'>
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
                name='contact.phone'
                placeholder='Phone'
                defaultValue={defaultValues.contact.phone}
                noValidate/>
            </FormInputWrapper>
          </FormRow>
        </>}

      </FormSection>
      { !defaultValues.user.email &&
        <FormSection>
          <FormSectionHeader className={styles.formSectionHeader}>Now, create your password</FormSectionHeader>
          <FormRow>
            <FormInputWrapper name='password'>
              <CandorInput name="password" type="password" placeholder="Password" required />
            </FormInputWrapper>
            <FormInputWrapper name='confirmPassword'>
              <CandorInput name="confirmPassword" type="password" placeholder="Confirm Password" required />
            </FormInputWrapper>
          </FormRow>
          <FormRow>
            <p className={styles.caveats}>Password must contain at least 8 characters, an uppercase and a lowercase letter, a special character, and a number</p>
            <></>
          </FormRow>
        </FormSection>
      }

      <FormSection>
        <FormSectionHeader className={styles.formSectionHeader}>Generate your shop URL</FormSectionHeader>
        <FormRow>
          <p>https://app.myhealthily.com/landing/</p>
          <FormInputWrapper name='agency.slug'>
            <CandorInput ref={register({ required: requireCopy('Agency Identifier') })} name='agency.slug' placeholder='Your Unique Identifier' className={styles.leftShifted} />
          </FormInputWrapper>
          <></>
        </FormRow>
        <FormRow>
          <p></p>
          <p className={classNames(styles.caveats, styles.leftShifted)}>This is your unique agency shop link.</p>
          <p></p>
        </FormRow>
      </FormSection>

      <TermsAndConditions name='user.acceptedTermsAndConditions' containerClassName={styles.termsContainer} withBAA/>
      <ShopButtons backTo={Route.agencyShop_GetStarted} backToName={'Get Started'} pageName={'AgencySignUp'} save={form.handleSubmit(data => go(data, true))} />
    </form>
  </FormProvider>

  async function go(data: Payload, saveOnly: boolean) {
    try {
      if (data.password && data.password.length > 0 && data.password !== data.confirmPassword) throw Error('Passwords do not match')
      const data_: Payload = { ...data, saveOnly }
      await callback(data_)
    } catch (error) {
      addToast(error as FetchError)
    }
  }
}

export default AgencySignUp
