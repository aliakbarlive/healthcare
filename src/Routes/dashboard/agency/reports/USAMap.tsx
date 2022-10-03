import React from 'react'
import ReactUSAMap from 'react-usa-map'
import './USAMap.css'

interface Props {
  selectedStates: string[]
  width?: any
  height?: any
  clickable: boolean
}

const USAMap: React.SFC<Props> = ({ selectedStates, ...rest }) => {
  const config = selectedStates.reduce((obj: any, state) => {
    obj[state] = { fill: '#5CADDF' }
    return obj
  }, {})

  return <ReactUSAMap
    customize={config}
    defaultFill='#F0F0F0'
    {...rest} />
}

export default USAMap
