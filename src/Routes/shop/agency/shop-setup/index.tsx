import React from 'react'
import styles from './index.module.scss'

import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { FormProvider, useForm, UseFormMethods } from 'react-hook-form'
import {
  FormSectionHeader,
  FormInputWrapper,
  FormSection
} from 'Components/Rudimentary/FormComponents'

import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'
import { Landing } from 'Utilities/Hooks/useStargate'
import { startCase } from 'lodash'
import Panel from 'Components/Panel/Panel'
import { LandingHeader, LandingBody } from 'Components/Pages/Landing'
import LogoUpload from './LogoUpload/LogoUpload'
import { useUploadLogo, useUploadLogoTypes } from './LogoUpload/useUploadFile'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import { Route } from 'Utilities/Route'
import { FetchError } from 'Utilities/fetch++'
import CandorInput from 'Components/Rudimentary/CandorInput'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import ZipInput from 'Components/Rudimentary/ZipInput'
import useUser from 'Utilities/Hooks/useUser'
import Loader from 'Components/Rudimentary/Loader'
import SectionInfo from './SectionInfo'
import UrlPreviewCopy from './UrlPreviewCopy'
import { Row, Col } from 'Components/Layout'
import { ReactComponent as IconOpenUrl } from 'Assets/up-right-from-square-solid.svg'

/* eslint-disable camelcase */

interface Payload extends Landing {
  saveOnly: boolean
}

const AgencyShopSetup: React.FC<PrivateWizardPageProps> = ({
  onwards,
  stargate
}) => {
  const uploadLogo = useUploadLogo() as useUploadLogoTypes
  const addToast = useToast()

  const { agency } = stargate || {}
  if (!agency) throw new Error('Stargate\'s Agency object have no data')
  const landing = agency.landing
  if (!landing) throw new Error('agency.landing have no data')
  // const label = useWhiteLabel().label

  const defaults: Payload = {
    name: landing.name,
    address1: landing.address1,
    address2: landing.address2,
    city: landing.city,
    state: landing.state,
    zip: landing.zip,
    phone: landing.phone,
    email: landing.email,
    website: landing.website,
    calendly: landing.calendly,
    additionalText: landing.additionalText,
    saveOnly: false
  }
  const form = useForm({ defaultValues: defaults })

  const {
    value: user,
    loading
  } = useUser()
  if (loading) return <Loader/>

  return (
    <div className={styles.shopSetup}>
      <h1>Personalize Your Page</h1>
      <Panel>
        Create a personalized page to direct clients to sign up and shop with
        your agency. They may reach out to you for assistance or input their own
        census. Clients will be prevented from viewing and selecting plans
        without your assistance.
      </Panel>
      <SectionInfo
        header="your Landing page url"
        main="This uses the same agency slug you created during the onboarding process to match your unique agency shop link."
        aside={(
          <UrlPreviewCopy key="1" url={`${location.origin}/landing/${agency?.slug}`}/>
        )}
      ></SectionInfo>
      <Form
        form={form}
        useUploadLogo={uploadLogo}
        callback={save}
        logo={user?.avatar}
      />
    </div>
  )

  function makeFormData() {
    const formData = new FormData()
    const actionType = 'agencyLogo' // TodoList.tsx one of Action Type
    formData.append('file', uploadLogo.selectedFile)
    formData.append('type', actionType)
    formData.append('note', startCase(actionType))
    return formData
  }

  function save(data: Payload): Promise<void> {
    return api.v3.agency.landing.POST(data).then(async rsp => {
      if (uploadLogo.selectedFile) {
        await api.v3.agency.logo.POST(makeFormData())
      }
      localStorage.overrideGroupID = rsp.id
      if (!data.saveOnly) {
        return onwards(Promise.resolve())
      } else {
        addToast('Data successfully saved', 'success')
      }
    })
  }
}

type FormProps = {
  form: UseFormMethods<Payload>
  useUploadLogo: useUploadLogoTypes
  callback: (payload: Payload) => Promise<void>
  logo?: string
}

const Form: React.FC<FormProps> = ({
  form,
  useUploadLogo,
  callback,
  logo
}) => {
  const addToast = useToast()
  const {
    register,
    handleSubmit
  } = form
  const requireCopy = (field: string, type: 'fill in' | 'select' = 'fill in') =>
    `Please ${type} your ${field}`

  return (
    <FormProvider {...form}>
      <form className={styles.formContainer} onSubmit={handleSubmit(data => go(data, false))}>
        {/** Business Information */}
        <FormSection className={styles.formSection}>
          <Row>
            <Col>
              <FormSectionHeader className={styles.formSectionHeader}>
                Business Information
              </FormSectionHeader>
              <FormInputWrapper name="name">
                <CandorInput
                  className={styles.formInput}
                  ref={register({ required: requireCopy('Business Name') })}
                  name="name"
                  placeholder="Business Name"
                />
              </FormInputWrapper>
              <FormInputWrapper name="address1">
                <CandorInput
                  className={styles.formInput}
                  ref={register({ required: requireCopy('Business Address1') })}
                  name="address1"
                  placeholder="Business Address 1"
                />
              </FormInputWrapper>
              <FormInputWrapper name="address2">
                <CandorInput
                  className={styles.formInput}
                  name="address2"
                  placeholder="Business Address 2"
                />
              </FormInputWrapper>
              <Row>
                <FormInputWrapper name="city">
                  <CandorInput
                    className={styles.formInput}
                    ref={register({ required: requireCopy('City') })}
                    name="city"
                    placeholder="City"
                  />
                </FormInputWrapper>
                <FormInputWrapper name="state">
                  <CandorInput
                    className={styles.formInput}
                    ref={register({ required: requireCopy('State') })}
                    name="state"
                    placeholder="State"
                  />
                </FormInputWrapper>
                <FormInputWrapper name="zip">
                  <ZipInput
                    className={styles.formInput}
                    rules={{ required: requireCopy('Zip Code') }}
                    name="zip"
                    placeholder="Zip Code"
                  />
                </FormInputWrapper>
              </Row>
              <FormInputWrapper name="phone">
                <PhoneInput
                  className={styles.formInput}
                  rules={{
                    pattern: {
                      value: /^\(\d{3}\) \d{3}-\d{4}$/,
                      message: 'Please enter a valid phone number'
                    },
                    required: requireCopy('Phone Number')
                  }}
                  name="phone"
                  placeholder="Work Phone"
                  noValidate
                />{' '}
                {/* Override validation in phoneInput component */}
              </FormInputWrapper>
              <FormInputWrapper name="email">
                <CandorInput
                  className={styles.formInput}
                  ref={register({ required: requireCopy('Business Address1') })}
                  name="email"
                  placeholder="Email Address"
                />
              </FormInputWrapper>
              <FormInputWrapper name="landing.website">
                <CandorInput
                  className={styles.formInput}
                  name="website"
                  placeholder="Business Website"
                />
              </FormInputWrapper>
            </Col>
            <Col>
              <FormSectionHeader className={styles.formSectionHeader}>
                Logo
              </FormSectionHeader>
              <LogoUpload useUploadLogo={useUploadLogo} currentLogo={logo}/>
              <FormSectionHeader className={styles.formSectionHeader}>
                Additional Text
              </FormSectionHeader>
              <p className={styles.notes3}>
                e.g., Your business slogan or additional information. 500 character
                limit
              </p>
              <FormInputWrapper name="additionalText">
                <textarea className={styles.formInput} name="additionalText" ref={register} maxLength={500}
                  placeholder="Additional Text"/>
                <span>{form.watch()?.additionalText?.length}/500</span>
              </FormInputWrapper>
            </Col>
          </Row>
        </FormSection>
        {/** Calendly */}
        <FormSection className={styles.formSection}>
          <FormSectionHeader className={styles.formSectionHeader}>
            Calendly
          </FormSectionHeader>
          <p className={styles.calendlyNotes}>
            Connecting your Calendly will enable clients to directly schedule
            with you. If you do not have a Calendly, we will automatically
            notify you when a call or meeting is requested.
          </p>
          <FormInputWrapper name="calendly">
            <CandorInput
              className={styles.formInput}
              name="calendly"
              ref={register({ required: requireCopy('Calendly Link') })}
              placeholder="Your Calendly Link"
            />
          </FormInputWrapper>
          <p className={styles.calendlyNotes}>
            If you don’t have a Calendly scheduler, you may use the link below
            to sign up. Calendly is a web-based platform which directly
            integrates with your calendar to show clients your availability and
            enables them to automatically schedule meetings. It is free to use
            with the basic plan.
          </p>
          <div>
            <a className={styles.secondary}
              href={'https://calendly.com/'}
              rel="noreferrer"
              target="_blank">Create a Calendly <IconOpenUrl/></a>
          </div>
        </FormSection>

        <section className={styles.landingSection}>
          <div className={styles.landing}>
            <LandingHeader
              isPreview
              logo={logo || URL.createObjectURL(useUploadLogo?.selectedFile)}
            />
            <LandingBody isPreview landingData={form.watch()}/>
          </div>
        </section>
        <ShopButtons
          backTo={Route.agencyShop_LicensesandAppointments}
          backToName={'Licenses and Appointments'}
          pageName={'AgencyShopInfo'}
          save={handleSubmit((data) => go(data, true))}
        />
      </form>
    </FormProvider>
  )

  async function go(data: Payload, saveOnly: boolean) {
    try {
      const data_: Payload = {
        ...data,
        saveOnly
      }
      await callback(data_)
    } catch (error) {
      addToast(error as FetchError)
    }
  }
}

export default AgencyShopSetup
