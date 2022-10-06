import React from 'react'
import style from './backToTop.module.scss'

const BackToTop: React.FC = () => {
  const [showScrol, setShowScroll] = React.useState(false)

  const CheckScroll = () => {
    if (!showScrol && window.pageYOffset > 400) {
      setShowScroll(true)
    } else if (showScrol && window.pageYOffset <= 400) {
      setShowScroll(false)
    }
  }
  const ScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  window.addEventListener('scroll', CheckScroll)

  return (<>
    <p className={style.backToTop} onClick={ScrollTop} style={{ display: showScrol ? 'block' : 'none' }}>Back to Top</p>
  </>
  )
}

export default BackToTop
