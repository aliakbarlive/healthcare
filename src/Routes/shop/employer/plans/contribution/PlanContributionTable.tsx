import React from 'react'
import styles from './index.module.scss'
import { Controller, useFormContext } from 'react-hook-form'
import ContributionsCalculator, { EnrolleeType, PlanUnion, GroupPlanType, moneyString, moneyWeekly, BaseContributions, contributionFor } from 'Utilities/Plans/ContributionCalculator'
import { extractPlanNameAndCarrier } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { isDollar, isPercentage } from 'Utilities/Plans/PlanCostUtils'
import { $enum } from 'ts-enum-util'
import numeral from 'numeral'
import { ContributionSplit } from 'Utilities/Hooks/useStargate'
import { Tier } from 'Utilities/pharaoh.types'
import { ContributionSplitType } from 'Components/Stargate/Contribution/ContributionAmount'
import { isNumber, upperFirst } from 'lodash'

interface PlanContributionTableProps {
  plan: PlanUnion
  prefix: string
  type: GroupPlanType
  baseContributions: BaseContributions
  calc: ContributionsCalculator
  split?: ContributionSplit
  showWeeklyPayments: boolean
}

enum AmountType {
  erAverage,
  eeAverage,
  erTotal
}

const PlanContributionTable: React.FC<PlanContributionTableProps> = ({ plan, calc, split, ...props }) => {
  const { name, carrier } = extractPlanNameAndCarrier(plan)
  const { control, setValue } = useFormContext()
  const base = contributionFor(props.type, props.baseContributions)
  const baseType = isDollar(base.contribution)
    ? ContributionSplitType.flatContribution
    : base.equitable
      ? ContributionSplitType.allTiers
      : ContributionSplitType.perEmployee

  const showFamilyBreakdown = baseType === ContributionSplitType.perEmployee

  return <table className={styles.planContributionTable} data-columns={showFamilyBreakdown ? 'four-col' : 'five-col'}>
    <thead>
      <tr>
        <th>{planType()}</th>
        { showFamilyBreakdown
          ? $enum(EnrolleeType).map(v => <th key={v}>{enrolleeHead(v)}</th>)
          : $enum(Tier).map((v, _, __, i) => <th key={v}>{tierHead(v, i + 1)}</th>)
        }
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>
          <div className={styles.pct_planCarrier}>{carrier}</div>
          <div className={styles.pct_planName }>{name}</div>
        </th>
        { showFamilyBreakdown
          ? $enum(EnrolleeType).map(v => <td key={v}>{input(v)}</td>)
          : $enum(Tier).map(v => <td key={`${v}.${baseType}`}>{input(v)}</td>)
        }
      </tr>
      <tr>
        <th>Employer Pays</th>
        { showFamilyBreakdown
          ? $enum(EnrolleeType).map(v => amountFor(v, AmountType.erAverage))
          : $enum(Tier).map(v => amountFor(v, AmountType.erAverage))
        }
      </tr>
      <tr>
        <th>Employee Pays</th>
        { showFamilyBreakdown
          ? $enum(EnrolleeType).map(v => amountFor(v, AmountType.eeAverage))
          : $enum(Tier).map(v => amountFor(v, AmountType.eeAverage))
        }
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th>
          Estimated Employer<br/>
          Total Cost
        </th>
        { showFamilyBreakdown
          ? $enum(EnrolleeType).map(v => amountFor(v, AmountType.erTotal))
          : $enum(Tier).map(v => amountFor(v, AmountType.erTotal))
        }
      </tr>
    </tfoot>
  </table>

  function amountFor(key: Tier | EnrolleeType, type: AmountType) {
    const amount = getAmount()
    return <td key={key}>
      { amount
        ? <>{props.showWeeklyPayments ? moneyWeekly(amount) : moneyString(amount)}/<span>{props.showWeeklyPayments ? 'wk' : 'mo'}</span></>
        : '—'
      }
    </td>

    function getAmount() {
      switch (type) {
      case AmountType.erAverage:
        if ($enum(Tier).isKey(key)) {
          return calc.avgPremiumsForPlanForTier(plan, key, split, props.type === GroupPlanType.medical).er
        }
        return calc.avgPremiumsForPlanForEnrolleeType(plan, key, split, props.type === GroupPlanType.medical).er

      case AmountType.eeAverage:
        if ($enum(Tier).isKey(key)) {
          return calc.avgPremiumsForPlanForTier(plan, key, split, props.type === GroupPlanType.medical).ee
        }
        return calc.avgPremiumsForPlanForEnrolleeType(plan, key, split, props.type === GroupPlanType.medical).ee
      case AmountType.erTotal:
        if ($enum(Tier).isKey(key)) {
          return calc.premiumsForPlanForTier(plan, key, split, props.type === GroupPlanType.medical).er
        }
        return calc.premiumsForPlanForEnrolleeType(plan, key, split, props.type === GroupPlanType.medical)?.er || 0
      }
    }
  }

  function input(suffix: Tier | EnrolleeType) {
    const name = `${props.prefix}.${suffix}`
    return <Controller
      name={name}
      control={control}
      defaultValue={''}
      render={props => {
        return <input
          className={styles.contributionInput}
          onBlur={onBlur}
          onFocus={onFocus}
          defaultValue={defaultValue()}
          placeholder={placeholder()}
        />

        function onBlur(event: React.ChangeEvent<HTMLInputElement>) {
          const input = numeral(event.target.value).value() || event.target.value.replace(/[^0-9]+/g, '')
          if (!input) {
            // Clear input
            event.target.value = ''
            setValue(name, '')
            return
          }
          let value = isNumber(input) ? input : numeral(input).value()
          let massagedValue = ''

          if (isPercentage(base.contribution || '0%')) {
            if (value > 100) {
              value = 100
            } else if (value < 0) {
              value = 0
            }
            massagedValue = numeral(value / 100).format('0%')
          } else {
            if (value < 0) value = 0
            massagedValue = numeral(value).format('$0,0')
          }
          event.target.value = massagedValue
          setValue(name, massagedValue)
        }

        function onFocus(event: React.ChangeEvent<HTMLInputElement>) {
          const value = event.target.value.replace(/[^0-9]+/g, '')
          if (!value || value === '0') {
            event.target.value = ''
          } else {
            event.target.value = value
          }
        }

        function placeholder() {
          switch (baseType) {
          case ContributionSplitType.flatContribution:
            return moneyString(base.contribution)
          case ContributionSplitType.perEmployee:
            return suffix === EnrolleeType.employee ? base.contribution : '0%'
          case ContributionSplitType.allTiers:
            return base.contribution
          }
        }

        function defaultValue() {
          const imDollar = isDollar(props.value)
          const baseIsDollar = isDollar(base.contribution)

          if (imDollar !== baseIsDollar) { return '' }
          if (isDollar(props.value)) return moneyString(props.value)
          return props.value
        }
      }}
    />
  }

  function planType() {
    return <div className={styles.planTypeCellWrapper}>
      <div className={styles.columnHeader}>{`${upperFirst(props.type)} Plan`}</div>
      <div className={styles.numberOfEmployees}># of people</div>
    </div>
  }

  function tierHead(tier: Tier, step: number) {
    return <>
      <div className={styles.columnHeader}>{`Tier ${step}`}</div>
      <div className={styles.columnTier}>{tierCopy(tier)}</div>
      <input className={styles.contributionInput} type='number' defaultValue={calc.numberOf(tier, split, props.type === GroupPlanType.medical)} disabled/>
    </>

    // Different names from `tierMarketingCopy` in `Plan.helpers`
    function tierCopy(tier: Tier) {
      switch (tier) {
      case Tier.individual:
        return 'Employee Only'
      case Tier.singleParent:
        return 'Employee & Child(ren)'
      case Tier.couple:
        return 'Employee & Spouse'
      case Tier.family:
        return 'Family'
      }
    }
  }

  function enrolleeHead(enrollee: EnrolleeType) {
    return <>
      <div className={styles.columnHeader}>&nbsp;</div>
      <div className={styles.columnTier}>{enrolleeCopy(enrollee)}</div>
      <input className={styles.contributionInput} type='number' defaultValue={calc.numberOf(enrollee, split, props.type === GroupPlanType.medical)} disabled/>
    </>

    function enrolleeCopy(enrollee: EnrolleeType) {
      switch (enrollee) {
      case EnrolleeType.employee:
        return 'Employee Only'
      case EnrolleeType.spouse:
        return 'Spouse'
      case EnrolleeType.children:
        return 'Child(ren)'
      }
    }
  }
}

export default PlanContributionTable
