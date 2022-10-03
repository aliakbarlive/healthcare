import React from 'react'
import styles from './Landing.module.scss'
import { Broker } from 'Utilities/pharaoh.types'
import useUser from 'Utilities/Hooks/useUser'
import Loader from 'Components/Rudimentary/Loader'
import { Img } from 'react-image'

const Landing: React.FC <{ broker: Broker, groupName: string}> = ({ broker, groupName }) => {
  const today = new Date()
  const { value: user, loading } = useUser()

  if (loading) return <Loader />
  const createdForText = `Proposal Created for ${groupName}`

  return <div className={styles.landingMain}>
    <div className={styles.brokerNameText}>
      <p>{broker.name}</p>
      <p>{broker.agency?.name}</p>
      <p>{broker.agency?.address1}</p>
      <p>{broker.agency?.address2}</p>
      <p>{broker.agency?.city}, {broker.agency?.state} {broker.agency?.zip}</p>
      <p>{broker.phone}</p>
      <p>{broker.email}</p>
    </div>
    <div className={styles.frame2425}>
      <p className={styles.completePackage}>Your Complete Healthcare Coverage Package</p>
      <p className={styles.proposalCreated}>{createdForText}</p>
      <p className={styles.dateProposalCreated}>{today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div className={styles.frame2821}>
      <div className={styles.frame2376}>
        <Img src={user?.avatar || ''} crossOrigin='anonymous' style={{ width: 'inherit' }} />
      </div>
      {myhealthilyLogo()}
    </div>
  </div>
}

export function myhealthilyLogo() {
  return <svg width="133" height="22" viewBox="0 0 133 22" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <rect width="133" height="22" fill="url(#pattern0)"/>
    <defs>
      <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_2179_1853" transform="translate(0 -0.0138636) scale(0.00333333 0.0201515)"/>
      </pattern>
      <image id="image0_2179_1853" width="300" height="51" xlinkHref="data:image/png;base64,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"/>
    </defs>
  </svg>
}

export default Landing
