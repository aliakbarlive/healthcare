import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import { classNames } from 'Utilities/etc'
import { useAppMode } from 'Components/Stargate/TableOfContents'

enum ContentMode {
  shop = 'shop',
  dashboard = 'dashboard'
}

function useContentMode() {
  const location = useLocation()
  const appMode = useAppMode()
  useEffect(go, [location])

  function go() {
    const el = document.getElementsByTagName('body')
    if (!el.length) return
    const isStargate = location.pathname.startsWith(Route.stargate)
    const classForMode = classNames(isStargate ? ContentMode.shop : ContentMode.dashboard, appMode)
    el[0].className = classForMode

    return () => {
      el[0].className = ''
    }
  }
}

export default useContentMode
