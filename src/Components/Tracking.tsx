import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga'
import { analyticsTrackers, Label, pageSenseID } from 'Utilities/config'

const Tracking: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    ReactGA.pageview(location.pathname, analyticsTrackers())
  }, [location.pathname])

  return <React.Fragment />
}

const pageSenseScript = (psID: string | undefined) => psID ? `https://cdn.pagesense.io/js/candorusa/${psID}.js` : ''

interface PSSProps {
  whiteLabel: Label
}

export const PageSenseSnippet: React.FC<PSSProps> = ({ whiteLabel }) => {
  const [prevWLabel, setPrevWLabel] = useState<Label>()
  const existing = document.querySelector('script[data-name="pageSenseScript"]') as HTMLScriptElement
  useEffect(() => {
    if (whiteLabel !== prevWLabel) {
      if (existing && existing.parentElement) existing.parentElement.removeChild(existing)
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.setAttribute('data-name', 'pageSenseScript')
      script.src = pageSenseScript(pageSenseID(whiteLabel))
      const x = document.getElementsByTagName('script')[0]
      if (x.parentNode) x.parentNode.insertBefore(script, x)
      setPrevWLabel(whiteLabel)
    }
  })
  return <React.Fragment />
}

export interface GAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  analytics: string
}

export const GAButton: React.FC<GAButtonProps> = props => {
  function onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ReactGA.event({
      category: 'Button Press',
      action: props.analytics,
      label: window.location.pathname
    }, analyticsTrackers())
    if (props.onClick) {
      props.onClick(event)
    }
  }
  return <button {...props} onClick={onClick}>
    {props.children}
  </button>
}

// export const GAAnchor: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = props => {
//   return <ReactGA.OutboundLink
//     eventLabel='Clicked an outbound link'
//     to={props.href || ''}
//     target={props.target || '_self'}
//   >
//     <a {...props}>
//       {props.children}
//     </a>
//   </ReactGA.OutboundLink>
// }

export default Tracking
