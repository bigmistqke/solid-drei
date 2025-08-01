import { ControlUtils } from '@/core/control-utils'
import { processProps } from '@/utils/process-props'
import { Ref, createEffect, createMemo } from 'solid-js'
import { S3, T, useThree } from 'solid-three'
import type { Event } from 'three'
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib'

export type OrbitControlsProps = S3.ClassProps<typeof ThreeOrbitControls> & {
  ref?: Ref<ThreeOrbitControls>
  camera?: S3.CameraType
  domElement?: HTMLElement
  enableDamping?: boolean
  makeDefault?: boolean
  onChange?: (e?: Event<'change', ThreeOrbitControls>) => void
  onEnd?: (e?: Event<'end', ThreeOrbitControls>) => void
  onStart?: (e?: Event<'start', ThreeOrbitControls>) => void
  regress?: boolean
  target?: S3.Vector3
  keyEvents?: boolean | HTMLElement
}

export function OrbitControls(props: OrbitControlsProps) {
  const [config, rest] = processProps(
    props,
    {
      enableDamping: true,
      keyEvents: false,
    },
    [
      'makeDefault',
      'camera',
      'regress',
      'domElement',
      'keyEvents',
      'onChange',
      'onStart',
      'onEnd',
      'object',
      'dispose',
    ],
  )
  const store = useThree()
  const element = () =>
    config.keyEvents instanceof HTMLElement
      ? config.keyEvents
      : ControlUtils.getDomElement(store, config)
  const camera = () => config.camera || store.camera
  const controls = createMemo(() => new ThreeOrbitControls(camera()))

  ControlUtils.initialize(controls, element, store, config)
  createEffect(() => {
    if (!config.onChange) return
    ControlUtils.addEventHandler(controls, 'change', config.onChange)
  })
  createEffect(() => {
    if (!config.onEnd) return
    ControlUtils.addEventHandler(controls, 'end', config.onEnd)
  })
  createEffect(() => {
    if (!config.onStart) return
    ControlUtils.addEventHandler(controls, 'start', config.onStart)
  })

  return <T.Primitive ref={props.ref} object={controls()} {...rest} />
}
