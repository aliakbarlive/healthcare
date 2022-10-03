import Tooltip from 'Components/Stargate/ToolTip/Tooltip'
import React from 'react'
import styles from 'Routes/shop/agency/licensesandappointments/tabs.module.scss'

const LicensesForm: React.FC<{ bColor: string, lineColor: string }> = ({ bColor, lineColor }) => {
  return <div className={styles.mainContainer}>
    <h1 className='shop-h1-periwinkle'>Now, Add Your Agency’s Licenses</h1>
    <h2>You may add or edit these later through your dashboard.</h2>
    <div className={styles.noticeBox} style={{ backgroundColor: bColor, marginBottom: 30 }}>
      <span style={{ backgroundColor: lineColor }}></span>
      <p className={styles.appointmentQuestion}>Add your health insurance licenses for the states in which you most frequently write business. You must add at least one license before proceeding.</p>
      <button type='button' className={styles.info} data-tip data-for='npnTooltip'>i</button>
      <Tooltip
        id='npnTooltip'
        place='bottom'
        offset={{ top: 0, right: 0 }}
        delayHide={100}
        backgroundColor='linear-gradient(135deg, #0B4BF7 0%, #8B17BB 100%)'
      >
        <span>You can look up your business’s state licenses on <a href='https://nipr.com' target='_blank' rel='noreferrer'>NIPR.com</a>.</span>
      </Tooltip>
    </div>
  </div>
}

export default LicensesForm
