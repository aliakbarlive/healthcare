/* eslint-disable camelcase */
import React, { useState } from 'react'
import styles from './ShowPlans.module.scss'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { useAsync, useToggle, useLocalStorage } from 'react-use'
import { get } from 'Utilities/fetch++'
import Error from 'Components/Primitives/Error'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import PlansFilter, { FilterType } from 'Components/Stargate/ShowPlans/Filters/PlansFilter'
import PlanCart from '../../../../Components/Stargate/ShowPlans/Components/PlanCart'
import Loader from 'Components/Rudimentary/Loader'
import { sortBy, uniq, compact, inRange, intersection } from 'lodash'
import useToast from 'Utilities/Hooks/useToast'
import * as api from 'Utilities/pharaoh'
import ContributionAmount, { contributionType as extractContributionType, ContributionSplitType } from 'Components/Stargate/Contribution/ContributionAmount'
import { useHistory, useLocation } from 'react-router-dom'
import { GroupPlanType, MemberPlus, moneyNumber } from 'Utilities/Plans/ContributionCalculator'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import CompareModal from 'Components/Stargate/ShowPlans/Components/CompareModal'
import MedicalPlanComponent from 'Components/Plans/MedicalPlan'
import headerStyles from 'Components/Stargate/ShowPlans/Components/ShowPlansHeader.module.scss'
import LazyLoad from 'react-lazyload'
import { PlanPlaceholder } from 'Components/Plans/plan-subcomponents/Plan'
import ReactDOM from 'react-dom'
import { isAllstate, Carriers, FundingType } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { GAButton } from 'Components/Tracking'
import BackToTop from 'Components/BackToTop'
import moment from 'moment'
import { employeePerTierCount } from 'Routes/dashboard/agency/clients/ID'
import numeral from 'numeral'

interface Recs {
  lowestTCoC: MedicalPlan
  lowestPremium: MedicalPlan
  bestValue: MedicalPlan
  meta: PlansMeta
}

export interface PlansMeta {
  totalNumberOfPlans: number
  carriers: string[]
  largestDeductible: string
  largestPremium: string
  largestOOPMax: string
  individualPlansCount: number
  couplePlansCount: number
  singleParentPlansCount: number
  familyPlansCount: number
  nonWaivedMemberCount: number
  memberCount: number
}

export enum SortingMethod {
  premium = 'premium', deductible = 'deductible', oopMax = 'oop≥'
}

const ERShopPlans: React.FC<PrivateWizardPageProps> = ({ stargate, ...props }) => {
  const { group, members, splits, contributions } = stargate
  const [filteredPlans, setFilteredPlans] = React.useState<MedicalPlan[]>([])
  const [medicalPlans, setMedicalPlans] = React.useState<MedicalPlan[]>([])
  const baseContributions = contributions?.baseContributions
  const [selectedPlanIDs, setSelectedPlanIDs, removeSelectedPlans] = useLocalStorage<string[]>(`selected-plans-${group?.id}`, localStorage.plans as string[] || stargate.planIds || [])
  const [isCompareModalOpen, toggleCompare] = useToggle(false)
  const [disabled, setDisabled] = useToggle(false)
  const [contribution, setContribution] = useState(baseContributions?.medical || '50%')
  const [contributionType, setContributionType] = useState<ContributionSplitType>(extractContributionType(baseContributions ? !!baseContributions.medicalEquitable : true, baseContributions?.medical || '50%'))
  const history = useHistory()
  const addToast = useToast()
  const { search, pathname } = useLocation()
  useFullContentArea()

  if (!group || !members) return <Error error='Please complete earlier steps' />

  const { value, loading: loadingPlans, error } = useAsync(async() => {
    const medicalPlansRsp = await get(`/v2/groups/${group?.id}/plans/options`) as MedicalPlan[]
    setMedicalPlans(medicalPlansRsp)
    const recs = await get(`/v2/groups/${group?.id}/plans/options/recommended`) as Recs
    const broker = await api.v3.brokers.GET()
    const ees = await api.v3.groups(group!.id).users().GET() as MemberPlus[]
    return { medicalPlans, recs, broker, ees }
  })

  React.useMemo(() => {
    // Default filters for first time load
    if (loadingPlans && search.length === 0) {
      history.push(`${pathname}?fundingTypes[]=Medically+Underwritten&fundingTypes[]=Fully+Insured&sort=premium`)
    }
    applyFilters()
    window.scrollBy(0, 1) // Seems like a LazyLoad Bug, the PlaceHolder runs infinitely unless you manually scroll the page, but this fixes it
  }, [search, medicalPlans])

  if (error) return <Error error={error} />
  if (loadingPlans) return <Loader />

  const { recs, broker, ees } = value!

  const plans = sortedPlans(filteredPlans, loadingPlans)
  const selectedPlans = sortedPlans(medicalPlans, loadingPlans)?.filter(plan => selectedPlanIDs?.some((id: string) => id === plan.id)) || []
  const isNextButtonDisabled = (selectedPlanIDs || []).length <= 0 || disabled
  const buttonCopy = isNextButtonDisabled ? 'Select a plan to continue' : 'Next'
  return <>
    {renderShowPlans()}
  </>

  function renderHeader() {
    return <header className={headerStyles.header}>
      <div>
        <div className={headerStyles.titleArea}>
          <h1>Select Group Plans</h1>
          {includesMQPlans(selectedPlans) &&
            <p>You have selected a level-funded plan, which requires all employees and their dependents seeking medical coverage to provide medical history in an Individual Medical Questionnaire (IMQ). This process allows us to get the best and most accurate rates so we can find the right plan for you.</p>
          }
        </div>
        <div className={headerStyles.buttonsContainer}>
          <GAButton
            analytics={`${buttonCopy} (${ERShopPlans.name})`}
            className={headerStyles.nextButton}
            onClick={() => onwards(selectedPlans).catch(addToast)}
            disabled={isNextButtonDisabled}
          >
            {buttonCopy}
          </GAButton>
        </div>
      </div>
    </header>
  }

  function renderPlans() {
    if (loadingPlans) return <Loader />
    return plans!.map(plan =>
      <LazyLoad
        offset={100}
        key={plan.id}
        placeholder={<PlanPlaceholder/>}
      >
        <MedicalPlanComponent
          plan={plan}
          contributions={mangleContribution()}
          selected={!!(selectedPlanIDs as string[])?.find(id => id === plan.id)}
          selectHandler={onPlanSelectToggled}
          splits={splits}
          members={members}
          key={plan.id}
          showWeeklyPayments={stargate.config.showWeeklyPayments}
          label={stargate.config.label}
        />
      </LazyLoad>
    )
  }

  function mangleContribution() {
    const c = contributions!
    c.baseContributions.medical = contribution
    c.baseContributions.medicalEquitable = contributionType === ContributionSplitType.allTiers
    return c
  }

  function renderShowPlans() {
    return <>
      {renderHeader()}
      <div className={styles.mainContainer}>
        <div className={styles.plansAndFilter} style={{ display: 'grid' }}>
          <div className={styles.filterBarContainer}>
            <PlansFilter
              activeFilters={activeFilters()}
              callback={applyFilter}
              meta={recs!.meta}
              filteredPlansCount={plans?.length}
              plansCount={medicalPlans.length}
            />
          </div>
          <div className={styles.plansListContainer}>
            <section className={styles.erSection}>
              <h2>
                <b>Selected plans will be added into your shopping cart to compare.</b>
                &nbsp;Once selected you may alter the contribution amount. You’ll be able to adjust your specific contributions before finalizing your selected plans.
              </h2>
              <ContributionAmount
                planType={GroupPlanType.medical}
                onChange={handleContribution}
                value={contribution}
                splitType={contributionType}
              />
            </section>
            <div className={styles.hideProposalContent}>
              <div className={styles.helperDiv} />
            </div>
            {renderPlans()}
          </div>
        </div>
        <PlanCart
          selectedPlans={selectedPlans}
          removePlan={onPlanSelectToggled}
          compare={toggleCompare}
          editingCart={disabled}
          NBtnAnalytics={`${buttonCopy} (${ERShopPlans.name})`}
          NBtnonClick={() => onwards(selectedPlans).catch(addToast)}
          broker={broker}
          groupInfo={{ name: group!.name, id: group!.id, effectiveDate: group!.effectiveDate, groupState: group!.state }}
          enrollCount={employeePerTierCount(ees)}
        />
        <CompareModal
          isOpen={isCompareModalOpen}
          onRequestClose={toggleCompare}
          plans={selectedPlans}
          contributions={mangleContribution()}
          splits={splits}
          members={members}
          group={group!}
          removePlanHandler={onPlanSelectToggled}
        />
      </div>
      <BackToTop/>
    </>
  }

  function runFilter(mPlan: MedicalPlan, filter: FilterType, value: string) {
    switch (filter) {
    case FilterType.sort:
    case FilterType.premium:
    case FilterType.deductible:
    case FilterType.oop:
      return isInRange(mPlan, filter, value)
    case FilterType.carrier:
      return mPlan.carrier === value
    case FilterType.planType:
      return mPlan.type.toString() === value
    case FilterType.fundingType:
      if (value === FundingType.mec) return mPlan.carrier === Carriers['Apex Management Group'].toString() || (mPlan.carrier === Carriers['Health Benefit Alliance'].toString() && mPlan.name.includes('MEC'))
      else if (value === FundingType.levelFunded) return mPlan.isLevelFunded
      else if (value === FundingType.fullyFunded) return (!mPlan.isLevelFunded && ![Carriers['Apex Management Group'].toString(), Carriers['Sidecar Health'].toString(), Carriers['Health Benefit Alliance'].toString()].includes(mPlan.carrier))
      else if (value === FundingType.alternative) return mPlan.carrier === Carriers['Sidecar Health'].toString()
      else if (value === FundingType.hsa) return mPlan.hsaEligible || mPlan.name.toLowerCase().includes('hsa')
    }

    function isInRange(plan: MedicalPlan, filterType: FilterType, range: string) {
      const minAndMax = { min: numeral(range.split('..')[0]).value(), max: numeral(range.split('..')[1]).value() }
      if (filterType === FilterType.premium) return inRange(numeral(plan.premium.employee.individual).value(), minAndMax.min, minAndMax.max)
      if (filterType === FilterType.deductible) return inRange(numeral(plan.deductible).value(), minAndMax.min, minAndMax.max)
      if (filterType === FilterType.oop) return inRange(numeral(plan.oopMax).value(), minAndMax.min, minAndMax.max)
    }
  }

  function applyFilters() {
    const allFiltersApplied: Array<Array<MedicalPlan>> = new Array<Array<MedicalPlan>>()
    const filters = activeFilters().filter(f => f[0] !== FilterType.sort)

    if (filters.length === 0) { setFilteredPlans(medicalPlans); return }
    if (filters.length === 1) { setFilteredPlans(medicalPlans.filter(p => runFilter(p, filters[0][0], filters[0][1]))); return }

    const filterMap: Map<FilterType, string[]> = new Map<FilterType, string[]>()
    filters.forEach(f => filterMap.set(f[0], [...filterMap.get(f[0]) || [], f[1]]))

    filterMap.forEach((value, key) => {
      const sameCategoryPlans = new Array<MedicalPlan>()
      value.forEach(v => medicalPlans.filter(p => runFilter(p, key, v)).forEach(p => sameCategoryPlans.push(p)))
      allFiltersApplied.push(sameCategoryPlans)
    })

    setFilteredPlans(intersection(...allFiltersApplied))
  }

  function activeFilters(): [FilterType, any][] {
    const pp = new URLSearchParams(search)
    // TODO should verify it is actually a FilterType or we may screw up
    const rv: [FilterType, any][] = compact(Array.from(pp.entries()).map(transform))
    return rv

    function transform(input: [string, any]): [FilterType, any] | undefined {
      let [key, value] = input
      if (key.endsWith('[]')) key = key.slice(0, -2)
      for (const typeKey in FilterType) {
        if (FilterType[typeKey as keyof typeof FilterType] === key) return [key, value]
      }
    }
  }

  function sortingMethod(): SortingMethod {
    const pp = new URLSearchParams(search)
    const query = pp.get(FilterType.sort)
    for (const key in SortingMethod) {
      const type = SortingMethod[key as keyof typeof SortingMethod]
      if (type === query) return type
    }
    return SortingMethod.premium
  }

  function applyFilter(type: FilterType, value: any) {
    const pp = new URLSearchParams(search)
    if (type === FilterType.sort) {
      pp.set(type, value)
    } else {
      const key = `${type}[]`
      if (activeFilters().find(([a, b]) => type === a && value === b)) {
        const values = pp.getAll(key).filter(vv => vv !== value)
        pp.delete(key)
        values.forEach(value => pp.append(key, value))
      } else {
        pp.append(key, value)
      }
    }
    // decode or [] becomes percent encoded and looks gross
    history.push({ search: decodeURIComponent(pp.toString()) })
  }

  function onPlanSelectToggled(plan: MedicalPlan) {
    const planIDs: string[] = selectedPlanIDs || []
    const has = planIDs.some(id => id === plan.id)
    if (has) {
      setSelectedPlanIDs(planIDs.filter(id => id !== plan.id))
    } else {
      setSelectedPlanIDs([...planIDs, plan.id])
      if (plan.isLevelFunded && moment(group?.effectiveDate).subtract(10, 'days').isBefore(moment())) {
        addToast('One or more plans in your cart may not meet carrier timeline for issuance.', 'warning')
      }
    }
  }

  function onwards(plans: MedicalPlan[]) {
    if (!plans.length) return Promise.reject(new window.Error('Please pick a plan to continue'))

    const hasHBAHighPlans = plans.some(p => p.name.includes('Ultra'))
    const hasHBALowPlans = plans.some(p => p.carrier === Carriers['Health Benefit Alliance'] && !p.name.includes('Ultra'))
    if (hasHBAHighPlans && !hasHBALowPlans) return Promise.reject(new window.Error('HBA Ultra plans require employers to offer an additional HBA plan option.'))

    const showSidecarInfo = plans.some(p => p.carrier === Carriers['Sidecar Health'])

    setDisabled(true)
    return props.onwards(saveSelections(plans.map(p => p.id))
      .then(() => saveContributions(contribution, contributionType))
      .then(() => setDisabled(false))
      .then(() => ({ showSidecarInfo })))
  }

  function saveSelections(planIDs: string[]) {
    return api.v2.groups(group?.id).plans.POST(uniq(planIDs)).then(removeSelectedPlans)
  }

  async function handleContribution(value: string, type: ContributionSplitType = ContributionSplitType.perEmployee) {
    try {
      ReactDOM.unstable_batchedUpdates(() => {
        setContribution(value)
        setContributionType(type)
      })
      await saveContributions(value, type)
    } catch (error) {
      addToast(error as Error)
    }
  }

  function saveContributions(value: string, type: ContributionSplitType = ContributionSplitType.perEmployee) {
    return api.v3.groups(group?.id).PUT({
      contributions: {
        medical: {
          value,
          isEquitable: type === ContributionSplitType.allTiers
        }
      }
    })
  }

  function includesMQPlans(plans: MedicalPlan[]): boolean {
    return plans?.some(p => isAllstate(p.carrier)) || false
  }

  function sortedPlans(plans?: MedicalPlan[], loading?: boolean): MedicalPlan[] | undefined {
    if (plans && !loading) {
      // This is gonna be good.
      const renewalPlans = plans.filter(plan => plan.isRenewalPlan)
      const renewalPlanIDs = renewalPlans.map(plan => plan.id)
      const nonRenewalPlans = plans.filter(plan => !plan.isRenewalPlan && !renewalPlanIDs.includes(plan.id))
      return sortBy(renewalPlans, func()).concat(sortBy(nonRenewalPlans, func()))
    }

    function func(): ((plan: MedicalPlan) => number)[] {
      const premium = (plan: MedicalPlan) => moneyNumber(plan.premium.employee.individual)
      const deductible = (plan: MedicalPlan) => moneyNumber(plan.deductible)
      const oopMax = (plan: MedicalPlan) => moneyNumber(plan.oopMax)
      switch (sortingMethod()) {
      case SortingMethod.premium:
        return [premium, deductible, oopMax]
      case SortingMethod.deductible:
        return [deductible, premium, oopMax]
      case SortingMethod.oopMax:
        return [oopMax, premium, deductible]
      }
    }
  }
}

export default ERShopPlans
