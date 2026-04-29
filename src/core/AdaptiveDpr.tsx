import { onCleanup } from 'solid-js'
import { useThree } from 'solid-three'
import { usePerformanceMonitor } from './PerformanceMonitor'

export function AdaptiveDpr({ pixelated }: { pixelated?: boolean }) {
  const store = useThree()
  const initialDpr = store.dpr

  usePerformanceMonitor({
    onChange: ({ factor }) => {
      store.gl.setPixelRatio(factor * initialDpr)
      if (pixelated && store.gl.domElement)
        store.gl.domElement.style.imageRendering = factor === 1 ? 'auto' : 'pixelated'
    },
  })

  onCleanup(() => {
    store.gl.setPixelRatio(initialDpr)
    if (pixelated && store.gl.domElement) store.gl.domElement.style.imageRendering = 'auto'
  })

  return null
}
