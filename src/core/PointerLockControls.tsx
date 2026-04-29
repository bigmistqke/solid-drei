import { processProps } from '@/utils'
import { every, whenEffect } from '@/utils/conditionals'
import { createEffect, createSignal, onCleanup, type JSXElement } from 'solid-js'
import { autodispose, CenterRaycaster, useProps, useThree, type S3 } from 'solid-three'
import * as THREE from 'three'
// import type { EventDispatcher } from 'node_modules/three-stdlib/controls/EventDispatcher'
import { PointerLockControls as ThreePointerLockControls } from 'three-stdlib'
import { useAutolisten } from './useAutolisten'
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
  const autolisten = useAutolisten(controls)

  // Apply props to controls
  useProps(controls, rest)

  // Attach event listeners and toggle locked
  autolisten('lock', event => (setLocked(true), config.onLock?.(event)))
  autolisten('unlock', event => (setLocked(false), config.onUnlock?.(event)))

  whenEffect(
    () => config.enabled,
    () => {
      // If useCenterRaycaster isn't disabled
      // we push a CenterRaycaster to the raycaster-stack
      whenEffect(
        every(locked, () => config.useCenterRaycaster),
        () => {
          const cleanup = store.setRaycaster(new CenterRaycaster())
          onCleanup(cleanup)
        },
      )

      // Connect controls to domElement (defaults to store.canvas)
      createEffect(
        () => [controls, config.domElement] as const,
        ([ctrl, elem]) => ctrl.connect(elem)
      )

      // Attach event listener
      createEffect(
        () => config.onChange,
        (onChange) => autolisten('change', onChange)
      )

      // Bind lock to either the domElement (defaults to store.canvas)
      // or elements selected by given selector
      createEffect(
        () => [config.selector, config.domElement, controls] as const,
        ([selector, domElement, ctrl]) => {
          if (selector) {
            document.querySelectorAll(selector).forEach((element) => {
              useAutolisten(element)('click', ctrl.lock.bind(ctrl))
            })
          } else {
            useAutolisten(domElement)('click', ctrl.lock.bind(ctrl))
          }
        }
      )
    },
  )
}
