import React, { ChangeEvent } from 'react'
import styles from './SearchBar.module.scss'

interface Props {
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  query: string
}

const SearchBar: React.FC<Props> = ({ query, setQuery, placeholder, className, style }) => {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value)
  }

  return <label style={style} className={`${styles.search} ${className}`}>
    <span className={styles.screenReaderText}>{placeholder}</span>
    <input
      placeholder={placeholder || 'Search'}
      onChange={onChange}
      value={query}/>
  </label>
}

export default SearchBar
