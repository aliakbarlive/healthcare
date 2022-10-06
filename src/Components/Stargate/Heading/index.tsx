import React, { HTMLProps } from 'react'
import { HeadingClassName } from 'Routes/shop/employee/plans/ancillary'
import { classNames } from 'Utilities/etc'
import styles from './index.module.scss'

enum InnerClassName{
  eeInnerClass = 'ShowPlansHeader_eeHeading__1y_lx',
  cartContainer = 'enroll_cartContainer__3Esij',
  eeSupplementalHeading = 'eeSuplemental_eeSupplementalHeading__2MGLP'
}
const Heading: React.FC<HTMLProps<HTMLElement> & { innerclassname?: string }> = props => {
  const propClass = props.innerclassname
  const eeClass = propClass === InnerClassName.eeInnerClass
  const coverageClas = propClass === HeadingClassName.coverageHeading
  const cartContainr = propClass === InnerClassName.cartContainer
  const eeSupplement = propClass === InnerClassName.eeSupplementalHeading
  const headerClasses = [(eeClass || eeSupplement) && styles.eeHeading, coverageClas && styles.coverageHeading, cartContainr && styles.cartContainer]
  return <section {...props} className={classNames(styles.header, headerClasses, props.className)}>
    <div className={classNames(styles.wrapper, props.innerclassname)}>
      {props.children}
    </div>
  </section>
}

export default Heading
