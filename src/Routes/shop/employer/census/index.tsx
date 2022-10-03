import React, { useMemo, useEffect } from 'react'
import styles from './index.module.scss'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import UploadCensus from './UploadCensus'
import eeStyles from './CensusEmployee.module.scss'
import { Dependent, StargateConfig } from 'Utilities/Hooks/useStargate'
import _, { compact } from 'lodash'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form'
import { CandorDatePicker } from 'Components/Anubis/CandorForm'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import { createStateContext, useToggle } from 'react-use'
import { v4 as uuid } from 'uuid'
import { Relationship } from 'Utilities/pharaoh.types'
import useToast from 'Utilities/Hooks/useToast'
import { FormData, CensusMember, submit, mangle, isSpouse, mangleXLSX, relationshipCopy, nonempty } from './index.helpers'
import { ReactComponent as InfoIcon } from 'Assets/info_icon_empty.svg'
import InformationalModal from 'Components/Modals/InformationalModal'
import ZipInput from 'Components/Rudimentary/ZipInput'
import { GAButton } from 'Components/Tracking'
import IndividualModeModal from 'Components/Modals/IndividualModeModal'
import { ModalProps } from 'Components/Modals/Modal'
import { GenderPicker } from 'Components/Rudimentary/Select/GenderPicker'
import { get } from 'Utilities/fetch++'

// FIXME if we keep this then we need to prevent simultaneous POST of submit if user is fast
// NOTE however this whole thing sucks, instead be granular with endpoints

const [useSharedEditID, SharedEditIDProvider] = createStateContext<string | undefined>('ees[0]')

const ERShopCensus: React.FC<PrivateWizardPageProps> = ({ onwards, stargate }) => {
  const defaultValues = useMemo(() => ({ ees: mangle(stargate) }), [stargate])
  const [showModal, setShowModal] = useToggle(false)
  const groupContactEmail = stargate?.contact?.email || ''
  useEffect(() => {
    const el = document.getElementById('content')
    if (!el) return
    el.style.backgroundColor = '#EDF6FB'
    el.style.maxWidth = 'unset'
    return () => {
      el.style.backgroundColor = ''
      el.style.maxWidth = ''
    }
  })

  return <>
    <div className={styles.benifitEnrolment}>
      <p>Employer Benefits Enrollment</p>
    </div>
    <div className={styles.container}>
      <CensusInformationalModal isOpen={showModal} onRequestClose={setShowModal}/>
      <h1 className='shop-h1-periwinkle'>What we need for your quote<i onClick={setShowModal}><InfoIcon/></i></h1>
      <h2 className='shop-h2-navy'>
        The information provided will help us get you the most precise
        pricing, and will not be used for any other means.&nbsp;
        <span>All employees, including those that are waiving, must be entered to access more plan options and better pricing.</span>
      </h2>
      <SharedEditIDProvider>
        <Census groupContactEmail={groupContactEmail} defaultValues={defaultValues} onwards={onwards} id={stargate.group!.id} config={stargate.config} hasMembers={stargate.members.length > 0} groupID={stargate.group?.id} />
      </SharedEditIDProvider>
    </div>
  </>
}

interface CensusProps {
  id: string
  onwards(api: Promise<any>): Promise<void>
  defaultValues: FormData
  config: StargateConfig
  hasMembers: boolean
  groupContactEmail: string
  groupID?: string
}

const Census: React.FC<CensusProps> = ({ defaultValues, id, onwards, config, hasMembers, groupContactEmail, groupID }) => {
  const copyDefaultValues = { ees: [...defaultValues.ees] } // react-hook-form doesn’t do this and seemingly alters the actual passed in object lol
  const form = useForm<FormData>({ defaultValues: copyDefaultValues })
  const { append, fields: ees, remove } = useFieldArray<CensusMember, 'rhfID'>({ control: form.control, name: 'ees' })
  const [, setEditID] = useSharedEditID()
  const [uploadOccurred, setUploadOccurred] = useToggle(false)
  const [showIndivModeModal, toggleIndivModeModal] = useToggle(false)
  const addToast = useToast()

  // HACK but works since re-render won’t occur
  let submitButtonPressed = false

  function exportCensus() {
    get(`/v4/groups/${id}/census/xlsx`).then(async(res: Response) => {
      const file = new Blob([await res.blob()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const a = document.createElement('a')
      const url = URL.createObjectURL(file)
      a.href = url
      a.download = 'census.xlsx'
      document.body.appendChild(a)
      a.click()
    }).catch(addToast)
  }

  return <>
    <IndividualModeModal isOpen={showIndivModeModal} onRequestClose={toggleIndivModeModal} groupID={groupID} contentType='members'/>
    <UploadCensus callback={handleCensusUpload} config={config} />
    <h4>Or</h4>
    <h2 className={styles.manually}>Manual Complete</h2>
    <FormProvider {...form}>
      {/* as any below because of some bug in TS or react-hook-form that decomposes `Date` into its contents then thinks they are different types */}
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        {ees.map((ee, index) => <Record groupContactEmail={groupContactEmail} ee={ee} key={(ee as any).rhfID || ee.id} index={index} remove={remove} />)}
        <div className={styles.buttons}>
          <GAButton analytics={`Add Employee (${ERShopCensus.name})`} className={styles.addEmployee} onClick={onAppend}><span>+</span>Add Employee</GAButton>
          <button type='button' disabled={!hasMembers} className={styles.exportCensus} onClick={exportCensus}>Export Group as Census</button>
        </div>
        <input type="submit" value='Next' onClick={() => { submitButtonPressed = true }} />
      </form>
    </FormProvider>
  </>

  function handleCensusUpload(input: any) {
    setUploadOccurred(true)
    form.reset({}) // react hook form bug requires this or next line has no effect
    remove() // Need to remove the fieldArray or it won't detect the zip/dob/gender of the group owner if they're first in the census. Because, of course.
    form.reset({ ees: mangleXLSX(input) })
  }

  async function onSubmit(data: FormData) {
    // here we avoid hitting Pharaoh if the form is unchanged
    // since Pharaoh will reject this if the group is finalized and also it is slow
    // NOTE this is a workaround since we shouldn't even let them near the
    // shop if they have finalized already

    const shouldSubmitForm =
      (defaultValues.ees.length && form.formState.isDirty) || // existing census was altered
      _.isEqual(getIDs(defaultValues), getIDs(data)) === false || // bug where isDirty is not set when removing from fieldArray
      uploadOccurred || // census replaced
      firstRowChanged() // react-hook-form bug ONE MILLION AND ONE, first item in fieldArray change doesn’t set isDirty

    let rv = data.ees
    rv = rv.filter(nonempty)

    if (rv.length === 1 && submitButtonPressed) {
      toggleIndivModeModal()
    } else {
      if (!shouldSubmitForm) {
        if (submitButtonPressed) {
          onwards(Promise.resolve())
        }
      } else {
        submit(data, submitButtonPressed, onwards, addToast, id)
      }
    }

    function getIDs(data: FormData): Set<string> {
      return new Set(data.ees.flatMap(ee => [ee.id].concat((ee.dependents || []).map(o => o.id))))
    }

    function firstRowChanged() {
      // can't use _.isEqual because we have additional fields in the form representation :(

      const d = defaultValues.ees[0]
      const e = data.ees[0]
      if (d.firstName !== e.firstName || !e.firstName) return true
      if (d.lastName !== e.lastName || !e.lastName) return true
      if (d.dateOfBirth !== e.dateOfBirth || !e.dateOfBirth) return true
      if (d.gender !== e.gender || !e.gender) return true
      if (d.email !== e.email || !e.email) return true
      if (d.zip !== e.zip || !e.zip) return true
      if (d.countyId !== e.countyId || !e.countyId) return true
      return false
    }
  }

  function onAppend() {
    append({ id: uuid(), email: '', dependents: [] })
    setEditID(`ees[${ees.length}]`)
  }
}

interface RecordProps {
  ee: Partial<CensusMember>
  index: number
  remove: (index: number) => void
  groupContactEmail: string
}

const Record: React.FC<RecordProps> = ({ ee, index, remove: eeRemove, groupContactEmail }) => {
  const depsPrefix = `ees[${index}].dependents`
  const { append, fields: deps, remove } = useFieldArray<Dependent, 'rhfID'>({ name: depsPrefix })
  const hasSpouse = deps.some(isSpouse)
  const [, setEditID] = useSharedEditID()

  return <div className={eeStyles.container}>
    <h4>Employee {index + 1}</h4>
    <Line
      person={ee}
      placeholder='Employee'
      formComponent={EmployeeForm}
      prefix='ees'
      index={index}
      remove={eeRemove}
      groupContactEmail={groupContactEmail} />
    {deps.map((dep, index) =>
      <React.Fragment key={`fragment[${index}]`}>
        <hr/>
        {depLine(dep, index)}
      </React.Fragment>
    )}
    <div className={eeStyles.dependentButtonContainer}>
      <GAButton analytics={`Add Spouse (${ERShopCensus.name})`} onClick={onAppend(Relationship.spouse)} disabled={hasSpouse}>Add Spouse</GAButton>
      <GAButton analytics={`Add Domestic Partner (${ERShopCensus.name})`} onClick={onAppend(Relationship.lifePartner)} disabled={hasSpouse}>Add Domestic Partner</GAButton>
      <GAButton analytics={`Add Child (${ERShopCensus.name})`} onClick={onAppend(Relationship.child)}>Add Child</GAButton>
    </div>
  </div>

  function onAppend(relationship: Relationship): () => void {
    return () => {
      append({ id: uuid(), relationship })
      setEditID(`${depsPrefix}[${deps.length}]`)
    }
  }

  function depLine(dep_: any, index: number) {
    const dep = dep_ as Dependent
    return <Line
      key={(dep as any).rhfID || dep.id}
      person={dep}
      placeholder={relationshipCopy(dep)}
      formComponent={DependentForm}
      prefix={depsPrefix}
      index={index}
      remove={remove}
    />
  }
}

interface LineProps {
  person: any
  placeholder: string
  formComponent: React.ComponentType<any>
  prefix: any
  index: number
  groupContactEmail?: string

  remove: (index: number) => void
}

const Line: React.FC<LineProps> = ({ person, placeholder, formComponent: Form, prefix, index, remove, groupContactEmail }) => {
  const [editID, setEditID] = useSharedEditID()
  const { watch } = useFormContext()
  const key = `${prefix}[${index}]`
  const name = compact([
    watch(`${key}.firstName`, person.firstName),
    watch(`${key}.lastName`, person.lastName)
  ]).join(' ') || watch(`${key}.name`, person.name)
  const editing = editID === key

  let title: any = placeholder
  if (!editing && name) {
    title = name
    if (person.relationship) title = <>{title}&ensp;<i>({relationshipCopy(person)})</i></>
  }

  return <>
    <div className={eeStyles.nameRow}>
      <div className={eeStyles.name}>{title}</div>
      <GAButton analytics={`Edit (${Census.name})`} className={eeStyles.edit} onClick={onEdit} style={{ display: editing ? 'none' : '' }}>Edit</GAButton>
      <GAButton analytics={`Delete (${Census.name})`} className={eeStyles.delete} onClick={onDelete}>Delete</GAButton>
    </div>
    <Form groupContactEmail={groupContactEmail} prefix={key} initialZip={person.zip} hidden={!editing} person={person} />
  </>

  function onDelete() {
    remove(index)
  }
  function onEdit() {
    setEditID(key)
  }
}

interface EmployeeFormProps extends DependentFormProps<CensusMember> {
  initialZip?: string
  groupContactEmail?: string
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ prefix, initialZip, hidden, person, groupContactEmail }) => {
  const zip = useFormContext().watch(`${prefix}.zip`, initialZip)
  const style = { display: hidden ? 'none' : '' }
  const { register } = useFormContext()
  const disabled = person.email === groupContactEmail

  return <div className={eeStyles.form} style={style} key={(person as any).rhfID}>
    <input type='hidden' name={`${prefix}.id`} ref={register()} defaultValue={person.id} />
    <CandorInput autoComplete="given-name" placeholder="First Name" name={`${prefix}.firstName`} defaultValue={person.firstName} readOnly={disabled} />
    <CandorInput autoComplete="family-name" placeholder="Last Name" name={`${prefix}.lastName`} defaultValue={person.lastName} readOnly={disabled} />
    <ZipInput autoComplete="postal" name={`${prefix}.zip`} placeholder='ZIP Code' defaultValue={zip} />
    <CountyPicker name={`${prefix}.countyId`} zip={zip} defaultValue={person.countyId} />
    <CandorDatePicker
      placeholder='Birthdate'
      showYearDropdown
      autoComplete="bday"
      dropdownMode="select"
      name={`${prefix}.dateOfBirth`}
      defaultValue={person.dateOfBirth}
    />
    <CandorInput autoComplete="email" name={`${prefix}.email`} placeholder="Email" defaultValue={person.email} readOnly={disabled} />
    <GenderPicker name={`${prefix}.gender`} defaultValue={person.gender} />
  </div>
}

interface DependentFormProps<T = Dependent> {
  prefix: string
  hidden: boolean
  person: T
}

const DependentForm: React.FC<DependentFormProps> = ({ prefix, hidden, person }) => {
  const style = { display: hidden ? 'none' : '' }
  const { register } = useFormContext()

  return <div className={eeStyles.form} style={style}>
    <input type='hidden' name={`${prefix}.id`} ref={register()} defaultValue={person.id} />
    <input type='hidden' name={`${prefix}.relationship`} ref={register()} defaultValue={person.relationship} />
    <CandorInput autoComplete="given-name" placeholder="First Name" name={`${prefix}.firstName`} defaultValue={person.firstName} />
    <CandorInput autoComplete="family-name" placeholder="Last Name" name={`${prefix}.lastName`} defaultValue={person.lastName} />
    <CandorDatePicker
      placeholder='Birthdate'
      showYearDropdown
      autoComplete="bday"
      dropdownMode="select"
      name={`${prefix}.dateOfBirth`}
      defaultValue={person.dateOfBirth}
    />
    <GenderPicker name={`${prefix}.gender`} defaultValue={person.gender} />
  </div>
}

const CensusInformationalModal: React.FC<Omit<ModalProps, 'gaModalName' | 'header'>> = props =>
  <InformationalModal
    gaModalName={CensusInformationalModal.name}
    header='Census Upload'
    { ...props }
  >
    <p className={styles.paragraph}>Your Company’s Census must be completely filled out for every employee prior to submitting. We will need the following information for each employee: </p>
    <p className={styles.detail}>(Providing this information will ensure you receive precise pricing for the healthcare coverage options for your team. All information is needed for every employee even those waiving coverage)</p>
    <ul className={styles.censusInformationList}>
      <li>Full Name</li>
      <li>Employee Type</li>
      <li>Email Address</li>
      <li>Date of Birth</li>
      <li>Gender</li>
      <li>Zip Code</li>
      <li>Knowledge of Tobacco use</li>
      <li>Enrollment Type <span>(Employee, Employee+Spouse, Employee+Child(ren) or Family)</span></li>
    </ul>
  </InformationalModal>

export default ERShopCensus
