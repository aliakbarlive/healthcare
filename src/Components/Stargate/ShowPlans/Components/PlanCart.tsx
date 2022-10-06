import React, { useEffect } from 'react'
import styles from './PlanCart.module.scss'
import FooterStyles from 'Components/Stargate/RefactorMe.module.css'
import PlanCartItem from './PlanCartItem'
import Loader from 'Components/Rudimentary/Loader'
import { useEffectOnce, useMeasure, useToggle } from 'react-use'
import { Broker, MedicalPlan } from 'Utilities/pharaoh.types'
import { motion, useMotionValue } from 'framer-motion'
import { GAButton } from 'Components/Tracking'
import CommissionsModal from 'Routes/dashboard/agency/clients/ID/Proposals/CommissionsModal/CommissionsModal'
import { ProposalGroupInfo, TierCount } from 'Routes/dashboard/agency/clients/ID/Proposals/Proposal'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'

interface Props {
  selectedPlans: MedicalPlan[]
  removePlan: (plan: MedicalPlan) => void
  compare: () => void
  editingCart: boolean
  NBtnAnalytics:string
  NBtnonClick: () => void
  broker: Broker
  groupInfo: ProposalGroupInfo
  enrollCount: TierCount
}

const PlanCart: React.FC<Props> = ({ selectedPlans, removePlan, compare, editingCart, NBtnAnalytics, NBtnonClick, broker, groupInfo, enrollCount }) => {
  const [modalVisible, setModalVisible] = useToggle(false)
  const { value: user } = useUser()
  const canPropose = user && user?.powerLevel >= PowerLevel.broker

  useEffectOnce(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })
  useEffect(handleScroll)
  const visible = selectedPlans.length > 0
  const [mouseDown, toggleMouseDown] = useToggle(false)
  const [ref, { width: containerWidth }] = useMeasure()
  const cellWidths = selectedPlans.length * 185
  const offset = (cellWidths - containerWidth) * -1
  const allowDrag = cellWidths > containerWidth
  const x = useMotionValue(0)

  if (!visible) return null

  return <div className={styles.container}>
    { editingCart && renderLoading() }
    <div className={styles.content}>
      <div
        className={styles.planContainer}
        ref={(ref as any)}
        style={{
          overflowX: allowDrag ? 'scroll' : 'hidden',
          marginLeft: 0
        }}>
        <motion.div
          drag={allowDrag && 'x'}
          dragConstraints={{ left: offset, right: 0 }}
          style={{
            cursor: allowDrag ? mouseDown ? 'grabbing' : 'grab' : 'inherit',
            x
          }}
          onMouseDown={toggleMouseDown}
          onMouseUp={toggleMouseDown}
        >
          {selectedPlans.slice(0).reverse().map(plan => <PlanCartItem key={plan.id} plan={plan} remove={handleRemove}/>)}
        </motion.div>
      </div>
      <GAButton analytics={`Compare (${PlanCart.name})`} className={styles.compareBtn} onClick={compare}>Compare</GAButton>
      { canPropose && <>
        <GAButton analytics='Generate Proposal ERShop' className={styles.proposalBtn} onClick={setModalVisible}>Generate Proposal</GAButton>
        <CommissionsModal isOpen={modalVisible} onRequestClose={ setModalVisible} broker={broker} group={groupInfo} enrollCount={enrollCount} cartPlans={selectedPlans} />
      </> }
      <div className={styles.nBtn}>
        <GAButton analytics={NBtnAnalytics} className={styles.nextBtn} onClick={NBtnonClick}>Next</GAButton>
      </div>
    </div>
  </div>

  function handleScroll() {
    const cart = document.getElementsByClassName(styles.container)[0] as HTMLElement
    const footer = document.getElementsByClassName(FooterStyles.footer)[0]

    // When an employee goes to the next page,
    // the element with the classname "container" will no longer exist,
    // so don't do anything with this function.
    if (!cart || !footer) return

    // https://stackoverflow.com/a/45514790
    const footerBounds = footer.getBoundingClientRect()
    const isOverlapping = (footerBounds.top + footerBounds.height) >= 0 && (footerBounds.top - footerBounds.height) <= window.innerHeight
    const offset = window.innerHeight - footerBounds.top
    if (isOverlapping && offset > 0) {
      cart.style.bottom = offset + 'px'
    } else {
      cart.style.bottom = '0'
    }
  }

  function handleRemove(plan: MedicalPlan) {
    removePlan(plan)
    const nextOffset = -((offset * -1) - 185)
    if (nextOffset > 0) {
      x.set(0)
    } else if (x.get() <= nextOffset) {
      x.set(nextOffset) // Need to do this or else there will be a gap after delete if scrolled/dragged all the way right
    }
  }

  function renderLoading() {
    return <div className={styles.loading}>
      <Loader/>
    </div>
  }
}

export default PlanCart
