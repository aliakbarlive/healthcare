import React from 'react'
import styles from './EPlusEENotices.module.scss'

interface EPlusEENoticesProps {
  leftParagraphs: JSX.Element
  rightParagraphs: JSX.Element
  page?: number
}

const EPlusEENotices: React.FC<EPlusEENoticesProps> = ({ leftParagraphs, rightParagraphs, page }) => {
  return <div className={styles.mainFrame}>
    <div className={styles.frame2825}>
      <div className={styles.frame2824}>
        <div className={styles.frame2763}>
          {leftParagraphs}
        </div>
        <div className={styles.frame2823}>
          {rightParagraphs}
          {page === 3 && <div className={styles.frame2377}>
            <p className={styles.rememberParagraph}>Remember: Keep this Creditable Coverage notice. If you decide to join one of the Medicare drug plans, you may be required to provide a copy of this notice when you join to show whether or not you have maintained creditable coverage and, therefore, whether or not you are required to pay a higher premium (a penalty).</p>
          </div>}
          <div style={{ order: 1 }} className={styles.frame2822}></div>
        </div>
      </div>
      <p className={styles.headerText}>Employer and Employee Notices</p>
    </div>
  </div>
}

export function rightParagraph(order: number, header?: string, text?: string) {
  const lineBreaks = text && text.split('/LineBreak/')
  return <div style={{ order: order }} className={styles.frame2765}>
    {header && <p className={styles.rightParagraphsSubheader}>{header}</p>}
    { lineBreaks ? lineBreaks.length === 1 ? <p className={styles.rightParagraphs}>{text}</p> : lineBreaks.map((s, i) => { if (i !== (text!.split('/LineBreak/').length - 1)) { return <p key='rightPs' className={styles.rightParagraphs}>{s}<br /></p> } else return <p key='rightPs' className={styles.rightParagraphs}>{s}</p> }) : <span style={{ width: 320 }}> </span> }
  </div>
}

export function leftParagraph(order: number, header?: string, text?: string) {
  const lineBreaks = text && text.split('/LineBreak/')
  return <div style={{ order: order }} className={styles.frame2761}>
    {header && <p className={styles.leftParagraphsSubheader}>{header}</p>}
    { lineBreaks ? lineBreaks.length === 1 ? <p className={styles.leftParagraphs}>{text}</p> : lineBreaks.map((s, i) => { if (i !== (text!.split('/LineBreak/').length - 1)) { return <p key='leftPs' className={styles.leftParagraphs}>{s}<br /></p> } else return <p key='leftPs' className={styles.leftParagraphs}>{s}</p> }) : <span style={{ width: 320 }}> </span> }
  </div>
}

export default EPlusEENotices
