import React, { useState, ReactElement } from 'react'
import { startCase } from 'lodash'
import moment from 'moment'
import styles from './Table.module.scss'
import { thousandsComma } from 'Utilities/etc'
import Loader from './Loader'
import Error from 'Components/Primitives/Error'
import { Link } from 'react-router-dom'
import { csv } from 'Utilities/csv'
import { GAButton } from 'Components/Tracking'

/**
 * Type safe Table, based on the typed interface of the data props.
 *
 * Note, nested data is more complex, we provide ways to handle that
 * automatically, but you will need to add more props.
 *
 * eg. sorting a column that is {} will require you to override the
 * sorter function since we can’t know how to sort that. This
 * would be easy in Swift :P
 */

// TODO email type and then we automatically render it, link type etc.

export interface Identifiable {
  id: any
}

enum Alignment {
  left, center, right
}

interface BaseTableProps<T extends Identifiable> {
  /// do you want a different title than the JSON key? Return something here.
  heading?: (key: keyof T) => string | undefined | null

  showHeader?: boolean
  showReportBtn?: boolean
  showPremiums?: boolean
  /// do you want to render the data differently than our defaults? Return something here.
  content?: (key: keyof T, value: any, row: T) => any | null

  /// without this keys are randomly ordered, sadly, please fix to be declaration order if poss.
  /// as a result this is also the list of items from the data that are rendered
  order?: Array<keyof T>

  /// visual column (not headers) alignment
  alignment?: (key: keyof T) => Alignment

  /// column that should be sorted by default, UI shows the arrow, don’t set to use supplied order of `data`
  defaultSort?: keyof T

  /// choose a default sort direction on a column by column basis, if unsupplied default sort is ascending
  defaultSortDirection?: (key: keyof T) => SortDirection

  /// secondary sorts (used when primary sorts are identical)
  secondarySort?: (key: keyof T) => Array<keyof T>

  /// array of keys that are sortable
  sortable?: boolean | Array<keyof T>

  /// for columns that have values JS cannot otherwise sort, eg. objects
  sortValue?: (key: keyof T, value: any) => any | null

  /// hovering on headers will show this tooltip if provided for the key
  headerToolTip?: (key: keyof T) => string | undefined | null

  /// causes the table to show a row highlight and execute this callback if clicked
  selectAction?: (row: T) => void

  // width of each column
  width?: (key: keyof T) => string | undefined

  truncate?: (key: keyof T) => boolean

  style?: any
  className?: string

  selectable?: (row: T) => boolean

  /// if `undefined` no report button will be shown
  reportFileBasename?: string

  /// if you return something here, it ends up in the generated CSV
  /// otherwise we call your content function, if you return **a string** there we use it
  /// if you don't return a string from content we see if the original data object is a string and use that
  /// if it isn't we transform the return from content into a string and use that
  /// if you don't implement or return undefined from both reportContent or content we transform the original value to a string and use that
  reportContent?: (key: keyof T, value: any, row: T) => string | undefined

  scrollable?: boolean // NOTE maybe doesn’t work
}

interface TableProps<T extends Identifiable> extends BaseTableProps<T> {
  data: T[]
}

enum SortDirection {
  ascending, descending
}

interface SortType<T> {
  key: keyof T
  direction: SortDirection
}

const Table = <T extends Identifiable>(props: TableProps<T> & { children?: React.ReactNode }) => {
  const [sortKey, setSortKey] = useState(extractDefaultSort())
  const sortableKeys = extractSortableKeys()
  const keys = props.order || (Object.keys(props.data[0]) as Array<keyof T>)
  const params = new URLSearchParams(window.location.search)
  if (params.has('show-ids')) {
    keys.push('id')
  }

  const headings: [keyof T, string][] = keys.map(key => {
    let heading: string | undefined | null = null
    if (props.heading) {
      heading = props.heading(key)
    }
    if (!heading) {
      heading = startCase(key as string)
    }
    return [key, heading]
  })

  function width(key: keyof T): string | undefined {
    return props.width && props.width(key)
  }

  function truncate(key: keyof T): string | undefined {
    if (!props.truncate) { return undefined }
    return props.truncate(key) ? styles.wrap : undefined
  }

  const classes = [styles.candor]
  if (props.scrollable) classes.push(styles.scrollable)
  if (props.selectAction && props.data.length) classes.push(styles.hoverable)
  if (props.className) classes.push(props.className)

  const data = props.data.length === 0
    ? <tr>{keys.map((key, i) => <td key={`${key}+ ${i}`}></td>)}</tr>
    : sortedData().map(tr)
  return <>
    <table className={classes.join(' ')} style={props.style}>
      {props.showHeader === undefined || props.showHeader === true ? header() : undefined}
      <tbody>
        {data}
      </tbody>
    </table>
    <div className={styles.tableDiscalimer}>
      <div>
        {!props.showPremiums &&
          <label className={styles.discLabel}>Premiums and commissions may not reflect the most recent QLE changes to group coverage.</label>}
      </div>
      {!props.showReportBtn && <GAButton
        analytics={`Download Report (${Table.name})`}
        style={{ display: props.reportFileBasename && props.data.length > 0 ? 'flex' : 'none' }}
        className={styles.downloadReport}
        onClick={downloadReport}>
        <i className="material-icons">cloud_download</i> Download Report
      </GAButton>}
    </div>
    <div>

    </div>
  </>

  function header() {
    return <thead>
      <tr>
        {headings.map(th)}
      </tr>
    </thead>
  }

  function th(content: [keyof T, string]): React.ReactElement {
    const [key, value] = content
    const thWidth = width(key)

    // first column should left align title if it is also left aligned
    const classes: string[] = []
    if (key === keys[0] && alignment(key) === Alignment.left) classes.push(styles.left)
    if (isSortable(key)) classes.push(styles.clickable)
    if (sortKey?.key === key) classes.push(styles.isSorted)

    let tooltip: string | undefined
    if (props.headerToolTip) tooltip = props.headerToolTip(key) || undefined

    return <th
      title={tooltip}
      style={{ width: thWidth || 'initial' }}
      className={classes.join(' ')}
      key={key as string}
      onClick={() => onHeaderClick(key)}
    >
      <div>
        {value}{arrow()}
      </div>
    </th>

    function arrow(): ReactElement | undefined {
      if (!sortKey) return undefined
      if (key !== sortKey.key) return undefined
      let rv = false
      if (typeof sortableKeys === 'boolean') {
        rv = sortableKeys
      } else if ((sortableKeys as Array<keyof T>).includes(key)) {
        rv = true
      }
      if (!rv) return undefined
      const foo = `keyboard_arrow_${sortKey.direction === SortDirection.ascending ? 'up' : 'down'}`
      return <i className={`material-icons ${styles.arrow}`}>{foo}</i>
    }
  }

  function content(key: keyof T, value: any, row: T): any {
    let customContentProvided = false
    if (props.content) {
      const newValue = props.content(key, value, row)
      // returning null presumes we *want* null
      // returning undefined presumes we want the original value
      if (newValue !== undefined) {
        value = newValue
        customContentProvided = true
      }
    }

    function transform(key: keyof T, value: any): any {
      if (value === undefined || value === null) {
        return '—'
      }
      if (value.type === Link) {
        if (value.props.onClick) return value
        // prevent the table row getting the click event
        return React.cloneElement(value, { onClick: e => e.stopPropagation() })
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '—'
        } else {
          return <ul>{value.map((value, ii) => <li key={ii}>{transform(key, value)}</li>)}</ul>
        }
      }
      if (value instanceof Date) {
        return moment.utc(value).format('L')
      }
      if (typeof value === 'number') {
        if (value === 0 && !customContentProvided) {
          return '—'
        } else {
          return thousandsComma(value)
        }
      }
      if (typeof value === 'boolean') {
        if (key === 'flagged' || key === 'qle') {
          return <div className={value ? styles.needAttention : styles.itsFine} />
        }
        return value ? '√' : '—'
      }
      if (typeof value.email === 'string') {
        return <a onClick={e => e.stopPropagation()} href={`mailto:${value.email}`}>{value.name || value.email}</a>
      }
      if (typeof value.name === 'string') {
        value = value.name
      }
      if (typeof value === 'string') {
        if (!customContentProvided && value === '$0.00') {
          return '—'
        } else {
          // must provide something that isn’t falsy or potentially objects are returned
          // below which causes React to throw
          value = value.trim() || '—'
        }
      }
      if (typeof value === 'object' && !React.isValidElement(value)) {
        // ^^ mainly for debug/dev
        return <pre>{JSON.stringify(value)}</pre>
      }
      return value
    }

    return transform(key, value)
  }

  function tr(datum: T): React.ReactElement {
    return <tr key={datum.id + Math.random().toFixed(4)} onClick={onClick()} className={className()}>
      {keys.map((key: keyof T) => {
        const tdWidth = width(key)
        const classes = [alignmentClassName(key), truncate(key)]
        return <td
          key={key as string}
          style={{ width: tdWidth || 'implicit' }}
          className={classes.join(' ')}
        >
          {content(key, datum[key], datum)}
        </td>
      })}
    </tr>

    function onClick() {
      if (selectable()) return () => props.selectAction!(datum)
    }
    function className() {
      if (!selectable()) return styles.unselectable
    }
    function selectable() {
      return (props.selectAction && props.selectable) ? props.selectable(datum) : false
    }
  }

  function alignment(key: keyof T): Alignment {
    if (props.alignment) {
      return props.alignment(key)
    } else {
      return Alignment.left
    }
  }

  function alignmentClassName(key: keyof T): string {
    switch (alignment(key)) {
    case Alignment.left: return styles.left
    case Alignment.center: return styles.center
    case Alignment.right: return styles.right
    }
  }

  function onHeaderClick(key: keyof T) {
    if (!isSortable(key)) return
    const direction = sortKey?.key === key
      ? flip(sortKey!.direction)
      : props.defaultSortDirection
        ? props.defaultSortDirection(key)
        : SortDirection.ascending
    setSortKey({ key, direction: direction })
  }

  function sortedData() {
    // FIXME could be cleaner (single loop)

    if (!sortKey) return props.data
    const key = sortKey.key
    const polarity = polarityForSortDirection(sortKey.direction)

    return [...props.data].sort((a, b) => {
      const [av, bv] = [value(key, a), value(key, b)]
      if (av < bv) return -polarity
      if (av > bv) return polarity
      if (props.secondarySort) {
        for (const key2 of props.secondarySort(key)) {
          const [av, bv] = [value(key2, a), value(key2, b)]
          const polarity = polarityForSortDirection(props.defaultSortDirection ? props.defaultSortDirection(key2) : SortDirection.ascending)
          if (av < bv) return -polarity
          if (av > bv) return polarity
        }
        return 0 // nothing matched at all
      } else {
        return 0
      }
    })

    function value(key: keyof T, row: T) {
      const value = getValue()
      if (typeof value === 'string') return value.toLowerCase()
      return value

      function getValue() {
        if (props.sortValue) {
          const value = props.sortValue(key, row[key])
          if (value) return value
        }

        // if content is sortable and a sortValue was not specified, sort with the content
        // we try to get the props content before we apply transformations, since eg. props
        // content is probably the actual Date object rather than our string of that Date
        const value = row[key]
        const content_ = (props.content || content)(key, value, row)

        switch (typeof content_) {
        case 'string':
        case 'number':
        case 'boolean':
          return content_
        default:
          if (content_ instanceof Date) {
            return content_
          } else {
            // we auto-grab name out of {} so we should auto-sort it too, if there
            const data = row[key]
            return (data as any)?.name || data
          }
        }
      }
    }

    function polarityForSortDirection(direction: SortDirection): number {
      switch (direction) {
      case SortDirection.ascending:
        return 1
      case SortDirection.descending:
        return -1
      }
    }
  }

  function extractDefaultSort(): SortType<T> | undefined {
    if (!props.defaultSort) return undefined
    const direction = props.defaultSortDirection ? props.defaultSortDirection(props.defaultSort) : SortDirection.ascending
    return { key: props.defaultSort, direction }
  }

  function extractSortableKeys(): Array<keyof T> | boolean {
    if (Array.isArray(props.sortable)) {
      return props.sortable
    } else if (props.sortable !== false) {
      return true // everything is sortable by default
    } else {
      return props.sortable as boolean
    }
  }

  function isSortable(key: keyof T): boolean {
    if (props.sortable !== false && !Array.isArray(props.sortable)) {
      return true
    } else if (Array.isArray(props.sortable)) {
      return props.sortable.includes(key)
    } else {
      return props.sortable as boolean
    }
  }

  function downloadReport() {
    const basename = `${props.reportFileBasename}-${moment().format('MM-DD-YYYY')}`
    const element = document.createElement('a')
    const headers = headings.map(([, value]) => value) as any[]
    const rows = sortedData().map(transform)
    const data = csv([headers].concat(rows))
    const file = new Blob([data], { type: 'text/csv' })
    element.href = URL.createObjectURL(file)
    element.download = `${basename}.csv`
    document.body.appendChild(element) // required for this to work in FireFox
    element.click()

    function transform(row: T): string[] {
      return keys.map(key => {
        const value = row[key] as any
        if (props.reportContent) {
          const rv = props.reportContent(key, value, row)
          if (rv !== undefined) return rv
        }
        if (props.content) {
          const rv = props.content(key, value, row)
          if (rv === undefined) return getRawValue()
          if (typeof rv === 'string') return rv
          if (typeof value === 'string') return value
          if (rv instanceof Date) return moment(rv).format('L')
          return `${rv}`
        }
        return getRawValue()
        function getRawValue(): string {
          if (value === undefined || value === null) return ''
          if (value && typeof value.email === 'string') {
            // same as what we do for `content`
            return value.email
          }
          if (value instanceof Date) return moment(value).format('L')
          return `${value}`
        }
      })
    }
  }
}

interface AsyncTableProps<T extends Identifiable> extends BaseTableProps<T> {
  async: {
    value?: T[]
    loading: boolean
    error?: Error
  }

  // use for eg. filtering, or other manipulation before the data is consumed by the table
  mangle?: (input: T[]) => T[]
}

const AsyncTable = <T extends Identifiable>(rawProps: AsyncTableProps<T>) => {
  const { async, ...props } = rawProps
  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />
  let data = async.value!
  if (rawProps.mangle) data = rawProps.mangle(data)
  return <Table {...props} data={data} />
}

export { Table, AsyncTable, Alignment, SortDirection }

function flip(direction: SortDirection): SortDirection {
  switch (direction) {
  case SortDirection.ascending:
    return SortDirection.descending
  case SortDirection.descending:
    return SortDirection.ascending
  }
}
