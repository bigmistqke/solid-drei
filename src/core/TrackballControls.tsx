import { processProps } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect, createMemo, createRenderEffect } from 'solid-js'
import type { S3 } from 'solid-three'
import { autodispose, useFrame, useProps, useThree } from 'solid-three'
import * as THREE from 'three'
import { TrackballControls as TreeTrackballControls } from 'three-stdlib'

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

    createRenderEffect(
      () => config.domElement,
      domElement => ctrl.connect(domElement),
    )
    createRenderEffect(
      () => config.onStart,
      onStart => {
        if (!onStart) return
        ctrl.addEventListener('start', onStart)
        return () => ctrl.removeEventListener('start', onStart)
      },
    )
    createRenderEffect(
      () => config.onChange,
      onChange => {
        if (!onChange) return
        ctrl.addEventListener('change', onChange)
        return () => ctrl.removeEventListener('change', onChange)
      },
    )
    createRenderEffect(
      () => config.onEnd,
      onEnd => {
        if (!onEnd) return
        ctrl.addEventListener('end', onEnd)
        return () => ctrl.removeEventListener('end', onEnd)
      },
    )
    createRenderEffect(
      () => store.bounds,
      () => { ctrl.handleResize() },
    )

    useProps(ctrl, rest, store)
    useFrame(() => ctrl.update())

    return ctrl
  })

  createEffect(
    () => config.enabled,
    enabled => { controls().enabled = enabled },
  )

  return { controls }
}

export function TrackballControls(props: TrackballControlsProps) {
  useTrackballControls(props)
  return null!
}
