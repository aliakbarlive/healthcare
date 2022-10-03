/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import styles from './index.module.scss'
import { PrivateWizardPageProps, WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import CandorInput from 'Components/Rudimentary/CandorInput'
import CandorSelect from 'Components/Rudimentary/Select'
import { startCase } from 'lodash'
import { genderNormalizer, ssnNormalizer } from 'Utilities/etc'
import StatePicker from 'Components/Rudimentary/Select/StatePicker'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import { isAuthenticated, localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import { StargateResponse as Stargate } from 'Utilities/Hooks/useStargate'
import useAsync, { AsyncState } from 'react-use/lib/useAsync'
import numeral from 'numeral'
import { $enum } from 'ts-enum-util'
import { Member, MaritalStatus } from 'Utilities/pharaoh.types'
import { CandorDatePicker } from 'Components/Anubis/CandorForm'
import useContentAdjustment from 'Utilities/Hooks/useContentAdjustment'
import TermsAndConditions from 'Components/Modals/TnC/TermsAndConditions'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import ZipInput from 'Components/Rudimentary/ZipInput'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { titleForWhiteLabel } from 'Utilities/Hooks/useWhiteLabel'
import { GenderPicker } from 'Components/Rudimentary/Select/GenderPicker'

const EEShopCensus: React.FC<WizardPageProps | PrivateWizardPageProps> = ({ onwards, ...props }) => {
  const stargate: Partial<Stargate> = (props.stargate as AsyncState<Stargate>).value || props.stargate as Stargate | undefined || {}
  useContentAdjustment({ paddingTop: '50px' })
  const async = useAsync(() => stargate?.groupMember?.id ? api.v3.users(stargate?.groupMember?.id).GET() : Promise.resolve(undefined))

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  return <Form ee={async.value} onwards={onwards} {...props} />
}

interface FormProps {
  ee?: Member
}

const Form: React.FC<FormProps & (WizardPageProps | PrivateWizardPageProps)> = ({ onwards, ee, ...props }) => {
  const stargate: Partial<Stargate> = (props.stargate as AsyncState<Stargate>).value || props.stargate as Stargate | undefined || {}
  const { group } = stargate
  const titleString = `Healthcare coverage, offered through ${group?.name || (stargate.label ? titleForWhiteLabel(stargate.label) : 'MyHealthily')}`
  const form = useForm({ defaultValues: { ...ee, ssn: ssnNormalizer(ee?.ssn || ''), gender: genderNormalizer(ee?.gender || '') } })
  const { handleSubmit, watch, register } = form
  const zip = watch('address.zip') as string | undefined

  useEffect(() => {
    const bele = document.getElementById('content')
    if (!bele) return
    bele.style.backgroundColor = '#F3FFFC'
    bele.style.maxWidth = 'unset'
    return () => {
      bele.style.backgroundColor = ''
      bele.style.maxWidth = ''
    }
  })
  return <>
    <div className={styles.benifitEnrolment}>
      <p>Employee Benefits Enrollment</p>
    </div>
    <div className={styles.mainContainer}>
      <h1 className={`shop-h1-periwinkle ${styles.title}`}>{titleString}</h1>
      <h2 className={`shop-h2-navy ${styles.healcareHeading}`}>Making healthcare coverage super simple.</h2>
      <div className={styles.formContainer}>
        <form autoComplete="on" onSubmit={handleSubmit(onSubmit)} noValidate={false}>
          <FormProvider {...form}>
            <div className={styles.mainForm}>
              <fieldset>
                <div className={styles.eeSec}> {/* Need to do this because of a chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=262679 */}
                  <input ref={register} type='hidden' name='id' />
                  <input ref={register} type='hidden' name='group.id' />
                  <input ref={register} type='hidden' name='group.name' />
                  <input ref={register} type='hidden' name='tier' />
                  <input ref={register} type='hidden' name='status' />
                  <input ref={register} type='hidden' name='isWaived' />
                  <input ref={register} type='hidden' name='privilege' />
                  <CandorInput
                    autoComplete="name"
                    placeholder="Name"
                    name="contact.name"
                    required />
                  <CandorDatePicker
                    autoComplete="bday"
                    placeholder='Birthdate'
                    className="glance_masked"
                    maxDate={new Date()}
                    required
                    dropdownMode="select"
                    name='dob'
                  />
                  <Controller
                    render={props => <CandorInput
                      {...props}
                      onChange={event => props.onChange(ssnNormalizer(event.currentTarget.value))}
                      minLength={11} maxLength={11}
                      pattern='[0-9-]{11}'
                      className='glance_masked'
                      placeholder='SSN'
                      required={true}
                    />}
                    name="ssn"
                  />
                  <GenderPicker name='gender' required />
                  <span className={styles.inputLabel}>Residential Address</span>
                  <CandorInput
                    autoComplete="street-address"
                    placeholder="Address 1"
                    name="address.street1"
                    required
                  />
                  <CandorInput
                    autoComplete="address-line2"
                    placeholder="Address 2"
                    name="address.street2"
                  />
                  <div className={styles.cityGrid}>
                    <CandorInput
                      autoComplete="address-level2"
                      placeholder="City"
                      name="address.city"
                      required
                    />
                    <ZipInput
                      autoComplete="postal-code"
                      placeholder="ZIP Code"
                      name="address.zip"
                      required
                    />
                  </div>
                  <div className={styles.stateGrid}>
                    <StatePicker
                      zip={zip}
                      name='address.state'
                      required
                    />
                    <CountyPicker
                      name='address.county.id'
                      zip={zip}
                      required
                    />
                  </div>
                  <div className={styles.spacer} /> {/* To align with the next button */}
                </div>
              </fieldset>
              <fieldset>
                <div className={styles.eeSec}>
                  <PhoneInput placeholder='Phone' name='contact.phone' required />
                  <CandorSelect
                    placeholder="Marital Status"
                    options={$enum(MaritalStatus).map(makeMaritalOptions)}
                    name='maritalStatus'
                    required
                  />
                  <CandorInput
                    autoComplete="email"
                    placeholder="Email"
                    name="contact.email"
                    required
                    disabled={isAuthenticated()}
                  />
                  <div className={styles.measurementsGrid} style={{ visibility: stargate.config?.showHeightWeight ? 'visible' : 'hidden' }}>
                    <CandorInput
                      className={styles.numericInput}
                      placeholder="Height (feet)"
                      name="measures.feet"
                      type="number"
                      step="1" min={0} max={99}
                      required={stargate.config?.showHeightWeight}
                    />
                    <CandorInput
                      className={styles.numericInput}
                      placeholder="inches"
                      name="measures.inches"
                      type="number"
                      step="1" min={0} max={11}
                      required={stargate.config?.showHeightWeight}
                    />
                    <CandorInput
                      className={styles.numericInput}
                      placeholder="Weight (lbs)"
                      name="measures.weight"
                      type="number"
                      step="1" min={0} max={999}
                      required={stargate.config?.showHeightWeight}
                    />
                  </div>
                  <span className={styles.inputLabel}>Mailing Address <span className={styles.labelAside}>(if different from residential)</span></span>
                  <CandorInput
                    autoComplete="street-address"
                    placeholder="Address 1"
                    name="address.mailingStreet1"
                  />
                  <CandorInput
                    autoComplete="address-line2"
                    placeholder="Address 2"
                    name="address.mailingStreet2"
                  />
                  <div className={styles.cityGrid}>
                    <CandorInput
                      autoComplete="address-level2"
                      placeholder="City"
                      name="address.mailingCity"
                    />
                    <ZipInput
                      autoComplete="postal-code"
                      placeholder="ZIP Code"
                      name="address.mailingZip"
                    />
                  </div>
                  <div className={styles.stateGrid}>
                    <StatePicker
                      name='address.mailingState'
                      zip={watch('address.mailingZip') as string | undefined}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
            <div className={styles.formFooter}>
              <div>
                <TermsAndConditions {...props} name='acceptedTermsAndConditions' containerClassName={styles.spacer} />
                <input type="submit" value='Next' style={{ width: '420px', marginTop: '20px' }}/>
              </div>
            </div>
          </FormProvider>
        </form>
      </div>
    </div>
  </>
  async function onSubmit(data: any) {
    return onwards(save(data))
  }

  async function save(data: any) {
    if (!data.acceptedTermsAndConditions) { throw new window.Error('You must accept the terms and conditions to continue') }
    if (!data.address.county.id) throw new window.Error('Please select your county')
    if (!data.address.state) throw new window.Error('Please select your state')
    if (!data.gender) throw new window.Error('Please select your gender')
    if (!data.maritalStatus) throw new window.Error('Please select your marital status')

    if (typeof data.isWaived !== 'boolean') {
      data.isWaived = ee?.isWaived || false
    }

    if (typeof data.isMedicallyUnderwritten !== 'boolean') {
      data.isMedicallyUnderwritten = ee?.isMedicallyUnderwritten || false
    }

    if (typeof data.acceptedTermsAndConditions !== 'boolean') {
      data.acceptedTermsAndConditions = ee?.acceptedTermsAndConditions
    }

    const height = data.feet && data.inches
      ? numeral(data.measures.feet).multiply(12).add(data.measures.inches).value()
      : data.measures.feet
        ? numeral(data.measures.feet).multiply(12).value()
        : undefined

    return api.v3.users().PUT({
      ...data,
      dob: localMidnightToPharaohFormat(data.dob),
      measures: {
        height: height,
        weight: numeral(data.measures.weight).value()
      }
    })
  }
}

function makeMaritalOptions(value: MaritalStatus) {
  return { value, label: value === MaritalStatus.domesticPartner ? 'Domestic Partnership' : startCase(value) }
}

export default EEShopCensus
