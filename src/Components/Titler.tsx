import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTitle } from 'react-use'
import { startCase } from 'lodash'
import isUUID from 'is-uuid'

const Titler: React.FC = () => {
  const location = useLocation()
  let parts = location.pathname.split('/')
  parts = parts.filter(isSane).map(mangle)
  parts[0] = 'MyHealthily'
  useTitle(parts.join('·'))
  return null

  function isSane(input: string): boolean {
    if (!input) return false
    if (isUUID.v4(input)) return false
    if (input.includes(' ')) return true // fuck knows why
    if (input.length > 20) return false // likely a token
    return true
  }

  function mangle(input: string): string {
    return startCase(input.trim())
  }
}

export default Titler
