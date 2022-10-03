import React from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { useSet } from 'react-use'
import styles from './index.module.scss'
import { sortBy, compact } from 'lodash'
import { useHistory } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import EmployeeSelectorItem from 'Components/Stargate/EmployeeSelectorItem'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { GAButton } from 'Components/Tracking'
import * as api from 'Utilities/pharaoh'
import { PowerLevel } from 'Utilities/Hooks/useUser'

const ERShopCensusWaive: React.FC<PrivateWizardPageProps> = ({ onwards, stargate }) => {
  const [values, { toggle }] = useSet(initialWaived())
  const members = sortBy(stargate.members, 'name')
  const history = useHistory()
  const groupID = stargate.group?.id
  useFullContentArea()

  return <div className={styles.censusWaivingContainer}>
    <header>
      <h1 className='shop-h1-periwinkle '>Employees Covered</h1>
      <h2 className='shop-h2-navy'>Everyone is covered until deselected. If you aren’t sure, keep selected.</h2>
    </header>
    <div className={styles.listContainer}>
      {members.map(member =>
        <EmployeeSelectorItem
          id={member.id}
          key={member.id}
          variant='checkmark'
          groupGroupId={groupID}
          callback={id => toggle(id)}
          name={member.name}
          selected={!values.has(member.id)}
        />)
      }
    </div>
    <div className={styles.buttonsContainer}>
      <GAButton analytics={`Back to Census (${ERShopCensusWaive.name})`} onClick={back} className={styles.backButton}>
        <i className={'material-icons'}>arrow_back</i> Back to Census
      </GAButton>
      <GAButton analytics={`Next (${ERShopCensusWaive.name})`} className='shop-next-button' onClick={() => onwards(go())}>Next</GAButton>
    </div>
    <p className={styles.note}>Everyone is selected for coverage by default, please click on the employees who wish to waive<br/>coverage to deselect them. If you do not know, please leave them selected.</p>
  </div>

  function initialWaived(): Set<string> {
    const waived = stargate.members.filter(ee => ee.is_waived)
    const ids = waived.map(ee => ee.id)
    return new Set(ids)
  }

  function back() { history.push(Route.erStargate_Census) }

  async function go() {
    if (values.size === members.length) throw new Error('At least one member must have coverage')

    const payload = compact(members.map(member => {
      return { email: member.email, isWaiving: values.has(member.id) }
    }))

    await api.v1.groups(groupID).users.waive.PUT(payload)

    return !!stargate.group?.approved || stargate.user.power_level >= PowerLevel.broker
  }
}

export default ERShopCensusWaive
