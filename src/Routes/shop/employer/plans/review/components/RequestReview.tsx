import { GAButton } from 'Components/Tracking'
import React from 'react'
import styles from './RequestReview.module.scss'

type Props = {
  requestClose: () => void
}

const RequestReview: React.FC<Props> = ({ requestClose }) => {
  return <div className={styles.requestReviewContainer}>
    <div>
      <p>Need to submit your choices to the business owner or your <br/>HR representative to evaluate and approve?</p>
      <GAButton analytics={`Request a Review (${RequestReview.name})`} onClick={requestClose} >Request a Review</GAButton>
    </div>
  </div>
}

export default RequestReview
