import React, { HTMLProps } from 'react'
import styles from './Plan.module.scss'
import headerStyles from './PlanTitle.module.scss'
import SlashesLoader from 'Components/Stargate/Wizard/SlashesLoader'
import { FundingType } from './Plan.helpers'
import { classNames } from 'Utilities/etc'

interface Props {
  selected?: boolean
  selectedForRemoval?: boolean
}

const Plan: React.FC<Props> = ({ selected, children }) =>
  <article className={classNames(styles.container, selected && styles.selected)}>{children}</article>

interface BodyProps {
  selectedForRemoval?: boolean
  fundingType?: FundingType
}

export const PlanBody: React.FC<BodyProps> = ({ selectedForRemoval, children, fundingType }) => {
  const isLevelFunded = fundingType === FundingType.levelFunded
  return <div className={styles.planBodyContainer}
    style={{
      backgroundColor: isLevelFunded ? '#EDF2FC' : '',
      border: isLevelFunded ? 'solid 2px #3564B9' : '',
      borderTop: 'none'
    }}>
    {children}
    { selectedForRemoval && <div className={headerStyles.remove}/> }
  </div>
}

export const PlanPlaceholder: React.FC<any> = () =>
  <>
    <div className={headerStyles.fundingTypeContainer} style={{ backgroundColor: '#d0d0d0', margin: '0 0 0 auto' }}/>
    <div className={styles.placeholderContainer}>
      <SlashesLoader/>
    </div>
  </>

interface SpecBoxProps extends HTMLProps<HTMLDivElement> {
  label: string
  tooltip?: string
}

export const SpecBox: React.FC<SpecBoxProps> = props =>
  <div {...props} className={classNames(styles.specBox, props.className)}>
    <div className={styles.specBoxLabel}>{props.label}</div>
    <div className={styles.specChildWrapper}>
      {props.children}
    </div>
  </div>

export const PlanSpecsError: React.FC = () =>
  <div className={classNames(styles.section, styles.box, styles.specsError)}>
    <p><b>Error displaying plan details.</b><br/>Please see plan details or contact support for more information.</p>
  </div>

export default Plan
