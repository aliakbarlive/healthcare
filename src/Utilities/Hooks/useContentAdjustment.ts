import { useEffect } from 'react'

function useContentAdjustment(styles: React.CSSProperties, deps?: any[]) {
  // FIXME without the two calls eslint warns that
  // the dependency array will not be correctly checked
  // and the Internet thinks any other way will cause bugs
  // however, this means we do it twice, which maybe also
  // will lead to bugs… 🤔
  useEffect(go, [styles])
  useEffect(go, deps)

  function go() {
    const el = document.getElementById('content')
    if (!el || typeof styles !== 'object') return
    for (const key in styles) {
      (el.style as any)[key] = (styles as any)[key]
      // ^^ https://stackoverflow.com/a/50506154
    }
    return () => {
      for (const key in styles) {
        (el.style as any)[key] = ''
      }
    }
  }
}

export default useContentAdjustment
