import React, { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Route } from 'Utilities/Route'

const Error: React.FC<{error: any}> = ({ error, children }) => {
  function header() {
    const defaultHeader = 'Something went wrong.'
    if (!error) return defaultHeader
    if (!error.response) return defaultHeader
    switch (error.response.status) {
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    default:
      return defaultHeader
    }
  }

  function innerRender() {
    if (!error) { return <p>An unknown error occurred</p> }
    const code = error.response ? error.response.status : 0
    const msg = messageForError(error)

    switch (code) {
    case 401:
    case 403:
      return <>
        {msg}
        <p>Please <Link to="/">go home</Link> or <Link to={Route.signOut}>sign out</Link>.</p>
      </>
    default:
      return msg
    }
  }

  return <div style={{ padding: '2rem' }}>
    <h2 style={{ textAlign: 'left' }}>{header()}</h2>
    {innerRender()}
    {children}
  </div>
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function messageForError(obj: any): ReactElement {
  if (obj instanceof TypeError && obj.message === 'Failed to fetch') {
    return <p>Your Internet connection appears to be offline.</p>
  }

  if (React.isValidElement(obj)) {
    return obj
  }

  // eslint-disable-next-line no-mixed-operators
  let msg = (
    obj.reason ||
    (obj.json && (obj.json.reason || obj.json.message)) ||
    obj.message ||
    `${obj}`
  )

  if (msg === 'Something went wrong.') {
    return <>
      <p>
        { /* eslint-disable-next-line */ }
        We’re looking into it… please wait a moment and then try <a onClick={window.location.reload}>reloading</a>.
      </p>
      <p>
        If that doesn’t work try <Link to='/account/sign-in'>signing in</Link> again.
      </p>
    </>
  } else {
    if (!msg.endsWith('.') && !msg.endsWith('!') && !msg.endsWith('?')) msg += '.'
    return <p
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{ __html: msg }} />
  }
}

export default Error
