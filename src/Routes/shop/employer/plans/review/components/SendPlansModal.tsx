import React, { useState } from 'react'
import styles from './SendPlansModal.module.scss'
import { uniq, sortBy } from 'lodash'
import { Member } from 'Utilities/Hooks/useStargate'
import ReactDOM from 'react-dom'
import useToast from 'Utilities/Hooks/useToast'
import Modal, { ActionType, BrandColors, ModalProps } from 'Components/Modals/Modal'
import { useLocation } from 'react-router'
import { Route } from 'Utilities/Route'

interface Props extends Omit<ModalProps, 'gaModalName' | 'header'> {
  members: Member[]
  callback: (email: string) => Promise<any>
}

const SendPlansModal: React.FC<Props> = ({ members, callback, ...props }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member>()
  const [disabled, setDisabled] = useState(true)
  const orderedMembers = getOrderedMembers()
  const addToast = useToast()
  const location = useLocation()

  const title = location.pathname.startsWith(Route.agencyDashboard) ? 'Select Group Manager' : 'Request a Review'

  return <Modal
    gaModalName={SendPlansModal.name}
    header={ <form className={styles.header} id={SendPlansModal.name} onSubmit={handleSendPlans}>
      {title}
      <p>Give access to the lead contact from the company to review your benefits package by selecting a contact from your census:</p>
      <input
        className={styles.searchBar}
        value={searchTerm}
        onChange={handleSearchChange}
        name='searchTerm'
        placeholder='Type name to search'
      />
    </form> }
    footerClassName={styles.footer}
    footerButtons={[{
      inputType: 'submit',
      actionType: ActionType.primary,
      color: BrandColors.navyBlue,
      formId: SendPlansModal.name,
      value: title,
      disabled
    }]}
    { ...props }
  >

    <div className={styles.membersListContainer}>
      <div className={styles.memberList}>
        { orderedMembers.map((member, index) => {
          const isUnique = uniq(orderedMembers).length === 1
          const isSelected = selectedMember ? member.id === selectedMember.id : false
          return <MemberItem member={member} isUnique={isUnique} isSelected={isSelected} onClick={handleMemberSelect} key={index}/>
        }) }
      </div>
    </div>

  </Modal>

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value)
  }

  function getOrderedMembers() {
    let hasMemberWithSearchTerm = false
    let orderedMembers
    if (!searchTerm || searchTerm === '') {
      orderedMembers = members
    } else {
      orderedMembers = sortBy(members, member => {
        const nameMatchesSearchTerm = member.name.toLowerCase().includes(searchTerm.toLowerCase())
        if (nameMatchesSearchTerm) { hasMemberWithSearchTerm = true }
        return nameMatchesSearchTerm
      })
    }

    if (hasMemberWithSearchTerm) {
      orderedMembers.reverse()
    }
    return orderedMembers
  }

  function handleMemberSelect(member: Member) {
    ReactDOM.unstable_batchedUpdates(() => {
      if (selectedMember?.id === member.id) {
        setSelectedMember(undefined)
        setSearchTerm('')
        setDisabled(true)
      } else {
        setSelectedMember(member)
        setSearchTerm(member.name)
        setDisabled(false)
      }
    })
  }

  async function handleSendPlans(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault() // don't refresh the page
    setDisabled(true)
    try {
      if (!selectedMember || !selectedMember.email) {
        return Promise.reject(new Error("No member selected or email doesn't exist"))
      }
      await callback(selectedMember.email)
      addToast('Email sent successfully!', 'info')
      setSelectedMember(undefined)
      setSearchTerm('')
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }
}

interface Props2 {
  isSelected: boolean
  member: Member
  onClick: (member: Member) => void
  isUnique: boolean
}

const MemberItem: React.FC<Props2> = props => {
  return <button
    type='button'
    className={`${styles.memberItem} ${props.isSelected ? styles.memberItemSelected : styles.memberItemDeselected}`}
    onClick={() => props.onClick(props.member)}
  >
    {props.member.name}<br/>
    {!props.isUnique && <span>{props.member.email}</span>}
  </button>
}

export default SendPlansModal
