import ErrorComponent from 'Components/Primitives/Error'
import { ToastProvider } from 'react-toast-notifications'
import ReactGA from 'react-ga'
import React from 'react'
import * as api from 'Utilities/pharaoh'
import util from 'util'
import SupportSection from 'Components/SupportSection'
import { Link } from 'react-router-dom'
import { analyticsTrackers } from 'Utilities/config'

class ErrorBoundary extends React.Component {
  state = {
    error: null,
    errorInfo: null
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error, errorInfo)

    api.v3.panic(util.format(error)).catch(console.error)

    ReactGA.exception({
      description: `${error}\n\n${errorInfo}`,
      fatal: true
    }, analyticsTrackers())
  }

  render() {
    const content = this.state.error
      ? <ErrorComponent error={this.state.error}>
        {this.errorChildren()}
      </ErrorComponent>
      : this.props.children
    return <ToastProvider autoDismiss autoDismissTimeout={15_000}>
      {content}
      <SupportSection />
    </ToastProvider>
  }

  errorChildren = () =>
    <p>
      <hr />
      If this keeps happening you may want to:
      <ol>
        <li><Link to='/'>Go Home</Link></li>
        <li><Link to='/account/sign-out'>Sign out</Link></li>
        <li>Contact support</li>
      </ol>
    </p>
}

export default ErrorBoundary
