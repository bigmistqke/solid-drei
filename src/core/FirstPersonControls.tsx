import { ControlUtils } from '@/core/control-utils'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { createMemo, splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import { FirstPersonControls as ThreeFirstPersonControl } from 'three-stdlib'

type FirstPersonControlsPropsBase = Omit<S3.Props<typeof ThreeFirstPersonControl>, 'object'>
export interface FirstPersonControlsProps extends FirstPersonControlsPropsBase {
  ref?: Ref<ThreeFirstPersonControl>
  domElement?: HTMLElement
  makeDefault?: boolean
}

export function FirstPersonControls(props: FirstPersonControlsProps) {
  const [config, rest] = splitProps(props, ['ref', 'domElement', 'makeDefault'])
  const store = useThree()
  const element = () => ControlUtils.getDomElement(store, config)
  const controls = createMemo(() => new ThreeFirstPersonControl(store.camera, element()))

  ControlUtils.initialize(controls, element, store, config)

  useRef(props, controls)

  return <Entity from={controls()} {...rest} />
}
