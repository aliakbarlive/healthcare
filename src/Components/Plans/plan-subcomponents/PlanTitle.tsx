import React from 'react'
import { useToggle } from 'react-use'
import styles from './PlanTitle.module.scss'
import { RemoveCheckbox, SelectCheckbox } from './Checkboxes'
import { logoFor, FundingType, massagedPlanName, isAllstate, Carriers, isHBA } from './Plan.helpers'
import { Label } from 'Utilities/config'
import { MedicalPlan, Group } from 'Utilities/pharaoh.types'
import { GAButton } from 'Components/Tracking'
import { $enum } from 'ts-enum-util'
import { ReactComponent as ProsperIcon } from '../assets/prosper-icon.svg'
import Modal, { ActionType, BrandColors } from 'Components/Modals/Modal'
import { GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'

interface Props {
  id: string
  className?: string
  planName: string
  carrier: string
  includesProsperBenefits: boolean
  customContributionApplied?: boolean
  planNameSubtitle?: JSX.Element | string // Will be overridden by includesProsperBenefits
  fundingType?: FundingType
  selectHandler?: () => void // Select checkbox won't show up unless you pass the handler
  selected?: boolean
  removeHandler?: () => void // Remove checkbox won't show up unless you pass the handler
  selectedForRemoval?: boolean
  sbc?: string
  isLimitedPlan?: boolean
  infoHandler?: () => void
  showLimitedPlanInfo?: boolean
  showSBC?: boolean
  toggleShowSBC?: () => void
  priorYearsPlan?: boolean
  available?: boolean
  planType: GroupPlanType
  group?: Group
  label: Label
}

const PlanTitle: React.FC<Props> = ({ id, planName, carrier, label, includesProsperBenefits, planNameSubtitle, fundingType, selectHandler, selected, selectedForRemoval, removeHandler, sbc, isLimitedPlan, infoHandler, showLimitedPlanInfo, showSBC, toggleShowSBC, priorYearsPlan, available, planType, group, ...props }) => {
  const prosperName = 'Prosper Benefits'
  const isLevelFunded = fundingType === FundingType.levelFunded
  const isBSLife = label === Label.blacksmith && planType === GroupPlanType.life
  const isEmployer = useAppMode() === AppMode.employer
  const showCustomContributionLabel = selectHandler
    ? isEmployer && props.customContributionApplied && selected
    : isEmployer && props.customContributionApplied
  return <>
    { fundingType && !isLimitedPlan && <FundingTypeTab fundingType={fundingType} carrier={carrier} /> }
    { priorYearsPlan &&
      <div style={{ backgroundColor: '#d4f8ef' }} className={styles.fundingTypeContainer} >
        You picked this plan last year
      </div>
    }
    <div className={styles.planTitleContainer}
      style={{
        backgroundColor: isLevelFunded ? '#EDF2FC' : '',
        border: isLevelFunded ? 'solid 2px #3564B9' : '',
        borderBottom: 'none'
      }}>
      { selectHandler && available !== false
        ? <SelectCheckbox
          name='planSelect'
          value={selected || isBSLife}
          onChange={selectHandler}
          className={selected && isLevelFunded ? styles.levelFundedSelected : undefined}
          disabled={isBSLife}
        />
        : selectHandler && !$enum(GroupPlanType).getEntries().map(pt => pt[1] as string).includes(planType)
          ? <h3>Unavailable</h3>
          : null
      }
      { showCustomContributionLabel && <div className={styles.customContributionLabel}>Custom Contribution Applied<span className="material-icons">check</span></div> }
      { logoFor(carrier, planName) || <span>{ carrier }</span> }
      <div className={styles.title}>
        <div style={{ color: isLevelFunded ? '#16346f' : '' }} >{massagedPlanName(planName, carrier)}</div>
        { includesProsperBenefits
          ? <div className={styles.prosper}>
            Includes <ProsperIcon className={styles.prosperIcon} /> <b>{prosperName}</b> by HealthAdvocate
            { isAllstate(carrier) &&
              <>
                <br/>
                Stop-loss insurance is underwritten by: <b>{ natGetStopLossProvider(group) }</b>
              </>
            }
          </div>
          : planNameSubtitle && <div className={styles.prosper}>{planNameSubtitle}</div>
        }
      </div>
      { removeHandler && <RemoveCheckbox name='planSelect' value={selectedForRemoval} onChange={removeHandler} /> }
      <div className={styles.planDetails}>
        <PlanDetailsButton planType={planType} id={id} sbc={sbc} carrier={carrier} planName={planName} showSBC={showSBC} toggleShowSBC={toggleShowSBC} />
        { isLimitedPlan && infoHandler &&
          <PlanDetailsInfoButton showInfo={!!showLimitedPlanInfo} infoHandler={infoHandler} />
        }
      </div>
      { selectedForRemoval && <div className={styles.remove}/>}
    </div>
  </>
}

interface SBCProps {
  id: string
  sbc?: string
  carrier: string
  planName: string
  showSBC?: boolean
  toggleShowSBC?: () => void
  planType?: GroupPlanType
}

const natGetStopLossProvider: (group?: Group) => string = (group?: Group) => {
  switch (group?.address.state) {
  case 'CO':
  case 'CT':
  case 'NY':
  case 'VT': return 'Integon National Insurance Company'
  case 'FL': return 'Integon Indemnity Corporation'
  default: return 'National Health Insurance Company'
  }
}

const PlanDetailsButton: React.FC<SBCProps> = props => {
  const supplementalGroupType = [GroupPlanType.accident, GroupPlanType.cancer, GroupPlanType.criticalIllness, GroupPlanType.criticalIllness, GroupPlanType.std, GroupPlanType.life]
  const planDetails = supplementalGroupType.some(item => item === props.planType)
  const [showSBC, toggleShowSBC] = (props.showSBC !== undefined && props.toggleShowSBC) ? [props.showSBC, props.toggleShowSBC] : useToggle(false)
  if (props.carrier === Carriers.Prosper) return <></>
  return <>
    <PlanDetailsModal {...props} showSBC={showSBC} toggleShowSBC={toggleShowSBC} />
    <GAButton analytics={`SBC (${PlanDetailsButton.name})`} className={styles.viewDetails} id={planDetailsButtonID(props.id)} onClick={toggleShowSBC}>{planDetails ? 'Plan Details' : 'SBC'}</GAButton>
  </>
}

const PlanDetailsInfoButton: React.FC<{ showInfo: boolean, infoHandler: () => void }> = ({ showInfo, infoHandler }) => {
  return <button className={styles.planDetailsInfo} onClick={infoHandler}>
    {showInfo
      ? <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 15.5C3.375 15.5 0 12.125 0 8C0 3.875 3.375 0.5 7.5 0.5C11.625 0.5 15 3.875 15 8C15 12.125 11.625 15.5 7.5 15.5Z" fill="#372DA3"/>
        <path d="M5.9375 11.75C5.5625 11.75 5.3125 11.5 5.3125 11.125C5.3125 10.75 5.5625 10.5 5.9375 10.5H7.1875V8H5.9375C5.5625 8 5.3125 7.75 5.3125 7.375C5.3125 7 5.5625 6.75 5.9375 6.75H7.8125C8.1875 6.75 8.4375 7 8.4375 7.375V10.5H9.6875C10.0625 10.5 10.3125 10.8125 10.3125 11.125C10.3125 11.5 10.0625 11.75 9.6875 11.75H5.9375Z" fill="white"/>
        <path d="M7.5 6.125C7 6.125 6.5625 5.6875 6.5625 5.1875C6.5625 4.9375 6.6875 4.6875 6.8125 4.5C7 4.375 7.25 4.25 7.5 4.25C8 4.25 8.4375 4.6875 8.4375 5.1875C8.4375 5.6875 8 6.125 7.5 6.125Z" fill="white"/>
      </svg>
      : <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.49976 15.5C3.37476 15.5 -0.000244141 12.125 -0.000244141 8C-0.000244141 3.875 3.37476 0.5 7.49976 0.5C11.6248 0.5 14.9998 3.875 14.9998 8C14.9998 12.125 11.6248 15.5 7.49976 15.5ZM7.49976 1.875C4.12476 1.875 1.37476 4.625 1.37476 8C1.37476 11.375 4.12476 14.125 7.49976 14.125C10.8748 14.125 13.6248 11.375 13.6248 8C13.6248 4.625 10.8748 1.875 7.49976 1.875Z" fill="#372DA3" />
        <path d="M5.93726 11.75C5.56226 11.75 5.31226 11.5 5.31226 11.125C5.31226 10.75 5.56226 10.5 5.93726 10.5H7.18726V8H5.93726C5.56226 8 5.31226 7.75 5.31226 7.375C5.31226 7 5.56226 6.75 5.93726 6.75H7.81226C8.18726 6.75 8.43726 7 8.43726 7.375V10.5H9.68726C10.0623 10.5 10.3123 10.8125 10.3123 11.125C10.3123 11.5 10.0623 11.75 9.68726 11.75H5.93726Z" fill="#372DA3" />
        <path d="M7.49976 6.125C6.99976 6.125 6.56226 5.6875 6.56226 5.1875C6.56226 4.9375 6.68726 4.6875 6.81226 4.5C6.99976 4.375 7.24976 4.25 7.49976 4.25C7.99976 4.25 8.43726 4.6875 8.43726 5.1875C8.43726 5.6875 7.99976 6.125 7.49976 6.125Z" fill="#372DA3" />
      </svg>
    }
  </button>
}

// Doing this because I don't want to expose the 'PlanDetailsModal' state/toggle outside of the 'Plan Details' button
const planDetailsButtonID = (id: string) => `${id}-sbc`
export function clickPlanDetailsButtonFor(plan: MedicalPlan) {
  const buttonID = planDetailsButtonID(plan.id)
  const button = document.getElementById(buttonID)
  if (button) button.click()
}

interface SBCPModalProps extends SBCProps {
  showSBC: boolean
  toggleShowSBC(): void
}

export const PlanDetailsModal: React.FC<SBCPModalProps> = ({ sbc, showSBC, toggleShowSBC, carrier, planName }) => {
  const sbcCopy = carrier === Carriers['Sidecar Health'] ? 'FAQs' : 'SBC'
  return <Modal
    gaModalName={PlanDetailsModal.name}
    isOpen={showSBC}
    onRequestClose={toggleShowSBC}
    header={<>
      {carrier === Carriers['Sidecar Health'] ? 'Sidecar Health FAQs' : 'Summary of Benefits and Coverage'}
      <div className={styles.sbcPlan}>
        <div>
          { logoFor(carrier, planName) || <div>{ carrier }</div> }
          <div className={styles.planName}>{massagedPlanName(planName, carrier)}</div>
        </div>
        { sbc && <a className={styles.downloadSBC} href={sbc}>
          <span className='material-icons'>cloud_download</span>
          Download {sbcCopy}
        </a> }
      </div>
    </>}
  >
    <div className={styles.sbcWrapper}>
      { sbc
        ? <object className={styles.sbcViewer} title="sbc" data={sbc} type="application/pdf">
          <a href={sbc}>{sbcCopy} document</a>
        </object>
        : <div className={styles.noSBC}>{sbcCopy} file not found, please use the chat button<br/>at the bottom right corner to request one.</div>
      }
    </div>
  </Modal>
}

const FundingTypeTab: React.FC<{ fundingType: FundingType, carrier: string }> = ({ fundingType, carrier }) => {
  const [showExplanation, toggleShowExplanation] = useToggle(false)
  const planTypeExplanation = explanationFor(fundingType)
  const color = fundingType === FundingType.levelFunded ? 'white' : ''
  let title = fundingType as string

  if (fundingType === FundingType.levelFunded) {
    title += ` - ${isHBA(carrier) ? 'Employer' : 'Employee'} Level`
  }

  if (fundingType === FundingType.fullyFunded) {
    title = 'ACA Community Rated'
  }

  return <div
    style={{ backgroundColor: colorFor(fundingType), color }}
    className={styles.fundingTypeContainer}
  >
    { planTypeExplanation }
    { title }
    { planTypeExplanation &&
      <button
        className={styles.whatAreThose}
        onClick={toggleShowExplanation}
        style={{ color, borderBottomColor: color }}
      >
        What are these?
      </button>
    }
  </div>

  function explanationFor(fundingType: FundingType) {
    switch (fundingType) {
    case FundingType.mec:
      return <MECExplanationModal isOpen={showExplanation} onRequestClose={toggleShowExplanation}/>
    case FundingType.levelFunded: break
      // return <LevelFundedExplanationModal isOpen={showExplanation} onRequestClose={toggleShowExplanation}/>
    case FundingType.fullyFunded: break
    }
  }
}

function colorFor(fundingType: FundingType) {
  switch (fundingType) {
  case FundingType.fullyFunded:
    return '#D9E8FF'
  case FundingType.levelFunded:
    return '#3564B9'
  case FundingType.mec:
    return '#DBE1FF'
  }
}

interface ExplanationModalProps {
  isOpen: boolean
  onRequestClose(): void
}

// const LevelFundedExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onRequestClose }) =>
//   <Modal
//     gaModalName={LevelFundedExplanationModal.name}
//     isOpen={isOpen}
//     onRequestClose={onRequestClose}
//     header={`${FundingType.levelFunded} Plans`}
//     footerButtons={[{
//       gaButtonName: `Close ${LevelFundedExplanationModal.name}`,
//       content: 'Close',
//       onClick: onRequestClose,
//       actionType: ActionType.primary,
//       color: BrandColors.navyBlue
//     }]}
//   >
//     <div className={styles.explanationContainer}>
//       <p>Our software was created to match each employee to their personalized plan. Providing each person with the optimal level of coverage, resulting in major savings for all. This gives employees real choices for their very real and unique situations.</p>
//       <h2>Advantages</h2>
//       <ul>
//         <li>Savings in Healthcare costs</li>
//         <li>Protection against extraordinary costs</li>
//         <li>Employees are offered plans that best fit their needs</li>
//       </ul>
//     </div>
//   </Modal>

const MECExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onRequestClose }) =>
  <Modal
    gaModalName={MECExplanationModal.name}
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    header={`${FundingType.mec} Plans`}
    footerButtons={[{
      gaButtonName: `Close ${MECExplanationModal.name}`,
      content: 'Close',
      onClick: onRequestClose,
      actionType: ActionType.primary,
      color: BrandColors.navyBlue
    }]}
  >
    <div className={styles.explanationContainer}>
      <p>{ FundingType.mec } Plans provide simple to understand and affordable options. They exceed the requirements of the Affordable Care Act satisfying Employer Penalty A and Individual Mandate Penalty*. These plans are not insurance products.</p>
      <h2>What it is</h2>
      <p>Everyday Healthcare Needs. Laboratory Services. Imaging or X-ray Services. Prescription Drugs. By frequency, Premier Plan accounts for 90+% of healthcare service and addresses those everyday healthcare needs.</p>
      <h2>What these plans cover</h2>
      <p>Preventive Care, Primary Care, Office Visits, Specialists Office Visits, Urgent Care Visits, Laboratory Services, Imaging or X-ray Services, Prescription Drugs, and Telemedicine</p>
      <h2>What these plans don’t cover</h2>
      <p>Big ticket items such as hospital stays, chronic diseases, specialty drugs. The Premier Plan includes a hospital component for Inpatient, Outpatient, Emergency Room, and Ambulance Services 50/50 Benefit to $5,000 / Max payout $2,500.</p>
      <h2>Q: Is there a network of doctors or physicians?</h2>
      <p>Yes, the plan uses Preferred Healthcare Services (PHCS), one of the largest physician networks with over 900,000 physicians nationwide. There is no coverage for out‐of‐network services </p>
      <h2>Q: Will I receive an ID Card?</h2>
      <p>Yes, An ID card and welcome kit will be sent to your home address. This usually takes several days after your requested effective date. For questions on benefits, claims, ID cards etc.: <a style={{ color: '#16346f' }} href='tel:+1-888-272-1513'>1-888-272-1513</a></p>
      <h2>Q: Does the plan cover Preventive Care Services?</h2>
      <p>Yes, the plan provides 100% benefits, no copays, no deductibles (in-network) Preventive Care services include: Screenings for blood pressure, cancer, cholesterol, depression, obesity, and Type 2 diabetes. Pediatric screenings for hearing, vision, autism, and developmental disorders, depression, and obesity.</p>
      <small>*These plans may not meet your state&apos;s individual or employer coverage mandates.</small>
    </div>
  </Modal>

export default PlanTitle
