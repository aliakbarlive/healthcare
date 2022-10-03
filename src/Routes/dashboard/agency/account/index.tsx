import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.module.scss'
import BasicForm from './BasicForm'
import { $enum } from 'ts-enum-util'
import MedicalCarrierForm from 'Routes/shop/agency/licensesandappointments/TabForms/MedicalCarrierForm/MedicalCarrierForm'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import LicensesForm from 'Routes/shop/agency/licensesandappointments/TabForms/LicenseForm/LicenseForm'
import { CarrierAppointmentComponent } from 'Routes/shop/agency/producers'
import { StateLicense } from 'Routes/shop/agency/producers/index.helpers'
import { useEffectOnce, useToggle } from 'react-use'
import { StateLicenseComponent } from 'Routes/shop/agency/licensesandappointments'
import formStyles from 'Routes/shop/agency/licensesandappointments/TabForms/LicenseForm/LicenseForm.module.scss'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import * as api from 'Utilities/pharaoh'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import useToast from 'Utilities/Hooks/useToast'
import AgencyPayment from 'Routes/shop/agency/payment'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'

export enum Tabs {
  basic = 'Basic Info',
  licenses = 'Licenses',
  appointments = 'Carrier Appointments',
  billing = 'Billing'
}

export enum NoticeBoxBgColor {
  shop = '#EFEEFA',
  dashboard = 'rgba(255, 118, 18, 0.1)'
}

export enum NoticeBoxLineColor {
  shop = '#6258D1',
  dashboard = '#E56100'
}
interface Payload {
  licenses: StateLicense[]

}

const AgencyDashboardAccount: React.FC<PrivateWizardPageProps> = () => {
  return <AgencyDashboardAccountForm />
}

const AgencyDashboardAccountForm: React.FC = () => {
  const [result, setResult] = useState<Payload>({ licenses: [] })
  const fetchData = useCallback(async() => {
    await api.v3.agency.licenses.GET().then((res) => {
      res.licenses.length > 0 ? setShowForm(true) : setShowForm(false)
      setResult({ licenses: [...res.licenses, { state: '', license: '', id: '', carriers: [] }] })
      form.reset({ licenses: [...res.licenses, { state: '', license: '', id: '', carriers: [] }] })
    })
  }, [])
  const copyDefaultValues = { licenses: result.licenses }
  useEffectOnce(() => {
    fetchData()
  })
  const user = useUser().value
  const [currentTab, transitionTab] = useState<Tabs>(Tabs.basic)
  const [showForm, setShowForm] = useToggle(false)
  const addToast = useToast()
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
    {renderTab(currentTab, transitionTab, showForm, setShowForm)}
    {currentTab !== Tabs.basic && <FormProvider {...form}>
      <form className={styles.licensesForm} onSubmit={form.handleSubmit(go as any)}>
        {renderFormContents(currentTab, showForm)}
        {
          currentTab !== 'Billing' && <ShopButtons pageName={'Licenses and Appointments'} save={form.handleSubmit(data => go(data))} />
        }
      </form>
    </FormProvider>}
  </>

  function renderHeader(currentTab: Tabs, transitionTab: React.Dispatch<React.SetStateAction<Tabs>>) {
    const showBilling = (user?.powerLevel || PowerLevel.individual) >= PowerLevel.superBroker
    return <div className={styles.headerStyles}>
      {$enum(Tabs).map(t => {
        if (currentTab === t) {
          return <div className={styles.selectedHeaderItem} onClick={() => transitionTab(t)} key={t}>
            <div className={styles.selectedText} >{t}</div>
            <div className={styles.selectedUnderline} />
          </div>
        }

        if (t === Tabs.billing && !showBilling) { return null }

        return <div className={styles.headerItem} onClick={() => transitionTab(t)} key={t}>{t}</div>
      })}
    </div>
  }

  async function go(data: Payload) {
    const submitData = { licenses: data?.licenses?.filter(isEmpty) }
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
    }

    function nextTabFrom(tab: Tabs) {
      const showBilling = (user?.powerLevel || PowerLevel.individual) >= PowerLevel.superBroker

      switch (tab) {
      case Tabs.basic: return transitionTab(Tabs.licenses)
      case Tabs.licenses: return transitionTab(Tabs.appointments)
      case Tabs.appointments: return transitionTab(showBilling ? Tabs.billing : Tabs.basic)
      case Tabs.billing: return transitionTab(Tabs.basic)
      }
      currentTab === Tabs.licenses ? transitionTab(Tabs.appointments) : transitionTab(Tabs.billing)
    }

    try {
      await api.v3.agency.licenses.POST(submitData)
      if (saveButtonPressed) {
        addToast('Data successfully saved', 'success')
      } else if (nextButtonPressed) {
        // currentTab === Tabs.licenses ? transitionTab(Tabs.appointments) : transitionTab(Tabs.basic)
        // (area == 0 ) ? icon0 : (area == 1) ? icon1 : icon2
        nextTabFrom(currentTab)
      }
    } catch (error) {
      addToast(error as Error)
    }
    fetchData()
  }

  function renderFormContents(currentTab: Tabs, showForm: boolean) {
    let displayLicenses = 'none'
    let displayMedicalForm = 'none'
    switch (currentTab) {
    case Tabs.licenses: displayLicenses = ''; break
    case Tabs.appointments: displayMedicalForm = ''; break
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
}

function isEmpty(entry: Partial<StateLicense>): boolean {
  return (entry.state !== '' && entry.license !== '')
}

function renderTab(currentTab: Tabs, transitionTab: React.Dispatch<React.SetStateAction<Tabs>>, showForm: boolean, setShowForm: (nextValue?: any) => void) {
  const [showNextBtn] = React.useState(true)
  const callApi = (results: Promise<any>): Promise<void> => {
    return results
  }
  switch (currentTab) {
  case Tabs.basic: return <BasicForm transitionTab={transitionTab} />
  case Tabs.licenses: return <LicensesForm bColor={NoticeBoxBgColor.dashboard} lineColor={NoticeBoxLineColor.dashboard} />
  case Tabs.appointments: return <MedicalCarrierForm showForm={showForm} setShowForm={setShowForm} bColor={NoticeBoxBgColor.dashboard} lineColor={NoticeBoxLineColor.dashboard} />
  case Tabs.billing: return <AgencyPayment onwards ={callApi} showNextBtn={showNextBtn}/>
  default: return <></>
  }
}

export default AgencyDashboardAccount
