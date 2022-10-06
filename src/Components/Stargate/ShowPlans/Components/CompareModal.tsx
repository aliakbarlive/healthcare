import React from 'react'
import styles from './CompareModal.module.scss'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import { Controller, FormProvider } from 'react-hook-form'
import { logoFor, massagedPlanName, Carriers } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import ContributionsCalculator, { Contributions, moneyString } from 'Utilities/Plans/ContributionCalculator'
import { Member, Group, ContributionSplit } from 'Utilities/Hooks/useStargate'
import { startCase } from 'lodash'
import numeral from 'numeral'
import usePersistableForm from 'Utilities/Hooks/usePersistableForm'
import Modal from 'Components/Modals/Modal'

type EmployerProps = {
  userID?: never
  removePlanHandler(event: any): void
}

type EmployeeProps = {
  userID: string
  removePlanHandler?: never
}

type Props = (EmployeeProps | EmployerProps) & {
  isOpen: boolean
  onRequestClose(): void
  plans: MedicalPlan[]
  contributions: Contributions
  splits: ContributionSplit[]
  group: Group
  members: Member[]
}

type CompareData = {
  avgMonthlyPremium?: string
  estCost?: string
  deductible?: string
  oopMax?: string
  primaryCarePhysician?: string
  urgentCare?: string
  generic?: string
  medicalBillAdvocacy?: boolean
  healthCareAdvisor?: boolean
  telemedicine?: boolean
  telemental?: boolean
  savingsWithUs?: number
}

const CompareModal: React.SFC<Props> = ({ plans, contributions, splits, group, removePlanHandler, isOpen, onRequestClose, members, userID }) => {
  const form = usePersistableForm(`compare-current-plan-${userID || group.id}`)
  const currentPlan = form.watch()
  const data = planDataToDisplay()
  const keys = data.length ? (Object.keys(data[0]) as Array<keyof CompareData>) : []

  // Auto close when no plans
  if (!plans.length && isOpen) { onRequestClose() }

  return <Modal
    gaModalName={CompareModal.name}
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    header='Compare Plans'
    className={styles.modalContainer}
  >
    <form>
      <FormProvider {...form}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th>Plan Specifications</th>
              <th className={styles.currentPlan}>Your Current Plan<span>Click into a cell to update</span></th>
              { plans.map(plan =>
                <th key={plan.id}>
                  <div className={styles.selected}>
                    { logoFor(plan.carrier, plan.name) }
                    <span>{ massagedPlanName(plan.name, plan.carrier) }</span>
                    {removePlanHandler && <button type='button' className='material-icons' onClick={() => removePlanHandler(plan)}>close</button>}
                  </div>
                </th>)
              }
            </tr>
          </thead>
          <tbody>
            { keys.map(key => {
              const rowCopy = rowCopyForKey(key)
              if (!rowCopy) return <></>
              return <tr key={key}>
                <td>
                  { rowCopy.header }
                  { rowCopy.sub && <span>{rowCopy.sub}</span> }
                </td>
                <DataRow
                  data={[massagedCurrentPlanData()[key], ...data.map(data => data[key])]}
                  dataKey={key}
                  setValue={form.setValue}
                />
              </tr>
            })}
          </tbody>
        </table>
      </FormProvider>
    </form>
  </Modal>

  function massagedCurrentPlanData() {
    if (currentPlan.avgMonthlyPremium && currentPlan.avgMonthlyPremium !== '—') {
      currentPlan.avgMonthlyPremium = userID && moneyString(numeral(currentPlan.estCost).value() / members.filter(member => !member.is_waived).length)
    }
    return currentPlan
  }

  function planDataToDisplay() {
    const compareData: CompareData[] = []
    plans.forEach(plan => {
      if (plan.carrier === Carriers['Sidecar Health']) {
        compareData.push({
          estCost: 'Sidecar Health is a different kind of insurance. Click "Next" to learn more',
          avgMonthlyPremium: undefined,
          deductible: undefined,
          oopMax: undefined,
          primaryCarePhysician: undefined,
          urgentCare: undefined,
          generic: undefined,
          medicalBillAdvocacy: true,
          healthCareAdvisor: true,
          telemedicine: true,
          telemental: true,
          savingsWithUs: undefined
        })
        return compareData
      }

      const calc = new ContributionsCalculator([plan], contributions, splits, userID ? members.filter(m => m.id === userID) : members)
      const avgMonthlyPremium = userID
        ? moneyString(calc.premiums([plan], false).ee)
        : moneyString(calc.avgPremiums([plan], false).er)

      compareData.push({
        estCost: userID ? avgMonthlyPremium : moneyString(calc.premiums([plan], false).er),
        avgMonthlyPremium,
        deductible: moneyString(plan.deductible, 2),
        oopMax: moneyString(plan.oopMax, 2),
        primaryCarePhysician: plan.copay.primaryCarePhysician,
        urgentCare: plan.copay.urgentCare,
        generic: plan.prescription.generic,
        medicalBillAdvocacy: true,
        healthCareAdvisor: true,
        telemedicine: true,
        telemental: true
      })
    })
    return compareData
  }

  function rowCopyForKey(key: keyof CompareData): { header: string, sub?: string } | undefined {
    switch (key) {
    case 'estCost': {
      const employees = members?.filter(member => !member.is_waived).length
      return { header: 'Your Est. Cost', sub: employees ? `(For ${employees} ${employees === 1 ? 'employee' : 'employees'})` : undefined }
    }
    case 'avgMonthlyPremium': return !userID ? { header: 'Avg. Monthly Premium' } : undefined
    case 'deductible': return { header: 'Yearly Deductible', sub: '(In-Network)' }
    case 'oopMax': return { header: 'Out of Pocket Max', sub: '(In-Network)' }
    case 'primaryCarePhysician': return { header: 'Primary Care Copay' }
    case 'urgentCare': return { header: 'Urgent Care Copay' }
    case 'generic': return { header: 'Prescription Copay' }
    case 'healthCareAdvisor': return { header: 'HealthCare Advisor', sub: 'Included with Prosper Benefits' }
    case 'medicalBillAdvocacy':
    case 'telemedicine':
    case 'telemental':
      return { header: startCase(key), sub: 'Included with Prosper Benefits' }
    default: return { header: startCase(key) }
    }
  }
}

interface DataRowProps {
  data: any[]
  dataKey: keyof CompareData
  setValue(key: keyof CompareData, value: any): void
}

const DataRow: React.FC<DataRowProps> = ({ data, dataKey, setValue }) => {
  const values: any[] = massagedValues(data)
  const best = bestValue()

  return <>
    {values.map((value, index) => {
      const classes = []
      const isBest = typeof data[index] === 'boolean' ? data[index] === best : numeral(data[index]).value() === best
      const isCovered = !['not covered', 'n/a', 'not included', 'no', 'nope'].some(foo => foo === value.toString().toLowerCase())
      const isLongSentence = value.toString().length > 20

      if (isBest) { classes.push(styles.best) }
      if (!isCovered) { classes.push(styles.notIncluded) }
      if (isLongSentence) { classes.push(styles.small) }

      return <td className={classes.join(' ')} key={index}>
        {index === 0
          ? <InputForDataRow dataKey={dataKey} value={data[index]} massagedValue={value} setValue={setValue}/>
          : value
        }
      </td>
    })}
  </>

  function massagedValues(array: any[]) {
    return array.map(value => {
      if (value === undefined || value === null) { return '—' }
      switch (dataKey) {
      case 'estCost':
      case 'avgMonthlyPremium':
        return numeral(value).value() ? `${moneyString((numeral(value).value()))}/mo` : value
      case 'deductible':
      case 'oopMax':
      case 'savingsWithUs':
        return `${moneyString((numeral(value).value()))}/yr`
      case 'medicalBillAdvocacy':
      case 'healthCareAdvisor':
      case 'telemedicine':
      case 'telemental':
        return value ? 'Included' : <span className={styles.notIncluded}>Not Included</span>
      case 'primaryCarePhysician':
      case 'urgentCare':
      case 'generic': {
        const isDollarAmount = value.toString().substring(0, 1) === '$' && value.length > 1 && !isNaN(Number(value.slice(1)))
        return isDollarAmount ? moneyString(value) : value
      }
      default:
        return value
      }
    })
  }

  function bestValue() {
    switch (dataKey) {
    case 'estCost':
    case 'avgMonthlyPremium':
    case 'deductible':
    case 'oopMax': {
      const filtered = data.filter(value => value !== undefined && value !== '' && value !== '—')
      return Math.min(...filtered.map(value => numeral(value).value()))
    }
    case 'medicalBillAdvocacy':
    case 'healthCareAdvisor':
    case 'telemedicine':
    case 'telemental':
      return true
    }
  }
}

interface InputForDataRowProps {
  dataKey: keyof CompareData
  value: any
  massagedValue: string
  setValue(key: keyof CompareData, value: any): void
}

/**
 *  All the DataRow defined in this function will editable
 *  Others Will based on calculation or disabled
 */
const InputForDataRow: React.FC<InputForDataRowProps> = ({ dataKey, value, massagedValue, setValue }) => {
  switch (dataKey) {
  case 'avgMonthlyPremium':
  case 'deductible':
  case 'oopMax':
    return <Controller
      name={dataKey}
      render={props => <input
        onFocus={strip}
        {...props}
        onBlur={event => normalize(event.target.value)}
        maxLength={10}
        type='text'
        pattern='[0-9]+'
      />}
      defaultValue={massagedValue}
    />
  case 'primaryCarePhysician':
  case 'urgentCare':
  case 'generic':
    return <Controller
      name={dataKey}
      render={props => <input
        onFocus={strip}
        {...props}
        onBlur={event => normalize(event.target.value)}
        maxLength={30}
      />}
      defaultValue={massagedValue}
    />
  case 'medicalBillAdvocacy':
  case 'healthCareAdvisor':
  case 'telemedicine':
  case 'telemental':
    return <Controller
      name={dataKey}
      as={<button className={styles.prosperBenefitToggle} type='button' onClick={() => setValue(dataKey, !value)}>
        {massagedValue}
      </button>}
      defaultValue={false}
    />
  default: return <>{massagedValue}</>
  }

  // Need to setValue since we are normalizing the value on blur, but the value in the form is still a number which gets reset for some reason when changing another value
  function normalize(value: any) {
    if (!value) {
      setValue(dataKey, '—')
      return
    }
    // Incase user enters in random characters, use the previous value
    if (isNaN(value)) {
      setValue(dataKey, massagedValue)
      return
    }
    switch (dataKey) {
    case 'estCost':
    case 'avgMonthlyPremium':
      value = `${moneyString(value)}/mo`
      break
    case 'deductible':
    case 'oopMax':
      value = `${moneyString(value)}/yr`
      break
    default:
      break
    }
    setValue(dataKey, value)
  }

  function strip(event: any) {
    const value = event.target.value
    if (!value || value === '—') {
      event.target.value = ''
      return
    }
    switch (dataKey) {
    case 'estCost':
    case 'avgMonthlyPremium':
    case 'deductible':
    case 'oopMax':
      event.target.value = numeral(value).value()
      return
    default:
      return value
    }
  }
}
export default CompareModal
