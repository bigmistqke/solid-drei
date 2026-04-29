import { processProps } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect, createRenderEffect, createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { autodispose, useFrame, useProps, useThree } from 'solid-three'
import * as THREE from 'three'
import { TrackballControls as TreeTrackballControls } from 'three-stdlib'
import { useAutolisten } from './useAutolisten'

export interface TrackballControlsProps
  extends Omit<S3.Props<typeof TreeTrackballControls>, 'object'> {
  ref?: Ref<TreeTrackballControls>
  camera?: S3.CameraKind
  domElement?: HTMLElement
  enabled?: boolean
  regress?: boolean
  target?: S3.Vector3
  onChange?: (e?: THREE.Event) => void
  onEnd?: (e?: THREE.Event) => void
  onStart?: (e?: THREE.Event) => void
}

export function useTrackballControls(props: TrackballControlsProps) {
  const store = useThree()
  const [config, rest] = processProps(
    props,
    {
      enabled: true,
      get domElement() {
        return store.canvas
      },
    },
    ['camera', 'domElement', 'enabled', 'regress', 'onChange', 'onStart', 'onEnd'],
  )

  const controls = createMemo(() => {
    const ctrl = autodispose(new TreeTrackballControls(props.camera || store.camera))
    const autolisten = useAutolisten(() => ctrl)

    // Connect to domElement (defaults to store.canvas)
    createRenderEffect(
      () => config.domElement,
      (elem) => ctrl.connect(elem),
    )

    // Attach event-listeners
    createRenderEffect(
      () => config.onStart,
      (onStart) => autolisten('start', onStart),
    )
    createRenderEffect(
      () => config.onChange,
      (onChange) => autolisten('change', onChange),
    )
    createRenderEffect(
      () => config.onEnd,
      (onEnd) => autolisten('end', onEnd),
    )

    // Call resize-handler whenever store.bounds updates
    createRenderEffect(
      () => store.bounds,
      () => { ctrl.handleResize() },
    )

    // Apply props
    useProps(ctrl, rest, store)

    // Update controls on each frame
    useFrame(() => ctrl.update())

    return ctrl
  })

  createEffect(
    () => config.enabled,
    (enabled) => { controls().enabled = enabled },
  )

  return {
    controls,
  }
}

export function TrackballControls(props: TrackballControlsProps) {
  useTrackballControls(props)
  return null!
}
