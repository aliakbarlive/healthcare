import React from 'react'
import styles from './Refresh.module.scss'
import { Route as RaRoute } from 'Utilities/Route'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { Link } from 'react-router-dom'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'

const ERShopRefresh: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  useFullContentArea()
  const addToast = useToast()

  function doRefresh(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    onwards(api.v3.groups(stargate?.group?.id).refresh.POST()).catch(addToast)
  }

  return <div className={styles.mainContainer}>
    <svg className={styles.refreshIcon} width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M46.0638 7.93125C41.167 3.0375 34.4465 0 26.9831 0C12.0563 0 0 12.0825 0 27C0 41.9175 12.0563 54 26.9831 54C39.5797 54 50.0826 45.3937 53.0882 33.75H46.0638C43.2946 41.6138 35.7974 47.25 26.9831 47.25C15.8049 47.25 6.72045 38.1712 6.72045 27C6.72045 15.8288 15.8049 6.75 26.9831 6.75C32.5891 6.75 37.5872 9.07875 41.2345 12.7575L30.3602 23.625H54V0L46.0638 7.93125Z" fill="#16346F"/>
    </svg>
    <div className={styles.mainText}>
      <h1>Your group needs a refresh!</h1>
      <h2>In order to ensure correct rates, we will <br/>need to update your group with new quotes.</h2>
      <button className='shop-next-button' onClick={doRefresh}>Refresh and Continue</button>
    </div>
    <p className={styles.escape}>If you were looking for your dashboard instead, you can find it <Link to={RaRoute.dashboardEmployer}> here</Link>.</p>
  </div>
}

export default ERShopRefresh
