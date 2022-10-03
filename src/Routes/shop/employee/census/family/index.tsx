/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import styles from './index.module.css'
import { Relationship } from 'Utilities/pharaoh.types'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { useForm, useFieldArray, FormProvider, Controller, useFormContext } from 'react-hook-form'
import { v4 as uuid } from 'uuid'
import { Dependent } from 'Utilities/Hooks/useStargate'
import { Label } from 'Utilities/config'
import { classNames, lastName, ssnNormalizer } from 'Utilities/etc'
import CandorSelect from 'Components/Rudimentary/Select'
import { GAButton } from 'Components/Tracking'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import { post } from 'Utilities/fetch++'
import { CandorDatePicker } from 'Components/Anubis/CandorForm'
import numeral from 'numeral'
import useCenteredContent from 'Utilities/Hooks/useCenteredContent'
import { compact } from 'lodash'
import ZipInput from 'Components/Rudimentary/ZipInput'
import { GenderPicker } from 'Components/Rudimentary/Select/GenderPicker'

interface Datum extends Omit<Dependent, 'dateOfBirth' | 'lastUsedTobacco'> {
  zipCode?: string
  dateOfBirth?: string | Date
  lastUsedTobacco?: Date | string
  feet?: number
  inches?: number
  sameHousehold?: 'true' | 'false'
}

const EEShopFamily: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { groupMember: member, user } = stargate
  const form = useForm({ defaultValues: { deps: defaultValues() } })
  const { append, fields: deps, remove } = useFieldArray<Datum, 'rhfID'>({ control: form.control, name: 'deps' })
  useCenteredContent()
  const config = stargate.config

  const copy = deps.length
    ? 'Add dependents, like your partner or children, if applicable and click “Next”. Dependents will be covered by the plans you choose.'
    : 'Add dependents, like your partner or children, if applicable. Dependents will be covered by the plans you choose. If none, click “Skip”.'

  useEffect(() => {
    const ele = document.getElementById('content')
    if (!ele) return
    ele.style.backgroundColor = '#F3FFFC'
    ele.style.maxWidth = 'unset'
    ele.style.display = ''
    return () => {
      ele.style.backgroundColor = ''
      ele.style.maxWidth = ''
    }
  })

  return <>
    <div className={styles.benifitEnrolment}>
      <p>Employee Benefits Enrollment</p>
    </div>
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.container}>
        <h1 className='shop-h1-periwinkle'>Are there any additional people in your family?</h1>
        <h2 className='shop-h2-navy'>{copy}</h2>
        {deps.map((dep, index) =>
          <Dep
            key={index}
            id={dep.rhfID}
            surnames={surnames()}
            prefix={`deps[${index}]`}
            remove={() => remove(index)}
            relationship={dep.relationship!}
            sameHousehold={dep.zipCode === member?.zip_code || dep.zipCode === undefined}
            showHeightWeight={config.showHeightWeight}
          />
        )}
        {buttons()}
        <div style={{ textAlign: 'center' }}>
          <input type='submit' style={{ marginTop: 40 }} value={deps.length === 0 ? 'Skip' : 'Next'} />
        </div>
      </form>
    </FormProvider>
  </>

  async function onSubmit({ deps: rawDeps }: { deps: Datum[] }) {
    const deps = rawDeps || []
    // ^^ because react-hook-form lies

    for (const dep of deps) {
      dep.dateOfBirth = localMidnightToPharaohFormat(dep.dateOfBirth as Date)
      if (dep.lastUsedTobacco === 'true') {
        dep.lastUsedTobacco = localMidnightToPharaohFormat(new Date())
      } else {
        delete dep.lastUsedTobacco
      }
      if (config.showHeightWeight) {
        dep.height = numeral(dep.feet).multiply(12).add(dep.inches).value()
        dep.weight = numeral(dep.weight).value()
      }
      if (dep.sameHousehold === 'true') dep.zipCode = member?.zip_code
      if (!dep.zipCode) delete dep.zipCode // happens if user switches sameHousehold on then off
      delete dep.sameHousehold
      delete dep.feet
      delete dep.inches
    }
    onwards(post('/users/dependents', deps).then(() => ({ ...config })))
  }

  function buttons() {
    const spouse = <GAButton analytics={`Add Spouse (${EEShopFamily.name})`} type={'button'} onClick={add(Relationship.spouse)} className={styles.addDependent}>Add Spouse</GAButton>
    const partner = config.label !== Label.blacksmith
      ? <GAButton analytics={`Add Partner (${EEShopFamily.name})`} type={'button'} onClick={add(Relationship.lifePartner)} className={styles.addDependent}>Add Partner</GAButton>
      : undefined
    return <div className={styles.addContainer}>
      <GAButton analytics={`Add Child (${EEShopFamily.name})`} type={'button'} onClick={add(Relationship.child)} className={styles.addChild}>Add Child</GAButton>
      {canAddPartner() && <>{spouse}{partner}</>}
    </div>

    function canAddPartner() {
      for (const dep of deps) {
        switch (dep.relationship) {
        case Relationship.lifePartner:
        case Relationship.spouse:
          return false
        }
      }
      return true
    }
  }

  function add(type: Relationship): (event: React.MouseEvent<HTMLButtonElement>) => void {
    return () => {
      append({
        id: uuid(),
        relationship: type
      })
    }
  }

  function defaultValues(): Datum[] {
    const rv = [...(stargate.dependents || [])] as Datum[]
    for (const dep of rv) {
      dep.lastUsedTobacco = dep.lastUsedTobacco ? 'true' : 'false'
      dep.sameHousehold = dep.zipCode === member?.zip_code ? 'true' : 'false'
      if (dep.ssn) {
        dep.ssn = ssnNormalizer(dep.ssn)
      }
    }
    return rv
  }

  function surnames() {
    return new Set(compact([user.last_name, lastName(member?.name)]))
  }
}

interface Props {
  relationship: Relationship
  surnames: Set<string>
  prefix: string
  remove: () => void
  id: string | undefined
  sameHousehold: boolean
  showHeightWeight: boolean
}

const Dep: React.FC<Props> = ({ relationship, prefix, remove, id, showHeightWeight, sameHousehold: initialSameHousehold, surnames }) => {
  const isChild = relationship === 'child'
  const { register, watch } = useFormContext()
  const sameHousehold = watch(`${prefix}.sameHousehold`, initialSameHousehold ? 'true' : 'false') === 'true'

  return <div className={styles.familyContainer} key={id} >
    <span className={styles.familyTitle}>{titleFor(relationship)}
      <button onClick={remove} className={styles.deleteButton} >
        <i className={classNames('material-icons', styles.delete)}>clear</i>
      </button>
    </span>
    <input type='hidden' name={`${prefix}.relationship`} value={relationship} ref={register()} />
    <div className={styles.left}>
      <Controller
        render={props =>
          <CandorInput {...props} autoComplete="given-name" placeholder="First name" />
        }
        name={`${prefix}.firstName`}
      />
    </div>
    <div className={styles.right}>
      <Controller
        render={props =>
          <CandorInput {...props} autoComplete="family-name" list="surname" placeholder="Last name" />
        }
        name={`${prefix}.lastName`}
      />
    </div>
    <datalist id="surname">
      {Array.from(surnames).sort().map(surname => <option key={surname}>{surname}</option>)}
    </datalist>
    <div className={styles.left}>
      <CandorDatePicker
        placeholder='Birthdate'
        showYearDropdown
        autoComplete="bday"
        dropdownMode="select"
        name={`${prefix}.dateOfBirth`}
        maxDate={new Date()}
        minDate={isChild ? twentySixYearsAgo() : undefined}
        className={classNames(styles.datePicker, isChild && 'glance_masked')}
      >
        {isChild && <div style={{ textAlign: 'center', padding: '5px' }}>Child dependents cannot be older than 26</div>}
      </CandorDatePicker>
    </div>
    <div className={styles.right}>
      <Controller
        render={props => <CandorInput
          {...props}
          onChange={event => props.onChange(ssnNormalizer(event.currentTarget.value))}
          minLength={11}
          maxLength={11}
          pattern='[0-9-]{11}'
          placeholder='Social Security Number (required by carriers)'
          className='glance_masked'
          required
        />}
        name={`${prefix}.ssn`} />
    </div>
    <div className={styles.left}>
      <GenderPicker name={`${prefix}.gender`} />
    </div>
    <div className={styles.right}>
      <CandorSelect
        placeholder="Tobacco Use?"
        options={boolOptions}
        name={`${prefix}.lastUsedTobacco`} />
    </div>
    <div className={styles.left}>
      <CandorSelect
        placeholder="Same Household?"
        options={[...boolOptions].reverse()}
        name={`${prefix}.sameHousehold`} />
    </div>
    {!sameHousehold && <div className={styles.right}>
      <div>
        <ZipInput
          autoComplete="postal-code"
          placeholder="ZIP Code"
          name={`${prefix}.zipCode`} />
      </div>
    </div>}
    {showHeightWeight && <>
      <div className={classNames(sameHousehold ? styles.left : styles.right, styles.height)}>
        <CandorInput
          placeholder="Height (feet)"
          name={`${prefix}.feet`}
          type="number"
          step="1" min={0} max={99}
          required />
        <CandorInput
          placeholder="inches"
          name={`${prefix}.inches`}
          type="number"
          step="1" min={0} max={11}
          required />
      </div>
      <div className={styles.right}>
        <CandorInput
          placeholder="Weight (lbs)"
          name={`${prefix}.weight`}
          type="number"
          step="1" min={0} max={999}
          required />
      </div>
    </>}
  </div>
}

function titleFor(relationship: Relationship) {
  switch (relationship) {
  case Relationship.child:
    return 'Child (under age 26)'
  case Relationship.lifePartner:
    return 'Domestic Partner'
  case Relationship.spouse:
    return 'Spouse'
  }
}

const boolOptions = [{
  value: 'false',
  label: 'No'
}, {
  value: 'true',
  label: 'Yes'
}]

function twentySixYearsAgo() {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 26)
  return date
}

export default EEShopFamily
