import React from 'react'
import styles from './BasicForm.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import TermsAndConditions from 'Components/Modals/TnC/TermsAndConditions'
import { FormProvider, useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import { FormSectionHeader, FormInputWrapper, FormRow, FormSection } from 'Components/Rudimentary/FormComponents'
import * as api from 'Utilities/pharaoh'
import { get as _get } from 'lodash'
import Tooltip from 'Components/Stargate/ToolTip/Tooltip'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import { FetchError } from 'Utilities/fetch++'
import { useAsyncRetry } from 'react-use'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { Tabs } from '.'
import { classNames } from 'Utilities/etc'

/* eslint-disable camelcase */

interface BasicFormProps {
  transitionTab: React.Dispatch<React.SetStateAction<Tabs>>
}

const BasicForm: React.FC<BasicFormProps> = ({ transitionTab }) => {
  const { value: user, loading, error } = useAsyncRetry(() => api.v3.brokers.GET())
  const addToast = useToast()

  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const defaults: Payload = {
    name: user?.name,
    email: user?.email,
    nipr: user?.nipr,
    phone: user?.phone,
    cellPhone: user?.cellPhone,
    acceptedTermsAndConditions: user?.acceptedTermsAndConditions || false,
    slug: user?.agency?.slug,
    saveOnly: false
  }

  return <div className={styles.mainContainer}>
    <h1 className='shop-h1-periwinkle'>Ready to Sell More and Stress Less?</h1>
    <h2>Welcome to the future of small group health insurance. Access accurate real-time quotes from medical and ancillary carriers. Enroll groups quickly and easily with zero paperwork. Keep 100% of retail commissions.</h2>
    <div className={styles.noticeBox}>
      <span></span>
      <p>Your agency has added you as a producer or customer service representative. Complete your profile and add your licenses and appointments now to get started.</p>
    </div>
    <Form defaultValues={defaults} callback={save} />
  </div>

  function save(data: Payload): Promise<void> {
    return api.v3.brokers.POST(data).then(() => {
      if (!data.saveOnly) transitionTab(Tabs.licenses)
      else addToast('Data successfully saved', 'success')
    })
  }
}

interface FormProps {
  defaultValues: Payload
  callback: (payload: Payload) => Promise<void>
}

interface Payload {
  name?: string
  email?: string
  nipr?: string
  phone?: string
  cellPhone?: string
  acceptedTermsAndConditions?: boolean
  slug?: string
  saveOnly: boolean
}

const Form: React.FC<FormProps> = ({ callback, defaultValues }) => {
  const form = useForm({ defaultValues })
  const { register } = form
  const addToast = useToast()
  const requireCopy = (field: string, type: 'fill in' | 'select' = 'fill in') => `Please ${type} your ${field}`

  return <FormProvider {...form} >
    <form className={styles.formContainer} onSubmit={form.handleSubmit(data => go(data, false))}>
      <FormSection>
        <FormSectionHeader className={styles.formSectionHeader}>Nice to meet you!</FormSectionHeader>
        <FormRow>
          <FormInputWrapper name='name'>
            <CandorInput ref={register({ required: requireCopy('Name') })} name='name' placeholder='Name' />
          </FormInputWrapper>
          <></>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='email'>
            <CandorInput name='email' placeholder='Email Address' ref={register({ required: requireCopy('Email') }) } />
          </FormInputWrapper>
          <></>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='nipr'>
            <div className={styles.inputWrapper}>
              <CandorInput ref={register({ required: requireCopy('Producer NPN') })} name='nipr' placeholder='Producer NPN' />
              <button type='button' className={styles.info} data-tip data-for='npnTooltip'>i</button>
              <Tooltip
                id='npnTooltip'
                place='right'
                offset={{ top: 0, right: 0 }}
                delayHide={100}
                backgroundColor='linear-gradient(135deg, #3777CB 0%, #002B64 100%)'
                arrowColor='#2963B0'
              >
                <span>You can look up your National Producer Number on <a href='https://nipr.com' target='_blank' rel='noreferrer'>NIPR.com</a>.</span>
              </Tooltip>
            </div>
          </FormInputWrapper>
          <></>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='phone'>
            <PhoneInput
              rules={
                {
                  pattern: {
                    value: /^\(\d{3}\) \d{3}-\d{4}$/,
                    message: 'Please enter a valid phone number'
                  },
                  required: requireCopy('Work Phone')
                }
              }
              name='phone'
              placeholder='Work Phone'
              defaultValue={defaultValues.phone}
              noValidate/>
          </FormInputWrapper>
          <></>
        </FormRow>
        <FormRow>
          <FormInputWrapper name='cellPhone'>
            <PhoneInput
              rules={
                {
                  pattern: {
                    value: /^\(\d{3}\) \d{3}-\d{4}$/,
                    message: 'Please enter a valid phone number'
                  }
                }
              }
              name='cellPhone'
              placeholder='Cell Phone'
              defaultValue={defaultValues.cellPhone}
              noValidate/>
          </FormInputWrapper>
          <></>
        </FormRow>
      </FormSection>

      <FormSection>
        <FormSectionHeader className={styles.formSectionHeader}>Your Agency Shop URL</FormSectionHeader>
        <FormSectionHeader className={classNames(styles.formSectionHeader, styles.slugURL)} style={{ textTransform: 'none', marginTop: 0 }}>https://app.myhealthily.com/landing/{defaultValues.slug}</FormSectionHeader>
      </FormSection>

      { !!defaultValues.acceptedTermsAndConditions || <TermsAndConditions name='acceptedTermsAndConditions' containerClassName={styles.termsContainer}/> }
      <ShopButtons pageName={'BasicForm'} save={form.handleSubmit(data => go(data, true))} />
    </form>
  </FormProvider>

  async function go(data: Payload, saveOnly: boolean) {
    try {
      const data_: Payload = { ...data, saveOnly, acceptedTermsAndConditions: data.acceptedTermsAndConditions || defaultValues.acceptedTermsAndConditions }
      await callback(data_)
    } catch (error) {
      addToast(error as FetchError)
    }
  }
}

export default BasicForm
