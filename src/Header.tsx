/* eslint-disable camelcase */
import React from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import styles from './Header.module.scss'
import { Route } from 'Utilities/Route'
import HeaderUserProfile from 'Components/Anubis/HeaderUserProfile'
import * as config from 'Utilities/config'
import { Host } from 'Utilities/config'
import api from 'Utilities/Deprecated/api'
import useStargate, { useSupportPhone } from 'Utilities/Hooks/useStargate'
import { labelShortCode, logo, useWhiteLabel } from 'Utilities/Hooks/useWhiteLabel'
import useUser, { PowerLevel, Response as User } from 'Utilities/Hooks/useUser'
import { v3 } from 'Utilities/pharaoh'
import { GAButton } from 'Components/Tracking'
import { classNames } from 'Utilities/etc'
import useToast from 'Utilities/Hooks/useToast'
import { Img } from 'react-image'
import { Broker } from 'Utilities/pharaoh.types'
import DashboardHeader from 'Components/Anubis/DashboardHeader'

enum ChapterName {
  erSignIn = 'signAsEr', eeSignIn = 'signAsEE'
}

interface Venues {
  groups: { id: string, name: string, agencyName: string }[]
  anubis: { ee: string[], er: string[], agency: boolean }
  stargate: { ee: string[], er: string[] }
}
const WhiteLabelLogo: React.FC = () => {
  const { label: label_, title } = useWhiteLabel()
  const path = useLocation().pathname

  if (!path.startsWith('/shop')) return null

  let label: config.Label = label_

  if (path.endsWith('/get-started')) {
    try {
      const shortcode = labelShortCode(localStorage.label || '')
      label = config.Label[shortcode]
    } catch {
      // no-op
    }
  }

  switch (label) {
  case config.Label.blacksmith:
    return <div style={{ margin: '1rem' }}>Blacksmith Automotive</div>
  case null:
  case undefined:
  case config.Label.myhealthily:
    return null
  default:
    return <img
      src={logo(label)}
      className={styles.logo}
      alt={`${title} Logo`}
      title={`${title} in association with MyHealthily`} />
  }
}

const MJMLogo = () => {
  return <img
    className={styles.logo}
    style={{ height: '1.7rem' }}
    alt='MyHealthily Logo'
    title='MyHealthily'
    src='https://app.myhealthily.com/logo.svg'
    id='mjm' />
}

export const Logo = () => {
  return <>
    <MJMLogo />
    <WhiteLabelLogo />
  </>
}

const Masthead: React.FC = ({ children }) => <div className={styles.header}>
  <Link to='/' className={styles.logos}>
    <Logo />
  </Link>
  {children}
</div>

function InnerMasthead() {
  const pathname = useLocation().pathname
  const showHelp = pathname.startsWith(Route.stargate) && !pathname.startsWith(`${Route.stargate}/employee`)
  const rv = []
  const { value: user } = useUser()
  addDevelopMetadata()
  const stargate = useStargate().value
  const userData = stargate?.user
  const UserName = `${userData?.first_name || ''} ${userData?.last_name || ''}`
  const async = useUser<[User, Venues, Broker]>(async user => {
    const venues = await v3.users().venues() as Venues
    const broker = await v3.brokers.GET() as Broker
    return [user, venues, broker]
  })
  const asynVal = async?.value?.[1]
  const stargateERs = asynVal?.anubis.er
  const GroupNameER = stargate?.group?.name || ''
  const GroupNameEE = stargate?.group?.name || ''
  const userLevels = async?.value?.[0].powerLevel
  const imgSrc = user?.avatar
  const firstTime = asynVal?.groups.find(item => item.id === stargateERs?.[0])?.name || ''
  const pl5GrpName = GroupNameER === firstTime ? 'MyHealthily' : GroupNameER
  const showUserLine = (GroupNameER.length > 0 && GroupNameEE.length > 0) && (userLevels === 5)
  // test user Levels
  const groupLabel: any = ['Employee', 'Employer', '', 'Producer', 'Principal', 'MyHealthily Employee']
  const groupLabelForEE: any = ['Employee', 'Employee', '', '', '', 'MyHealthily Employee']
  const agencyLevelUser = [PowerLevel.broker, PowerLevel.superBroker]
  const showUserEe = [PowerLevel.individual, PowerLevel.groupManager, PowerLevel.candorEmployee]
  const showUserPlEe = [PowerLevel.candorEmployee, PowerLevel.groupManager]

  const showUserPlEeOverLay = checkUserLevel(showUserPlEe, userLevels)
  const TestuserPLEr = checkUserLevel(agencyLevelUser, userLevels)
  const testuserPLEe = checkUserLevel(showUserEe, userLevels)
  const AgencyName = (TestuserPLEr && async!.value?.[2]?.agency?.name) || ''
  const userLabel = userLevels !== undefined ? groupLabel[userLevels] : ''
  const userLabelEE = userLevels !== undefined ? groupLabelForEE[userLevels] : ''
  const GrpLevelNameEr = `${userLabel}`
  const GrpLevelNameEe = `${testuserPLEe ? userLabelEE : ''}`
  if (showHelp) {
    rv.push(<Help key='1' />, <SignedAsEr key='2' GrpLevelNameEr={GrpLevelNameEr} pl5GrpName ={pl5GrpName} AgencyName ={AgencyName} GrpLevelNameEe={GrpLevelNameEe} showOverLay = {TestuserPLEr} groupNameER={GroupNameER} groupNameEE={GroupNameEE} userName={UserName} imgSrc={imgSrc} stargateERs= {stargateERs} userLevels={userLevels} showUserLine= {showUserLine} />)
  } else if (!pathname.startsWith('/account')) {
    rv.push(<HeaderUserProfile key='3' />, <SignedAsEe key='4' GrpLevelNameEr={GrpLevelNameEr} pl5GrpName ={pl5GrpName} GrpLevelNameEe={GrpLevelNameEe} AgencyName ={AgencyName} showOverLay = {showUserPlEeOverLay} groupNameER={GroupNameER} groupNameEE={GroupNameEE} userName={UserName} imgSrc={imgSrc} stargateERs= {stargateERs} userLevels={userLevels} showUserLine= {showUserLine}/>)
  }
  return rv

  function checkUserLevel(arr:PowerLevel[], val:PowerLevel | undefined) {
    return arr.some(item => item === val)
  }

  function addDevelopMetadata() {
    switch (config.host()) {
    case Host.develop:
    case Host.staging:
      if (process.env.REACT_APP_GIT_SHA) {
        rv.push(<span key='4'>{process.env.REACT_APP_GIT_SHA}</span>)
      }
    }
  }
}

const Header: React.FC = ({ children }) => {
  return <header className={styles.static}>
    <Masthead>
      {InnerMasthead()}
    </Masthead>
    {children}
  </header>
}

const Help = () => {
  const supportPhone = useSupportPhone().replace(/ /g, '\xa0') // Non Breaking space
  const isAgencyShop = useLocation().pathname.startsWith('/shop/agency')
  if (isAgencyShop) return <DashboardHeader key='2' />
  return <div className={styles.help}>
    <div className={styles.inner}>
      <p>If&nbsp;you&nbsp;have&nbsp;questions&nbsp;or&nbsp;need&nbsp;help&nbsp;call:</p>
      <p className={styles.bigger}>&#32;{supportPhone}</p>
      <p className={styles.smaller}>Mon&nbsp;–&nbsp;Fri,&nbsp;8:00AM&nbsp;–&nbsp;9:00PM&nbsp;EST</p>
    </div>
  </div>
}

interface Props {
  userName: string
  groupNameER: string
  groupNameEE: string
  stargateERs: string[] | undefined
  GrpLevelNameEr: string
  GrpLevelNameEe: string
  showOverLay: boolean
  imgSrc: string | HTMLImageElement | any
  userLevels: PowerLevel | undefined
  AgencyName:string
  showUserLine: boolean
  pl5GrpName: string
 }

const SignedAsEr: React.FC<Props> = ({ userName, groupNameER, pl5GrpName, showUserLine, GrpLevelNameEr, showOverLay, imgSrc, userLevels, AgencyName }) => {
  const routeName = useLocation().pathname
  const isShopErRoute = routeName.startsWith('/shop/employer') || routeName.includes('/get-started')
  const groupInitials = showOverLay ? ErInitials(AgencyName) : ErInitials(groupNameER)
  const showGN = userLevels === 5 ? pl5GrpName : groupNameER
  return <> {isShopErRoute &&
    <div className={styles.signInContainer}>
      <div className={styles.avater}>
        {imgSrc ? <Img src={imgSrc} alt ='logo' /> : <span className= {styles.groupInitial}>{groupInitials}</span>}
      </div>
      <div>
        <p className={styles.erSigned}>Signed in to <span className={`${styles.signedAsEe} ${styles.signedAsEr}`}>
          Employer Shop</span> { showGN && <> for<span className={`${styles.signedAsEe} ${styles.signedAsEr}`}>  {showGN}</span> </>}
        </p>
        <label className={styles.dashEmployer}>{` ${GrpLevelNameEr}`}</label>
      </div>
      {/* there will be no overlay for Principal(PL4) and producer (PL3) */}
      {!showOverLay ? <>
        <div className={`${styles.ChapterContainer}`}>
          {userLevels === 1 ? <> <p className={`${userName ? styles.userName : ''}`}> {userName} </p>
            {showGN && <SignedASChapter title={`${showGN} Employer`} destination={Route.eeStargate_info} keyVal='1' chapterName={ChapterName.erSignIn} />}
            {showGN && <SignedASChapter title={`${showGN} Employee`} destination={Route.eeStargate_info} keyVal='2' chapterName={ChapterName.erSignIn} />}
          </> : '' }
          {/* only PL5 user can use SuperUser Action */}
          { userLevels === 5 ? <SwitchUser showUserLine={showUserLine} /> : '' }
        </div>
      </> : ''}
    </div>
  }
  </>

  function ErInitials(str:string) {
    return typeof str === 'string' && str.split(' ').map((item: string) => item[0]).join('')
  }
}

const SignedAsEe: React.FC<Props> = ({ userName, groupNameEE, showUserLine, GrpLevelNameEe, showOverLay, imgSrc, userLevels }) => {
  const routePath = useLocation().pathname
  const isShopEeRoute = routePath.startsWith('/shop/employee')
  const groupInitials = typeof userName === 'string' && userName.split(' ').map((item: string) => item[0]).join('')
  const showGN = userLevels === 5 ? 'MyHealthily ' : groupNameEE
  return <> {isShopEeRoute &&
    <div className={styles.signInContainer}>
      <div className={styles.avater}>
        {imgSrc ? <Img src={imgSrc} alt ='logo' /> : <span className= {styles.groupInitial}>{groupInitials}</span>}
      </div>
      <div>
        <p className={styles.erSigned}>Signed in to <span className={styles.signedAsEe}>Employee Shop </span>
          { (groupNameEE || userLevels === 5) && <>for <span className={`${styles.signedAsEe} ${styles.signedAsEe}`}>{showGN}</span> </>}
        </p>
        {GrpLevelNameEe && <label className={styles.dashEmployer}>{`${userLevels === 5 ? 'MyHealthily Employee' : GrpLevelNameEe} `}</label>}
      </div>
      {showOverLay && <div className={styles.ChapterContainer}>
        {userLevels === 1 ? <> <p className={`${userName ? styles.userName : ''}`}> {userName} </p>
          {showGN && <SignedASChapter title={`${showGN} Employee`} destination={Route.erStargate_GetStarted} keyVal='4' chapterName={ChapterName.eeSignIn} />}
          {showGN && <SignedASChapter title={`${showGN} Employer`} destination={Route.erStargate_GetStarted} keyVal='3' chapterName={ChapterName.eeSignIn} />}
        </> : ''}
        {/* only PL5 user can use SuperUser Action */}
        { userLevels === 5 ? <SwitchUser showUserLine={showUserLine} /> : '' }
      </div>}
    </div>
  }
  </>
}

export default Header

interface ChapterProps {
  title: string
  destination: Route
  keyVal: string
  chapterName: string
  imgSrc?: HTMLImageElement
}

const SignedASChapter: React.FC<ChapterProps> = ({ title, destination, keyVal, chapterName }) => {
  const history = useHistory()
  const erClass = keyVal === '1'
  const eeClass = keyVal === '4'
  const showCheck = erClass || eeClass
  const chapNameEr = chapterName === ChapterName.erSignIn
  const classes = [styles.chapterBtnContainer, chapNameEr && styles.erChapter, erClass && styles.activeEr, eeClass && styles.activeEe]
  return <div>
    <GAButton analytics={`${title} Button`} onClick={go} className={classNames(classes)}>
      <div className={styles.chapterCont}>
        {showCheck && <Check />}
        <h3 className={`${styles.titleFont} ${showCheck && styles.activeFont}`}>{title}</h3>
      </div>
    </GAButton>
  </div>
  function go() {
    !showCheck && history.push(destination)
  }
}

const Check = () =>
  <div className={styles.check}>
    <i className='material-icons'>check</i>
  </div>

interface SwitchUser {
  showUserLine: boolean
  }

const SwitchUser: React.FC<SwitchUser> = ({ showUserLine }) => {
  const [email, setEmail] = React.useState('')
  const toast = useToast()
  const history = useHistory()
  const classes = [styles.candorInput, styles.placeholder ? styles.hasPlaceholder : '']

  return <div className={styles.switchContainer}>
    <p className={`${styles.superUser} ${(!showUserLine) ? styles.superUserBar : ''}`}>Super User Actions</p>
    <p className={styles.superUserFnc}>As a superuser, you are able to switch between user accounts.</p>
    <div style={{ position: 'relative' }}>
      <input name='Email Address' onChange={(e) => setEmail(e.target.value)} placeholder='Email Address' className={classNames(classes)} />
      <label className={styles.label}>Email Address</label>
    </div>
    <div className={styles.btnContainer}>
      <GAButton analytics={`superUser Action ${SwitchUser.name}`} onClick={switchToUser} className={styles.superUserBtn}>
        <h4>Switch User</h4>
      </GAButton>
    </div>
  </div>

  function switchToUser() {
    api.switchToUser(email)
      .then(rsp => {
        localStorage.setItem('token', rsp.token)
        history.push('/')
        window.location.reload()
      })
      .catch(toast)
  }
}
