import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { $enum } from 'ts-enum-util'
import LicensesForm from './TabForms/LicenseForm/LicenseForm'
import MedicalCarrierForm from './TabForms/MedicalCarrierForm/MedicalCarrierForm'
import { ArrayField, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { StateLicense } from '../producers/index.helpers'
import { CarrierAppointmentComponent } from '../producers'
import { useAsyncRetry, useToggle } from 'react-use'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import { Route } from 'Utilities/Route'
import formStyles from 'Routes/shop/agency/licensesandappointments/TabForms/LicenseForm/LicenseForm.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import StatePicker from 'Components/Rudimentary/Select/StatePicker'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import useToast from 'Utilities/Hooks/useToast'
import { NoticeBoxBgColor, NoticeBoxLineColor } from 'Routes/dashboard/agency/account'

enum Tabs {
  licenses = 'Licenses',
  mca = 'Medical Carrier Appointments',
}
interface Payload {
  licenses: StateLicense[]
}

const LicensesAndAppointments: React.FC<PrivateWizardPageProps> = ({ onwards }) => {
  const async = useAsyncRetry(async() =>
    await api.v3.agency.licenses.GET() as Payload
  )

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const data = async.value!

  return <LicensesAndAppointmentsForm onwards={onwards} defaultValues={data} />
}

interface LicensesAndAppointmentsFormProps {
  onwards(api: Promise<any>): Promise<void>
  defaultValues: Payload
}

const LicensesAndAppointmentsForm: React.FC<LicensesAndAppointmentsFormProps> = ({ onwards, defaultValues }) => {
  const [currentTab, transitionTab] = useState<Tabs>(Tabs.licenses)
  const [showForm, setShowForm] = useToggle(false)
  const addToast = useToast()
  defaultValues.licenses = [...defaultValues.licenses, { state: '', license: '', id: '', carriers: [] }]
  const copyDefaultValues = { licenses: defaultValues.licenses }
  const form = useForm<Payload>({ defaultValues: { licenses: copyDefaultValues.licenses } })
  const { append, fields, remove } = useFieldArray<StateLicense, 'rhfId'>({ control: form.control, name: 'licenses', keyName: 'rhfId' })
  const [saveButtonPressed, setSaveButtonPressed] = useToggle(false)
  const [nextButtonPressed, setNextButtonPressed] = useToggle(false)
  const [lastEntrySaved, setLastEntrySaved] = useToggle(true)
  let saveOnlyBtn = document.createElement('button') as HTMLButtonElement
  let nextBtn = document.createElement('button') as HTMLButtonElement

  useEffect(() => {
    nextBtn = document.getElementById('agencyOnboardingNextButton') as HTMLButtonElement
    saveOnlyBtn = document.getElementById('saveOnlyBtn') as HTMLButtonElement
    if (saveOnlyBtn) saveOnlyBtn.addEventListener('click', () => setSaveButtonPressed(true))
    if (nextBtn) nextBtn.addEventListener('click', () => setNextButtonPressed(true))
  })

  return <>
    {renderHeader(currentTab, transitionTab)}
    {renderTab(currentTab, showForm, setShowForm)}
    <FormProvider {...form}>
      <form className={styles.licensesForm} onSubmit={form.handleSubmit(go as any)}>
        {renderFormContents(currentTab, showForm)}
        <div style={{ margin: '50px auto 20px', maxWidth: '800px' }}><ShopButtons backTo={Route.agencyShop_Payment} backToName={'Payment'} pageName={'Licenses and Appointments'} save={form.handleSubmit(data => go(data))} /></div>
      </form>
    </FormProvider>
  </>

  async function go(data: Payload) {
    const submitData = { licenses: data.licenses.filter(isEmpty) }
    setSaveButtonPressed(false)
    setNextButtonPressed(false)
    if (!lastEntrySaved) {
      addToast('Please save all State Licenses.')
      return
    }

    if (nextButtonPressed) {
      if (!submitData || submitData.licenses.length === 0) {
        addToast('In order to move forward, we require that you to enter at least one license.')
        return
      }
      if (currentTab === Tabs.licenses) { transitionTab(Tabs.mca); return }
    }

    try {
      await api.v3.agency.licenses.POST(submitData)
      if (saveButtonPressed) {
        addToast('Data successfully saved', 'success')
      } else if (nextButtonPressed) {
        onwards(Promise.resolve())
      }
    } catch (error) {
      addToast(error)
    }
  }

  function isEmpty(entry: Partial<StateLicense>): boolean {
    return (entry.state !== '' && entry.license !== '')
  }

  function renderFormContents(currentTab: Tabs, showForm: boolean) {
    let displayLicenses = 'none'
    let displayMedicalForm = 'none'
    switch (currentTab) {
    case Tabs.licenses: displayLicenses = ''; break
    case Tabs.mca: displayMedicalForm = ''; break
    default: return <></>
    }

    return <div>
      <div style={{ display: displayLicenses }}>
        <p className={formStyles.pleaseAddParagraph}>Please save each state license that you enter before proceeding.</p>
        {fields.map((lic, index) => <StateLicenseComponent fields={fields} remove={remove} append={append} index={index} key={(lic as any).rhfId} item={lic} setLastEntrySaved={setLastEntrySaved} />)}
      </div>
      <div style={{ display: displayMedicalForm }}>
        {showForm && <div>
          <p className={formStyles.selectCarrierParagraph}>Select your medical carrier appointments by state.</p>
          {fields.filter(isEmpty).map((lic, index) => <CarrierAppointmentComponent key={(lic as any).rhfId} state={lic.state as any} stateLicense={lic as any} prefix={`licenses[${index}]`} removeCarriersButton={false} />)}
        </div>
        }
      </div>
    </div>
  }

  function renderHeader(currentTab: Tabs, transitionTab: React.Dispatch<React.SetStateAction<Tabs>>) {
    return <div className={styles.headerStyles}>
      {$enum(Tabs).map(t => {
        if (currentTab === t) {
          return <div className={styles.selectedHeaderItem} onClick={() => transitionTab(t)} key={t}>
            <div className={styles.selectedText}>{t}</div>
            <div className={styles.selectedUnderline} />
          </div>
        }

        return <div className={styles.headerItem} onClick={() => transitionTab(t)} key={t}>{t}</div>
      })}
    </div>
  }

  function renderTab(currentTab: Tabs, showForm: boolean, setShowForm: (nextValue?: any) => void) {
    switch (currentTab) {
    case Tabs.licenses: return <LicensesForm bColor={NoticeBoxBgColor.shop} lineColor={NoticeBoxLineColor.shop}/>
    case Tabs.mca: return <MedicalCarrierForm showForm={showForm} setShowForm={setShowForm} bColor={NoticeBoxBgColor.shop} lineColor={NoticeBoxLineColor.shop}/>
    default: return <></>
    }
  }
}

export const StateLicenseComponent: React.FC<{ fields: Partial<ArrayField<StateLicense, 'rhfId'>>[], item: any, index: number, remove: (index: number) => void, append: (value: Partial<StateLicense> | Partial<StateLicense>[], shouldFocus?: boolean | undefined) => void, setLastEntrySaved: (nextValue?: any) => void }> = ({ fields, item, index, remove, append, setLastEntrySaved }) => {
  const addToast = useToast()
  const arrayLength = fields.length
  const prefix = `licenses[${index}]`
  const { register } = useFormContext()
  const inputState = useFormContext()?.watch(`${prefix}.state`)
  const inputLicense = useFormContext()?.watch(`${prefix}.license`)
  const requireInput = (index !== (arrayLength - 1))
  if (index === arrayLength - 1 && ((inputState && inputState.length !== 0) || (inputLicense && inputLicense.length !== 0))) setLastEntrySaved(false)
  else setLastEntrySaved(true)
  return <div key={(item as any).rhfId} className={formStyles.stateLicensesSubcontainer}>
    <input type='hidden' name={`${prefix}.id`} ref={register()} defaultValue={item.id} />
    <StatePicker name={`${prefix}.state`} className={formStyles.stateInput} backgroundColor='white' defaultValue={item.state} placeholder='State' required={requireInput} />
    <CandorInput className={formStyles.licenseInput} placeholder='License #' name={`${prefix}.license`} defaultValue={item.license} required={requireInput} />
    <button type='button' className={formStyles.append} onClick={onSave}>Save</button>
    <button type='button' style={{ visibility: index === arrayLength - 1 ? 'hidden' : 'visible' }} className={formStyles.delete} onClick={onDelete}>Delete</button>
  </div>

  function onSave() {
    if (inputState === '') { addToast('Please select a state to save'); return }
    if (fields.map(f => f.state).includes(inputState)) { addToast('You have already selected this state. Please select a different state.'); return }
    if (inputLicense === '') { addToast('Please enter a license to save'); return }
    if (arrayLength === index + 1) append({ state: '', license: '', id: '', carriers: [] })
    setLastEntrySaved(true)
  }

  function onDelete() {
    remove(index)
  }
}

export default LicensesAndAppointments
