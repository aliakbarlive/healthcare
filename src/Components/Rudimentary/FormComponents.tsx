import React, { HTMLProps } from 'react'
import styles from './FormComponents.module.scss'
import { classNames } from 'Utilities/etc'
import { ErrorMessage } from '@hookform/error-message'
import { useFormContext } from 'react-hook-form'

/*
  HOW To USE

  Your form structure should be
  <form>
    <FormSection>
      <FormRow>
        ...your inputs
      </FormRow>
    </FormSection>
  </form>

  If you want the inputs in the rows to have different widths, pass in your desired ratios via the columnLayout prop. By default, they are all equal width
  Ex: [1,2,1] will result in [   ][      ][   ] where your second input is twice the size as the others
*/

interface FormSectionProps extends HTMLProps<HTMLDivElement> { columnLayout?: number[] }
export const FormSection: React.FC<FormSectionProps> = ({ columnLayout, ...props }) => {
  const gridTemplateColumns = columnLayout
    ? columnLayout.map(c => `${c}fr`).join(' ')
    : '1fr'

  return <div
    style={{ gridTemplateColumns, ...props.style }}
    className={classNames(props.className, styles.formSection)}
  >
    {props.children}
  </div>
}

export const FormSectionHeader: React.FC<HTMLProps<HTMLHeadingElement>> = props =>
  <h5 {...props} className={classNames(props.className, styles.formSectionHeader)}>{props.children}</h5>

export const FormRow: React.FC<HTMLProps<HTMLDivElement> & { columnLayout?: number[] }> = ({ children, columnLayout, ...props }) => {
  const childCount = React.Children.count(children)
  return <div
    {...props}
    style={{ ...props, gridTemplateColumns: formTemplateColumns(columnLayout, childCount) }}
    className={classNames(styles.formRow, props.className)}
  >
    {children}
  </div>

  function formTemplateColumns(columnLayout: number[] | undefined, childCount: number) {
    const l = columnLayout
      ? childCount > columnLayout.length
        ? columnLayout.concat(Array(childCount - columnLayout.length).fill(1))
        : columnLayout.splice(columnLayout.length - childCount)
      : Array(childCount).fill(1)

    return l.map(c => `${c}fr`).join(' ')
  }
}

// TODO remove and embed the error directly into the input. This is a temp workaround to avoid breaking other forms.
export const FormInputWrapper: React.FC<{name: string, errorPosition?: 'top' | 'bottom'}> = props =>
  <div>
    { props.errorPosition === 'top' && <FormError name={props.name}/> }
    { props.children }
    { props.errorPosition !== 'top' && <FormError name={props.name}/> }
  </div>

const FormError: React.FC<{name: string}> = ({ name }) => {
  const { errors } = useFormContext()
  return <ErrorMessage
    name={name}
    errors={errors}
    as={<span className={styles.formError}/>}
  />
}
