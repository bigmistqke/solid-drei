import { Accessor } from 'solid-js'
import { useThree } from 'solid-three'

export function useAspect(
  width: number,
  height: number,
  factor: number = 1,
): Accessor<[number, number, number]> {
  const store = useThree()
  const adaptedHeight = () =>
    height *
    (store.viewport.aspect > width / height
      ? store.viewport.width / width
      : store.viewport.height / height)
  const adaptedWidth = () =>
    width *
    (store.viewport.aspect > width / height
      ? store.viewport.width / width
      : store.viewport.height / height)
  return () => [adaptedWidth() * factor, adaptedHeight() * factor, 1]
}
