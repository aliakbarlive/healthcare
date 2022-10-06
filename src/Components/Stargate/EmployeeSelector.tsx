import React from 'react'
import EmployeeSelectorItem from './EmployeeSelectorItem'
import styles from './EmployeeSelector.module.css'
import { Member } from 'Utilities/Hooks/useStargate'
import { sortBy } from 'lodash'

interface Props {
  id: string
  groupMembers: Member[]
  variant: 'checkmark' | 'unknown'
  selectCallback: (id: string, splitID: string) => void
  selected: Set<string>
}

const EmployeeSelector: React.FC<Props> = ({ groupMembers, variant, id, selectCallback, selected }) => {
  const members = sortBy(groupMembers, 'name')
  return <div className={styles.listContainer}>
    {sortBy(members, 'name').map(member => <div key={member.id}>
      <EmployeeSelectorItem
        variant={variant}
        key={member.id}
        id={member.id}
        groupGroupId={id}
        callback={selectCallback}
        name={member.name}
        selected={selected.has(member.id)}/></div>)}
  </div>
}

export default EmployeeSelector
