import React from 'react'
import ReactTooltip, { Place } from 'react-tooltip'
import styles from './Annotation.module.scss'

interface Props {
  definition: string
  place?: Place // default is 'right'
  id: string // must be unique to the current DOM
}

interface UghThanksForNothingTypeScript {
  waive: string
  carrier: string
}

const Annotation: React.FC<Props> & UghThanksForNothingTypeScript = ({ children, place, id, definition }) => {
  // FIXME we should set the title property for accessibility reasons
  // but this causes the browser to show the tooltip AS WELL, which looks bad
  // FIXME ReactTooltip is broken and first render positions the tooltip wrong
  // https://github.com/wwayne/react-tooltip/issues/374
  return <>
    <abbr data-tip data-for={id} className={styles.abbr}>
      {children}
    </abbr>
    <ReactTooltip id={id} effect='solid' place={place || 'right'} backgroundColor='#29B573' className={styles.tooltip}>
      {definition}
    </ReactTooltip>
  </>
}

// only add definitions here for DRY reasons
Annotation.waive = 'An employee that waives is declaring they do not wish to take that benefit.'
Annotation.carrier = 'The carrier provides the services promised by their plans.'

export default Annotation
