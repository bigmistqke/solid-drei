import { ControlUtils } from '@/core/control-utils'
import { useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createMemo, splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import type { Event, OrthographicCamera, PerspectiveCamera } from 'three'
import { ArcballControls as ThreeArcballControls } from 'three-stdlib'

export interface ArcballControlsProps extends S3.Props<ThreeArcballControls> {
  ref?: Ref<ThreeArcballControls>
  camera?: OrthographicCamera | PerspectiveCamera
  domElement?: HTMLElement
  makeCurrent?: boolean
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
    'makeCurrent',
    'regress',
    'domElement',
    'onChange',
    'onStart',
    'onEnd',
  ])
  const store = useThree()
  const camera = () => config.camera || store.currentCamera
  const element = () => ControlUtils.getDomElement(store, config)
  const controls = createMemo(() => new ThreeArcballControls(camera()))

  ControlUtils.initialize(controls, element, store, config)
  ControlUtils.addEventHandler(controls, 'change', event => config.onChange?.(event))
  ControlUtils.addEventHandler(controls, 'start', event => config.onStart?.(event))
  ControlUtils.addEventHandler(controls, 'end', event => config.onEnd?.(event))

  useRef(props, controls)

  return <Entity from={controls()} {...rest} />
}
