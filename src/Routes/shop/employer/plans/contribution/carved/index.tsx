import React from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import styles from './SpecialContribution.module.scss'
import { useToggle } from 'react-use'
import { sortBy } from 'lodash'
import CandorInput from 'Components/Rudimentary/CandorInput'
import EmployeeSelector from 'Components/Stargate/EmployeeSelector'
import { ContributionSplit } from 'Utilities/Hooks/useStargate'
import ReactDOM from 'react-dom'
import useSplits from './useSplits()'
import { GAButton } from 'Components/Tracking'

const ERShopContributionsCarved: React.FC<PrivateWizardPageProps> = ({ stargate, ...props }) => {
  const [asking, stopAsking] = useToggle(stargate.splits.length <= 0)
  const [splits, unsplitMembers, { create, delete: remove, toggleMember, setName, async }] = useSplits(stargate.group, stargate.members, stargate.splits)
  useFullContentArea()

  return <div className={styles.container}>
    <div className={styles.header}>
      <h1>Employee Classes</h1>
      {renderHeader()}
    </div>
    <div className={styles.body}>
      {renderBody()}
    </div>
  </div>

  function renderBody() {
    if (asking) {
      return <>
        <h2>
          Would you like to create employee classes for different employee types?
          &nbsp;<br/><span>(e.g., executives, managers, hourly, salary)</span>
        </h2>
        <div className={styles.boolContainer}>
          <BoolButton callback={() => {
            ReactDOM.unstable_batchedUpdates(() => {
              stopAsking()
              create()
            })
          }} color='#D4F8EF' value={true}>
            I want an employee class!
          </BoolButton>
          <BoolButton callback={onwards} color='#EBEBEB' value={false}>
            I&apos;m ready to review contributions!
          </BoolButton>
        </div>
      </>
    } else {
      return <>
        {splits.map(render)}
        <GAButton analytics={`Next (${ERShopContributionsCarved.name})`} className='shop-next-button' onClick={onwards}>Next</GAButton>
      </>
    }

    function render(split: ContributionSplit) {
      const options = new Set([...unsplitMembers, ...split.members])
      const members = stargate.members.filter(member => options.has(member.id))
      return <div className={styles.employeeSelector} key={split.id}>
        <div className={styles.coveredBy}>
          <label>Employees Covered by</label>
          <input placeholder="Class Name" value={split.name} onChange={event => setName(split.id, event.currentTarget.value)} />
        </div>
        <p>Please <b>select</b> all employees in the employee class. By default, no employees are covered in an employee class until selected.</p>
        <EmployeeSelector
          id={split.id}
          selectCallback={toggleMember}
          selected={new Set(split.members)}
          groupMembers={members}
          variant='checkmark'
        />
      </div>
    }
  }

  function onwards() { props.onwards(async) }

  function renderHeader() {
    if (asking) return null
    return <div>
      <p>To create an <b>Employee Class</b>, please complete the following:</p>
      <ol>
        <li>Add a class name.</li>
        <li>Select members within each class.</li>
        <li>Create up to 6 employee classes.</li>
      </ol>
      {renderSplits()}
      <GAButton analytics={`Add Class (${ERShopContributionsCarved.name})`} className={styles.addGroup} onClick={create}>Add Class</GAButton>
    </div>

    function renderSplits() {
      return sortBy(splits, 'index').map(split => {
        return <div key={split.id} className={styles.contContainer}>
          <RemoveBox callback={() => remove(split.id)} />
          <CandorInput
            name={`name.${split.id}`}
            className={styles.headerNameInput}
            onChange={event => setName(split.id, event.currentTarget.value)}
            value={split.name}
            placeholder="Class Name"
            autoFocus
          />
        </div>
      })
    }
  }
}

const RemoveBox = (props: { callback: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void }) =>
  <button onClick={props.callback} className={styles.addBox}>
    <i className='material-icons'>{'remove'}</i>
  </button>

const BoolButton = (props: { children: any, value: boolean, color: string, callback: () => void }) => {
  const { value, color: backgroundColor, callback } = props
  return <button style={{ backgroundColor }} className={styles.boolButton} onClick={callback}>
    {value ? 'YES' : 'NO'}
    <p>{props.children}</p>
  </button>
}

export default ERShopContributionsCarved
