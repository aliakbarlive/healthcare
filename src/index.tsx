import 'core-js'
import 'proxy-polyfill'
import 'date-input-polyfill-react'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import ReactModal from 'react-modal'
import { BrowserRouter as Router } from 'react-router-dom'
import ReactGA from 'react-ga'
import { analytics, analyticsTrackers, host, Host } from 'Utilities/config'
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import 'react-datepicker/dist/react-datepicker.css' // FIXME is this necessary?
import 'fast-text-encoding/text'
import IEBlocker from 'Components/IEBlocker'

ReactModal.setAppElement('#root')

// Google Analytics
ReactGA.initialize(analytics())

// Google Tag Manager
// FIXME not sure how to fix this or what it is for
// if (tagManager()) {
//   ReactGTM.initialize({ gtmId: tagManager()! })
// }
// export function tagManager() {
//   switch (host()) {
//   case Host.production:
//     switch (label()) {
//     case Label.fbhc: return 'GTM-WSFJK6H'
//     }
//     break
//   default:
//     return undefined
//   }
// }

// Enable GA test mode for non-production hosts
if (host() !== Host.production) {
  ReactGA.set({ testMode: true }, analyticsTrackers())
}
// Enable GA debugging on localhost
if (host() === Host.localhost) {
  ReactGA.set({ debug: true }, analyticsTrackers())
}
if (window.performance) {
  const timeSinceLoad = Math.round(window.performance.now())
  ReactGA.timing({
    category: 'JS Libraries',
    variable: 'load',
    value: timeSinceLoad
  }, analyticsTrackers())
}

const isIE = navigator.userAgent.indexOf('Trident/') > 0
if (isIE) {
  ReactDOM.render(<IEBlocker/>, document.getElementById('root'))
} else {
  ReactDOM.render(<Router basename={process.env.REACT_APP_BASENAME}>
    <App />
  </Router>, document.getElementById('root'))
}
