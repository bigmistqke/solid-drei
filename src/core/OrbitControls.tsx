import { processProps } from '@/utils'
import { whenComputed } from '@/utils/conditionals'
import { createMemo, createRenderEffect, onCleanup, type JSXElement, type Ref } from 'solid-js'
import { autodispose, useFrame, useProps, useThree, type S3 } from 'solid-three'
import { OrthographicCamera, PerspectiveCamera, type Event } from 'three'
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib'
import { useAutolisten } from './useAutolisten'

export interface OrbitControlsOptions extends S3.Props<typeof ThreeOrbitControls> {
  ref?: Ref<ThreeOrbitControls>
  enableDamping?: boolean
  camera?: PerspectiveCamera | OrthographicCamera
  onChange?: (e?: Event<'change', ThreeOrbitControls>) => void
  onEnd?: (e?: Event<'end', ThreeOrbitControls>) => void
  onStart?: (e?: Event<'start', ThreeOrbitControls>) => void
  regress?: boolean
  target?: S3.Vector3
  keyEvents?: boolean | HTMLElement
}

export function OrbitControls(props: OrbitControlsOptions) {
  useOrbitControls(props)
  return null as unknown as JSXElement
}

export function useOrbitControls(options?: OrbitControlsOptions) {
  const store = useThree()

  const [config, rest] = processProps(
    options ?? {},
    {
      enableDamping: true,
      keyEvents: false,
      enabled: true,
      get camera() {
        return store.camera
      },
      get domElement() {
        return store.gl.domElement
      },
    },
    [
      'camera',
      'dispose',
      'domElement',
      'enabled',
      'keyEvents',
      'object',
      'onChange',
      'onEnd',
      'onStart',
      'regress',
    ],
  )

  const controls = createMemo<ThreeOrbitControls>(() => {
    const controls = autodispose(new ThreeOrbitControls(config.camera))
    const autolisten = useAutolisten(controls)

    whenComputed(
      () => config.enabled,
      () => {
        // Enable OrbitControls
        controls.enabled = true
        // Disable OrbitControls on cleanup
        onCleanup(() => (controls.enabled = false))

        // Connect to domElement (defaults to store.canvas)
        createRenderEffect(
          () => config.domElement,
          () => controls.connect(config.domElement),
        )

        // Attach event-listeners
        createRenderEffect(
          () => config.onStart,
          () => autolisten('start', config.onStart),
        )
        createRenderEffect(
          () => config.onChange,
          () => autolisten('change', config.onChange),
        )
        createRenderEffect(
          () => config.onEnd,
          () => autolisten('end', config.onEnd),
        )

        // Apply props
        useProps(controls, rest, store)

        // Update controls on each frame
        useFrame(controls.update)
      },
    )
    return controls
  })

  return {
    controls,
  }
}
