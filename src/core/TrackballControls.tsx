import { processProps } from '@/utils'
import { whenComputed } from '@/utils/conditionals'
import type { Ref } from 'solid-js'
import { createRenderEffect, createMemo, onCleanup } from 'solid-js'
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

  const controls = createMemo(() =>
    autodispose(new TreeTrackballControls(props.camera || store.camera)),
  )
  const autolisten = useAutolisten(controls)

  whenComputed(
    () => config.enabled,
    () => {
      // Enable OrbitControls
      controls().enabled = true
      // Disable OrbitControls on cleanup
      onCleanup(() => (controls().enabled = false))

      // Connect to domElement (defaults to store.canvas)
      createRenderEffect(() => controls().connect(config.domElement))

      // Attach event-listeners
      createRenderEffect(() => autolisten('start', config.onStart))
      createRenderEffect(() => autolisten('change', config.onChange))
      createRenderEffect(() => autolisten('end', config.onEnd))

      // Call resize-handler whenever store.bounds updates
      createRenderEffect(
        () => store.bounds,
        () => { controls().handleResize() }
      )

      // Apply props
      useProps(controls(), rest, store)

      // Update controls on each frame
      useFrame(controls().update)
    },
  )

  return {
    controls,
  }
}

export function TrackballControls(props: TrackballControlsProps) {
  useTrackballControls(props)
  return null!
}
