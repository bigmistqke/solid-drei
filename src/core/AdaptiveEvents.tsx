import { onSettled } from 'solid-js'
import { useThree } from 'solid-three'
import { usePerformanceMonitor } from './PerformanceMonitor'

export function AdaptiveEvents() {
  const store = useThree()

  usePerformanceMonitor({
    onChange: ({ factor }) => {
      if (store.gl.domElement)
        store.gl.domElement.style.pointerEvents = factor === 1 ? 'auto' : 'none'
    },
  })

  onSettled(() => () => {
    if (store.gl.domElement) store.gl.domElement.style.pointerEvents = 'auto'
  })

  return null
}
