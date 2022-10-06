import React, { CSSProperties, useEffect } from 'react'
import ReactModal from 'react-modal'
import styles from './Modal.module.scss'
import ReactGA from 'react-ga'
import { classNames } from 'Utilities/etc'
import { GAButton } from 'Components/Tracking'
import Loader from 'Components/Rudimentary/Loader'

// TODO Design and add loader mechanism

export interface ModalProps extends Omit<ReactModal.Props, 'style'> {
  /* Used to track modal statistics in google analytics */
  /* Can skip, we use PageSense now */
  gaModalName?: string

  // CSSProperties to be applied to the modal
  style?: CSSProperties

  /*
    You can either pass in a string for the title or your own custom header component.
    Note the close button will stay in it's position for better consistency unless overridden using closeButtonStyle or closeButtonClassName.
  */

  header: string | React.ReactNode

  /* CSSProperties to be applied to the header. Use sparingly for better consistency. */
  headerStyle?: React.CSSProperties

  /* String className to be applied to the header. Use sparingly for better consistency. */
  headerClassName?: string

  /* CSSProperties to be applied to the Close button. Avoid changing it's position. Use sparingly for better consistency. */
  closeButtonStyle?: React.CSSProperties

  /* String className to be applied to the Close button.. Avoid changing it's position. Use sparingly for better consistency. */
  closeButtonClassName?: string

  /* CSSProperties to be applied to the content. Use sparingly for better consistency. */
  contentStyle?: React.CSSProperties

  /* String className to be applied to the content. Use sparingly for better consistency. */
  contentClassName?: string

  /* If your modal needs to perform any actions. Stick em here. in order from left to right */
  footerButtons?: ModalActionButton[]

  /* CSSProperties to be applied to the footer. Use sparingly for better consistency. */
  footerStyle?: React.CSSProperties

  /* String className to be applied to the footer. Use sparingly for better consistency. */
  footerClassName?: string

  /* If you want to pass along a state to the modal */
  loading?: boolean
}

export type ModalActionButton = MABaseProps & (MAButton | MAInputSubmit | MAInputButton | MALink)

type MABaseProps = {
  /*
    Base props for all footer buttons.
    Note: all buttons are wrapped in a div to pass down the color css variable
  */

  /* Used to define the base style and purpose of the button */
  actionType: ActionType

  /* Will color the button accordingly */
  color: BrandColors

  /* To disable your button */
  disabled?: boolean

  /* CSSProperties to be applied to the footer. Use sparingly for better consistency. */
  style?: React.CSSProperties

  /* String classname to be applied to the footer button. Use sparingly for better consistency. */
  className?: string

  /* Define whether you want it to show up on the left or right side of the footer */
  alignment?: ButtonAlignment
}

type MAButton = {
  /* The following set of props are used when you want add a <button/> */

  /* Used to track button statistics in google analytics */
  /* Can skip, we use PageSense now */
  gaButtonName?: string

  onClick(e: any): void

  /* Your button copy */
  content: string | React.ReactNode

  /* No need to pass these if adding a <button/> */
  value?: never
  inputType?: never
  formId?: never
  href?: never
}

type MAInputSubmit = {
  /* The following set of props are used when you want add an <input type='submit'/> */

  /* Your button copy */
  value: string

  inputType: 'submit'

  /* Pass the id of your form since this will be outside of the <form/> */
  formId: string

  /* No need to pass this if adding an <input type='submit'/> */
  gaButtonName?: never
  content?: never
  href?: never
  onClick?: never /* handle your form submission on the <form/> */
}

type MAInputButton = {
  /* The following set of props are used when you want add an <input type='button'/> */

  /* Your button copy */
  value: string

  inputType: 'button'

  /* Pass the id of your form since this will be outside of the <form/> */
  formId: string

  /* Your button's action */
  onClick(): void

  /* No need to pass these if adding an <input type='button'/> */
  gaButtonName?: never
  content?: never
  href?: never
}

type MALink = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /*
    The following set of props are used when you want add an anchor element.
    Do not use if you just want the style of a link, use ActionType.link for that.
  */

  /* Your link copy */
  content: string

  /* Your link copy */
  href: string

  /* No need to pass these if adding a link */
  onClick?: never
  gaButtonName?: never
  value?: never
  inputType?: never
  formId?: never
}

export enum ActionType {
  /*
    This would be the primary action as it relates to your modal.
    By default these buttons are filled in according to the color you choose with white text.
  */
  primary = 'primary',

  /*
    Used for any secondary actions such as resets as it relates to your modal.
    By default these buttons are styled like ghost buttons (outlined, light background) and will reflect the color you choose.
  */
  secondary = 'secondary',

  /*
    Used for any secondary actions that need to appear as a link.
    By default there is no border or background and the text underlined in the color of your choosing.
  */
  link = 'link'
}

export enum ButtonAlignment {
  /* Buttons with this alignment will appear on the left side of the footer with the left most button being the first one with this alignment */
  left = 'left',

  /* Buttons with this alignment will appear on the right side of the footer with the right most button being the last one with this alignment */
  right = 'right'
}

export enum BrandColors {
  gray = 'gray',
  navyBlue = 'navy-blue',
  green = 'green',
  purple = 'purple',
  blue = 'blue', // Use this if clicking it will lead to the next step in the process.
  caution = 'caution', // Orange/Red. Use this for destructive actions.
  concern = 'concern' // Yellow. Use this for actions that are not destructive but also not benign.
}

const Modal: React.FC<ModalProps> = ({ className, header, footerButtons, style, ...props }) => {
  useEffect(() => { // Analytics modal event
    if (props.isOpen && props.gaModalName) ReactGA.modalview(props.gaModalName)
  }, [props.gaModalName, props.isOpen])

  const leftButtons = footerButtons?.filter(b => b.alignment === 'left')
  const rightButtons = footerButtons?.filter(b => b.alignment !== 'left')

  return <ReactModal
    overlayClassName={{
      base: styles.base,
      beforeClose: styles.beforeClose,
      afterOpen: styles.afterOpen
    }}
    closeTimeoutMS={150}
    bodyOpenClassName={styles.bodyOpen}
    className={styles.containerWrapper}
    {...props}
  >
    <div className={classNames(styles.container, className)} style={style}>
      <div style={props.headerStyle} className={classNames(props.headerClassName, styles.header)}>
        { header }
        <button
          onClick={props.onRequestClose}
          aria-label='Close Modal'
          style={props.closeButtonStyle}
          className={classNames(props.closeButtonClassName, styles.close)}>
          <svg aria-hidden='true' focusable='false' width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M2 2L12 12M12 2L2 12' strokeWidth='3'/>
          </svg>
        </button>
      </div>
      <div className={classNames(styles.content, props.contentClassName)} style={props.contentStyle}>{ props.children }</div>
      { footerButtons && <div style={props.footerStyle} className={classNames(props.footerClassName, styles.footer)}>
        {leftButtons?.map((b, i) => <ModalFooterButton {...b} key={i}/>)}
        {rightButtons?.map((b, i) => <ModalFooterButton {...b} key={i}/>)}
      </div> }
    </div>
  </ReactModal>
}

const ModalFooterButton: React.FC<ModalActionButton> = ({ alignment, actionType, className, color, ...props }) => {
  const buttonActionTypeClass = actionType === ActionType.primary
    ? styles.primary
    : actionType === ActionType.secondary
      ? styles.secondary
      : styles.link
  const buttonClassName = classNames(className, buttonActionTypeClass)
  return <div className={classNames(color, alignment === 'left' ? styles.left : styles.right)}>
    { props.gaButtonName
      ? <GAButton
        analytics={props.gaButtonName || props.content?.toString() || ''}
        onClick={props.onClick}
        className={buttonClassName}
        style={props.style}
        disabled={props.disabled}>
        {props.content}
      </GAButton>
      : props.href
        ? <a {...props} className={buttonClassName}>{props.content}</a>
        : props.inputType && <input
          type={props.inputType}
          value={props.value}
          form={props.formId}
          className={buttonClassName}
          style={props.style}
          onClick={props.onClick}
          disabled={props.disabled} />
    }
  </div>
}

export const ModalLoader: React.FC<{loading: boolean}> = ({ loading }) =>
  loading ? <div className={styles.loadingContainer}><Loader center/></div> : <></>

export default Modal
