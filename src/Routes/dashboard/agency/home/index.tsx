import React from 'react'
import styles from './index.module.scss'
import TodoList from 'Components/Anubis/TodoList'
import useUser from 'Utilities/Hooks/useUser'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { useToggle } from 'react-use'
import TermsModal from 'Components/Modals/TnC'
import useStargate, { Agency } from 'Utilities/Hooks/useStargate'

interface Notification {
  type: NotificationType
  client: string
  id: string
}

enum NotificationType {
  newProducer = 'newProducer',
  qle = 'qle',
  policyIssued = 'policyIssued'
}

function titleFor(type: NotificationType): string {
  switch (type) {
  case NotificationType.newProducer: return '(Sample) New producer signed up'
  default: return type
  }
}

const DashboardAgencyHome: React.FC = () => {
  const { loading, error, value: user } = useUser()
  const { loading: loading2, error: error2, value: stargate } = useStargate()
  const [isShowingTermsModal, toggleTandCModal] = useToggle(false)

  if (loading || loading2) return <Loader />
  if (error) return <Error error={error} />
  if (error2) return <Error error={error2} />

  const customerSupportSpecialist = cssForAgency(stargate?.agency)
  const brokerSales = salesForAgency(stargate?.agency)

  const notifications: Notification[] = [{ type: NotificationType.newProducer, client: 'Test Client', id: '1' }]

  return <>
    <div>
      <h1>Home</h1>
    </div>
    <div className={styles.container}>
      <div className={styles.tablContainer}>
        <div className={styles.innerT}>
          <div style ={{ display: 'block' }}>
            <table className={styles.homeTable}>
              <thead>
                <tr>
                  <th style={{ width: '42%' }}>
                    <div>Notification</div>
                  </th>
                  <th style={{ width: '25%' }} >
                    <div>Client</div>
                  </th>
                  <th style={{ width: '16%' }}><div></div></th>
                  <th style={{ width: '16%' }}><div></div></th>
                </tr>
              </thead>
              <tbody>
                { notifications.map(n => <>
                  <tr>
                    <td>{titleFor(n.type)}</td>
                    <td >{n.client}</td>
                    <td className={styles.btnCell}> <button className={styles.viewButton} >VIEW</button></td>
                    <td className={styles.btnCell}> <button className={styles.dismisBtn}>dismiss</button></td>
                  </tr>
                </>)}
              </tbody>
            </table>
          </div>
          <div className={styles.myHealthInfo}>
            <div className={styles.myHealthily}>
              <h2> Your MyHealthily Team</h2>
            </div>
            <div className={styles.knowelContainer}>
              <div className={styles.knowel}>
                <div className={styles.beyonceCont}>
                  <span>{customerSupportSpecialist.name}</span>
                  <span>Customer Solutions Specialist</span>
                </div>
                <p>
                  <span>Phone: {customerSupportSpecialist.phone}</span>
                  <br/>
                  <span>Email: {customerSupportSpecialist.email}</span>
                </p>
              </div>
              <div className={styles.jay_z}>
                <div className={styles.beyonceCont}>
                  <span>{brokerSales.name}</span>
                  <span>Broker Sales</span>
                </div>
                <p>
                  <span>Phone: {brokerSales.phone}</span>
                  <br/>
                  <span>Email: {brokerSales.email}</span>
                </p>
              </div>
            </div>
            <div className={styles.onBoardBtn}>
              <button className="Table_downloadReport__TCD6d" onClick={openGuide}>
                <i className="material-icons">cloud_download</i>
                  download onboarding guide
              </button>
            </div>
            <div className={styles.tAndC}>
              <TermsModal isOpen={isShowingTermsModal} onClose={toggleTandCModal} />
              <a onClick={toggleTandCModal}>MyHealthily Terms and Conditions</a>
            </div>
          </div>
        </div>
        <div className={styles.todoList}>
          <TodoList id={user!.id} />
        </div>

      </div>
    </div>
  </>
}

function openGuide() {
  window.open('https://public.myhealthily.com/uploads/MyHealthily%20Agency-Producer%20Onboarding%20Guide%201-2022.pdf', '_blank')
}

interface MyHealthilyContact {
  name: string
  phone: string
  email: string
}

function cssForAgency(agency: Agency | undefined): MyHealthilyContact {
  if (agency && agency.state === 'NJ') {
    return { name: 'Karen Grant', phone: '(912) 600-2224', email: 'karen@myhealthily.com' }
  }
  return { name: 'Victoria P. Martinez', phone: '(912) 525-2485', email: 'victoria@myhealthily.com' }
}

function salesForAgency(_agency: Agency | undefined): MyHealthilyContact {
  return { name: 'Jeremy McLendon', phone: '(706) 254-7370', email: 'jeremy@myhealthily.com' }
}

export default DashboardAgencyHome
