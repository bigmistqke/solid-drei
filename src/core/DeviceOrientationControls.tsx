import { useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect, omit } from 'solid-js'
import type { S3 } from 'solid-three'
import { autodispose, Entity, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { DeviceOrientationControls as DeviceOrientationControlsImp } from 'three-stdlib'

export interface DeviceOrientationControlsProps
  extends Omit<S3.Props<DeviceOrientationControlsImp>, 'object'> {
  ref?: Ref<DeviceOrientationControlsImp>
  camera?: THREE.Camera
  onChange?: (e?: THREE.Event<string, unknown>) => void
  makeCurrent?: boolean
}

export function DeviceOrientationControls(props: DeviceOrientationControlsProps) {
  const rest = omit(props, 'ref', 'camera', 'onChange', 'makeCurrent')
  const store = useThree()

  const explCamera = props.camera || store.camera
  const controls = new DeviceOrientationControlsImp(explCamera)

  createEffect(
    () => props.onChange,
    () => {
      const callback = (e: THREE.Event<string, unknown>) => {
        store.requestRender()
        if (props.onChange) props.onChange(e)
      }
      controls.addEventListener?.('change', callback)
      return () => controls.removeEventListener?.('change', callback)
    },
  )

  useFrame(() => controls.update(), { priority: -1 })

  createEffect(
    () => controls,
    () => {
      const current = controls
      current.connect()
      return () => current.dispose()
    },
  )

  useRef(props, controls)

  return <Entity from={autodispose(controls)} {...rest} />
}
