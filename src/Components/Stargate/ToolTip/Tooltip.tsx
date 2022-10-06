import React from 'react'
import styles from './Tooltip.module.scss'
import { ReactComponent as InfoIcon } from 'Assets/info_icon.svg'
import { ReactComponent as QuestionIcon } from 'Assets/question_icon.svg'
import ReactTooltip, { TooltipProps } from 'react-tooltip'
import { classNames } from 'Utilities/etc'

interface Props extends Omit<TooltipProps, 'type'> {
  id: string
  showCloseButton?: boolean
  closeButtonClassName?: string
  type?: 'info' | 'question'
}

const Tooltip: React.FC<Props> = ({ showCloseButton, type, children, closeButtonClassName, className, ...props }) => {
  return <ReactTooltip
    {...props}
    className={classNames(styles.tooltip, className)}
    effect={props.effect || 'solid'}
    delayHide={props.delayHide || 0}
    delayUpdate={props.delayUpdate || 500}
    type="light"
  >
    {closeButton()}
    {icon()}
    {children}
  </ReactTooltip>

  function closeButton() {
    if (!showCloseButton) return null
    return <button onClick={close} className={classNames(styles.close, closeButtonClassName)}>
      <i className="material-icons">close</i>
    </button>
  }
  function icon() {
    switch (type) {
    case 'info':
      return <InfoIcon className={styles.tooltipImg} />
    case 'question':
      return <QuestionIcon className={styles.tooltipImg} />
    }
  }
  function close() {
    ReactTooltip.hide()
  }
}

export default Tooltip
