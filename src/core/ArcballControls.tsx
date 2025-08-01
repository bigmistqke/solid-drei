import { ControlUtils } from '@/core/control-utils'
import { Ref, createMemo, splitProps } from 'solid-js'
import { S3, T, useThree } from 'solid-three'
import type { Event, OrthographicCamera, PerspectiveCamera } from 'three'
import { ArcballControls as ThreeArcballControls } from 'three-stdlib'

export interface ArcballControlsProps extends S3.ClassProps<ThreeArcballControls> {
  ref?: Ref<ThreeArcballControls>
  camera?: OrthographicCamera | PerspectiveCamera
  domElement?: HTMLElement
  makeDefault?: boolean
  onChange?: (e?: Event) => void
  onEnd?: (e?: Event) => void
  onStart?: (e?: Event) => void
  regress?: boolean
  target?: S3.Vector3
}

export function ArcballControls(props: ArcballControlsProps) {
  const [config, rest] = splitProps(props, [
    'ref',
    'camera',
    'makeDefault',
    'regress',
    'domElement',
    'onChange',
    'onStart',
    'onEnd',
  ])
  const store = useThree()
  const camera = () => config.camera || store.camera
  const element = () => ControlUtils.getDomElement(store, config)
  const controls = createMemo(() => new ThreeArcballControls(camera()))

  ControlUtils.initialize(controls, element, store, config)
  ControlUtils.addEventHandler(controls, 'change', event => config.onChange?.(event))
  ControlUtils.addEventHandler(controls, 'start', event => config.onStart?.(event))
  ControlUtils.addEventHandler(controls, 'end', event => config.onEnd?.(event))

  return <T.Primitive ref={config.ref} object={controls()} {...rest} />
}
