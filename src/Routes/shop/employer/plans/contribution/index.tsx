/* eslint-disable camelcase */
import React, { ComponentType, useState } from 'react'
import useContentAdjustment from 'Utilities/Hooks/useContentAdjustment'
import styles from './index.module.scss'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import Heading from 'Components/Stargate/Heading'
import { Controller, ControllerProps, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { ContributionSplitType, ContributionType, ContributionAmountInput, ContributionSplitTypeSelect, extractContribution } from 'Components/Stargate/Contribution/ContributionAmount'
import * as api from 'Utilities/pharaoh'
import { useAsync, useEffectOnce, useLocation } from 'react-use'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { MedicalPlan, Tier } from 'Utilities/pharaoh.types'
import { ContributionSplit, StargateResponse } from 'Utilities/Hooks/useStargate'
import { capitalize, isNumber, uniq, upperFirst } from 'lodash'
import ContributionsCalculator, { Contributions, AncillaryPlanUnion, PlanUnion, GroupPlanType, BaseContributions, isMedical, GroupPlanContributions, moneyWeekly, moneyString, allAncillaryContributionEligibleLines, formatAllAncillaryInput } from 'Utilities/Plans/ContributionCalculator'
import { extractPlanNameAndCarrier, extractPremiumsByTier, getPlanIDFrom, isHBA, tierMarketingCopy, typeOfPlan } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import PlanContributionTable from './PlanContributionTable'
import useToast from 'Utilities/Hooks/useToast'
import { AncillaryContributionMode } from 'Routes/shop/employer/plans/ancillary'
import { Switch } from 'Components/Rudimentary/CandorSwitch'
import inputStyles from 'Components/Stargate/Contribution/ContributionAmount.module.scss'
import numeral from 'numeral'

const ERShopPlansContribution: React.FC<PrivateWizardPageProps> = ({ onwards, stargate }) => {
  const { group, splits } = stargate
  const location = useLocation().hash?.replace('#', '')
  const async = useAsync(async() => {
    const medical = await api.v3.groups(group?.id).plans.GET() as MedicalPlan[]
    const ancillary = await api.v3.groups(group?.id).plans.options.ancillary.selected() as AncillaryPlanUnion[]
    const contributions = await api.v3.groups(group?.id).contributions.GET() as Contributions
    return { medical, ancillary, contributions }
  })
  useContentAdjustment({ maxWidth: 'unset', padding: 0 })

  if (async.loading) return <Loader/>
  if (async.error) return <Error error={async.error}/>

  const contributions = async.value!.contributions
  contributions.baseContributions.allAncillary = contributions.baseContributions.allAncillary && moneyString(contributions.baseContributions.allAncillary)
  splits.forEach(s => {
    if (!contributions.splitContributions?.some(sc => sc.id === s.id)) {
      contributions.splitContributions?.push({
        id: s.id,
        baseContributions: {
          medical: s.contribution || '0%',
          medicalEquitable: !!s.isEquitable,
          dentalEquitable: false,
          visionEquitable: false,
          lifeEquitable: false,
          disabilityEquitable: false,
          majorCancerEquitable: false,
          accidentEquitable: false
        },
        planContributions: []
      })
    }
  })
  const plans: PlanUnion[] = [...async.value!.medical, ...async.value!.ancillary]
  plans.forEach(p => {
    const planID = getPlanIDFrom(p)
    const defPlan = {
      groupID: group!.id,
      groupPlanID: planID,
      planType: typeOfPlan(p)
    }
    if (!contributions.planContributions.some(pc => pc.groupPlanID === planID)) {
      contributions.planContributions.push(defPlan)
    }

    if (isMedical(p)) {
      contributions.splitContributions?.forEach(sc => {
        if (!sc.planContributions.some(pc => pc.groupPlanID === planID)) {
          sc.planContributions.push({ ...defPlan, splitID: sc.id })
        }
      })
    }
  })

  return <ContributionForm {...async.value!} contributions={contributions} stargate={stargate} onwards={onwards} scrollToSection={location}/>
}

interface ContributionFormProps {
  medical: MedicalPlan[]
  ancillary: AncillaryPlanUnion[]
  contributions: Contributions
  stargate: StargateResponse
  onwards(api: Promise<any>): Promise<void>
  scrollToSection?: string
}

const ContributionForm: React.FC<ContributionFormProps> = ({ medical, ancillary, stargate, contributions, ...props }) => {
  const { group, splits, members } = stargate
  const { showWeeklyPayments, moneyDecimals } = stargate.config
  const addToast = useToast()
  const [disabled, setDisabled] = useState(false)
  const [ancillaryContributionMode, setAncillaryContributionMode] = useState(contributions.baseContributions.allAncillary ? AncillaryContributionMode.allEligibleLines : AncillaryContributionMode.perLine)
  const form = useForm({ defaultValues: contributions })
  const { handleSubmit, watch, register, control, setValue } = form
  const inputs = watch() as Contributions
  const calc = new ContributionsCalculator([...ancillary], inputs, splits, members, moneyDecimals)
  const formID = 'groupContributionsSpreadsheet'

  useEffectOnce(() => {
    if (props.scrollToSection) {
      const element = document.getElementById(props.scrollToSection)
      if (element) {
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition - 200
        window.scrollBy({ top: offsetPosition, behavior: 'smooth' })
      }
    }
  })

  return <div className={styles.mainContainer}>
    <Heading >
      <h1 className={styles.contirbHeading}>Set Your Contribution</h1>
    </Heading>
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} id={formID} onKeyDown={e => e.key === 'Enter' && e.preventDefault()}>
        <fieldset disabled={disabled}>
          { hiddenInputs() }
          <section>
            <h2 id={GroupPlanType.medical}>Set Your Medical Plan Contribution</h2>
            { tables(GroupPlanType.medical) }
            { contributions.splitContributions?.map((sc, i) => {
              const split = splits.find(s => s.id === sc.id)
              return planTables(inputs.splitContributions![i].baseContributions, sc.planContributions || [], GroupPlanType.medical, split, i)
            }) }
            <CategoryCart plans={medical} showWeeklyPayments={showWeeklyPayments} calc={calc} type={'medical'}/>
          </section>
          <section>
            <h2 id={'ancillary'}>Set Your Ancillary Plan Contribution</h2>
            {contributionModeForm()}
            {tables(GroupPlanType.dental)}
            {tables(GroupPlanType.vision)}
            {tables(GroupPlanType.disability)}
            <CategoryCart
              plans={ancillary}
              showWeeklyPayments={showWeeklyPayments}
              calc={calc} type={'ancillary'}
              multiLineContribution={ancillaryContributionMode === AncillaryContributionMode.allEligibleLines}
            />
          </section>
        </fieldset>
      </form>
    </FormProvider>
    <OverallCart plans={[...medical, ...ancillary]} showWeeklyPayments={showWeeklyPayments} calc={calc}>
      <input type='submit' form={formID}/>
    </OverallCart>
  </div>

  function hiddenInputs() {
    return <>
      { contributions.planContributions.map((pc, i) => {
        return <React.Fragment key={pc.groupPlanID}>
          <input type='hidden' name={`planContributions[${i}].groupID`} ref={register}/>
          <input type='hidden' name={`planContributions[${i}].groupPlanID`} ref={register}/>
          <input type='hidden' name={`planContributions[${i}].planType`} ref={register}/>
        </React.Fragment>
      })}
      { contributions.splitContributions?.map((sc, si) => {
        return sc.planContributions.map((pc, i) => {
          return <React.Fragment key={pc.groupPlanID}>
            <input type='hidden' name={`splitContributions[${si}].planContributions[${i}].groupID`} ref={register}/>
            <input type='hidden' name={`splitContributions[${si}].planContributions[${i}].groupPlanID`} ref={register}/>
            <input type='hidden' name={`splitContributions[${si}].planContributions[${i}].planType`} ref={register}/>
            <input type='hidden' name={`splitContributions[${si}].planContributions[${i}].splitID`} ref={register}/>
          </React.Fragment>
        })
      })}
    </>
  }

  function tables(type: GroupPlanType) {
    return planTables(
      inputs.baseContributions,
      contributions.planContributions || [],
      type
    )
  }

  function planTables(bc: BaseContributions, planContributions: GroupPlanContributions[], type: GroupPlanType, split?: ContributionSplit, index?: number) {
    if (!contributions.planContributions.filter(pc => pc.planType === type).length) return
    if (allAncillaryContributionEligibleLines().has(type) && ancillaryContributionMode === AncillaryContributionMode.allEligibleLines) return

    const prefix = split && isNumber(index) ? `splitContributions[${index}].` : ''
    const key = split ? `${type}.${split.id}` : type

    return <article key={key}>
      { split && <>
        <h4>{split.name} <span>(Employee Class)</span></h4>
        <input name={`${prefix}id`} type='hidden' ref={register}/>
      </> }
      <BaseContributionInput
        prefix={`${prefix}baseContributions.${type}`}
        type={type}
        split={split}
      />
      { !split && type === GroupPlanType.medical &&
        <div className={styles.disclaimer}>* Most carriers require a 50% employer contribution to the individual tier. Your contribution may be altered to meet the minimum state requirements. You must meet the minimum employer contribution requirement per carrier guidelines in order to insure.</div>
      }
      { planContributions.map((pc, i) => {
        const id = pc.groupPlanID
        const plan = [...medical, ...ancillary].find(p => getPlanIDFrom(p) === id)

        if (pc.planType !== type || !plan) return
        return <PlanContributionTable
          plan={plan}
          prefix={`${prefix}planContributions[${i}]`}
          type={type}
          baseContributions={bc}
          calc={calc}
          showWeeklyPayments={showWeeklyPayments}
          split={split}
          key={`${key}.${id}`}
        />
      }) }
    </article>
  }

  function contributionModeForm() {
    const eligibleTypes = uniq(contributions.planContributions.map(pc => pc.planType))
    const eligibleLines = eligibleTypes.filter(t => allAncillaryContributionEligibleLines().has(t))

    if (!eligibleLines.length) return null
    const plansCopy = eligibleLines.length === 1 ? eligibleLines[0] : `${eligibleLines.slice(0, eligibleLines.length - 1).join(', ')} and ${eligibleLines[eligibleLines.length - 1]}`
    return <div className={styles.contributionModeContainer}>
      <p className={styles.contributionModeContainer}>Would you like to contribute a fixed amount across {plansCopy} plan{eligibleLines ? 's' : ''}?</p>
      <Switch
        className={styles.contributionModeSwitch}
        value={ancillaryContributionMode === AncillaryContributionMode.allEligibleLines}
        onChange={d => {
          setAncillaryContributionMode(d ? AncillaryContributionMode.allEligibleLines : AncillaryContributionMode.perLine)
        }}
      />
      { ancillaryContributionMode === AncillaryContributionMode.allEligibleLines &&
        <>
          <p>How much would you like to contribute?</p>
          <Controller
            name='baseContributions.allAncillary'
            control={control}
            render={props => {
              return <input
                {...props}
                className={inputStyles.amount}
                placeholder={'$0'}
                onChange={ e => props.onChange(formatAllAncillaryInput(e.target.value))}
                onBlur={onBlur}
                onFocus={onFocus}
              />
            }}
          />
        </>
      }
    </div>

    function onBlur(event: React.ChangeEvent<HTMLInputElement>) {
      const massagedValue = numeral(event.target.value).format('$0,0')
      event.target.value = massagedValue
      setValue('baseContributions.allAncillary', massagedValue)
    }

    function onFocus(event: React.ChangeEvent<HTMLInputElement>) {
      const value = numeral(event.target.value).value()
      if (!value || value === 0) {
        event.target.value = ''
      } else {
        event.target.value = value.toString()
      }
    }
  }

  async function onSubmit(data: Contributions) {
    try {
      setDisabled(true)
      data.planContributions = data.planContributions.map(addOptionalGPCFields)
      data.baseContributions = addRequiredBCFields({ ...data.baseContributions })
      data.splitContributions = data.splitContributions || []
      data.splitContributions.forEach(sc => {
        sc.baseContributions = addRequiredBCFields({ ...sc.baseContributions })
        sc.planContributions = sc.planContributions.map(addOptionalGPCFields)
      })
      await props.onwards(api.v3.groups(group?.id).contributions.PUT(data))
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }

    function addRequiredBCFields(bc: BaseContributions) {
      bc.medicalEquitable = !!bc.medicalEquitable
      bc.dentalEquitable = !!bc.dentalEquitable
      bc.visionEquitable = !!bc.visionEquitable
      bc.lifeEquitable = !!bc.lifeEquitable
      bc.disabilityEquitable = !!bc.disabilityEquitable
      bc.majorCancerEquitable = !!bc.majorCancerEquitable
      bc.accidentEquitable = !!bc.accidentEquitable
      return bc
    }

    // Not sure why we need to do this
    function addOptionalGPCFields(gpc: GroupPlanContributions) {
      gpc.individual = gpc.individual || undefined
      gpc.couple = gpc.couple || undefined
      gpc.singleParent = gpc.singleParent || undefined
      gpc.family = gpc.family || undefined
      gpc.employee = gpc.employee || undefined
      gpc.spouse = gpc.spouse || undefined
      gpc.children = gpc.children || undefined
      return gpc
    }
  }
}

type BaseContributionInputProps = & {
  prefix: string
  type: GroupPlanType
  split?: ContributionSplit
}

const BaseContributionInput: React.FC<Omit<ControllerProps<ComponentType<BaseContributionInputProps>>, 'render' | 'as' | 'name'>> = ({ prefix, ...props }) => {
  const { control, setValue } = useFormContext()
  const amountName = `${prefix}`
  const typeName = `${prefix}Equitable`
  const amount = useWatch({ name: amountName }) as string

  return <div className={styles.baseContributionContainer}>
    <h3 id={props.type}>{copy()}</h3>
    <div className={styles.baseContributionInputContainer}>
      <Controller
        {...props}
        name={amountName}
        control={control}
        defaultValue={'0%'}
        render={({ value, onChange }) => {
          const [amount, type] = extractContribution(value || '0%')
          return <ContributionAmountInput
            value={amount}
            type={type}
            onChange={a => onChange(type === ContributionType.fixed ? `$${a}` : `${a}%`)}
          />
        }}
      />
      <Controller
        {...props}
        name={typeName}
        control={control}
        defaultValue={false}
        render={({ value, onChange }) => {
          const [, type] = extractContribution(amount || '0%')
          const parsedValue = type === ContributionType.fixed
            ? ContributionSplitType.flatContribution
            : value
              ? ContributionSplitType.allTiers
              : ContributionSplitType.perEmployee
          return <ContributionSplitTypeSelect
            planType={props.type}
            value={parsedValue}
            backgroundColor='white'
            onChange={value => {
              onChange(value === ContributionSplitType.allTiers)
              const [a] = extractContribution(amount || '0%')
              switch (value) {
              case ContributionSplitType.allTiers:
              case ContributionSplitType.perEmployee:
                setValue(amountName, `${a > 100 ? 100 : a}%`)
                break
              case ContributionSplitType.flatContribution:
                setValue(amountName, `$${a}`)
              }
            }}
          />
        }}
      />
    </div>
  </div>

  function copy() {
    return props.split
      ? `How would you like to contribute to the employee class, ${props.split.name}?`
      : `How would you like to contribute to ${props.type} plans?${props.type === GroupPlanType.medical ? '*' : ''}`
  }
}

interface CategoryCartProps {
  plans: PlanUnion[]
  type: 'medical' | 'ancillary'
  showWeeklyPayments: boolean
  multiLineContribution?: boolean
  calc: ContributionsCalculator
}

const CategoryCart: React.FC<CategoryCartProps> = ({ plans, calc, showWeeklyPayments, type, multiLineContribution }) => {
  // Note: will not show plans for other ancillary lines if they don't qualify for the All Ancillary Contribution
  // Fix me if we ever require this
  if (type === 'ancillary' && multiLineContribution) {
    const eligibleTypes = uniq(plans.map(p => typeOfPlan(p)))
    const eligibleLines = eligibleTypes.filter(t => allAncillaryContributionEligibleLines().has(t))
    const amount = calc.premiumsForAncillary().er
    return <div className={styles.allAncillaryCart}>
      <h4>Your Plan Selections</h4>
      { eligibleLines.map(l => {
        const p = plans.filter(p => typeOfPlan(p) === l)
        return <React.Fragment key={`AllAncillary.${l}`}>
          <h5>{`${l} plan${p.length !== 1 ? 's' : ''}`}</h5>
          { p.map(p => {
            const { name, carrier } = extractPlanNameAndCarrier(p)
            const tierPremiums = extractPremiumsByTier(p)
            return <React.Fragment key={`AllAncillary.${l}.${getPlanIDFrom(p)}`}>
              <div className={styles.planCarrier}>{carrier}</div>
              <div className={styles.planName}>{name}</div>
              <div className={styles.planPremiumText}>Premium</div>
              <div className={styles.planTier}>
                <div>
                  <div className={styles.planTierUpper}>{tierMarketingCopy(Tier.individual)}</div>
                  <div className={styles.planTierLower}>{tierPremiums[Tier.individual]}/mo</div>
                </div>
                <div>
                  <div className={styles.planTierUpper}>{tierMarketingCopy(Tier.couple)}</div>
                  <div className={styles.planTierLower}>{tierPremiums[Tier.couple]}/mo</div>
                </div>
                <div>
                  <div className={styles.planTierUpper}>{tierMarketingCopy(Tier.singleParent)}</div>
                  <div className={styles.planTierLower}>{tierPremiums[Tier.singleParent]}/mo</div>
                </div>
                <div>
                  <div className={styles.planTierUpper}>{tierMarketingCopy(Tier.family)}</div>
                  <div className={styles.planTierLower}>{tierPremiums[Tier.family]}/mo</div>
                </div>
              </div>
              <div className={styles.planBottomSpace}></div>

            </React.Fragment>
          }) }
        </React.Fragment>
      })}
      <div className={styles.planBottomSpace}></div>
      <div className={styles.categoryCartContainer}>
        <h5>Estimated Employer {upperFirst(type)} Contribution Total</h5>
        <div className={styles.cc_cost}><span>$</span>{showWeeklyPayments ? moneyWeekly(amount).replace('$', '') : moneyString(amount).replace('$', '')}</div>
        <div className={styles.cc_costSchedule}>Per {showWeeklyPayments ? 'Week' : 'Month'}</div>
        <div className={styles.cc_disclaimer}>* Final price will depend on employee <br/>participation and final carrier rates</div>
      </div>
    </div>
  }

  return <div className={styles.categoryCartContainer}>
    <h5>Estimated Employer {upperFirst(type)} Contribution Total</h5>
    {plans.map(p => planCost(p))}
    <div className={styles.cc_disclaimer}>* Final price will depend on employee <br/>participation and final carrier rates</div>
  </div>

  function planCost(plan: PlanUnion) {
    const amount = calc.premiums([plan], false).er
    const { carrier, name } = extractPlanNameAndCarrier(plan)
    return <React.Fragment key={getPlanIDFrom(plan)}>
      <div className={styles.cc_name}>{carrier} <span>{name}</span></div>
      <div className={styles.cc_cost}><span>$</span>{showWeeklyPayments ? moneyWeekly(amount).replace('$', '') : moneyString(amount).replace('$', '')}</div>
      <div className={styles.cc_costSchedule}>Per {showWeeklyPayments ? 'Week' : 'Month'}</div>
    </React.Fragment>
  }
}

interface OverallCartProps {
  plans: PlanUnion[]
  calc: ContributionsCalculator
  showWeeklyPayments: boolean
}

export const OverallCart: React.FC<OverallCartProps> = ({ plans, calc, showWeeklyPayments, ...props }) => {
  const medical = plans.filter(p => typeOfPlan(p) === GroupPlanType.medical)
  const dental = plans.filter(p => typeOfPlan(p) === GroupPlanType.dental)
  const vision = plans.filter(p => typeOfPlan(p) === GroupPlanType.vision)
  const disability = plans.filter(p => typeOfPlan(p) === GroupPlanType.disability)

  const carts = matrix(medical, dental, vision, disability)

  return <section className={styles.oc_container} id={'total'}>
    <div className={styles.oc_inner}>
      <h2>Estimated Total Costs</h2>
      <div className={styles.oc_cartsContainer}>
        {carts.map((c, i) => cart(c, i))}
      </div>
      {props.children}
    </div>
  </section>

  function cart(plans: PlanUnion[], index: number) {
    /*
      Need another calc here since all ancillary contribution calculations are only done in `premiumsForAncillary()`
      and that uses all the current plans instead of the specific plan combination shown here.
    */
    const cartCalc = new ContributionsCalculator(plans, calc.contributions, calc.splits, calc.members, calc.precision)
    const hasHBA = plans.some(p => isMedical(p) && isHBA((p as MedicalPlan).carrier))
    const admin = hasHBA ? 20 * calc.nonWaivedMembers.length : 0
    const medical = cartCalc.premiumsForMedical(undefined, false).er - admin
    const ancillary = cartCalc.premiumsForAncillary().er
    const total = medical + ancillary + admin
    return <div className={styles.oc_cart} key={`cart.${index}`}>
      <p className={styles.oc_cart_plans}>
        {plans.map(p => {
          const { carrier, name } = extractPlanNameAndCarrier(p)
          return `${carrier} ${name}`
        }).join(', ')}
      </p>
      { cost('medical', medical) }
      { cost('ancillary', ancillary) }
      { !!admin && cost('admin', admin)}
      { cost('prosper', 0) }
      <hr/>
      { cost('total', total)}
    </div>
  }

  function cost(type: 'medical' | 'ancillary' | 'prosper' | 'admin' | 'total', amount: number) {
    let title: string
    switch (type) {
    case 'medical':
    case 'ancillary':
      title = `Estimated ${capitalize(type)} Plans`
      break
    case 'prosper':
      title = 'Prosper Benefits+'
      break
    case 'admin':
      title = 'Association, Admin, and Billing Fee'
      break
    case 'total':
      title = 'Estimated Total Cost to Employer'
      break
    }
    return <div className={styles.oc_line}>
      <div className={styles.oc_label}>{title}</div>
      { type === 'prosper' && amount === 0
        ? <div className={styles.oc_included}>Included</div>
        : <div className={styles.oc_cost}><span>$</span>{showWeeklyPayments ? moneyWeekly(amount).replace('$', '') : moneyString(amount).replace('$', '')}<span>{showWeeklyPayments ? '/wk' : '/mo'}</span></div>
      }
    </div>
  }

  // https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
  function matrix(...plans: PlanUnion[][]) {
    const filtered = plans.filter(p => p.length)
    const carts: PlanUnion[][] = []
    const max = filtered.length - 1

    function helper(arr:PlanUnion[], i: number) {
      for (let j = 0, l = filtered[i].length; j < l; j++) {
        const a = arr.slice(0) // clone arr
        a.push(filtered[i][j])
        if (i === max) {
          carts.push(a)
        } else {
          helper(a, i + 1)
        }
      }
    }
    helper([], 0)
    return carts
  }
}

export default ERShopPlansContribution
