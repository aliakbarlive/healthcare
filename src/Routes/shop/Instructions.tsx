import React, { useEffect, useState } from 'react'
import { Mode as StargateMode, StargateResponse as Stargate, StargateConfig, Census, censusURL } from 'Utilities/Hooks/useStargate'
import { ReactComponent as InfoIcon } from 'Assets/info_icon_empty.svg'
import { ReactComponent as QuestionIcon } from 'Assets/question_icon.svg'
import { ReactComponent as LeftImage } from './home_asset1.svg'
import { ReactComponent as RightImage } from './home_asset2.svg'
import { ReactComponent as Stripes } from './stripes.svg'
import NextButton, { ButtonStates } from 'Components/Stargate/NextButton/NextButton'
import styles from './Instructions.module.css'
import faqStyles from 'Components/Modals/InformationalModal/index.module.scss'
import SignInModal from './SignInModal'
import TermsModal from 'Components/Modals/TnC'
import ReturningModal from './ReturningModal'
import { useToggle } from 'react-use'
import Loader from 'Components/Rudimentary/Loader'
import { useForm } from 'react-hook-form'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'
import { useHistory, useLocation } from 'react-router-dom'
import path from 'path'
import InformationalModal from 'Components/Modals/InformationalModal'
import ProsperBenefitsModal from './employer/plans/review/components/ProsperBenefitsModal'
import { setToken } from 'Utilities/pharaoh'
import { GAButton } from 'Components/Tracking'
import { useWhiteLabelFromSearchParams } from 'Utilities/Hooks/useWhiteLabel'
import { ModalProps } from 'Components/Modals/Modal'
import { Label } from 'Utilities/config'

interface Props {
  loading: boolean
  value?: Stargate
}

const ShopHome: React.FC<Props> = async => {
  useEffect(mangleStyling, [async.loading])

  if (async.loading) return <Loader />
  const stargate = async.value

  return <div className={styles.mainContainer}>
    <div className={styles.upperContainer}>
      <div className={styles.upperContent}>
        <LeftImage className={styles.leftImage} />
        <RightImage className={styles.rightImage} />
        <Form email={stargate?.user?.email} mode={stargate?.mode || StargateMode.employer}/>
      </div>
    </div>
    <BottomBit config={async.value?.config} />

  </div>

  function mangleStyling() {
    if (async.loading) return

    const body = document.getElementsByTagName('body')[0] as HTMLElement
    body.style.backgroundColor = '#F6F7FA'

    const content = document.getElementById('content')
    if (content) {
      content.style.maxWidth = 'unset'
      content.style.padding = '0'
    }

    return () => {
      if (content) {
        content.style.maxWidth = ''
        content.style.padding = ''
      }
      body.style.backgroundColor = ''
    }
  }
}

interface FormProps {
  email?: string
  mode: StargateMode
}

const Form: React.FC<FormProps> = ({ email: defaultEmail, mode: originalMode }) => {
  enum VisibleModal {
    signIn, returning
  }

  const [mode, setMode] = useState(originalMode)
  const [showEmailModal, toggleShowEmailModal] = useToggle(false)
  const { register, handleSubmit, watch } = useForm({ defaultValues: { email: defaultEmail } })
  const [visibleModal, setVisibleModal] = useState<VisibleModal | undefined>(undefined)
  const [buttonState, setButtonState] = useState<ButtonStates>('')
  const email = watch('email')
  const continuing = defaultEmail !== undefined
  const addToast = useToast()
  const history = useHistory()
  const location = useLocation()
  const label = useWhiteLabelFromSearchParams()

  localStorage.label = label?.url

  return <form onSubmit={handleSubmit(onSubmit)}>
    <EmailInformationModal isOpen={showEmailModal} onRequestClose={toggleShowEmailModal}/>
    <div className={styles.emailContainer}>
      <input
        name="email"
        type="email"
        className={styles.emailInput}
        placeholder="Email"
        ref={register}
        required={true}
      />
      <QuestionIcon
        className={styles.emailIcon}
        onClick={toggleShowEmailModal}
      />
    </div>
    <div className={styles.buttonContainer}>
      <NextButton
        state={buttonState}
        type="submit"
        controlled={true}
        className={styles.nextButton}
        value={continuing ? 'Continue Entry' : 'Let’s Get Started'}
      />
      <Stripes className={styles.stripes} />
    </div>
    <SignInModal
      isOpen={visibleModal === VisibleModal.signIn}
      onRequestClose={close}
      callback={onSignIn}
      email={email}
    />
    <ReturningModal
      isOpen={visibleModal === VisibleModal.returning}
      onRequestClose={close}
      handleButton={onReturning}
      mode={mode}
    />
  </form>

  function close() {
    setVisibleModal(undefined)
  }

  async function onSubmit(data: any) {
    try {
      setButtonState('loading')
      if (data.email === defaultEmail) {
        switch (mode) {
        case 'both':
          setVisibleModal(VisibleModal.returning)
          break
        case 'employer':
          // preserve obelisk slug
          if (path.basename(location.pathname) !== 'shop') {
            history.push(path.join(location.pathname, 'group-type'))
          } else {
            history.push('/shop/employer')
          }
          break
        case 'employee':
          history.push(`/shop/${mode}`)
        }
      } else {
        const rsp = await api.v2.users().gatekeeper(data)
        api.clearLocalStorage()
        setToken(rsp.token)
        await onSignIn(rsp.groupId, true)
      }
      setButtonState('success')
    } catch (error) {
      switch (error.response?.status) {
      case 401:
      case 403:
      case 409:
      case 406:
        setButtonState('')
        // cannot create user because user already exists
        setVisibleModal(VisibleModal.signIn)
        break
      default:
        setButtonState('error')
        addToast(error)
      }
    }
  }

  async function onSignIn(groupId?: string, newUser = false) {
    const start = newUser ? 'group-type' : 'get-started'
    const stargate = await api.v1.stargate(groupId)
    if (stargate.group?.individualExperience) { history.push('/shop/employee') }

    switch (stargate.mode) {
    case StargateMode.employee:
      history.push('/shop/employee')
      break
    case StargateMode.employer:
      // preserve obelisk slug
      if (path.basename(location.pathname) !== 'shop') localStorage.slug = location.pathname.replace(/\/shop\//, '')

      if (!newUser) {
        history.push('/shop/employer')
      } else {
        let dst = start
        if (label) {
          dst += `?label=${label.shortcode}`
        }
        history.push(`/shop/employer/${dst}`)
      }
      break
    case StargateMode.both:
      setMode(StargateMode.both)
      setVisibleModal(VisibleModal.returning)
    }
  }

  async function onReturning(mode: 'logout' | 'employer' | 'employee') {
    try {
      switch (mode) {
      case 'logout':
        await api.v1.users.sessions.DELETE()
        window.location.reload() // FIXME not ideal but will suffice
        addToast('You are now signed out')
        break
      case 'employee':
      case 'employer':
        // assign rather than push because otherwise it doesn’t go
        // to the furthest page because the Table of Contents component
        // isn't mounted :(
        window.location.assign(`${process.env.REACT_APP_BASENAME || ''}/shop/${mode}`)
      }
    } catch (error) {
      addToast(error)
    }
  }
}

const EmailInformationModal: React.FC<Omit<ModalProps, 'gaModalName' | 'header'>> = props => {
  const [tncOpen, toggleTnC] = useToggle(false)
  return <>
    <InformationalModal
      gaModalName={EmailInformationModal.name}
      header='FAQs'
      {...props}
    >
      <p className={faqStyles.question}>Q: Why are you asking for my email?</p>
      <p className={faqStyles.answer}>
        A: We use your email as a way to save your results, and to help
        you through the sign-up process. We do not sell email addresses
        or personal information.
      </p>
      <p className={faqStyles.question}>Q: What if I do not want to sign-up?</p>
      <p className={faqStyles.answer}>
        A: You are under no obligation to sign-up for any of our
        products and services.&nbsp;
        <GAButton analytics={`Terms & Conditions (${ShopHome.name})`} className={faqStyles.linkButton} onClick={toggleTnC}>
          Terms &amp; Conditions
        </GAButton>
      </p>
    </InformationalModal>
    <TermsModal
      isOpen={tncOpen}
      onClose={toggleTnC}
    />
  </>
}

const BottomBit: React.FC<{ config?: StargateConfig }> = ({ config }) => {
  const [showCensusModal, toggleShowCensusModal] = useToggle(false)
  const [showProsperModal, toggleShowProsperModal] = useToggle(false)
  const label = useWhiteLabelFromSearchParams()?.url || Label.myhealthily
  const census = config?.census.group.url || censusURL(Census.standard, label)
  return <>
    <CensusInformationModal isOpen={showCensusModal} onRequestClose={toggleShowCensusModal} config={config} />
    <ProsperBenefitsModal isOpen={showProsperModal} onRequestClose={toggleShowProsperModal}/>
    <div className={styles.bottomContainer}>
      <div className={styles.bottomRow}>
        <div className={styles.infoContainer}>
          <div className={styles.infoLeft}>
            <span className={styles.eeFaq}>Employee FAQ</span>
            <span data-tip data-for="info" className={styles.info}>
              <InfoIcon className={styles.infoIcon} onClick={toggleShowCensusModal}/>
              What information will I need?
            </span>
          </div>
          <a
            className={styles.download}
            href={census}
            download
          >
          Download Our Census .xlsx template
          </a>
          <div className={styles.healthCareContainer}>
            <p className={styles.healthCare}>
              <b>Healthcare plans</b> from the major carriers, includes{' '}
              <b className={styles.healthCareProsper} onClick={toggleShowProsperModal}>
              Prosper Benefits+
              </b>
            </p>
            <p className={styles.healthCare}>
            Many Plan options for your group, with <b>great premiums</b>
            </p>
            <p className={styles.healthCare}>
            Made for <b>small groups, under 50</b> employees<sup>†</sup>
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
}

interface CIMProps extends Omit<ModalProps, 'gaModalName' | 'header'> {
  config?: StargateConfig
}

const CensusInformationModal: React.FC<CIMProps> = props =>
  <InformationalModal
    { ...props }
    gaModalName={CensusInformationModal.name}
    header='Company Census'
  >
    <h2>We will need the following information about your company and it&apos;s employees:</h2>
    <ul>
      <li>Your current Healthcare and renewal date (if applicable)</li>
      <li>
      Every employee’s basic information including name, number of
      family members, smoking history
      </li>
      <li>
      Your existing coverage end date and carrier, and your desired
      effective date of your coverage
      </li>
      <li>
      Basic company information including contact details and industry
      type
      </li>
    </ul>
    <a href={props.config?.census.group.url} download>
      Download Our Census .xlsx template.
    </a> Fill it out now, upload later.
  </InformationalModal>

export default ShopHome
