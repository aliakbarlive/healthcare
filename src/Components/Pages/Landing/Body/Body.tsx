import React from 'react'
import styles from './Body.module.scss'
import { Landing } from 'Utilities/Hooks/useStargate'
import PreviewModal from 'Components/Pages/Landing/PreviewModal'
import backgroundImg from 'Assets/Landing/background.svg'
import emailIcon from 'Assets/Landing/icon/email.svg'
import locationIcon from 'Assets/Landing/icon/location.svg'
import phoneIcon from 'Assets/Landing/icon/phone.svg'
import searchIcon from 'Assets/Landing/icon/search.svg'

type LandingBodyType = {
  isPreview?: boolean
  landingData: Landing
}

export const LandingBody: React.FC<LandingBodyType> = (props) => {
  const {
    isPreview,
    landingData
  } = props
  const {
    name,
    address1,
    address2,
    city,
    state,
    zip,
    phone,
    email,
    website,
    calendly,
    additionalText
  } = landingData || {}
  const [modalOpen, setModalOpen] = React.useState<boolean>(false)

  const closeButtonOnClick = React.useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const requestACallOnClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (isPreview) {
        setModalOpen(true)
      }
    },
    [setModalOpen]
  )

  const getStartedOnClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (isPreview) {
        setModalOpen(true)
      }
    },
    [setModalOpen]
  )

  const showAdditionlText = () => {
    if (additionalText) {
      return <p className={styles.paragraphAdditional}>{additionalText}</p>
    }
    if (isPreview) {
      return <p className={styles.paragraphAdditional}>
        {'Your Additional Text Here (500 Characters Max)'}
      </p>
    }
    return ''
  }

  const buttons = () => {
    if (isPreview) {
      return (
        <>
          <button className={styles.primaryBtn} onClick={requestACallOnClick}>
            Request a Call
          </button>
          <button className={styles.outlinedBtn} onClick={getStartedOnClick}>
            Let’s Get Started
          </button>
        </>
      )
    }
    return (
      <>
        <a className={styles.primaryBtn} href={calendly} target="_blank" rel="noreferrer">
          Request a Call
        </a>
        <a className={styles.outlinedBtn} href={`${location.pathname.replace('landing', 'shop')}`}>
          Let’s Get Started
        </a>
      </>
    )
  }

  return (
    <div className={styles.LandingBody}>
      <div className={styles.backgroundContainer}>
        <div className={styles.background}>
          <img src={backgroundImg}/>
        </div>
      </div>
      <div className={styles.contentContainer}>
        {/* <h1>You have requested the landing page for /{slug}.</h1> */}
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.paragraph}>
          We’ve partnered with MyHealthily to bring you big business benefits
          and real savings. With zero paperwork, open enrollment will be a snap.
        </p>
        {showAdditionlText()}
      </div>
      <div className={styles.buttonGroup}>
        {buttons()}
      </div>
      <div className={styles.contactInfoContainer}>
        <p className={styles.companyName}>
          {name}
        </p>
        <section className={styles.contactInfo}>
          <article>
            <img src={locationIcon}/>
            <p className={styles.text}>{`${address1}, ${address2}`}</p>
            <p className={styles.text}>{`${city}, ${state} ${zip}`}</p>
          </article>
          <article>
            <img src={phoneIcon}/>
            <p className={styles.text}>{phone}</p>
          </article>
          <article>
            <img src={emailIcon}/>
            <p className={styles.text}>{email}</p>
          </article>
          {website && (
            <article>
              <img src={searchIcon}/>
              <p className={styles.text}>{website}</p>
            </article>
          )}
        </section>
      </div>
      <PreviewModal
        isOpen={modalOpen}
        header=""
        onRequestClose={closeButtonOnClick}
      />
    </div>
  )
}
