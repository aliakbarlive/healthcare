import useContentAdjustment from './useContentAdjustment'

function useFullContentArea(deps?: any[]) {
  useContentAdjustment({
    maxWidth: 'unset',
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0
  }, deps)
}

export default useFullContentArea
