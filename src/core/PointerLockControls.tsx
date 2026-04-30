import { processProps } from '@/utils'
import { createEffect, createSignal, onCleanup, onSettled, type JSXElement } from 'solid-js'
import { autodispose, CenterRaycaster, useProps, useThree, type S3 } from 'solid-three'
import * as THREE from 'three'
// import type { EventDispatcher } from 'node_modules/three-stdlib/controls/EventDispatcher'
import { PointerLockControls as ThreePointerLockControls } from 'three-stdlib'
export declare class EventDispatcher<TEventMap extends {} = {}> {
  private _listeners
  /**
   * Adds a listener to an event type.
   * @param type The type of event to listen to.
   * @param listener The function that gets called when the event is fired.
   */
  addEventListener<T extends Extract<keyof TEventMap, string>>(
    type: T,
    listener: THREE.EventListener<TEventMap[T], T, this>,
  ): void
  /**
   * Checks if listener is added to an event type.
   * @param type The type of event to listen to.
   * @param listener The function that gets called when the event is fired.
   */
  hasEventListener<T extends Extract<keyof TEventMap, string>>(
    type: T,
    listener: THREE.EventListener<TEventMap[T], T, this>,
  ): boolean
  /**
   * Removes a listener from an event type.
   * @param type The type of the listener that gets removed.
   * @param listener The listener function that gets removed.
   */
  removeEventListener<T extends Extract<keyof TEventMap, string>>(
    type: T,
    listener: THREE.EventListener<TEventMap[T], T, this>,
  ): void
  /**
   * Fire an event type.
   * @param event The event that gets fired.
   */
  dispatchEvent<T extends Extract<keyof TEventMap, string>>(
    event: THREE.BaseEvent<T> & TEventMap[T],
  ): void
}

export interface PointerLockControlsProps
  extends Omit<S3.Props<typeof ThreePointerLockControls>, 'camera'> {
  selector?: string
  enabled?: boolean
  onChange?: (e?: THREE.Event) => void
  onLock?: (e?: THREE.Event) => void
  onUnlock?: (e?: THREE.Event) => void
  useCenterRaycaster?: boolean
}

export function PointerLockControls(props: PointerLockControlsProps) {
  usePointerLockControls(props)
  return null as unknown as JSXElement
}

export function usePointerLockControls(options: PointerLockControlsProps) {
  const store = useThree()

  const [config, rest] = processProps(
    options,
    { enabled: true, domElement: store.canvas, useCenterRaycaster: true },
    ['domElement', 'enabled', 'onChange', 'onLock', 'onUnlock', 'selector', 'useCenterRaycaster'],
  )
  const [locked, setLocked] = createSignal(false)

  const controls = autodispose(new ThreePointerLockControls(store.camera))

  // Apply props to controls
  useProps(controls, rest)

  // Attach lock/unlock listeners
  onSettled(() => {
    const ac = new AbortController()
    controls.addEventListener('lock', event => (setLocked(true), config.onLock?.(event)), { signal: ac.signal })
    controls.addEventListener('unlock', event => (setLocked(false), config.onUnlock?.(event)), { signal: ac.signal })
    return () => ac.abort()
  })

  createEffect(
    () => config.enabled,
    enabled => {
      if (!enabled) return

      createEffect(
        () => locked() && config.useCenterRaycaster,
        should => {
          if (!should) return
          return store.setRaycaster(new CenterRaycaster())
        },
      )

      createEffect(
        () => [controls, config.domElement] as const,
        ([ctrl, elem]) => ctrl.connect(elem),
      )

      createEffect(
        () => config.onChange,
        onChange => {
          if (!onChange) return
          const ac = new AbortController()
          controls.addEventListener('change', onChange, { signal: ac.signal })
          return () => ac.abort()
        },
      )

      createEffect(
        () => [config.selector, config.domElement] as const,
        ([selector, domElement]) => {
          const ac = new AbortController()
          if (selector) {
            document.querySelectorAll(selector).forEach(element =>
              element.addEventListener('click', controls.lock.bind(controls), { signal: ac.signal }),
            )
          } else {
            domElement.addEventListener('click', controls.lock.bind(controls), { signal: ac.signal })
          }
          return () => ac.abort()
        },
      )
    },
  )
}
