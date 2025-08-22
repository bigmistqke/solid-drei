import { useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect, onCleanup, splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { autodispose, Entity, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { DeviceOrientationControls as DeviceOrientationControlsImp } from 'three-stdlib'

export interface DeviceOrientationControlsProps
  extends Omit<S3.Props<DeviceOrientationControlsImp>, 'object'> {
  ref?: Ref<DeviceOrientationControlsImp>
  camera?: THREE.Camera
  onChange?: (e?: THREE.Event) => void
  makeCurrent?: boolean
}

export function DeviceOrientationControls(props: DeviceOrientationControlsProps) {
  const [config, rest] = splitProps(props, ['ref', 'camera', 'onChange', 'makeCurrent'])
  const store = useThree()

  const explCamera = config.camera || store.currentCamera
  const controls = new DeviceOrientationControlsImp(explCamera)

  createEffect(() => {
    const callback = (e: THREE.Event) => {
      store.requestRender()
      if (config.onChange) config.onChange(e)
    }
    controls.addEventListener?.('change', callback)
    onCleanup(() => controls.removeEventListener?.('change', callback))
  })

  useFrame(
    () => controls.update(),
    () => -1,
  )

  createEffect(() => {
    const current = controls
    current.connect()
    onCleanup(() => current.dispose())
  })

  createEffect(() => {
    if (config.makeCurrent) {
      store.setControls(controls)
    }
  })

  useRef(config, controls)

  return <Entity from={autodispose(controls)} {...rest} />
}
