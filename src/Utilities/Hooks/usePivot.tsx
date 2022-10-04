import { useSet } from 'react-use'
import ReactDOM from 'react-dom'

export enum Side {
  left, right
}

function usePivot<T>(initialValues: { left?: Set<T>, right?: Set<T>} | undefined = undefined): [[Set<T>, (t: T) => void], [Set<T>, (t: T) => void], { side: (t: T) => Side | undefined, size: number, slot: (t: T, side: Side) => void, reset(): void }] {
  const [left, { add: addToLeft, remove: removeFromLeft }] = useSet<T>(initialValues?.left)
  const [right, { add: addToRight, remove: removeFromRight }] = useSet<T>(initialValues?.right)

  return [
    [
      left,
      (t: T) => slot(t, Side.left)
    ],
    [
      right,
      (t: T) => slot(t, Side.right)
    ],
    {
      side: (t: T) => {
        if (left.has(t)) { return Side.left }
        if (right.has(t)) { return Side.right }
        return undefined
      },
      size: left.size + right.size,
      slot,
      reset
    }
  ]

  function reset() {
    // Not using useSet reset because it will only switch back to the initial initial value which is none for left and all for right
    left.forEach(removeFromLeft)
    right.forEach(removeFromRight)
    initialValues?.left?.forEach(addToLeft)
    initialValues?.right?.forEach(addToRight)
  }

  function slot(t: T, side: Side | undefined) {
    ReactDOM.unstable_batchedUpdates(() => {
      switch (side) {
      case Side.left:
        addToLeft(t)
        removeFromRight(t)
        break
      case Side.right:
        addToRight(t)
        removeFromLeft(t)
        break
      case undefined:
        removeFromLeft(t)
        removeFromRight(t)
      }
    })
  }
}

export default usePivot
