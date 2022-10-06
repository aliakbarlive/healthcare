import React from 'react'
import styles from './DebugModal.module.scss'
import useStargate from 'Utilities/Hooks/useStargate'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { useToggle } from 'react-use'
import { useLocation } from 'react-router-dom'
import { pharaoh, cairo } from 'Utilities/config'
import useToast from 'Utilities/Hooks/useToast'
import { getToken } from 'Utilities/pharaoh'
import { useWhiteLabelFromSearchParams } from 'Utilities/Hooks/useWhiteLabel'
import Modal, { ActionType, BrandColors, ModalActionButton } from './Modal'

export default function DebugModal() {
  const { loading, error, value } = useStargate()
  const pharaoh = getPharaoh()
  const basename = process.env.REACT_APP_BASENAME || ''
  const urlPrefix = `${window.location.protocol}//${window.location.host}${basename}`
  const [open, toggle] = useToggle(true)
  const location = useLocation()
  const addToast = useToast()
  const label = useWhiteLabelFromSearchParams()

  return <Modal
    gaModalName={DebugModal.name}
    header='Report a Bug'
    isOpen={open}
    onRequestClose={toggle}
    footerButtons={footerButtons()}
  >
    <div className={styles.container}>
      <h4>How To Report Bugs</h4>
      <ul>
        <li><a href='https://testlio.com/blog/the-ideal-bug-report/'>How to write a bug report that will make your engineers love you</a></li>
        <li><a href='https://www.chiark.greenend.org.uk/~sgtatham/bugs.html'>How to Report Bugs Effectively</a></li>
        <li><a href='https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines'>Mozzila’s bug report writing guidelines</a></li>
      </ul>
      <h4>Environment</h4>
      <Env />
      <details>
        <summary>/stargate dump</summary>
        <pre>{stargate()}</pre>
      </details>
    </div>
  </Modal>

  function footerButtons(): ModalActionButton[] {
    const linearLink: ModalActionButton = {
      content: 'Report Bug',
      href: linear() || '',
      actionType: ActionType.primary,
      color: BrandColors.purple
    }

    const signInLink: ModalActionButton = {
      gaButtonName: `Copy Instant Sign-in Link ${DebugModal.name}`,
      content: 'Copy Instant Sign-in Link',
      onClick: copy,
      actionType: ActionType.secondary,
      color: BrandColors.purple
    }
    return [signInLink, linearLink]
  }

  function instantSignInLink() {
    let rv = `${urlPrefix}/account/sign-in?token=${encodeURIComponent(getToken())}&redirect=${encodeURIComponent(location.pathname)}`
    if (label) rv += `&label=${label.shortcode}`
    if (localStorage.overrideGroupID) rv += `&overrideGroupID=${localStorage.overrideGroupID}`
    return rv
  }

  function copy() {
    navigator.clipboard.writeText(instantSignInLink())
    addToast('Sign‐in link copied to clipboard')
  }

  function stargate() {
    if (loading) return <Loader />
    if (error) return <Error error={error} />
    return JSON.stringify(value!, null, 2)
  }

  function linear() {
    if (loading || error) return undefined

    const data = value!

    let text = `
# Incorrect Behavior
Succinctly describe what didn’t work, *don’t* list the replication steps.

# Expected Behavior
What *should* have happened, but didn’t?

# Replication Steps
1. Provide steps
2. Leading up to the bug
3. If the steps are very common feel free to abbreviate them

[Instant sign-in to final step](${instantSignInLink()}).

# Properties
|Key|Value|
|-|-|
|Location|${location.pathname}|`
    if (data.group) {
      const groupName = `[${data.group.name}](${cairo()}?id=${data.group.id})`
      text += `
|Group Name|${groupName}|
|Group ID|\`${data.group.id}\`|`
    }

    text += `
|User ID|\`${data.user.id}\`|
|User Email|\`${data.user.email}\`|
|Pharaoh|${pharaoh}|
|Host|${window.location.host}|
|White-label|${label?.title}|
|Token|\`${getToken()}\`|

# Developer Tasks
-[ ] QA notes
-[ ] Release notes
-[ ] Screenshots/Videos of new features
`
    const sha = getMeta('commit')
    if (sha) {
      text += `|SHA|[${sha}](https://github.com/candor/ra/commit/${sha})|\n`
    }

    const labels = ['Bug']
    const path = location.pathname
    if (path.startsWith('/dashboard')) labels.push('Ra·Dash')
    if (path.startsWith('/dashboard/agency')) labels.push('Agency')
    if (path.startsWith('/dashboard/employer')) labels.push('ER')
    if (path.startsWith('/dashboard/employee')) labels.push('EE')
    if (path.startsWith('/shop')) labels.push('Ra·Shop')
    if (path.startsWith('/shop/employer')) labels.push('ER')
    if (path.startsWith('/shop/employee')) labels.push('EE')

    const encodedLabels = labels.map(o => encodeURIComponent(o)).join(',')

    return `https://linear.app/myhealthily/team/ANKH/new?description=${encodeURIComponent(text)}&labels=${encodedLabels}`
  }
}

function getPharaoh() {
  const pharaohHostname = new URL(pharaoh()).hostname
  const pharaohPart = pharaohHostname.split('.')[1]

  switch (pharaohPart) {
  case 'candor':
    return 'production'
  case 'staging':
    return pharaohPart
  default:
    return pharaohHostname
  }
}

function getMeta(metaName: string) {
  const metas = document.getElementsByTagName('meta')
  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === metaName) { return metas[i].getAttribute('content') }
  }
}

const Env: React.FC = () => {
  return <table>
    {Object.keys(process.env).sort().map(row)}
  </table>

  function row(key: string) {
    const value = process.env[key]
    if (value) {
      return <tr key={key}><td>{key}</td><td>{process.env[key]}</td></tr>
    } else {
      return null
    }
  }
}
