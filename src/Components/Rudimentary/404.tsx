import React from 'react'
import { Link } from 'react-router-dom'

const FourOhFour: React.SFC = () => <>
  <h1>404</h1>
  <p>There is no content here.</p>
  <p><Link to='/'>Go Home</Link>.</p>
</>

export default FourOhFour
