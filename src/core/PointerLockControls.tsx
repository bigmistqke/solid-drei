import { processProps } from '@/utils/process-props'
import { createEffect, createSignal, type JSXElement } from 'solid-js'
import { autodispose, autolisten, useProps, useThree, type S3 } from 'solid-three'
import * as THREE from 'three'
import { PointerLockControls as ThreePointerLockControls } from 'three-stdlib'

export interface PointerLockControlsOptions
  extends Omit<S3.Props<typeof ThreePointerLockControls>, 'camera'> {
  selector?: string
  enabled?: boolean
  onChange?: (e?: THREE.Event) => void
  onLock?: (e?: THREE.Event) => void
  onUnlock?: (e?: THREE.Event) => void
}

export function usePointerLockControls(store: S3.Context, options?: PointerLockControlsOptions) {
  const [config, rest] = processProps(options ?? {}, { enabled: true, domElement: store.canvas }, [
    'domElement',
    'selector',
    'onChange',
    'onLock',
    'onUnlock',
    'enabled',
  ])

  const [active, setActive] = createSignal<boolean>(false)

  const controls = autodispose(new ThreePointerLockControls(store.currentCamera))

  useProps(controls, rest)

  autolisten(controls)('lock', event => (setActive(true), config.onLock?.(event)))
  autolisten(controls)('unlock', event => (setActive(false), config.onUnlock?.(event)))

  createEffect(() => {
    if (!config.enabled) return

    createEffect(() => controls.connect(store.canvas))

    createEffect(() => autolisten(controls)('change', config.onChange))

    createEffect(() => {
      if (config.selector) {
        for (const element of document.querySelectorAll(config.selector)) {
          autolisten(element)('click', controls.lock.bind(controls))
        }
        return
      }
      autolisten(store.canvas)('click', controls.lock.bind(controls))
    })
  })

  return {
    controls,
    get active() {
      return active()
    },
  }
}

export function PointerLockControls(props: PointerLockControlsOptions) {
  usePointerLockControls(useThree(), props)
  return null as unknown as JSXElement
}
