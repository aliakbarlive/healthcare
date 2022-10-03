import React, { useState } from 'react'
import styles from './ProfileInfoSection.module.scss'
import TodoList, { Member } from 'Components/Anubis/TodoList'
import EnrollmentStatus from './EnrollmentStatus'
import { Route } from 'Utilities/Route'
import ContactSnapshot from 'Components/Anubis/ContactSnapshot'
import { stages as statuses } from 'Routes/dashboard/agency/client/PipelineSettings'
import { get, post, put } from 'Utilities/fetch++'
import useToast from 'Utilities/Hooks/useToast'
import { Group, PipelineStatus, Contact } from 'Utilities/pharaoh.types'
import { ValueType } from 'react-select'
import PipelineStatusSelect, { StatusType } from 'Components/Rudimentary/PipelineStatusSelect'
import FlagGroup from 'Components/Rudimentary/FlagGroup'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import CandorForm, { CandorFormName, CandorFormAddress, CandorFormDatePicker } from 'Components/Anubis/CandorForm'
import { v3 } from 'Utilities/pharaoh'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'
import BackTo from 'Components/Anubis/BackTo'
import { useLocation } from 'react-router-dom'
import NewContactModal from 'Components/Anubis/NewContactModal'
import { useAsync, useToggle } from 'react-use'
import ContactsModal from 'Components/Anubis/ContactsModal'
import effectiveDateFilter from 'Utilities/Plans/effectiveDateFilter()'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { defaultMinimumDate } from 'Utilities/etc'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import MQStatus from './MQStatus'
import AssignProducer from './AssignProducer'

type Props = {
  id: string
  group: Group
  targetType: string
  ees?: AsyncStateRetry<Member[]>
}

const ProfileInfoSection: React.FC<Props> = ({ group, id, ees }) => {
  const [status, setStatus] = useState(group.status)
  const [flagged, setFlagged] = useState(group.flagged)
  const addToast = useToast()
  const defaultContact = !_.isEmpty(group.contacts) ? group.contacts[0] : undefined
  const defaultFormValues = { ...group, contact: defaultContact }
  const form = useForm({ defaultValues: defaultFormValues })
  const { register, setValue } = form
  const user = useUser()
  const location = useLocation()
  const [showNewContactModal, toggleShowNewContactModal] = useToggle(false)
  const [showSwitchContactModal, toggleShowSwitchContactModal] = useToggle(false)
  const [currentContact, setCurrentContact] = useState<Contact | undefined>(defaultContact)
  const [showNotesForCurrentContact, toggleShowNotesForCurrentContact] = useToggle(false)
  const isAgencyDash = useLocation().pathname.startsWith(Route.agencyDashboard)
  const [approved, toggleApproval] = useToggle(false)
  const { value: v1group, loading, error } = useAsync(() => get(`/groups/${id}`), [approved])
  const canAssign = (user.value?.powerLevel || PowerLevel.individual) >= PowerLevel.superBroker

  if (loading) return <Loader />
  if (error) return <Error error={error} />
  if (!!v1group?.approved !== approved) { toggleApproval() }

  const Stats = statuses.map(({ label, key }) => {
    if (label === 'Enrollment\nShop Sent to\nEmployees') {
      return { label: label.split(' ')[0], key }
    }
    if (label === 'Medical \nQuestionnaires \nSent') {
      return { label: 'MQs Sent', key }
    } else return { label, key }
  })

  function currentStatus() {
    let selectedStatus = Stats.find(({ key }) => key === status)
    if (!selectedStatus) { selectedStatus = statuses[0] }
    const value: StatusType = { value: selectedStatus.key, label: selectedStatus.label }
    return value
  }

  const profileSnapshotContent: any[] = [{
    before: <h2>{group.members.total || '–'}</h2>,
    after: <span># Employees</span>
  }]
  if (user.value && user.value.powerLevel >= PowerLevel.broker) {
    profileSnapshotContent.push({
      after: <FlagGroup checked={flagged} onChange={onToggleFlagged} />
    })
    profileSnapshotContent.push({
      after: <div>
        <span>Status</span>
        <PipelineStatusSelect
          value={currentStatus()}
          onChange={onStatusChanged}
          options={Stats.map((status) => ({ value: status.key, label: status.label }))}
        />
        <div className={styles.pipelineDisclaimer}>
        In order to update the pipeline status of each prospect or client, please change manually on the client’s profile. Automatic pipeline status changes include when employee medical questionnaires are sent, enrollment shop invites have been sent to employees, and the group has been successfully enrolled with the carrier.
        </div>
      </div>
    })
  }

  const stats: any = _.pick(group.members, 'complete', 'waived', 'incomplete')

  const back = location.pathname.startsWith(Route.agencyDashboard)
    ? <BackTo analytics={`Back to Clients (${ProfileInfoSection.name})`} route={Route.agencyDashboardClient}>Back to Clients</BackTo>
    : null

  return <>
    {back}
    <div className={styles.mainContainer}>
      <NewContactModal isOpen={showNewContactModal} onRequestClose={onAddContactRequestClose} groupID={group.id} />
      <ContactsModal isOpen={showSwitchContactModal} onRequestClose={onSwitchContactRequestClose} groupID={group.id} currentContact={currentContact} showNotesForCurrentContact={showNotesForCurrentContact} />
      <ContactSnapshot name={group?.name} content={profileSnapshotContent} />
      <CandorForm {...form} save={onSave}>
        <CandorFormName name='name' flagged={flagged} />
        {isAgencyDash && <span onClick={toggleShoppingApproval} className={approved ? styles.shoppingButtonApproved : styles.shoppingButtonNotApproved}>{approved ? 'Revoke Shopping Approval' : 'Approve to Shop'}</span>}
        <p className={styles.contactDetails}>
          <span>
            {isAgencyDash && <i
              className='material-icons'
              role='button'
              tabIndex={0}
              aria-label='Add New Contact'
              onClick={toggleShowNewContactModal}>
              add_circle
            </i>}
            Contact Details
          </span>
          {isAgencyDash && <div role='button' tabIndex={0} onClick={toggleShowSwitchContactModal}>Switch Contact</div>}
        </p>
        <label>
          Name
          <input name='contact.name' ref={register} placeholder='Contact Name' />
        </label>
        <label>
          Email
          <input name='contact.email' ref={register} placeholder='Contact Email' />
        </label>
        <label>
          Phone
          <PhoneInput name='contact.phone' placeholder='Contact Phone' candorFormStyles />
        </label>
        {isAgencyDash && <label>Notes
          <div role='button' tabIndex={0} onClick={showNotesForCurrentcontact}>
            See Notes
          </div>
        </label>}
        <p>Business Details</p>
        <CandorFormAddress showCountyPicker />
        <CandorFormDatePicker
          name="dates.effective"
          placeholder='Effective Date'
          openToDate={defaultMinimumDate()}
          filterDate={effectiveDateFilter}
        >
          Effective Date
        </CandorFormDatePicker>
        <label>
          Wait Per. (Days)
          <input name='waitingPeriod' placeholder='Wait Period' ref={register} />
        </label>
        <label>
          EIN
          <input name='identifiers.ein' placeholder='Employer ID Number' ref={register} />
        </label>
      </CandorForm>
      <div className={styles.todoEnrollment}>
        <TodoList id={id} ees={ees?.value} />
        {canAssign && <AssignProducer group={group} />}
        {group.status === PipelineStatus.sent && <EnrollmentStatus stats={stats} />}
        {group.status === PipelineStatus.mqsent && <MQStatus groupID={group!.id} />}
      </div>
    </div>
  </>

  function onAddContactRequestClose(contact?: Contact) {
    toggleShowNewContactModal()
    if (contact) {
      setCurrentContact(contact)
      setValue('contact', contact, { shouldValidate: true })
    }
  }

  function onSwitchContactRequestClose(contact?: Contact) {
    toggleShowSwitchContactModal()
    if (contact) {
      setCurrentContact(contact)
      setValue('contact', contact, { shouldValidate: true })
    }
  }

  function showNotesForCurrentcontact() {
    toggleShowNotesForCurrentContact()
    toggleShowSwitchContactModal()
  }

  async function onSave(data: any) {
    if (!data.address.county.id) throw new window.Error('Please select your county')
    await Promise.all([
      v3.groups(group.id).PUT(data),
      v3.groups(group.id).contacts.POST({ id: currentContact?.id, ...data.contact })
    ])
  }

  async function onStatusChanged(pipelineStatus: ValueType<StatusType>) {
    const prevStatus = status
    try {
      const status = (pipelineStatus as StatusType).value as PipelineStatus
      setStatus(status)
      await put('/v3/groups', { id, status })
    } catch (error) {
      addToast(error as Error)
      setStatus(prevStatus)
    }
  }

  async function onToggleFlagged(event: React.ChangeEvent<HTMLInputElement>) {
    const prevFlagged = flagged
    try {
      const flagged = event.currentTarget.checked
      setFlagged(flagged)
      await put('/v3/groups', { id, flagged })
    } catch (error) {
      addToast(error as Error)
      setFlagged(prevFlagged)
    }
  }

  async function toggleShoppingApproval() {
    try {
      await post(`/v3/cairo/groups/${id}/approve`, {})
      if (approved) {
        addToast('You have revoked shopping approval from your client.', 'info')
      } else {
        addToast('Your client has been approved to shop for healthcare plans.', 'success')
      }
      toggleApproval()
    } catch (error) {
      addToast(error as Error)
    }
  }
}
export default ProfileInfoSection
