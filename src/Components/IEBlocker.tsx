import React from 'react'
import chrome from 'Assets/Browsers/chrome-logo.svg'
import edge from 'Assets/Browsers/edge-logo.png'
import firefox from 'Assets/Browsers/firefox-logo.png'
import './IEBlocker.css'
import { Logo } from 'Header'

const IEBlocker: React.FC = () => {
  const securityRisks = <a href='https://www.forbes.com/sites/jasonevangelho/2019/04/15/warning-internet-explorer-just-became-a-silent-but-serious-threat-to-every-windows-user/#1b2c604486d8' target='_blank' rel="noopener noreferrer">security risks</a>
  return <div id='ie-blocker'>
    <Logo/>
    <h1>Internet Explorer is no longer supported.</h1>
    <p>Unsupported browsers can expose your computer to {securityRisks}. We recommend using an <br/>up-to-date version of one of these browsers.</p>
    <div>
      { <SupportedBrowser name='Google Chrome' src={chrome} href='https://www.google.com/chrome/' /> }
      { <SupportedBrowser name='Microsoft Edge' src={edge} href='https://www.microsoft.com/en-us/edge' /> }
      { <SupportedBrowser name='Mozilla Firefox' src={firefox} href='https://www.mozilla.org/en-US/firefox/' /> }
    </div>
  </div>
}

const SupportedBrowser: React.FC<{ name: string, src: string, href:string }> = ({ name, src, href }) =>
  <a href={href} target='_blank' rel="noopener noreferrer">
    <img src={src} alt={name}/>
    {name}
  </a>

export default IEBlocker
