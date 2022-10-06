import React from 'react'
import SlashesLoader from './SlashesLoader'
import styles from './Interstitial.module.scss'
import { useToggle, useWindowSize } from 'react-use'
import { motion, useAnimation } from 'framer-motion'

interface Props {
  title?: string
  state: State
}

export enum State {
  loading, ready, exiting
}

const Interstitial: React.FC<Props> = ({ state, children }) => {
  const [isOpen, close] = useToggle(true)
  const controls = useAnimation()
  const infoAndAffirmsVelocity = useWindowSize().height * 0.00025

  if (state === State.ready && (!isOpen || isBasic())) {
    hideInterstitial()
  } else if (state === State.ready) {
    slideInfoAndAffirm()
  } else {
    loadingAnimation()
  }

  return <motion.div
    animate={controls}
    className={styles.bg}
    onHoverStart={() => controls}
  >
    <div className={styles.container} style={{ pointerEvents: isOpen ? 'all' : 'none' }}>
      {renderChildren()}
    </div>
    <SlashesLoader style={{ visibility: state === State.ready ? 'hidden' : 'initial' }}/>
  </motion.div>

  function renderChildren() {
    if (React.Children.count(children) <= 0) return
    const child = React.Children.only(children)
    if (typeof child === 'string') {
      return <h2>{child}</h2>
    } else {
      return <div className={styles.infoAndAffirmationsContainer}>
        {state === State.ready && <div className={styles.close} onClick={close} />}
        {child}
      </div>
    }
  }

  function isBasic() {
    if (React.Children.count(children) <= 0) return true
    const child = React.Children.only(children)
    return typeof child === 'string'
  }

  function hideInterstitial() {
    controls.stop()
    controls.start({
      backgroundColor: 'rgba(255, 255,255, 0)',
      pointerEvents: 'none',
      top: 'unset',
      bottom: 0,
      transition: { duration: isBasic() ? 0.25 : 0 }
    }).then(() =>
      controls.start({
        height: '0',
        opacity: 0,
        transition: { duration: isBasic() ? 0.25 : 0.18 }
      })
    )
  }

  function loadingAnimation() {
    controls.stop()
    controls.start({
      height: '100vh',
      transition: { duration: 0 }
    }).then(() =>
      controls.start({
        opacity: 1,
        backgroundColor: 'rgba(255, 255,255, 1)',
        transition: { duration: 0.15 }
      })
    )
  }

  function slideInfoAndAffirm() {
    controls.stop()
    controls.start({
      backgroundColor: 'rgba(255, 255,255, 0)',
      pointerEvents: 'none',
      transition: { duration: 0.25 }
    }).then(() =>
      controls.start({
        height: '340px',
        top: 'unset',
        transition: { duration: infoAndAffirmsVelocity, ease: [0.3, 0.2, 0.4, 0.9] }
      })
    )
  }
}

export default Interstitial
