import { useToasts, AppearanceTypes, Options } from 'react-toast-notifications'
import { messageForError } from 'Components/Primitives/Error'
import * as api from 'Utilities/pharaoh'
import { FetchError } from 'Utilities/fetch++'

const useToast = () => {
  const { addToast } = useToasts()
  return (error: FetchError | Error | string | JSX.Element, options?: AppearanceTypes | Options | null, callback?: (id: string) => void) => {
    if (error instanceof Error) {
      console.error(error)
      const browserIdentity = JSON.stringify({
        appCodeName: window.navigator.appCodeName,
        appName: window.navigator.appName,
        appVersion: window.navigator.appVersion,
        platform: window.navigator.platform,
        product: window.navigator.product,
        productSub: window.navigator.productSub,
        userAgent: window.navigator.userAgent,
        vendor: window.navigator.vendor,
        vendorSub: window.navigator.vendorSub
      })

      const payload = window.localStorage
      delete payload['intercom-state'] // nonsense
      delete payload.siqlsdb // poppycock
      delete payload.utsdb // balderdash

      api.v3.toastCollector().POST({
        error: error.toString(),
        localStorage: JSON.stringify(payload),
        browserIdentity,
        url: window.location.href,
        body: error instanceof FetchError ? JSON.stringify(error.json) : undefined
      }).catch(console.error)
    }
    if (!options) {
      options = { appearance: error instanceof Error ? 'error' : 'info' }
    } else if (typeof options === 'string') {
      options = { appearance: options }
    }
    addToast(messageForError(error), options, callback)
  }
}

export default useToast
