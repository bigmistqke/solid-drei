import { createEffect, createMemo, splitProps } from 'solid-js'
import type { Ref } from 'solid-js'
import { T, useThree } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'
import { TrackballControls as TrackballControlsImpl } from 'three-stdlib'
import { ControlUtils } from './control-utils'

type TrackballControlsPropsBase = Omit<S3.ClassProps<typeof TrackballControlsImpl>, 'object'>
export interface TrackballControlsProps extends TrackballControlsPropsBase {
  ref?: Ref<TrackballControlsImpl>
  target?: S3.Vector3
  camera?: S3.CameraType
  domElement?: HTMLElement
  regress?: boolean
  makeDefault?: boolean
  onChange?: (e?: THREE.Event) => void
  onStart?: (e?: THREE.Event) => void
  onEnd?: (e?: THREE.Event) => void
}

export function TrackballControls(props: TrackballControlsProps) {
  const [config, rest] = splitProps(props, [
    'makeDefault',
    'camera',
    'domElement',
    'regress',
    'onChange',
    'onStart',
    'onEnd',
  ])
  const store = useThree()
  const camera = () => props.camera || store.camera
  const element = () => ControlUtils.getDomElement(store, config)
  const controls = createMemo(() => new TrackballControlsImpl(camera()))

  ControlUtils.initialize(controls, element, store, config)

  createEffect(() => {
    if (!config.onChange) return
    ControlUtils.addEventHandler(controls, 'change', config.onChange)
  })
  createEffect(() => {
    if (!config.onStart) return
    ControlUtils.addEventHandler(controls, 'start', config.onStart)
  })
  createEffect(() => {
    if (!config.onEnd) return
    ControlUtils.addEventHandler(controls, 'end', config.onEnd)
  })
  createEffect(() => controls().handleResize())

  return <T.Primitive ref={props.ref} object={controls()} {...rest} />
}
