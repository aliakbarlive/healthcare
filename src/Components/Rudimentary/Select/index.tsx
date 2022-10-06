import React from 'react'
import ReactSelect, { Props as ReactSelectProps, Styles } from 'react-select'
import AsyncSelect, { Props as ReactAsyncProps } from 'react-select/async'
import cssStyles from './index.module.css'
import { classNames } from 'Utilities/etc'
import { useFormContext, Controller } from 'react-hook-form'
import { startCase } from 'lodash'
import { ControllerProps } from 'react-hook-form/dist/types/props'

export type Option = { label: string, value: any }

type BaseProps = (Omit<ReactSelectProps, 'value'> | Omit<ReactAsyncProps<Option>, 'value'>) & {
  onChange?: (value: any | any[]) => void
  color?: string
  backgroundColor?: string
  value?: Option | string
}

export const BaseSelect = React.forwardRef<any, BaseProps>((props, ref) => {
  const { value } = props
  const choice = value && Array.isArray(value) ? props.options ? (props.options as any[]).filter(o => value.includes(o.value)) : value.map(v => ({ label: startCase(v), value: v })) : (props.options as any[])?.find((opt: any) => opt.value === value)
  const maybeOnChange = props.onChange ? (o: any | any[]) => props.onChange!(Array.isArray(o) ? o.map(v => v?.value) : o?.value) : undefined
  const hasValue = !!(Array.isArray(value) ? value?.length > 0 : value)
  const isClearable = props.isClearable !== undefined ? props.isClearable : !props.isMulti
  return <div className={classNames(cssStyles.selectContainer, props.className)}>
    <span className={classNames(cssStyles.label, cssStyles.labelVisible)}>{props.placeholder}</span>
    { isReactAsyncProps(props)
      ? <AsyncSelect {...props} onChange={maybeOnChange} styles={styles()} value={choice} ref={ref} isClearable={isClearable}/>
      : <ReactSelect {...props} onChange={maybeOnChange} styles={styles()} value={choice} ref={ref} isClearable={isClearable} />
    }
  </div>

  function styles() {
    if (props.styles) return props.styles

    const styles: Partial<Styles> = { ...selectStyle }
    styles.singleValue = styles => ({
      ...styles,
      padding: props.placeholder ? '3px 30px 0 0px' : '0px 30px 0 0px',
      color: props.color || '#4EA6DC'
    })
    styles.control = (styles, { isDisabled, isFocused, isMulti }) => ({
      ...styles,
      backgroundColor: isDisabled ? 'rgb(230, 230, 230)' : props.backgroundColor || '#f4f4f4',
      cursor: isDisabled ? 'not-allowed' : undefined,
      borderRadius: 6,
      border: 0, // For some reason having this is selectStyle doesn't work :/
      paddingTop: controlPaddingTop(isMulti, hasValue),
      paddingBottom: hasValue ? 10 : 10,
      paddingRight: 40,
      minHeight: 55,
      boxShadow: isFocused ? '0px 0px 4px #48a3db' : undefined
    })
    return styles
  }

  function controlPaddingTop(isMulti: boolean, hasValue: boolean) {
    if (props.placeholder && hasValue) return isMulti ? 24 : 6
    return 10
  }
})

export type SelectProps = Omit<ControllerProps<typeof BaseSelect>, 'render' | 'as'> & { name: string }

const Select: React.FC<SelectProps> = ({ value, ...props }) => {
  const control = useFormContext()?.control || props.control
  return <Controller
    {...props}
    render={fwdProps =>
      <BaseSelect {...props} {...fwdProps} />
    }
    control={control}
  />
}

function isReactAsyncProps(props: any): props is ReactAsyncProps<Option> {
  return !!props.loadOptions
}

const selectStyle: Partial<Styles> = {
  option: (provided, state) => ({
    ...provided,
    padding: '17px 23px',
    color: state.isSelected ? 'white' : state.isFocused ? 'hsl(0, 0%, 35%)' : 'inherit'
  }),
  control: styles => ({
    ...styles,
    backgroundColor: '#f4f4f4',
    border: 0,
    width: '100%'
  }),
  multiValueLabel: styles => ({
    ...styles,
    paddingLeft: 8,
    paddingRight: 6,
    color: '#48A3DB'
  }),
  multiValueRemove: styles => ({
    ...styles,
    ':hover': {
      backgroundColor: '#A4D1ED',
      color: '#2687C3'
    }
  }),
  placeholder: styles => ({
    ...styles,
    color: 'hsla(0, 0%, 67%, 1)',
    fontSize: 16
  }),
  valueContainer: styles => ({
    ...styles,
    paddingLeft: '21px'
  }),
  singleValue: styles => ({
    ...styles,
    fontSize: 16,
    margin: 0
  }),
  indicatorsContainer: styles => ({
    ...styles,
    position: 'absolute',
    right: '0',
    top: '52%',
    transform: 'translateY(-50%)'
  }),
  indicatorSeparator: styles => ({
    ...styles,
    display: 'none'
  }),
  menu: styles => ({
    ...styles,
    zIndex: 5,
    overflow: 'hidden'
  }),
  menuList: styles => ({
    ...styles,
    maxHeight: 300
  })
}

export default Select
