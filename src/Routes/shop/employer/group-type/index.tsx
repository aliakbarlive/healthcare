import React from 'react'
import styles from './index.module.scss'
import { WizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'
import { Route as RaRoute } from 'Utilities/Route'
import { useHistory } from 'react-router'
import { ReactComponent as GroupIllustration } from './Assets/group.svg'
import { ReactComponent as IndividualIllustration } from './Assets/individual.svg'

const ERGroupType: React.FC<WizardPageProps> = ({ onwards }) => {
  const addToast = useToast()
  const history = useHistory()
  return <div className={styles.mainContainer}>
    <h1>Who are you looking to cover?</h1>
    <h2>
      At MyHealthily, we help you find a complete healthcare solution - no matter whether you’re
      looking to insure yourself or your group. Please select the shopping experience that best
      describes you.
    </h2>
    <div className={styles.groupTypeContainer}>
      <div className={styles.group}>
        <GroupIllustration className={styles.illustration}/>
        <h3>Group</h3>
        <p>Find affordable plans that fit the needs of you and your group, including your employees and their dependents.</p>
        <button className='shop-next-button' onClick={() => onwards(Promise.resolve())}>Group Shop</button>
      </div>
      <div className={styles.individual}>
        <IndividualIllustration className={styles.illustration}/>
        <h3>Individual</h3>
        <p>If you’re a sole proprietor or shopping for just yourself and your family, the individual route is the best choice for you.</p>
        <button className='shop-next-button' onClick={switchToIndividual}>Individual Shop</button>
      </div>
    </div>
  </div>

  async function switchToIndividual() {
    try {
      const res = await api.v3.groups().individual.POST()
      history.push(`${RaRoute.signUp}/${res.token}`)
    } catch (error) {
      addToast(error)
    }
  }
}

export default ERGroupType
