import React, { ReactElement } from 'react'
import styles from './ContactSnapshot.module.scss'

interface Props {
  name: string
  content: Content[]
  img?: string
}

export interface Content {
  before?: ReactElement | string | number
  after: ReactElement | string | number
}

const ContactSnapshot: React.FC<Props> = ({ name, img, content }) => {
  const initials = name.split(' ').map(i => i.charAt(0))

  const image = img
    ? <img src={img} alt={name} />
    : <h1>{initials}</h1>

  const items = content.map((item, ii) => {
    const before = item.before
      ? <div>{item.before}</div>
      : <Spacer/>
    return <div className={styles.items} key={ii}>
      {before}
      <hr/>
      {!item.before && <Spacer/>}
      <div>{item.after}</div>
    </div>
  })

  return <div className={styles.container}>
    <div className={styles.profilePic}>{image}</div>
    {items}
  </div>
}

const Spacer = () => <div className={styles.spacer}/>

export default ContactSnapshot
