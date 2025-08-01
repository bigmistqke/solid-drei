import { createEffect, onCleanup } from 'solid-js'
import { useThree } from 'solid-three'

export function AdaptiveEvents() {
  const store = useThree()
  createEffect(() => {
    const enabled = store.events.enabled
    onCleanup(() => store.setEvents({ enabled }))
  }, [])
  createEffect(() => store.setEvents({ enabled: store.performance.current === 1 }))
  return null
}
