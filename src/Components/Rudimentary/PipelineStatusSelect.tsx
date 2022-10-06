import React from 'react'
import ReactSelect, { ValueType, Styles } from 'react-select'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'

export type StatusType = {
  label: string
  value: string
}

type Props = {
  value: StatusType
  options: StatusType[]
  onChange: (pipelineStatus: ValueType<StatusType>) => Promise<void> | undefined
}

const PipelineStatusSelect: React.FC<Props> = ({ value, options, onChange }) => {
  const user = useUser()
  let disabled: boolean
  if (user.value) {
    disabled = user.value.powerLevel < PowerLevel.broker
  } else {
    disabled = true
  }
  return <ReactSelect
    value={value}
    onChange={onChange}
    styles={selectStyle}
    options={options}
    isDisabled={disabled}
  />
}

const selectStyle: Styles = {
  option: (provided, state) => ({
    ...provided,
    padding: '17px 23px',
    color: '#707070',
    backgroundColor: state.isSelected ? '#91F8DF' : state.isFocused ? '#D4F8EF' : 'null',
    ':active': {
      backgroundColor: !state.isDisabled && state.isSelected && '#D4F8EF'
    }
  }),
  container: styles => ({
    ...styles,
    flex: '0 0 100%',
    marginTop: 15,
    fontFamily: 'Barlow Semi Condensed, sans-serif',
    color: '#707070',
    letterSpacing: 0.2
  }),
  control: (styles, { isDisabled }) => ({
    ...styles,
    backgroundColor: isDisabled ? 'rgb(230, 230, 230)' : '#FCFCFC',
    cursor: isDisabled ? 'not-allowed' : undefined,
    borderRadius: 0,
    borderColor: '#F2F2F2',
    boxShadow: 'none',
    height: 50,
    ':active': {
      borderColor: '#F2F2F2'
    },
    ':hover': {
      borderColor: '#F2F2F2'
    }
  }),
  placeholder: styles => ({
    ...styles,
    color: '#A2A2A2',
    fontSize: 16,
    padding: '0px 25px 0 0px',
    margin: 0
  }),
  valueContainer: styles => ({
    ...styles,
    fontWeight: 600
  }),
  singleValue: styles => ({
    ...styles,
    fontSize: '14px',
    padding: '0px 25px 0 0px'
  }),
  indicatorSeparator: styles => ({
    ...styles,
    display: 'none'
  }),
  indicatorsContainer: styles => ({
    ...styles,
    fill: '#707070',
    position: 'absolute',
    right: 0,
    top: 6
  })
}

export default PipelineStatusSelect
