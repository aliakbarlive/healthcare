import React from 'react'
import styles from './index.module.scss'

const HealthCareNews: React.FC = () =>
  <div className={styles.container}>
    <h3>Healthcare News</h3>
    <p>Everything from healthcare coverage to small business success.</p>
    {/* Podcast */}
    <iframe
      src='https://webplayer.whooshkaa.com/show/8345?theme=light&button-color=%2348A3DB&background-color=%23F8F8F8A&waveform-progress-color=%233F8FC1&scrolling-title=true&hide-download=true&hide-rss-feed=true&enable-volume=true'
      className={styles.podcast}
      scrolling='no'
      frameBorder='0'
      allow='autoplay'
      title='Podcast'
    >
    </iframe>
  </div>

export default HealthCareNews
