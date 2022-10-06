import React from 'react'
import styles from './ContributionAmount.module.scss'
import { $enum } from 'ts-enum-util'
import { classNames } from 'Utilities/etc'
import { GroupPlanType, moneyNumber } from 'Utilities/Plans/ContributionCalculator'
import { BaseSelect } from 'Components/Rudimentary/Select'
import { compact } from 'lodash'
import { components, OptionProps } from 'react-select'

export enum ContributionSplitType {
  perEmployee = 'perEmployee',
  flatContribution = 'flatContribution',
  allTiers = 'allTiers'
}

export enum ContributionType {
  percent = '%', fixed = '$'
}

interface Props {
  value?: string
  planType: GroupPlanType
  onChange: (value: string, splitType: ContributionSplitType) => void
  className?: string
  splitType?: ContributionSplitType
  onlyPercent?: boolean
}

const ContributionAmount: React.FC<Props> = ({ value, splitType, className, onChange, onlyPercent }) => {
  const [amount, type] = extractContribution(value || '0%')

  return <div className={styles.contributionContainer}>
    <ContributionAmountInput
      type={type}
      onChange={amount => onChangeAmount(amount, splitType)}
      value={amount}
      className={className}
    />
    <ContributionSplitTypeSelect
      planType={GroupPlanType.medical}
      value={splitType || ContributionSplitType.perEmployee}
      onChange={splitType => onChangeAmount(amount, splitType)}
      className={className}
      onlyPercent={onlyPercent}
    />
  </div>

  function onChangeAmount(amount: number, splitType?: ContributionSplitType) {
    switch (splitType) {
    case ContributionSplitType.allTiers:
    case ContributionSplitType.perEmployee:
      onChange(`${amount > 100 ? 100 : amount}%`, splitType)
      break
    case ContributionSplitType.flatContribution:
      onChange(`$${amount}`, splitType)
      break
    case undefined:
      onChange(type === ContributionType.percent ? `${amount}%` : `$${amount}`, ContributionSplitType.perEmployee)
    }
  }
}

export function extractContribution(value: string): [number, ContributionType] {
  const type = value.startsWith('$') ? ContributionType.fixed : ContributionType.percent
  switch (type) {
  case ContributionType.fixed:
    return [moneyNumber(value), type]
  case ContributionType.percent:
    return [parseInt(value), type]
  }
}

interface CAIProps {
  value: number
  onChange: (value: number) => void
  className?: string
  type: ContributionType
}

export const ContributionAmountInput: React.FC<CAIProps> = ({ className, type, value, ...props }) => {
  return <input
    className={classNames(styles.amount, className)}
    type="number"
    placeholder="0"
    onChange={onChange}
    value={value || ''} // Needs to be '' otherwise the older value is used when switching between ancillary types
  />

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    let newValue: number = parseInt(event.currentTarget.value)
    if (isNaN(newValue)) newValue = 0
    switch (type) {
    case ContributionType.percent:
      if (newValue > 100) {
        newValue = 100
      } else if (newValue < 0) {
        newValue = 0
      }
      props.onChange(newValue)
      break
    case ContributionType.fixed:
      if (newValue < 0) {
        newValue = 0
      }
      if (newValue > 9999) {
        newValue = 9999
      }
      props.onChange(newValue)
    }
  }
}

function ContributionSplitTypeText(value: ContributionSplitType): string {
  switch (value) {
  case ContributionSplitType.perEmployee:
    return '% Per Employee'
  case ContributionSplitType.flatContribution:
    return '$ Flat Contribution'
  case ContributionSplitType.allTiers:
    return '% Across All Tiers'
  }
}

interface CASProps {
  planType: GroupPlanType
  className?: string
  value: ContributionSplitType
  onChange: (value: ContributionSplitType) => void
  backgroundColor?: string
  onlyPercent?: boolean
}

export const ContributionSplitTypeSelect: React.FC<CASProps> = ({ className, onChange, ...props }) => {
  const showSelector = (props.planType === GroupPlanType.medical) || (!GroupPlanType.medical && props.value === ContributionSplitType.perEmployee)

  return <div className={classNames(styles.contType, className)}>
    {showSelector
      ? <BaseSelect
        {...props}
        value={props.value}
        isOptionDisabled={(o: { value: ContributionSplitType, label: string}) => {
          return props.onlyPercent && o.value === ContributionSplitType.flatContribution
        }}
        options={compact($enum(ContributionSplitType).map(value => {
          const fc = ContributionSplitType.flatContribution
          const pe = ContributionSplitType.perEmployee
          // This way we don't screw up any existing per line fixed contributions for ancillary.
          if (props.onlyPercent && value === fc && props.value !== fc) return
          // This way we show % Per Employee if it was chosen previously
          if (value === pe && !(props.value === pe)) return
          return { value, label: ContributionSplitTypeText(value) }
        }))}
        color='#1F2E4D'
        backgroundColor={'#FFF'}
        onChange={(value: any) => onChange(value)}
        components={{ Option }}
        isClearable={false}
      />
      : <div className={styles.ancillaryAllTiersWrappers}>
        <div className={styles.ancillaryAllTiersText}>{ContributionSplitTypeText(props.value)}</div>
        <div className={styles.ancillaryAllTiersDescription}>{contributionTypeDescription(props.value)}</div>
      </div>
    }
  </div>
}

const Option: React.FC<OptionProps<any>> = props => {
  return <components.Option {...props}>
    {props.data.label}
    <div className={styles.description}>{contributionTypeDescription(props.data.value)}</div>
  </components.Option>
}

export function contributionType(isEquitable: boolean, contribution?: string): ContributionSplitType {
  if (!contribution) { return ContributionSplitType.perEmployee }
  if (contribution.startsWith('$')) return ContributionSplitType.flatContribution
  if (isEquitable) return ContributionSplitType.allTiers
  return ContributionSplitType.perEmployee
}

function contributionTypeDescription(value: ContributionSplitType) {
  switch (value) {
  case ContributionSplitType.perEmployee:
    return 'A percentage applied to the employee only'
  case ContributionSplitType.flatContribution:
    return 'A fixed amount applied across all tiers'
  case ContributionSplitType.allTiers:
    return 'A percentage applied across each tier equally'
  }
}

export default ContributionAmount
