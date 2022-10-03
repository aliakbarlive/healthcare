import CandorInput from 'Components/Rudimentary/CandorInput'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import React, { useCallback, useEffect, useState } from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, UseFormMethods, useWatch } from 'react-hook-form'
import { useAsync, useEffectOnce, useToggle } from 'react-use'
import styles from './index.module.scss'
import * as api from 'Utilities/pharaoh'
import { states } from 'Components/Rudimentary/Select/StatePicker'
import Loader from 'Components/Rudimentary/Loader'
import { ProducerType, StateLicense, FormData, majorCarrier } from './index.helpers'
import ReactSelect from 'react-select'
import useToast from 'Utilities/Hooks/useToast'
import { Venue } from 'Utilities/pharaoh.types'
import { Route } from 'Utilities/Route'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import { BaseSelect } from 'Components/Rudimentary/Select'
import Tooltip from 'Components/Stargate/ToolTip/Tooltip'
import { compact } from 'lodash'

let agencyID = ''

const AgencyProducers: React.FC<PrivateWizardPageProps> = ({ onwards, stargate }) => {
  agencyID = stargate.agency?.id || ''

  return <div className={styles.mainContainer}>
    <div className={styles.addInvite}>
      <h1>Add and Invite Producers</h1>
      <p>Build your agency by adding and inviting your producers. You may add or edit this later on your dashboard. Name and email address are required to onboard producers to your agency, but additional information may be completed by the producer.</p>
    </div>
    <ProducerCensus onwards={onwards}/>
  </div>
}

interface ProducerCensusProps {
  onwards(api: Promise<any>): Promise<void>
}

const ProducerCensus: React.FC<ProducerCensusProps> = ({ onwards }) => {
  const [result, setResult] = useState<FormData>({ producers: [] })
  const fetchData = useCallback(async() => {
    await api.v3.producers.GET().then((res) => {
      setResult({ producers: res.producers })
      form.reset(res)
    })
  }, [])
  const copyDefaultValues = { producers: result.producers }
  useEffectOnce(() => {
    fetchData()
  })
  const form = useForm<FormData>({ defaultValues: { producers: copyDefaultValues.producers } })
  const { append, fields: producers, remove } = useFieldArray<ProducerType, 'rhfId'>({ control: form.control, name: 'producers' })
  const [showCensus, setCensus] = useToggle(false)
  const [showAddProducers, setShowAddProducers] = useToggle(true)
  const lineStyling: { width :string, marginLeft: string } = showAddProducers ? { width: '140', marginLeft: '0%' } : { width: '156', marginLeft: '25.6%' }
  const addToast = useToast()
  const [inviteList] = useState<Set<number>>(new Set<number>())
  const [nextButtonPressed, setNextButtonPressed] = useToggle(false)
  const [saveButtonPressed, setSaveButtonPressed] = useToggle(false)
  const [inviteButtonPressed, setInviteButtonPressed] = useToggle(false)
  const [loader, setLoader] = useToggle(false)
  let saveOnlyBtn = document.createElement('button') as HTMLButtonElement
  let nextBtn = document.createElement('button') as HTMLButtonElement

  useEffect(() => {
    nextBtn = document.getElementById('agencyOnboardingNextButton') as HTMLButtonElement
    saveOnlyBtn = document.getElementById('saveOnlyBtn') as HTMLButtonElement
    if (saveOnlyBtn) saveOnlyBtn.addEventListener('click', () => setSaveButtonPressed(true))
    if (nextBtn) nextBtn.addEventListener('click', () => setNextButtonPressed(true))
  })

  const ProducerInviteItem: React.FC<{name: string, index: number}> = ({ name, index }) => {
    function addToInviteList(e: any) {
      if (e.target.checked) inviteList.add(index)
      else inviteList.delete(index)
    }

    return <div className={styles.producerInviteeContainer}>
      <div className={styles.producerInviteeInnerContainer}>
        <div className={styles.nameSection}>
          <label>
            <input type='checkbox' name={`producers[${index}].invite`} onChange={addToInviteList} />
            <div>{name}</div>
          </label>
        </div>
      </div>
    </div>
  }

  return <div className={styles.producerCensusContainer}>
    <div className={styles.addProducersQueryContainer}>
      <div className={styles.addProducersQuery}>
        <div className={styles.addProducersQueryButtons}>
          <button className={styles.yes} style={ showCensus ? { backgroundColor: '#3564B9', color: '#FFFFFF' } : { backgroundColor: '#FFFFFF', color: '#3564B9' }} onClick={() => { setCensus(true) }}>Yes</button>
          <button className={styles.no} style={ showCensus ? { backgroundColor: '#FFFFFF', color: '#3564B9' } : { backgroundColor: '#3564B9', color: '#FFFFFF' }} onClick={() => { setCensus(false) }}>No</button>
        </div>
        <div className={styles.addProducersQueryTextContainer}>
          <svg className={styles.line} width="4" height="48" viewBox="0 0 4 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2" y1="0.5" x2="2" y2="47.5" stroke="#6258D1" strokeWidth="4"/>
          </svg>
          <p>Would you like to add producers to your agency?</p>
        </div>
      </div>
      {!showCensus && <ShopButtons backTo={Route.agencyShop_AgencyShop} backToName={'Agency Shop'} pageName={'Producers'} noSubmitData save={() => onwards(api.v3.agency.finalize.POST({})) } />
      }
    </div>
    {showCensus && <>
      <div className={styles.addorinviteContainer}>
        <button className={styles.addProducersBtn} onClick={() => { fetchData(); setShowAddProducers(true) }}>ADD PRODUCERS</button>
        <button type='submit' form='hookform' className={styles.inviteBtn} onClick={() => setInviteButtonPressed(true)}>INVITE PRODUCERS</button>
      </div>
      { <svg style= {{ marginLeft: lineStyling.marginLeft }} className={styles.underline} width={lineStyling.width} height="3" viewBox={`0 0 ${lineStyling.width} 3`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="-1.31134e-07" y1="1.5" x2={lineStyling.width} y2="1.49999" stroke="#372DA3" strokeWidth="3"/>
      </svg> }
      <FormProvider {...form}>
        <form id='hookform' className={styles.formContainer} onSubmit={form.handleSubmit(onSubmit)} >
          { showAddProducers ? <>
            <div style={{ display: loader ? '' : 'none' }}><Loader /></div>
            {producers.map((p, index) => <Record form={form} defaultValues={copyDefaultValues} key={(p as any).rhfID || (p as any).id } producer={p} pindex={index} remove={remove}/>)}
            <button className={styles.addProducerButton} onClick={onAppend}><span>+</span>Add Producer</button>
            <div style={{ marginTop: '50px' }}><ShopButtons backTo={Route.agencyShop_LicensesandAppointments} backToName={'Licenses and Appointments'} pageName={'Producers'} save={form.handleSubmit(onSubmit)} /></div>
          </> : <>
            <div className={styles.inviteProducersContainer}>
              <div className={styles.sendInvitesAllContainer}>
                <div className={styles.sendInvitesAllSubContainer}>
                  <button type="button" onClick={sendAllInvites}>Send Invites to All Producers</button>
                  <div className={styles.sendAllInviteParagraphDiv}>
                    <svg width="4" height="87" viewBox="0 0 4 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="2" y1="8.74228e-08" x2="2" y2="87" stroke="#C0D0ED" strokeWidth="4"/>
                    </svg>
                    <p>Ready to send invitations? Invites will be sent to the producers selected and cannot be undone. Producers will be prompted to create their own account and join your agency in order to onboard, quote, and enroll clients.</p>
                  </div>
                </div>
              </div>
              <div className={styles.sendInvitesSomeContainer}>
                {producers.length > 0 && <div className={styles.sendInvitetoSelectedText}><button type="button" onClick={sendSelectedInvites}>Send Invites to Selected Producers</button></div>}
                <div className={styles.producerListToBeInvited}>
                  {producers.filter(incompleteEntry).map((p, index) => <ProducerInviteItem index={index} key={(p as any).rhfID || (p as any).id} name={p.firstName!.concat(' ', p.lastName!)} />)}
                </div>
              </div>
            </div>
            <ShopButtons backTo={Route.agencyShop_LicensesandAppointments} backToName={'Licenses and Appointments'} pageName={'Producers'} noSubmitData save={() => onwards(api.v3.agency.finalize.POST({})) } />
          </> }
        </form>
      </FormProvider>
    </>}
  </div>

  function incompleteEntry(producer: any) {
    return (producer.firstName && producer.lastName && producer.email)
  }

  async function sendInvite(p: ProducerType) {
    try {
      await api.v3.tickets().POST({
        email: p.email as string,
        name: p.firstName!.concat(' ', p.lastName!) as string,
        venue: Venue.agency,
        venueID: agencyID
      })
      addToast('Your producers have been notified to set up their account.')
    } catch (error) {
      addToast(error as Error)
    }
  }
  async function sendAllInvites() {
    producers.forEach((p) => sendInvite(p as ProducerType))
  }

  async function sendSelectedInvites() {
    inviteList.forEach((invitee) => {
      const p = producers[invitee]
      sendInvite(p as ProducerType)
      inviteList.delete(invitee)
    })
  }

  async function onSubmit(data: FormData) {
    setNextButtonPressed(false)
    setSaveButtonPressed(false)
    setInviteButtonPressed(false)
    // manual validation for state *needs to be fixed*
    if (data && data.producers) {
      for (const p of data.producers) {
        if (p.licenses) {
          const licenses = p.licenses.map(p => p.state)
          if (licenses.includes('')) { addToast('Please select state for ' + compact([p.firstName, p.lastName]).join(' ')); return }
        }
      }
    }

    if (inviteButtonPressed) {
      setLoader(true)
      await api.v3.producers.POST(data).then(() => { fetchData(); setLoader(false); setShowAddProducers(false) })
      return
    }

    try {
      if (showAddProducers) {
        if (saveButtonPressed) {
          await api.v3.producers.POST(data).then(() => {
            addToast('Data successfully saved', 'success')
            fetchData()
          })
          return
        } else if (nextButtonPressed) {
          setLoader(true)
          await api.v3.producers.POST(data).then(() => { fetchData(); setLoader(false); setShowAddProducers(false) })
          return
        }
      } else {
        if (nextButtonPressed) {
          await onwards(Promise.resolve())
        }
      }
    } catch (error) {
      addToast(error as Error)
    }
  }

  function onAppend() {
    append({ npn: '', email: '', firstName: '', lastName: '', licenses: [] })
  }
}

interface RecordProps {
  producer: Partial<ProducerType>
  pindex: number
  remove: (index: number) => void
  defaultValues: FormData
  form: UseFormMethods<FormData>
}

const Record: React.FC<RecordProps> = ({ producer, pindex, remove: removeItem, form }) => {
  const stateLicensePrefix = `producers[${pindex}].licenses`
  const { append, fields: licenses, remove } = useFieldArray<StateLicense, 'rhfID'>({ control: form.control, name: stateLicensePrefix })
  const [description, setDescription] = useState<string>('Add state licenses for producer')
  const selectedStates = useWatch({ name: stateLicensePrefix }) as StateLicense[]

  useEffect(() => {
    licenses.length > 0 ? setDescription('Add another state') : setDescription('Add state licenses for producer')
  }, [licenses])

  return <div className={styles.container}>
    <Line formComponent={ProducerForm} index={pindex} componentItem={producer} remove={removeItem} componentName='Producer' prefix='producers' />
    <div style={{ order: licenses.length > 0 ? 1 : 0, marginTop: licenses.length > 0 ? '1.5rem' : '0' }} className={styles.additionsContainer}>
      <AddComponent onClick={onAppend} description={description}></AddComponent>
    </div>
    {licenses.map((lic, index) =>
      <React.Fragment key={`fragment[${index}]`}>
        <hr/>
        {stateLine(lic, index)}
      </React.Fragment>
    )}
  </div>

  function stateLine(license: any, index: number) {
    const lic = license as StateLicense

    return <Line
      key={(lic as any).rhfID || license.id}
      componentItem={lic}
      formComponent={StateLicenseComponent}
      remove={remove}
      index={index}
      componentName='State License'
      prefix={stateLicensePrefix}
      selectedStateOptions={selectedStates}
    />
  }

  function onAppend() {
    append({ state: '', license: '' })
  }
}

interface AddComponentProps {
  description: string
  onClick: () => void
}
const AddComponent: React.FC<AddComponentProps> = ({ description, onClick }) => {
  return <div onClick={onClick} className={styles.addAnItem}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#3564B9"/>
      <path d="M16.8886 15.728H21.3286V14.096H16.8886V9.296H15.1126V14.096H10.6726V15.728H15.1126V20.696H16.8886V15.728Z" fill="white"/>
    </svg>
    <text>{description}</text>
  </div>
}

interface ProducerFormProps {
  person: any
  id?: string
  prefix: string
  index: string
  selectedStateOptions?: StateLicense[]
}

const ProducerForm: React.FC<ProducerFormProps> = ({ person, prefix }) => {
  const { register } = useFormContext()
  return <div>
    <div className={styles.form} key={(person as any).rhfID}>
      <input type='hidden' name={`${prefix}.id`} ref={register()} defaultValue={person.id} />
      <CandorInput name={`${prefix}.firstName`} placeholder='First Name' defaultValue={person.firstName} required></CandorInput>
      <CandorInput name={`${prefix}.lastName`} placeholder='Last Name' defaultValue={person.lastName} required></CandorInput>
      <CandorInput name={`${prefix}.email`} placeholder='Email' defaultValue={person.email} required></CandorInput>
      <div className={styles.npnGroup}>
        <CandorInput name={`${prefix}.npn`} placeholder='Producer NPN' defaultValue={person.npn}></CandorInput>
        <button type='button' className={styles.info} data-tip data-for='npnTooltip'>i</button>
        <Tooltip
          id='npnTooltip'
          place='bottom'
          offset={{ top: 0, right: 0 }}
          delayHide={100}
          backgroundColor='linear-gradient(135deg, #0B4BF7 0%, #8B17BB 100%)'
        >
          <span>You can look up your producer’s National Producer Number on <a href='https://nipr.com' target='_blank' rel='noreferrer'>NIPR.com</a>.</span>
        </Tooltip>

      </div>
    </div>
  </div>
}

const CarrierAgentCodeComp: React.FC<{ carriers: majorCarrier[], prefix: string }> = ({ carriers, prefix }) => {
  const { register } = useFormContext() || useForm()
  return <div className={styles.carrierAgentMainComponent}>
    <div className={styles.carrierAgentHeaderComponent}>
      <div className={styles.AgentCodeComponent}>
        <text>Agent Code</text>
        <button type='button' className={styles.info} data-tip data-for='acTooltip'>i</button>
        <Tooltip
          id='acTooltip'
          place='bottom'
          offset={{ top: 0, right: 0 }}
          delayHide={100}
          backgroundColor='linear-gradient(135deg, #0B4BF7 0%, #8B17BB 100%)'
        >
          <span>Also known as Writing Code. Some carriers provide an agent code or number for an appointment while others may link your appointment to your NPN and state license.</span>
        </Tooltip>
      </div>
      <text>Carrier Appointments</text>
    </div>

    {carriers && carriers.map((carrier, index) => {
      const prefixName = `${prefix}[${index}]`

      return <div key={carrier.name} className={styles.carrierAgentEntryComp}>
        <input type='hidden' name={`${prefixName}.id`} ref={register()} defaultValue={prefix} />
        <div className={styles.carrierBoxComponent}>
          <div className={styles.carrierBox}>
            <text>{carrier.trimmedName}</text>
          </div>
        </div>
        <CandorInput type='hidden' name={`${prefixName}.carrier`} defaultValue={carrier.name} />
        <CandorInput name={`${prefixName}.agentCode`} width='86px' height='30px' defaultValue={carrier.agentNumber} className={styles.agentCodeBox} />
      </div>
    })}
  </div>
}

type OptionType = {
  value: string
  label: string
}

export const CarrierAppointmentComponent: React.FC<{state: string, prefix: string, stateLicense: StateLicense, removeCarriersButton: boolean }> = ({ state, prefix, stateLicense: license, removeCarriersButton }) => {
  const key = `${prefix}.carriers`
  const { register } = useFormContext() || useForm()
  const async = useAsync(async() => await api.v1.carriers())
  const [remove, setRemove] = useToggle(false)
  const [carriers, setCarriers] = useState<majorCarrier[]>(license.carriers?.map((c: any) => ({ name: c.carrier, trimmedName: c.carrier.length > 15 ? `${c.carrier.substring(0, 15)}...` : c.carrier, agentNumber: c.agentCode })) || [])

  if (async.loading) return <Loader />

  const carrierOptions = async!.value.map((carrier: string) => ({ value: carrier, label: carrier }) as OptionType) as Array<OptionType>
  const defaultCarriers = license.carriers?.map((c: any) => c.carrier) || []
  const defaults = [...carrierOptions]

  carrierOptions.forEach((s) => {
    if (!defaultCarriers.includes(s.value)) {
      const index = defaults.indexOf(s)
      defaults.splice(index, 1)
    }
  })

  const onChange = (selectedOptions: any) => {
    if (!selectedOptions) { setCarriers([]); return undefined }
    const param = selectedOptions.map((s: OptionType) => ({ value: s.value, label: s.value }) as OptionType)
    setCarriers(trimCarrierName(param))
  }

  function trimCarrierName(s?: OptionType[]): majorCarrier[] {
    if (s && s.length > 0) {
      return s.map((s1: OptionType) => {
        const tm = s1.value.length > 15 ? `${s1.value.substring(0, 15)}...` : s1.value
        return { name: s1.value, trimmedName: tm, agentNumber: '' }
      })
    }
    return []
  }

  return !remove ? <div className={styles.CarrierAppointmentComponentContainer}>
    <div className={styles.stateTitleForCarrierComp}>
      <text className={styles.stateText}>{state}</text>
      <button style={{ visibility: removeCarriersButton ? 'visible' : 'hidden' }} className={styles.removeCarrAppButton} onClick={() => setRemove(true)}>Remove Carrier Appointments for {state}</button>
    </div>
    <div className={styles.addCarrierComponent}>
      <div style={{ order: 1, display: carriers.length > 0 ? '' : 'none' }}>
        <CarrierAgentCodeComp carriers={carriers} prefix={key} />
      </div>
      <input type='hidden' name={`${prefix}.id`} ref={register} defaultValue={license.id} key={license.id} />
      <ReactSelect options={carrierOptions} name={key} defaultValue={defaults} className={styles.dropdownCarriers} backgroundColor='white' ref={register} onChange={onChange} isSearchable isMulti required />
    </div>
  </div> : <AddComponent onClick={() => { setRemove(false) }} description='Add carrier appointments for this state' />
}

const StateLicenseComponent: React.FC<ProducerFormProps> = ({ person, prefix, selectedStateOptions }) => {
  const { register } = useFormContext()
  const [showCarrierApp, setShowCarrierApp] = useToggle((person.carriers && person.carriers.length > 0) || false)
  const [state, setState] = useState<string>(person.state)

  const sOptions = states.map((s: string) => ({ value: s, label: s }) as OptionType) as Array<OptionType>
  let selectableOptions: OptionType[] = [...sOptions]
  const defaults = [...sOptions]

  sOptions.forEach((s) => {
    if (person.state !== s.value) {
      const index = defaults.indexOf(s)
      defaults.splice(index, 1)
    }
  })

  if (selectedStateOptions && selectedStateOptions.length > 0) {
    const b = selectedStateOptions.map(s => {
      return { value: s.state!, label: s.state! } as OptionType
    })
    selectableOptions = sOptions.filter(x => !(b.some(o => o.label === x.label)))
  }

  const onChange = (selectedOption: any) => {
    if (!selectedOption) { setState(''); return undefined }
    setState(selectedOption)
  }

  return <div className={styles.stateLicenseContainer} key={(person as any).rhfID}>
    <input type='hidden' name={`${prefix}.id`} ref={register()} defaultValue={person.id} />
    <div className={styles.stateLicensesSubcontainer}>
      <BaseSelect className={styles.stateInput} options={selectableOptions} onChange={onChange} backgroundColor='white' defaultValue={defaults} placeholder='State' required />
      <CandorInput type='hidden' name={`${prefix}.state`} defaultValue={state} />
      <CandorInput className={styles.licenseInput} placeholder='License #' name={`${prefix}.license`} defaultValue={person.license} required />
    </div>
    {!showCarrierApp && <AddComponent onClick={() => { setShowCarrierApp(true) }} description='Add carrier appointments for this state'></AddComponent>}
    {showCarrierApp && <div>
      <CarrierAppointmentComponent state={state} stateLicense={person} prefix={prefix} removeCarriersButton={true} />
    </div>
    }
  </div>
}

interface LineProps {
  componentItem: any
  formComponent: React.ComponentType<any>
  remove: (index: number) => void
  componentName: string
  index: number
  prefix: any
  selectedStateOptions?: StateLicense[]
}

const Line: React.FC<LineProps> = ({ formComponent: Form, componentItem, index, remove, componentName, prefix, selectedStateOptions }) => {
  const key = `${prefix}[${index}]`
  return <>
    <div className={styles.nameRow}>
      <div className={styles.name}>{componentName} {index + 1}</div>
      <button className={styles.delete} onClick={onDelete}>Remove {componentName}</button>
    </div>
    <Form person={componentItem} index={index} prefix={key} selectedStateOptions={selectedStateOptions} />
  </>

  function onDelete() {
    remove(index)
  }
}

export default AgencyProducers
