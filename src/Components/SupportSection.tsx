import React, { useState } from 'react'
import styles from './SupportSection.module.scss'
import api from 'Utilities/Deprecated/api'
import { useToggle } from 'react-use'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'
import useToast from 'Utilities/Hooks/useToast'
import DebugModal from 'Components/Modals/DebugModal'
import { isProduction } from 'Utilities/config'
import { GAButton } from './Tracking'

enum Mode {
  off,
  open,
  debug
}

const SupportSection: React.FC = () => {
  const [mode, setMode] = useState(Mode.off)

  return <div className={styles.supportContainer} style={{ opacity: mode === Mode.debug ? 1 : 0 }}>
    {mode !== Mode.off
      ? <Content debug={mode === Mode.debug} onClick={onClick}/>
      : <GAButton analytics={`Support (${SupportSection.name})`} name="support" onClick={onClick}>Support<i className='material-icons'>help_outline</i></GAButton>
    }
  </div>

  function onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (event.shiftKey) {
      setMode(Mode.debug)
    } else if (mode === Mode.debug) {
      setMode(Mode.off)
    }
  }
}

interface Props {
  debug: boolean
  onClick(event: any): void
}

const Content: React.FC<Props> = ({ debug, onClick }) => {
  const { value: user } = useUser()
  const [email, setEmail] = useState('')
  const [bugReporterOpen, toggleBugReporter] = useToggle(false)
  const addToast = useToast()
  const isAdmin = user && user.powerLevel >= PowerLevel.candorEmployee
  const isNotProduction = !isProduction()
  const children = []

  // showing this for “shift” click now so Sandra from Blacksmith can switch user
  if (isAdmin || (debug && user && user.powerLevel >= PowerLevel.groupManager)) {
    children.push(<>
      <input
        onChange={event => setEmail(event.target.value)}
        placeholder="Email (Switch User)"
      />
      <GAButton analytics={`Submit (${SupportSection.name})`} onClick={switchToUser}>Submit</GAButton>
    </>)
  }

  if (isAdmin || isNotProduction || debug) {
    children.push(<GAButton analytics={`Report Bug (${SupportSection.name})`} onClick={toggleBugReporter}>Report Bug</GAButton>)
  }

  children.push(
    <GAButton analytics={`Collapse Menu (${SupportSection.name})`} onClick={onClick}>Collapse Menu<i className='material-icons'>expand_more</i></GAButton>
  )

  const els = children.flatMap((el, index) => [
    React.cloneElement(el, { key: `${index}_` }),
    <br key={index} />
  ])
  els.pop() // pop last <br/>

  return <>
    {els}
    {bugReporterOpen && <DebugModal />}
  </>

  function switchToUser() {
    api.switchToUser(email)
      .then(rsp => {
        localStorage.setItem('token', rsp.token)
        window.location.reload()
      })
      .catch(addToast)
  }
}

export default SupportSection
