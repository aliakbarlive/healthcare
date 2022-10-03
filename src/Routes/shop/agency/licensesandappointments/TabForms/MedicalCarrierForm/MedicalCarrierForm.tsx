import React from 'react'
import { useToggle } from 'react-use'
import styles from 'Routes/shop/agency/licensesandappointments/tabs.module.scss'
import formStyles from './MedicalCarrierForm.module.scss'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'
interface MedicalCarrierFormProps {
  showForm: boolean
  setShowForm: (nextValue?: any) => void
  bColor: string
  lineColor: string
}

const MedicalCarrierForm: React.FC<MedicalCarrierFormProps> = ({ showForm, setShowForm, bColor, lineColor }) => {
  const [showApplicationButton, setshowApplicationButton] = useToggle(false)
  const addToast = useToast()
  return <div className={styles.mainContainer}>
    <h1 className='shop-h1-periwinkle'>Add Your Agency’s Carrier Appointments</h1>
    <h2>You may add or edit these later through your dashboard.</h2>
    {/* This section to be implemented in ANKH-1681 */}
    <div className={styles.noticeBox} style={{ background: '#F4F4F4', marginBottom: 0 }}>
      <p className={styles.questionMark}>?</p>
      <p className={styles.appointmentQuestion}>Do you need to be appointed with these carriers? To help you get appointed, we provide applications for Allstate Benefits, The Health Benefit Alliance, Aflac, and Principal. Choose a carrier below to get started.</p>
    </div>
    <div className={formStyles.selectCarriersDiv} onClick={setshowApplicationButton}>
      <p>select carriers to get appointed with</p>
      { showApplicationButton
        ? <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.615 11.5574L9.5 4.68738L16.385 11.5574L18.5 9.44238L9.5 0.442383L0.5 9.44238L2.615 11.5574Z" fill="#16346F"/>
        </svg>
        : <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.615 0.442505L9.5 7.3125L16.385 0.442505L18.5 2.5575L9.5 11.5575L0.5 2.5575L2.615 0.442505Z" fill="#3C3C3C"/>
        </svg>
      }
    </div>
    { showApplicationButton && <div className={formStyles.ApplicationContainer}>
      <p className={formStyles.carrierText}>carrier</p>
      {selectCarrierEntry('Allstate Benefits')}
      {selectCarrierEntry('The Health Benefit Alliance')}
      {selectCarrierEntry('Aflac')}
      {selectCarrierEntry('Principal')}
    </div>
    }
    <AddQuestion showForm={showForm} setShowForm={setShowForm} bColor={bColor} lineColor={lineColor} />
  </div>

  function selectCarrierEntry(carrierName: string) {
    const appoint = () => api.v3.brokers.getAppointed(carrierName.replace('The ', ''))
      .then(() => addToast('Your Customer Solutions Specialist has been notified, and will be in touch very soon.', 'success'))
      .catch(addToast)
    return <div className={formStyles.carrierEntry}>
      <p>{carrierName}</p>
      <button type='button' onClick={appoint}>Get Appointed</button>
    </div>
  }
}

const AddQuestion: React.FC<{ setShowForm: (nextValue?: any) => void, showForm: boolean, bColor: string, lineColor: string }> = ({ setShowForm, showForm, bColor, lineColor }) => {
  return <div style={{ backgroundColor: bColor }} className={styles.addProducersQueryContainer}>
    <div className={styles.addProducersQuery}>
      <div className={styles.addProducersQueryButtons}>
        <button className={styles.yes} style={ showForm ? { backgroundColor: '#3564B9', color: '#FFFFFF' } : { backgroundColor: '#FFFFFF', color: '#3564B9' }} onClick={() => { setShowForm(true) }}>Yes</button>
        <button className={styles.no} style={ showForm ? { backgroundColor: '#FFFFFF', color: '#3564B9' } : { backgroundColor: '#3564B9', color: '#FFFFFF' }} onClick={() => { setShowForm(false) }}>No</button>
      </div>
      <div className={styles.addProducersQueryTextContainer}>
        <svg style={{ backgroundColor: lineColor, border: `4px solid ${lineColor}` }} className={styles.line} width="4" height="48" viewBox="0 0 4 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="2" y1="0.5" x2="2" y2="47.5" stroke="#6258D1" strokeWidth="4"/>
        </svg>
        <p>Would you like to search for and add your carrier appointments for those states?</p>
      </div>
    </div>
  </div>
}

export default MedicalCarrierForm
