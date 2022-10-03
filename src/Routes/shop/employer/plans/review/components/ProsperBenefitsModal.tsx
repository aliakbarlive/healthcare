import React, { useState } from 'react'
import styles from './ProsperBenefitsModal.module.scss'
import { ReactComponent as ProsperLogo } from './prosper-benefits-logo-white.svg'
import prosperMain from './prosper-main.svg'
import prosperTelehealth from './prosper-telehealth.svg'
import prosperWorkLife from './prosper-work-life.svg'
import prosperHealthAdvocacy from './prosper-health-advocacy.svg'
import prosperMedicalBillSaver from './prosper-medical-bill-saver.svg'
import prosperCobraErisa from './prosper-cobra-erisa.svg'
import { useInterval } from 'react-use'
import { classNames } from 'Utilities/etc'
import { useCycle } from 'Utilities/Hooks/useCycle'
import Modal, { ModalProps } from 'Components/Modals/Modal'

const ProsperBenefitsModal: React.FC<Omit<ModalProps, 'gaModalName' | 'header'>> = props => {
  const [step, { next, prev, set }] = useCycle(ProsperBenefits.length - 1)
  const [interacted, setInteracted] = useState(false)
  useInterval(next, props.isOpen && !interacted ? 5000 : null)

  return <Modal
    gaModalName={ProsperBenefitsModal.name}
    header={<>
      What’s Included?
      <ProsperLogo className={styles.prosperLogo}/>
    </>}
    contentClassName={styles.container}
    {...props}
  >
    <div className={styles.prosperIncluded}>
      <h2>{ProsperBenefits[step].title}</h2>
      <p>{ProsperBenefits[step].copy}</p>
    </div>
    <img src={ProsperBenefits[step].image} alt={ProsperBenefits[step].title}/>
    <div className={styles.controls}>
      <button className={classNames(styles.arrow, styles.prev)} onClick={() => { prev(); setInteracted(true) }}><span className="material-icons">navigate_before</span></button>
      <div className={styles.stepNav}>{renderStepNav()}</div>
      <button className={classNames(styles.arrow, styles.next)} onClick={() => { next(); setInteracted(true) }}><span className="material-icons">navigate_next</span></button>
    </div>
  </Modal>

  function renderStepNav() {
    return ProsperBenefits.map(({ title }, index) =>
      <button
        className={classNames(step === index && styles.stepButtonActive, styles.stepButton)}
        onClick={() => { set(index); setInteracted(true) }}
        key={title}
      />)
  }
}

const ProsperBenefits = [
  {
    title: 'prosper benefits+',
    image: prosperMain,
    copy: `
    Prosper Benefits+ is a suite of services included with your plan at
    no cost to you. Use of Prosper Benefits+ is unlimited and proven to
    lower a group’s claims history, creating future savings at renewal.
    `
  },
  {
    title: 'Telehealth',
    image: prosperTelehealth,
    copy: `
    Feel better now! Get access to a licensed healthcare provider 24/7 with
    $0 copay, right from your desktop or mobile device. Telehealth doctors
    can offer treatment options, refer you to specialists, and even order
    prescription refills.
    `
  },
  {
    title: 'Work/Life Care Management',
    image: prosperWorkLife,
    copy: `
    True wellness starts from within. Our Confidential Employee Counseling
    program enables you access to a licensed counselor anytime, anywhere.
    Counselors can assist with everything from depression and anxiety to
    struggles with addiction.
    `
  },
  {
    title: 'Health Advocacy',
    image: prosperHealthAdvocacy,
    copy: `
    Prosper’s Health Advocacy program provides a team of expert negotiators
    to support you from start to finish when you visit the hospital or
    emergency room. They’ll educate you on various procedures and assess
    medical bills.
    `
  },
  {
    title: 'Medical Bill Saver',
    image: prosperMedicalBillSaver,
    copy: `
    A recent study showed that 60% of adults who asked their doctor for a
    discount, got it. Medical Bill Saver works to reduce the amount you
    owe by as much as possible. This way, you can spend money on the things
    that matter, and not an overpriced X-ray.
    `
  },
  {
    title: 'Cobra & Erisa Compliance',
    image: prosperCobraErisa,
    copy: `
    Keeping up with a constantly evolving environment of employment regulations
    can cost you time and money. Prosper Benefits+ allows you to outsource key
    HR functions, avoid potentially costly mistakes, and ensures your ability to
    remain compliant.
    `
  }
]

export default ProsperBenefitsModal
