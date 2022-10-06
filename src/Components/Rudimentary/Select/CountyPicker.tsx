import React, { useState, useEffect } from 'react'
import { BaseSelect, Option, SelectProps } from '.'
import { post } from 'Utilities/fetch++'
import { usePrevious } from 'react-use'
import { useFormContext, Controller } from 'react-hook-form'

/// Either pass control, useFormContext() if you do none of these it won’t work.
/// Pass `zipCode` or there won’t be *any* options.
const CountyPicker: React.FC<Omit<SelectProps, 'options' | 'placeholder'> & { zip?: string }> = props => {
  const control = useFormContext()?.control || props.control

  return <Controller
    {...props}
    name={props.name}
    render={fwdprops => {
      const [options, setOptions] = useState<Option[]>([])
      const prevZip = usePrevious(props.zip)

      useEffect(() => {
        const { zip } = props
        if (prevZip === zip) return

        if (!zip || zip.length < 5) {
          if (options.length) {
            setOptions([])
            fwdprops.onChange(undefined)
          }
        } else {
          fetcher.fetch(zip, counties => {
            if (zip !== props.zip) return
            // ^^ zip changed while we were fetching the data
            if (counties.length === 0) throw new Error('Invalid ZIP Code')
            setOptions(counties.map(({ name, id }) => ({ label: name, value: id })))
            fwdprops.onChange(counties.some(c => c.id === fwdprops.value) ? fwdprops.value : counties[0].id)
          })
        }
      }, [props.zip, fwdprops.value, prevZip, options.length])
      return <BaseSelect {...props} {...fwdprops} options={options} placeholder='County'/>
    }}
    control={control}
  />
}

// because there may be 100+ of us on the same page and we want to make *one* API call
class Fetcher {
  zips: { [key: string]: ((obj: { name: string, id: string }[]) => void)[] } = {}
  active = false

  fetch = (zip: string, callback: (objs: {name: string, id: string}[]) => void) => {
    if (this.zips[zip]) {
      this.zips[zip].push(callback)
    } else {
      this.zips[zip] = [callback]
    }
    if (!this.active) {
      this.active = true
      setTimeout(this.go, 0)
    }
  }

  go = () => {
    const zips = this.zips
    this.zips = {}
    this.active = false

    post('/v2/fips/4/zips', Object.keys(zips)).then(rsp => {
      if (Object.keys(rsp).length === 0) {
        throw new Error('Invalid ZIP Code')
      }
      Object.keys(rsp).forEach(zip =>
        zips[zip].forEach(callback => callback(rsp[zip]))
      )
    }).catch(console.error) // FIXME
  }
}

const fetcher = new Fetcher()

export default CountyPicker
