import { createEffect, onCleanup, splitProps } from 'solid-js'
import type { Ref } from 'solid-js'
import { T, useFrame, useThree } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'
import { DeviceOrientationControls as DeviceOrientationControlsImp } from 'three-stdlib'

type DeviceOrientationControlsPropsBase = Omit<
  S3.ClassProps<DeviceOrientationControlsImp>,
  'object'
>
export interface DeviceOrientationControlsProps extends DeviceOrientationControlsPropsBase {
  ref?: Ref<DeviceOrientationControlsImp>
  camera?: THREE.Camera
  onChange?: (e?: THREE.Event) => void
  makeDefault?: boolean
}

export function DeviceOrientationControls(props: DeviceOrientationControlsProps) {
  const [config, rest] = splitProps(props, ['ref', 'camera', 'onChange', 'makeDefault'])
  const store = useThree()

  const explCamera = config.camera || store.camera
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
    if (config.makeDefault) {
      store.setControls(controls)
    }
  })

  return <T.Primitive ref={config.ref} object={controls} {...rest} />
}
