import React, { useEffect, useState } from 'react'
import styles from './SidecarEEApplication.module.scss'
import * as api from 'Utilities/pharaoh'
import usePersistableForm from 'Utilities/Hooks/usePersistableForm'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useAsync, useAsyncRetry, useToggle } from 'react-use'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import useToast from 'Utilities/Hooks/useToast'
import { SidecarProfile } from 'Utilities/pharaoh.types'
import { FormProvider, useFormContext } from 'react-hook-form'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { SidecarStripeCard } from 'Routes/shop/employer/plans/review/components/SidecarPaymentModal'
import { Member } from 'Utilities/Hooks/useStargate'
import Modal, { ModalProps } from 'Components/Modals/Modal'
import { capitalize } from 'lodash'
import { classNames } from 'Utilities/etc'

interface Props {
  member: Member
  onwards(api: Promise<any>): Promise<void>
}

interface FamilyMember {
  id: string
  name: string
}

interface SidecarDocumentsModalProps extends Omit<ModalProps, 'gaModalName' | 'header'> {
  documentType: SidecarDocumentType
  id: string
}

enum SidecarDocumentType {
  application = 'application',
  policy = 'policy'
}

export enum SidecarApplicationState {
  incomplete = 'incomplete',
  review = 'review', // Sidecar profile has application/policy documents to review before enrolling
  enrolled = 'enrolled' // Sidecar profile has a policy ID
}

const SidecarEEApplication: React.FC<Props> = props => {
  const { value: key, loading, error } = useAsync(async() => await api.v3.integrations.sidecar.stripeKey().then(res => res.text()))

  if (loading) return <Loader/>
  if (error) return <Error error={error}/>
  return <Elements stripe={loadStripe(key)}>
    <Form {...props}/>
  </Elements>
}

const Form: React.FC<Props> = ({ member, onwards }) => {
  const { value: sidecarProfile, loading, error, retry } = useAsyncRetry(async() =>
    await api.v3.integrations.sidecar.member(member?.id).GET().catch(error => {
      if (error.json?.reason !== 'Profiles not found for this input.') throw error
    }) as SidecarProfile | undefined
  )
  const [disabled, setDisabled] = useState(false)
  const [documentType, setDocumentType] = useState(SidecarDocumentType.application)
  const [showModal, toggleShowModal] = useToggle(false)
  const stripe = useStripe()
  const elements = useElements()
  const form = usePersistableForm(`sidecar-${member.id}-application-form`)
  const addToast = useToast()

  const family: FamilyMember[] = [{
    id: member.id,
    name: member.name
  } as FamilyMember].concat(member.dependents?.map(d => { return { id: d.id, name: [d.firstName, d.lastName].join(' ') } }) || [])

  if (loading) return <Loader/>
  if (error) return <Error error={error}/>

  return <>
    <SidecarDocumentsModal
      id={member.id}
      isOpen={showModal}
      onRequestClose={toggleShowModal}
      documentType={documentType}
    />
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)} className={styles.paymentForm}>
        <fieldset disabled={disabled}>
          { applicationForm() }
          { reviewDocuments() }
          { enrolled() }
          <input type='submit' value={submitButtonCopy()}/>
        </fieldset>
      </form>
    </FormProvider>
  </>

  function sidecarApplicationState() {
    if (sidecarProfile?.policyId) return SidecarApplicationState.enrolled
    if (sidecarProfile?.application) return SidecarApplicationState.review
    return SidecarApplicationState.incomplete
  }

  function applicationForm() {
    const termsAndConditions = <a href='https://sidecarhealth.com/automatic-payment-terms-and-conditions' target='_blank' rel='noreferrer'>Automatic Payment Terms and Conditions</a>
    const electronicRecords = <a href='https://sidecarhealth.com/electronic-records' target='_blank' rel='noreferrer'>Disclosure on Electronic Records</a>
    const memberCare = <a href='tel:877-653-6440'>877-653-6440</a>
    const privacyPolicy = <a href='https://sidecarhealth.com/privacy-policy' target='_blank' rel='noreferrer'>Privacy Policy</a>
    const hippa = <a href='https://sidecarhealth.com/hipaa' target='_blank' rel='noreferrer'>HIPAA Notice</a>

    const { register } = form

    return sidecarApplicationState() === SidecarApplicationState.incomplete
      ? <>
        <ApplicationStep step={SidecarApplicationState.incomplete} loading={disabled}/>
        <h3>Current Insurance Information</h3>
        { family.map((fm, i) => <FamilyMemberInputs key={fm.id} index={i} name={fm.name} id={fm.id}/>) }
        <h3>Credit Card Information</h3>
        <SidecarStripeCard className={classNames(disabled && styles.ccDisabled)}/>
        <h3>Authorization for Automatic Payments</h3>
        <label className={styles.authorization}>
          <input type='checkbox' name='authorizationForAutomaticPayment' ref={register({ required: true })}/>
          <div>I have read and agree to the {termsAndConditions} that apply to both premium and medical invoice payments.</div>
        </label>
        <h3>Important Disclosures</h3>
        <label className={styles.authorization}>
          <input type='checkbox' name='authorizationForMarketingCommunication' ref={register({ required: true })}/>
          <div>I consent to receive telephone calls and text messages related to my Sidecar Health plan, including messages related to my available benefits and for billing and invoicing purposes. I further consent to receive marketing calls and text messages from Sidecar Health using an automated telephone dialing system or artificial prerecorded voice. I understand that my consent to receive marketing text messages and phone calls is not required to receive any services. I may opt-out at any time by replying STOP to any marketing text message I receive. Message &amp; data rates may apply. Refer to our full {electronicRecords} to eSign consent.</div>
        </label>
        <label className={styles.authorization}>
          <input type='checkbox' name='authorizationForElectronicCommunication' ref={register({ required: true })}/>
          <div>I consent to complete my application electronically and to receive my policy, certain legal disclosures, notices, communications and other items electronically. I understand I can change this election at any time by contacting Sidecar Health Member Care. If I do not check this box, I can contact Sidecar Health Member Care at {memberCare} to request a paper application be mailed to me.</div>
        </label>
        <label className={styles.authorization}>
          <input type='checkbox' name='acknowledgementOfGeneralDisclosures' ref={register({ required: true })}/>
          <div>I acknowledge and consent that:</div>
        </label>
        <ul>
          <li>the information I have provided in my registration to Sidecar Health is true and complete;</li>
          <li>my application will be reviewed and that my coverage is not guaranteed issue;</li>
          <li>the policy I am purchasing is a fixed indemnity plan and does not provide ACA-qualified Essential Health Benefits or Minimum Essential Coverage;</li>
          <li>the policy only covers services that are deemed medically necessary by the Sidecar Health claims team and if Sidecar Health determines that a service or product is not medically necessary, I will be responsible for the cost of that service or product;</li>
          <li>the policy covers pre-existing conditions that are disclosed except for those listed in a rider attached to the policy or not disclosed by me at the time of the application;</li>
          <li>the premiums on this policy are fixed for 1 year and may change thereafter, unless the 3-year rate lock rider is purchased;</li>
          <li>the policy is not guaranteed renewable. If this coverage expires or I lose eligibility for this coverage, I might have to wait until an open enrollment period to get other health insurance coverage;</li>
          <li>Sidecar Health may share information about me with its partner carrier, subcontractors and vendors in compliance with the {privacyPolicy} and {hippa}; and</li>
          <li>I represent and warrant that I will take full responsibility for payments should the account become delinquent or there is evidence of fraud.</li>
        </ul>

      </>
      : <ApplicationStep step={SidecarApplicationState.incomplete} completed/>
  }

  function reviewDocuments() {
    const callback = (type: SidecarDocumentType) => {
      setDocumentType(type)
      toggleShowModal()
    }

    const documents = () => <>
      <button type='button' onClick={() => callback(SidecarDocumentType.application)}>Application</button>
      <button type='button' onClick={() => callback(SidecarDocumentType.policy)}>Policy</button>
    </>

    switch (sidecarApplicationState()) {
    case SidecarApplicationState.incomplete:
      return
    case SidecarApplicationState.review:
      return <ApplicationStep step={SidecarApplicationState.review} loading={disabled}>
        <p>Please review your application and policy documents and click the <b><q>Complete Enrollment</q> button</b> below to complete your enrollment.</p>
        <div className={styles.documentButtonsContainer}>{documents()}</div>
      </ApplicationStep>
    case SidecarApplicationState.enrolled:
      return <ApplicationStep step={SidecarApplicationState.review} completed>
        <p>Please review your application and policy documents.</p>
        <div className={styles.documentButtonsContainer}>{documents()}</div>
      </ApplicationStep>
    }
  }

  function enrolled() {
    if (sidecarApplicationState() !== SidecarApplicationState.enrolled) return
    return <ApplicationStep step={sidecarApplicationState()} completed>
      <p>
        Your <b>policy ({sidecarProfile?.policyId})</b> is now active. If you have any questions about your coverage please call&nbsp;
        <a href='tel:877-653-6440'><b>877-653-6440.</b></a>
      </p>
    </ApplicationStep>
  }

  function submitButtonCopy() {
    switch (sidecarApplicationState()) {
    case SidecarApplicationState.incomplete:
      return 'Submit Application'
    case SidecarApplicationState.review:
      return 'Complete Enrollment'
    case SidecarApplicationState.enrolled:
      return 'Next'
    }
  }

  async function submit(data: any) {
    try {
      setDisabled(true)
      switch (sidecarApplicationState()) {
      case SidecarApplicationState.incomplete: {
        const card = elements?.getElement(CardElement)
        if (!stripe || !card) throw window.Error('Stripe is not initialized')
        card.update({ disabled: true })
        const { error, token } = await stripe.createToken(card)
        if (error) throw error
        if (!token) throw window.Error('Something went wrong, please try again')

        const payload = {
          paymentInfo: token.id,
          replaceQuestions: data.family,
          authorizationForAutomaticPayment: !!data.authorizationForAutomaticPayment,
          authorizationForMarketingCommunication: !!data.authorizationForMarketingCommunication,
          authorizationForElectronicCommunication: !!data.authorizationForElectronicCommunication,
          acknowledgementOfGeneralDisclosures: !!data.acknowledgementOfGeneralDisclosures
        }
        await api.v3.integrations.sidecar.member(member.id).apply.POST(payload)
        retry()
        break
      }
      case SidecarApplicationState.review: {
        await api.v3.integrations.sidecar.member(member.id).enroll.POST()
        retry()
        break
      }
      case SidecarApplicationState.enrolled:
        onwards(Promise.resolve())
      }
    } catch (error) {
      addToast(error)
    } finally {
      const card = elements?.getElement(CardElement)
      if (card) { card.update({ disabled: false }) }
      setDisabled(false)
    }
  }
}

const FamilyMemberInputs: React.FC<FamilyMember & { index: number }> = ({ index, name, id }) => {
  const { register, watch } = useFormContext()
  const prefix = `family.${index}`
  const replaceInsurance = watch(`${prefix}.replaceInsurance`)

  return <div className={styles.familyMemberContainer}>
    <div className={styles.familyMemberHeader}>
      <h4>{name}</h4>
      <label>
      Replacing Insurance?
        <input name={`${prefix}.replaceInsurance`} type='checkbox' ref={register} />
      </label>
    </div>
    <input name={`${prefix}.id`} type='hidden' defaultValue={id} ref={register}/>
    { replaceInsurance && <div className={styles.familyMemberInputs}>
      <CandorInput name={`${prefix}.replaceCoverage`} type='text' placeholder='Coverage' ref={register} />
      <CandorInput name={`${prefix}.replacePolicy`} type='text' placeholder='Policy' ref={register} />
      <CandorInput name={`${prefix}.replaceCompany`} type='text' placeholder='Company' ref={register} />
    </div> }
  </div>
}

type ApplicationStepProps = React.HTMLAttributes<HTMLDivElement> & {
  step: SidecarApplicationState
  completed?: boolean
  loading?: boolean
}

const ApplicationStep: React.FC<ApplicationStepProps> = ({ step, completed, loading, ...props }) => {
  return <div {...props} className={classNames(props.className, styles.applicationStep, completed ? styles.completed : loading ? styles.loading : undefined)}>
    <div className={styles.step}>
      { completed
        ? '√'
        : loading
          ? <Loader/>
          : stepNumber()
      }
    </div>
    <div className={styles.copy}>
      <h3>{stepCopy()}</h3>
      <div>{props.children}</div>
    </div>
  </div>

  function stepNumber() {
    switch (step) {
    case SidecarApplicationState.incomplete:
      return 1
    case SidecarApplicationState.review:
      return 2
    case SidecarApplicationState.enrolled:
      return 3
    }
  }

  function stepCopy() {
    switch (step) {
    case SidecarApplicationState.incomplete:
      return 'Sidecar Health Application'
    case SidecarApplicationState.review:
      return 'Review Enrollment documents'
    case SidecarApplicationState.enrolled:
      return 'Enrollment Complete!'
    }
  }
}

const SidecarDocumentsModal: React.FC<SidecarDocumentsModalProps> = ({ documentType, id, ...props }) => {
  const [document, setDocument] = useState<string>()
  const [loading, setLoading] = useState(false)
  const addToast = useToast()

  useEffect(() => {
    async function getSidecarEnrollmentDocs() {
      try {
        setLoading(true)
        if (documentType === 'application') {
          setDocument(await api.v3.integrations.sidecar.member(id).application.STREAM())
        } else {
          setDocument(await api.v3.integrations.sidecar.member(id).policy.STREAM())
        }
      } catch (error) {
        addToast(error)
      } finally {
        setLoading(false)
      }
    }
    if (props.isOpen) {
      getSidecarEnrollmentDocs()
    }
  }, [documentType, props.isOpen])

  return <Modal
    {...props}
    gaModalName={SidecarDocumentsModal.name}
    contentClassName={styles.documentModal}
    header={capitalize(documentType)}
  >
    { loading
      ? <Loader/>
      : <object className={styles.sbcViewer} title={capitalize(documentType)} data={document} type="application/pdf"/>
    }
  </Modal>
}

export default SidecarEEApplication
