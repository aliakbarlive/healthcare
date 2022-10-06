import React, { ReactElement } from 'react'
import styles from './Section.module.css'
import { Route } from 'Utilities/Route'
import { useLocation, useHistory } from 'react-router-dom'
import { classNames } from 'Utilities/etc'
import { GAButton } from 'Components/Tracking'
import { ShopType, ChapterName } from './'

export enum State {
  complete, furthest, inaccessible, hidden, er, ee
}

interface Props {
  title: string
  number: number
  sectionName: string
}

export const Section: React.FC<Props> = ({ children, title, number, sectionName }) => {
  const location = useLocation()
  const history = useHistory()
  const proplings = getProplings()
  const hasCurrentRoute = proplings.find(([route]) => route === location.pathname) !== undefined
  const sectionRouteClass = hasCurrentRoute ? sectionName === ShopType.employer ? styles.erCurrentSec : styles.currentSection : ''
  const signedInERCalss = number === 4 && styles.signInER
  const accessible = proplings.some(([, state]) => state !== State.inaccessible && state !== State.hidden)
  const sectionClass = accessible ? sectionName === ShopType.employer ? styles.activeER : styles.active : styles.inaccessible
  return <> <div className={styles.container}>
    <div onClick={go} className={classNames(styles.section, sectionClass)}>
      <div className={classNames(styles.chevron, accessible && styles.accessible)}/>
      <div className={styles.copy}>
        <h1>{number !== 4 && number}</h1>
        <h2 className={classNames(signedInERCalss, sectionRouteClass)}>{title}</h2>
      </div>
      { /* Must be last item, TODO do with CSS */ }
      {number === 3 && <div className={classNames(styles.chevron, accessible && styles.accessible)}/> }
    </div>
    <div className={classNames(styles.chapters, number === 4 && styles.signedInAs)}>
      <div style={{ borderBottom: `15px solid ${arrowBorderColor()}` }} className={styles.arrow}/>
      {children}
    </div>
  </div>
  </>

  function arrowBorderColor() {
    switch (proplings[0][1]) {
    case State.inaccessible:
    case undefined:
      return '#E2E2E2'
    case State.furthest:
      return '#D4F9EF'
    case State.complete:
      return '#FFFFFF'
    }
  }
  function go() {
    let dst: Route | undefined
    for (const [route, state] of proplings) {
      switch (state) {
      case State.hidden:
        continue // skip
      case State.inaccessible:
        break // k, use whatever we have
      case State.complete:
      case State.furthest:
        dst = route // assign, but there may be something further along so keep looping
      }
    }
    if (dst) history.push(dst)
  }
  function getProplings() {
    // mysteriously React.Children.map flattens an array of tuples ∴ `forEach`
    const proplings: [Route, State][] = []
    React.Children.forEach(children as any, (chapter: ReactElement) => proplings.push([chapter.props.destination, chapter.props.state]))
    return proplings
  }
}

interface ChapterProps {
  title: string
  description?: string
  destination: Route
  state?: State
  chapName: string
}

export const Chapter: React.FC<ChapterProps> = ({ state, title, description, destination, chapName }) => {
  const history = useHistory()
  const active = destination === useLocation().pathname
  const classes = [styles.chapterContainer, chapName === ChapterName.employerChap && styles.erChapterContainer, active && styles.activeChapter, chapName === ChapterName.employerChap ? active && styles.erActiveChapter : '']
  if (state === undefined) throw new Error('Programmer Error')
  if (state === State.hidden) return <></>
  return <GAButton analytics={`${title} (TableOfContents)`} onClick={go} className={classNames(classes)} disabled={state === State.inaccessible}>
    <div>
      {state as State === State.complete && <Check />}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </GAButton>

  function go() {
    history.push(destination)
  }
}

const Check = () =>
  <div className={styles.check}>
    <i className='material-icons'>check</i>
  </div>
