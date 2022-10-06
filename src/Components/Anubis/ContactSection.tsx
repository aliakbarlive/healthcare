import React from 'react'
import styles from './ContactSection.module.css'
import { Address, Contact } from 'Utilities/pharaoh.types'
import { useToggle } from 'react-use'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import ZipInput from 'Components/Rudimentary/ZipInput'

interface Props {
  data: ContactSectionData
  className?: string
  onSave?: (data: ContactSectionData) => Promise<any>
  showCountyPicker?: boolean
}

interface ExtendedContact extends Contact {
  type?: string
}

interface ContactSectionData {
  address: Address
  contact?: ExtendedContact
  name?: string
  flagged?: boolean
}

const ContactSection: React.FC<Props> = props => {
  const { register, watch, handleSubmit, reset, control } = useForm()
  const [editing, toggleEditing] = useToggle(false)
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()
  const zip = watch('zip')

  const classes = `${styles.container} ${!editing || styles.editing} ${props.className}`
  const contact = props.data.contact

  return <div className={classes}>
    {props.onSave && <button className={styles.edit} onClick={!editing ? toggleEditing : undefined}/>}
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={!editing && !disabled}>
        <div>
          <div className={styles.name}>
            <div>
              {props.data.name && <input
                placeholder={`${contact ? contact.type : 'Contact'} Name`}
                name='name'
                defaultValue={props.data.name}
                ref={register}
              />}
              { props.data.flagged && <div className={styles.flagged}/> }
            </div>
            <input
              placeholder='Contact Name'
              defaultValue={contact && contact.name}
              name='contact.name'
              ref={register}
              // cannot edit this currently since we currently require “lead name” to be a member of the group
              disabled={true}
            />
          </div>
          <div className={styles.contact}>
            <div>
              <ContactLabel label='phone'/>
              <input
                placeholder='Phone'
                defaultValue={contact && contact.phone}
                name='contact.phone'
                maxLength={10}
                minLength={10}
                ref={register} />
            </div>
            <div>
              <ContactLabel label='email'/>
              <input
                className={styles.email}
                placeholder='Email'
                name='comtact.email'
                defaultValue={contact && contact.email}
                ref={register}
                // cannot edit this currently since we currently require “lead name” to be a member of the group
                disabled={true} />
            </div>
            <div>
              <ContactLabel label='address 1'/>
              <input
                placeholder='Address 1'
                defaultValue={props.data.address.street1}
                name='address.street1'
                ref={register} />
            </div>
            <div>
              <ContactLabel label='address 2'/>
              <input
                placeholder='Address 2'
                defaultValue={props.data.address.street2}
                name='address.street2'
                ref={register} />
            </div>
            <div>
              <ContactLabel label='city'/>
              <input
                placeholder='City'
                defaultValue={props.data.address.city}
                name='address.city'
                ref={register} />
            </div>
            <div>
              <ContactLabel label='state'/>
              <input
                placeholder='State'
                defaultValue={props.data.address.state}
                name='address.state'
                ref={register} />
            </div>
            <div>
              <ContactLabel label='Zip Code'/>
              <ZipInput
                placeholder='ZIP Code'
                defaultValue={props.data.address.zip}
                control={control}
                name='address.zip'
                candorFormStyles />
            </div>
            {props.showCountyPicker &&
              <div>
                <ContactLabel label='county'/>
                <CountyPicker control={control} zip={zip} name='address.county.id' />
              </div>
            }
            { editing && <>
              <input className={styles.saveButton} type="submit" value="Save" />
              <button type='button' className={styles.cancelButton} onClick={onCancel}>Cancel</button>
            </> }
          </div>
        </div>
      </fieldset>
    </form>
  </div>

  async function onSubmit(data: any) {
    try {
      if (!data.address.county.id) throw new window.Error('Please select your county')
      setDisabled(true)
      await props.onSave!(data)
      toggleEditing(false)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }

  function onCancel() {
    reset()
    toggleEditing(false)
  }
}

const ContactLabel = (props: any) =>
  <div className={styles.label}>
    { props.add && <button>+</button> }
    <p>{props.label}</p>
  </div>

export default ContactSection
