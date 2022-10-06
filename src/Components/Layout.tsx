import React from 'react'
import styles from './Layout.module.scss'

export class Col extends React.Component {
  render() {
    const {
      children
    } = this.props

    return (
      <div className={styles.column}>{children}</div>
    )
  }
}

export class Row extends React.Component {
  render() {
    const {
      children
    } = this.props

    return (
      <div className={styles.row}>{children}</div>
    )
  }
}
