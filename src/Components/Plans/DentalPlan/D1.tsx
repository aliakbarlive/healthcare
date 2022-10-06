import React from 'react'
import { D1 as Data } from './index.helpers'
import baseStyles from '../plan-subcomponents/Plan.module.scss'
import styles from './index.module.scss'
import { startCase } from 'lodash'
import { Label } from 'Utilities/config'

enum DentalDataKeys {
  preventive = 'preventive',
  basic = 'basic',
  major = 'major',
  childOrthodontia = 'childOrthodontia',
  orthodontia = 'orthodontia',
  annualMax = 'annualMax'
}

const D1:React.FC<{data: Data, label: Label}> = props => {
  return <div className={`${baseStyles.section} ${styles.specs}`}>
    {Object.keys(DentalDataKeys).map(key => {
      const { inNetwork, outOfNetwork } = massagedData()[key as DentalDataKeys]
      return <div className={`${baseStyles.box} ${styles.spec} ${props.label === Label.blacksmith && styles.bsSpec}`} key={key}>
        <div>{ startCase(key as DentalDataKeys) }</div>
        { !inNetwork && !outOfNetwork
          ? <div>N/A</div>
          : inNetwork === outOfNetwork
            ? <><div>{inNetwork}</div><span>in &amp; out of network</span></>
            : <div className={styles.separateSpecs}>
              { inNetwork && <div>{inNetwork}<span>in-network</span></div> }
              { outOfNetwork && <div>{outOfNetwork}<span>out of network</span></div> }
            </div>
        }
      </div>
    })}
  </div>

  function massagedData(): {[key in DentalDataKeys]: { inNetwork?: string, outOfNetwork?: string }} {
    const { data } = props
    return {
      preventive: {
        inNetwork: data.dentalPreventativeInNetwork,
        outOfNetwork: data.dentalPreventativeOutOfNetwork
      },
      basic: {
        inNetwork: data.dentalBasicInNetwork,
        outOfNetwork: data.dentalBasicOutOfNetwork
      },
      major: {
        inNetwork: data.dentalMajorInNetwork,
        outOfNetwork: data.dentalMajorOutOfNetwork
      },
      childOrthodontia: {
        inNetwork: data.dentalChildOrthodonticsInNetwork || data.dentalChildOrthodontics,
        outOfNetwork: data.dentalChildOrthodonticsOutOfNetwork
      },
      orthodontia: {
        inNetwork: data.dentalOrthodonticsLifetimeMaximumInNetwork,
        outOfNetwork: data.dentalOrthodonticsLifetimeMaximumOutOfNetwork
      },
      annualMax: {
        inNetwork: data.individualInNetworkCarrierPayOutMaximum,
        outOfNetwork: data.individualOutOfNetworkCarrierPayOutMaximum
      }
    }
  }
}

export default D1
