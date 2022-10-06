import React from 'react'
import styles from './Panel.module.scss'

enum PanelTypes {
  info = 'info',
  note = 'note',
  success = 'success',
  warning = 'warning',
  error = 'error',
}

type Props = {
  children: React.ReactNode
  type?: PanelTypes
}

class Panel extends React.Component<Props> {
  static defaultProps = {
    type: PanelTypes.note
  }

  typeToClass(type: any) {
    switch (type) {
    case PanelTypes.note:
      return styles.note
    }
  }

  render() {
    const {
      children,
      type
    } = this.props

    return (
      <article className={`${styles.Panel} ${this.typeToClass(type)}`}>
        <div className={styles.content}>{children}</div>
      </article>
    )
  }
}

export default Panel
