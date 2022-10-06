/* eslint-disable camelcase */
import React, { useState } from 'react'
import styles from './NewClientModal.module.scss'
import AnubisModal from './AnubisModal'
import CandorInput from 'Components/Rudimentary/CandorInput'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import useToast from 'Utilities/Hooks/useToast'
import { v4 as uuid } from 'uuid'
import moment from 'moment'
import effectiveDateFilter from 'Utilities/Plans/effectiveDateFilter()'
import PhoneInput from 'Components/Rudimentary/PhoneInput'
import ZipInput from 'Components/Rudimentary/ZipInput'
import { defaultMinimumDate } from 'Utilities/etc'
import CandorSelect, { Option } from 'Components/Rudimentary/Select'
import { useAsync, useToggle } from 'react-use'
import * as api from 'Utilities/pharaoh'
import IndustryPicker from 'Components/Rudimentary/Select/IndustryPicker'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { FormInputWrapper } from 'Components/Rudimentary/FormComponents'
import DateSelector from 'Components/Stargate/DateSelector'
import { sortBy } from 'lodash'

interface Props {
  isOpen: boolean
  onRequestClose: (id: string | null) => void
  clientBtnShow: (id: boolean) => void
}

const NewClientModal: React.FC<Props> = ({ isOpen, onRequestClose, clientBtnShow }) => {
  const form = useForm()
  const { register, handleSubmit, control, watch, getValues } = form
  const zip = watch('address.zip')
  const addToast = useToast()
  const [disabled, setDisabled] = useState(false)
  const [associations, setAssociations] = useState<Option[]>([])
  const [sameContact, toggleSameContact] = useToggle(false)
  const maxEffectiveDate = moment().add(3, 'quarter').endOf('quarter').toDate()
  const otherAssociation = { value: '00000000-0000-0000-0000-000000000001', label: 'OTHER' }

  useAsync(async() => {
    const rsp = await api.v2.groups().associations.all()
    setAssociations(
      sortBy([
        ...rsp.map((item: { id: string, name: string }) => ({ value: item.id, label: item.name })),
        otherAssociation
      ], 'label'))
    clientBtnShow(!!rsp)
  })

  return <AnubisModal
    name={NewClientModal.name}
    isOpen={isOpen}
    onRequestClose={() => onRequestClose(null)}
    showClose={true}
    styles={{ width: '55%', maxWidth: 1000, height: '100%', overflow: 'visible', overflowY: 'scroll' }}
  >
    <p className={styles.newClien}>Add New Client</p>
    <p className={styles.companyName}>Company Details</p>
    <fieldset disabled={disabled}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(submit)} className={styles.addContactForm}>
          <div className={styles.twoInp}>
            <CandorInput placeholder='Company Name' name='name' ref={register} required/>
            <CandorInput placeholder='Employer Identification Number (EIN)' name='identifiers.ein' ref={register} required/>
          </div>
          <div>
            <IndustryPicker name={'identifiers.sic'} control={control} backgroundColor='#fff' required/>
          </div>
          <div className={styles.selectOpt}>
            <CandorSelect
              name="associations"
              options={associations}
              defaultValue={otherAssociation}
              control={control}
              backgroundColor='#fff'
              placeholder='Associations'
              required />
          </div>
          <div className={styles.twoInp}>
            <CandorInput placeholder='Address 1' name='address.street1' ref={register} required/>
            <CandorInput placeholder='Address 2' name='address.street2' ref={register} />
          </div>
          <div className={styles.twoInp} style={{ margin: '0 0' }}>
            <CandorInput placeholder='City' name='address.city' ref={register} required/>
            <ZipInput placeholder='ZIP Code' control={control} name='address.zip' required/>
            <CountyPicker placeholder='County' zip={zip} name='address.county.id' control={control} backgroundColor='#fff' required/>
          </div>

          <p className={styles.companyName} >Contact details</p>
          <div className={styles.twoInp}>
            <CandorInput placeholder='First Name' name='contacts[0].firstName' ref={register} required />
            <CandorInput placeholder='Last Name' name='contacts[0].lastName' ref={register} required />
          </div>
          <div className={styles.twoInp} style={{ margin: '0 0' }}>
            <CandorInput placeholder='Email Address' name='contacts[0].email' type='email' ref={register} required/>
            <CandorInput placeholder='Job Title' name='contacts[0].job' ref={register} required/>
            <PhoneInput placeholder='Phone' name='contacts[0].phone' control={control} required/>
          </div>

          <p className={styles.companyName}>
          HR or Administrator details</p>
          <div className={styles.checkboxCont}>
            <input type="checkbox" name="Same as Above" className={styles.check} checked={sameContact} onChange={toggleSameContact} />
            <label>Same as Above</label>
          </div>
          {sameContact || <>
            <div className={styles.twoInp}>
              <CandorInput placeholder='First Name' name='contacts[1].firstName' ref={register} required />
              <CandorInput placeholder='Last Name' name='contacts[1].lastName' ref={register} required />
            </div>
            <div className={styles.twoInp} style={{ margin: '10px 0' }}>
              <CandorInput placeholder='Email Address' name='contacts[1].email' type='email' ref={register} required />
              <CandorInput placeholder='Job Title' name='contacts[1].job' ref={register} />
              <PhoneInput placeholder='Phone' name='contacts[1].phone' control={control} />
            </div>
          </>}
          <div className={styles.efectiveDate}>
            <p className={styles.companyName}>
              effective/renewal date</p>
          </div>
          <div className={styles.dateInp}>
            <FormInputWrapper name='dates.effective' errorPosition='top'>
              <Controller
                name='dates.effective'
                render={props => <DateSelector
                  {...props}
                  filterDate={effectiveDateFilter}
                  minDate={defaultMinimumDate()}
                  maxDate={maxEffectiveDate}
                  openToDate={defaultMinimumDate()}
                />}
                defaultValue={defaultMinimumDate()}
                rules={{
                  validate: () => {
                    const date = getValues('dates.effective')
                    if (!date) { return 'Effective Date is required' }
                    if (date > maxEffectiveDate) {
                      return `Effective Date cannot be greater than ${moment(maxEffectiveDate).format('MMM Do, YYYY')}`
                    }
                    if (date < defaultMinimumDate()) {
                      return `Effective Date cannot be less than ${moment(defaultMinimumDate()).format('MMM Do, YYYY')}`
                    }
                    if (moment(date).date() !== 1/* && moment(date).date() !== 15 */) {
                      // ^^ 15th disabled for now
                      return 'Effective Date must fall on the 1st of the month'
                    }
                  }
                }}
              />
            </FormInputWrapper>
          </div>
          <p className={styles.caveats}>Please note: while all available carriers will provide a quote, please refer to carrier
            implementation timelines for case submission deadlines. MyHealthily cannot guarantee all quotes are issuable within
            carrier timelines. We encourage selecting an effective date at least 30 days from the current date.</p>
          <div className={styles.subBtn}>
            <input type='submit' className={styles.save} style={{ background: ' linear-gradient(180deg, #71C6FC 0%, #3F8FC1 100%)' }} value='add new client' />
          </div>
        </form>
      </FormProvider>
    </fieldset>

  </AnubisModal>

  async function submit(data: any) {
    try {
      if (!data.address.county.id) throw new window.Error('Please select your county')
      if (!data.identifiers.sic) throw new window.Error('Please select an industry for your group to proceed')
      if (!data.associations) throw new window.Error('Please select an association for your group to proceed')
      data.associations = [{ id: data.associations.value || data.associations, name: '' }]
      data.dates.effective = data.dates.effective && moment.utc(data.dates.effective).format()
      data.contacts = data.contacts.map((c: any) => ({ ...c, name: `${c.firstName} ${c.lastName}` }))
      setDisabled(true)
      data.id = uuid()
      await api.v3.groups().POST(data)
      onRequestClose(data.id)
    } catch (error) {
      addToast(error as Error)
      setDisabled(false)
    }
  }
}

export default NewClientModal
