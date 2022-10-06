import React from 'react'
import { PipelineStatus } from 'Utilities/pharaoh.types'
import styles from './Stage.module.scss'

type StageType = {
  label: string
  key: string
  arrow: boolean // Pass true if the stage should have a little tab
  startColor: string
  endColor: string
  index: number
  quantity: number
}

type StageProps = {
  stage: StageType
  activeStage: boolean
  archiveStage?: boolean
}

const Stage: React.SFC<StageProps> = ({ stage, activeStage, archiveStage }) => {
  const pathPoints = stage.arrow ? 'M0,0H150.91V65L160,73.57,150.91,82v65H0Z' : 'M0,0H150.91V65,82v65H0Z'
  const classes = [styles.stage]
  if (activeStage) classes.push(styles.active)
  const stageClass = classes.join(' ')
  const stageQuantityText = (stage.key === PipelineStatus.archived) ? archiveStage ? stage.quantity : 'VIEW' : stage.quantity
  const stageArchiveStyles: React.CSSProperties = (stage.key === PipelineStatus.archived) ? archiveStage ? {} : { fontSize: '30px' } : {}
  const yCoordinate = (stage.key === PipelineStatus.archived) ? archiveStage ? '43%' : '47%' : '43%'

  return <div className={stageClass} style={{ zIndex: stage.index }}>
    <svg style={(stage.key === PipelineStatus.archived) ? archiveStage ? { width: '100%', height: '155px' } : {} : {}} viewBox="0 0 160 147">
      <defs>
        <style>{`.cls-${stage.key}{fill:url(#linear-gradient-${stage.key})}`}</style>
        <linearGradient id={`linear-gradient-${stage.key}`} x1="-172.56" y1="338.81" x2="-173.35" y2="338.81" gradientTransform="matrix(160, 0, 0, -147, 27746.58, 49878.92)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={stage.startColor}/><stop offset="1" stopColor={stage.endColor}/>
        </linearGradient>
      </defs>
      <g>
        <path
          className={`cls-${stage.key}`}
          d={pathPoints}
        />
        <text style={stageArchiveStyles} className={styles.quantity} x='47%' y={yCoordinate} dominantBaseline="middle" textAnchor="middle">{stageQuantityText}</text>
        {/*
          <foreignObject> doesn't have ie support which and <text> doesn't
          wrap which is why we are mapping over the string and creating
          <text> for each line break
        */}
        { stage.label.split(' ').map((subString, index) =>
          <text
            className={styles.label}
            x='47%' y={`${68 + index * 10}%`}
            dominantBaseline='middle'
            textAnchor='middle'
            key={index}
          >
            {subString}
          </text>
        )}
        { activeStage
          ? stage.arrow
            ? <path fill='#707070' d="M2.6,2v143h146.9V82v-0.9l0.6-0.6l7.5-7l-7.5-7.1l-0.6-0.6V65V2H2.4 M0.4,0h150.9v65l9.1,8.5l-9.1,8.4v65H0.4V0z"/>
            : <path fill='#707070' d="M2.6,2v143h146.9V2H2.4 M151.3,82v65H0.4V0h150.9v65"/>
          : stage.arrow
            ? <path id="Path_1765" stroke='#FFFFFF' fill='none' d="M151.3,0.1v65l8.7,8.7l-8.7,8.7v64.6"/>
            : <line x1="151.3" y1="0.1" x2="151.3" y2="146.9" fill='none' stroke='#FFFFFF'/>
        }
      </g>
    </svg>
  </div>
}

export default Stage
