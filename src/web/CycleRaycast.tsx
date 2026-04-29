import { defaultProps } from '@/utils'
import { createEffect, onCleanup } from 'solid-js'
import { useThree } from 'solid-three'
import * as THREE from 'three'

export type CycleRaycastProps = {
  onChanged?: (hits: THREE.Intersection[], cycle: number) => void
  preventDefault?: boolean
  scroll?: boolean
  keyCode?: number
  portal?: HTMLElement
}

/**
 * CycleRaycast allows cycling through intersecting objects with keyboard/wheel events.
 * Note: event filter functionality requires R3F-compatible event system.
 */
export function CycleRaycast(_props: CycleRaycastProps) {
  const props = defaultProps(_props, {
    preventDefault: true,
    scroll: true,
    keyCode: 9,
  })

  let cycle = 0
  const store = useThree()

  createEffect(() => {
    let hits: THREE.Intersection[] = []
    let lastEvent: PointerEvent = undefined!
    const target = props.portal ?? (store.gl.domElement.parentNode as HTMLElement)

    const renderStatus = () => {
      if (target && props.onChanged) {
        props.onChanged(hits, Math.round(cycle) % Math.max(hits.length, 1))
      }
    }

    // Cycle, refresh events and render status
    const refresh = (fn: (current: number) => number) => {
      cycle = fn(cycle)
      renderStatus()
    }

    // Key events
    const tabEvent = (event: KeyboardEvent) => {
      if (event.keyCode || event.which === props.keyCode) {
        if (props.preventDefault) event.preventDefault()
        if (hits.length > 1) refresh(current => current + 1)
      }
    }

    // Wheel events
    const wheelEvent = (event: WheelEvent) => {
      if (props.preventDefault) event.preventDefault()
      let delta = 0
      if (!event) event = window.event as WheelEvent
      if ((event as unknown as { wheelDelta: number }).wheelDelta) {
        delta = (event as unknown as { wheelDelta: number }).wheelDelta / 120
      } else if (event.detail) {
        delta = -event.detail / 3
      }
      if (hits.length > 1) refresh(current => Math.abs(current - delta))
    }

    // Catch last move event
    const moveEvent = (event: PointerEvent) => (lastEvent = event)

    document.addEventListener('pointermove', moveEvent, { passive: true })
    if (props.scroll) document.addEventListener('wheel', wheelEvent, { passive: !props.preventDefault })
    if (props.keyCode !== undefined) document.addEventListener('keydown', tabEvent)

    onCleanup(() => {
      if (props.keyCode !== undefined) document.removeEventListener('keydown', tabEvent)
      if (props.scroll) document.removeEventListener('wheel', wheelEvent)
      document.removeEventListener('pointermove', moveEvent)
    })
  })

  return null
}
