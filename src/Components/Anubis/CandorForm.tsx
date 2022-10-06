import React, { HTMLProps, useContext } from 'react'
import styles from './CandorForm.module.scss'
import datePickerStyles from './CandorFormDatePicker.module.scss'
import { useToggle } from 'react-use'
import useToast from 'Utilities/Hooks/useToast'
import { Controller, useFormContext, FormProvider, UseFormMethods, Control } from 'react-hook-form'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { Styles } from 'react-select'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'
import Select from 'Components/Rudimentary/Select'
import { classNames } from 'Utilities/etc'
import StatePicker from 'Components/Rudimentary/Select/StatePicker'
import ZipInput from 'Components/Rudimentary/ZipInput'

interface Props extends UseFormMethods {
  save: (data: any) => Promise<void>
}

const CandorFormContext = React.createContext({ formDisabled: true })

const CandorForm: React.FC<Props> = ({ children, save, ...form }) => {
  const [editing, toggleEditing] = useToggle(false)
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()

  const hidden = {
    display: editing ? 'inherit' : 'none'
  }

  const classes = [styles.container]
  if (editing) classes.push(styles.editing)

  return <FormProvider {...form}>
    <div className={classes.join(' ')}>
      <button type='button' className={styles.edit} onClick={!editing ? toggleEditing : undefined}/>
      <form onSubmit={form.handleSubmit(go)}>
        <fieldset disabled={disabled || !editing}>
          <CandorFormContext.Provider value={{ formDisabled: disabled || !editing }}>
            { children }
          </CandorFormContext.Provider>
          <input type="submit" value="Save" style={hidden} className={styles.saveButton} />
          <input type='button' value="Cancel" style={hidden} className={styles.cancelButton} onClick={onCancel} />
        </fieldset>
      </form>
    </div>
  </FormProvider>

  function onCancel(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    event.preventDefault()
    toggleEditing(false)
    form.reset()
  }

  async function go(data: any) {
    try {
      setDisabled(true)
      await save(data)
      toggleEditing(false)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }
}

interface CandorFormNameProps {
  placeholder?: string
  flagged?: boolean
  value?: string
  name: string
}

export const CandorFormName: React.FC<CandorFormNameProps> = ({ children, flagged, value, placeholder, name }) => {
  const user = useUser()
  const ref = useFormContext()?.register
  const showFlag = flagged && user.value && user.value.powerLevel >= PowerLevel.broker

  return <div>
    <label className={styles.nameRow}>
      <input
        className={styles.name}
        placeholder={placeholder}
        name={name}
        defaultValue={value}
        ref={ref}
        id='focusme'
      />
      {showFlag && <div className={styles.flagged}/>}
    </label>
    {children}
  </div>
}

interface CandorFormCheckboxProps extends HTMLProps<HTMLInputElement> {
  name: string
  checked: boolean
}

export const CandorFormCheckbox: React.FC<CandorFormCheckboxProps> = ({ children, name, checked, ...props }) => {
  const ref = useFormContext()?.register

  return <label className={styles.checkLabel}>
    { children }
    <input name={name} ref={ref} defaultChecked={checked} type='checkbox' {...props} />
    <span/>
  </label>
}

interface CandorFormAddressProps {
  showCountyPicker?: boolean
}

export const CandorFormAddress: React.FC<CandorFormAddressProps> = ({ showCountyPicker, children }) => {
  const { register: ref, watch } = useFormContext()
  const { formDisabled } = useContext(CandorFormContext)
  const zip = watch('address.zip')
  return <>
    <label>Address
      <input
        placeholder='Address 1'
        name='address.street1'
        ref={ref} />
    </label>
    <label>Address
      <input
        placeholder='Address 2'
        name='address.street2'
        ref={ref} />
    </label>
    <label>City
      <input
        placeholder='City'
        name='address.city'
        ref={ref} />
    </label>
    <label>State
      <StatePicker
        zip={zip}
        name='address.state'
        className={styles.formPicker}
        styles={candorFormSelectStyles}
        isDisabled={formDisabled}
      />
    </label>
    <label>
      ZIP Code
      <ZipInput
        placeholder='ZIP Code'
        name='address.zip'
        candorFormStyles />
    </label>
    { showCountyPicker &&
      <label>County
        <CountyPicker
          className={styles.formPicker}
          zip={zip}
          isDisabled={formDisabled}
          styles={candorFormSelectStyles}
          name='address.county.id'
          defaultValue={null}
        />
      </label>
    }
    { children }
  </>
}

export const CandorFormEmail: React.FC<UseFormMethods> = ({ ...form }) => {
  const { formDisabled } = useContext(CandorFormContext)
  const addToast = useToast()
  return <label onClick={() => addToast('If you’d like to update your email address, please contact our service team for assistance.', 'warning')}>Email
    <input className={formDisabled ? styles.disabledEmailInput : styles.enabledEmailInput} name='contact.email' ref={form.register({
      required: true
    })} disabled={true}/>
  </label>
}

type CandorFormSelectProps = {
  options: { value: string, label: string }[]
  disabled?: boolean
  name: string
  placeholder: string
}

export const CandorFormSelect: React.FC<CandorFormSelectProps> = props => {
  const { formDisabled } = useContext(CandorFormContext)

  return <label>{props.children}
    <Select {...props} className={styles.formPicker} styles={candorFormSelectStyles} isDisabled={formDisabled || props.disabled} />
  </label>
}

interface CandorFormDatePickerProps extends Omit<ReactDatePickerProps, 'onFocus' | 'onBlur' | 'onChange' | 'placeholderText' | 'selected'> {
  name: string
  defaultValue?: any
  placeholder?: string
  control?: Control<any>
  rules?: Record<string, unknown>
}

const MyDatePicker1: React.FC<ReactDatePickerProps> = ({ className, selected, children, ...props }) => {
  return <label className={datePickerStyles.candorFormDatePickerContainer}>
    <span>{ children }</span>
    <ReactDatePicker
      {...props}
      selected={selected}
      showYearDropdown
      showMonthDropdown
      yearDropdownItemNumber={5}
      className={classNames(datePickerStyles.datePicker, className)}
      disabledKeyboardNavigation
    />
  </label>
}

export const CandorFormDatePicker: React.FC<CandorFormDatePickerProps> = ({ placeholder, ...props }) => {
  const { formDisabled } = useContext(CandorFormContext)
  return <Controller
    {...props}
    render={({ value, ...fwd }) =>
      <MyDatePicker1
        placeholderText={placeholder}
        selected={value}
        disabled={formDisabled || props.disabled}
        {...fwd}
        {...props}/>
    }
  />
}

const MyDatePicker2: React.FC<ReactDatePickerProps> = ({ className, selected, placeholderText, ...props }) => {
  const placeholderStyles = placeholderText ? datePickerStyles.hasPlaceholder : ''

  return <div className={datePickerStyles.datePickerContainer}>
    <label className={selected ? datePickerStyles.labelVisible : ''}>{placeholderText}</label>
    <ReactDatePicker
      {...props}
      placeholderText={placeholderText}
      selected={selected}
      showYearDropdown
      showMonthDropdown
      yearDropdownItemNumber={5}
      className={classNames(datePickerStyles.datePicker, placeholderStyles, className)}
      disabledKeyboardNavigation
    />
  </div>
}

export const CandorDatePicker: React.FC<CandorFormDatePickerProps> = ({ placeholder, ...props }) => {
  return <Controller
    {...props}
    render={({ value, ...fwd }) => {
      return <MyDatePicker2
        selected={value}
        placeholderText={placeholder}
        {...fwd}
        {...props} />
    }}
  />
}

const candorFormSelectStyles: Styles = {
  container: styles => ({
    ...styles
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? 'white' : state.isFocused ? 'hsl(0, 0%, 35%)' : 'inherit',
    padding: '10px 1rem !important',
    fontSize: '1rem',
    textTransform: 'capitalize',
    letterSpacing: 'normal',
    textAlign: 'left'
  }),
  control: (provided, { isDisabled }) => ({
    ...provided,
    backgroundColor: isDisabled ? '#fff' : '#f8f8f8',
    borderRadius: 6,
    border: 0,
    width: '100%',
    padding: '0.4rem 1rem !important',
    minHeight: 'unset'
  }),
  placeholder: styles => ({
    ...styles,
    color: '#a2a2a2',
    fontSize: '1rem',
    textTransform: 'capitalize',
    letterSpacing: 'normal',
    textAlign: 'left',
    marginLeft: '0'
  }),
  singleValue: styles => ({
    ...styles,
    color: '#707070',
    fontSize: '1rem',
    textTransform: 'capitalize',
    letterSpacing: 'normal'
  }),
  indicatorsContainer: (provided, { isDisabled }) => ({
    ...provided,
    display: isDisabled && 'none',
    position: 'absolute',
    right: 5,
    top: 'calc( 1rem / 2)'
  }),
  menu: styles => ({
    ...styles,
    zIndex: 5
  })
}

export default CandorForm
