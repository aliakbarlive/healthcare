import React from 'react'
import styles from 'Components/Plans/plan-subcomponents/Checkboxes.module.scss'
import TermsModal from '.'
import { Checkbox } from 'Components/Plans/plan-subcomponents/Checkboxes'
import { useToggle } from 'react-use'
import { Controller, Control, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { GAButton } from 'Components/Tracking'

interface Props {
  value?: boolean
  onChange: (value: boolean) => void
  control?: Control<any>
  name: string
  containerClassName?: string
  withBAA?: boolean
}

const TAC: React.FC<Props> = (props) => {
  const [isShowingTermsModal, toggleModal] = useToggle(false)
  const [isShowingBAAModal, toogleBAA] = useToggle(false)
  const { withBAA } = props
  return (
    <div className={styles.termsContainer}>
      <TermsModal isOpen={isShowingTermsModal} onClose={toggleModal} />
      <TermsModal isOpen={isShowingBAAModal} onClose={toogleBAA} isBAA />
      <Checkbox
        {...props}
        label="I accept the"
        labelClassName={styles.termsLabel}
        name="accept"
      />
      <GAButton
        analytics={`Terms and Conditions (${TAC.name})`}
        onClick={toggleModal}
        type="button"
      >
        Terms and Conditions
      </GAButton>
      {withBAA && (
        <>
          &
          <GAButton
            analytics={`Bussiness Associate Agreement (${TAC.name})`}
            type="button"
            onClick={() => { window.open('https://myhealthily.com/BAA/') }}
          >
            Business Associate Agreement
          </GAButton>
        </>
      )}
    </div>
  )
}

const TermsAndConditions: React.FC<Omit<Props, 'onChange'>> = ({
  containerClassName,
  ...props
}) => {
  const { getValues, errors } = useFormContext()
  return (
    <div className={containerClassName}>
      <Controller
        {...props}
        render={(fwd) => <TAC {...fwd} {...props} />}
        rules={{
          validate: () =>
            !!getValues(props.name) ||
            'You must accept the terms and conditions to continue'
        }}
      />
      <ErrorMessage
        errors={errors}
        name={props.name}
        render={(data) => <div className="form-error">{data.message}</div>}
      />
    </div>
  )
}

export default TermsAndConditions
