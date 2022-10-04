import { useCounter } from 'react-use'

export function useCycle(max: number): [number, { next: () => void, prev: () => void, set: (value: number) => void }] {
  const [value, { inc, dec, set, reset }] = useCounter(0, max)
  return [value, { next, prev, set }]

  function next() {
    if (value === max) {
      reset()
    } else {
      inc()
    }
  }

  function prev() {
    if (value === 0) {
      set(max)
    } else {
      dec()
    }
  }
}
