import useContentAdjustment from './useContentAdjustment'

function useCenteredContent(deps?: any[]) {
  useContentAdjustment({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0'
  }, deps)
}

export default useCenteredContent
