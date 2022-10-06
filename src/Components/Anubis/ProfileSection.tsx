import React from 'react'
import styles from './ProfileSection.module.scss'
import AddButton from './AddButton'
import { useToggle } from 'react-use'

// FIXME this is weird, is the whole point of allowing top/children as a distinct
// prop set just so we can reuse the top-level div style? If so we should then just
// import that module.css for such uses, it's weird.

interface Props {
  children?: any
  name?: string | JSX.Element
  addButtonName?: string
  onAddButton?: (event: any) => void
  expanded?: boolean
  style?: React.CSSProperties
}

const ProfileSection: React.FC<Props> = ({ children, name, addButtonName, onAddButton, expanded: defaultExpanded, style }) => {
  const [expanded, setExpanded] = useToggle(!!defaultExpanded)

  return <div style={style} className={styles.container}>
    <div className={styles.summaryContainer}>
      <div className={`${styles.summary} ${expanded ? styles.expanded : ''}`} onClick={setExpanded}>{name}</div>
      { onAddButton && <div> <AddButton analytics={`${addButtonName} (${ProfileSection.name})`} onClick={onAddButtonClick} className={styles.addButton}>{addButtonName}</AddButton></div> }
    </div>
    <div style={{ display: expanded ? 'block' : 'none' }}>
      {children}
    </div>
  </div>

  function onAddButtonClick(event: any) {
    if (!onAddButton) return
    setExpanded(true)
    onAddButton(event)
  }
}

interface ShowAllProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  checked: boolean
  label?: string
}

// A checked ShowAll is just supposed to show you are indeed seeing everything. Clicking it, in it's checked state  will not do anything
export const ShowAll: React.FC<ShowAllProps> = ({ checked, onChange, label }) => {
  return <label className={styles.showAllLabel}>
    {label || 'Show All'}
    <input type='checkbox' checked={checked} onChange={onChange} disabled={checked}/>
    <span/>
  </label>
}

export default ProfileSection
