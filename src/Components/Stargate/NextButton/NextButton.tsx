import React from 'react'
import ProgressButton from 'react-progress-button'
import './NextButton.css'

const durationSuccess = 100
const durationError = durationSuccess + 400

interface Props {
  isDisabled?: boolean
  className?: string
  value?: string
  state?: ButtonStates

  // use these unless you set controlled to `true`
  onClick?: (event: any) => Promise<void>
  onError?: (error: Error) => void
  onSuccess?: () => void

  // pass through to ProgressButton
  type?: string
  controlled?: boolean
}

export type ButtonStates = '' | 'error' | 'success' | 'loading' | 'disabled'

const NextButton: React.FC<Props> = ({ className, state, value, ...props }) => {
  // const [buttonState, setButtonState] = useState(isDisabled ? 'disabled' : (state || ''))

  // TODO this needs rework
  // no need for buttonState, ProgressButton can be manually controlled using
  // state and onClick.
  // NOTE this commend may no longer apply since TS rewrite, hard to say

  // useEffect(() => {
  //   if (buttonState === '' && isDisabled === true) {
  //     setButtonState('disabled')
  //   }
  // }, [isDisabled, buttonState])

  return <ProgressButton
    {...props}
    className={className || 'defaultSizing'}
    classNamespace='cpb-'
    state={state}
    // onClick={onClick}
    // onError={null}
    durationSuccess={durationSuccess + 3000 /* we add a bunch so the checkmark _stays_ during the render for the next page */}
    durationError={durationError}
    shouldAllowClickOnLoading={false}>
    {value || 'Next'}
  </ProgressButton>

  /* async function go(event: any) {
    if (!onClick || !onSuccess) return

    try {
      setButtonState('loading')

      let tookAtLeast300ms = false
      setTimeout(() => {
        tookAtLeast300ms = true
      }, 300)

      await onClick(event)

      // we only show checkmark
      if (tookAtLeast300ms) {
        setButtonState('success')
        // FIXME seems flakey, we want the ProgressButton to do this *for us* or call us back when its animation is complete
        setTimeout(onSuccess, durationSuccess)
      } else {
        onSuccess()
        // Need to reset back to normal state on ShowPlans after showing LF quiz modal
        // Delay is to not show the button copy before going to the next page
        setTimeout(() => setButtonState(''), 300)
      }
    } catch (error) {
      setButtonState('error')
      setTimeout(() => setButtonState(''), durationError)
      if (onError) onError(error)
    }
  } */
}

export default NextButton
