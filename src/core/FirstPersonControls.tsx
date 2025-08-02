import { ControlUtils } from '@/core/control-utils'
import { createMemo, splitProps } from 'solid-js'
import type { Ref } from 'solid-js'
import { T, useThree } from 'solid-three'
import type { S3 } from 'solid-three'
import { FirstPersonControls as ThreeFirstPersonControl } from 'three-stdlib'

type FirstPersonControlsPropsBase = Omit<S3.ClassProps<typeof ThreeFirstPersonControl>, 'object'>
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

  return <T.Primitive ref={props.ref} object={controls()} {...rest} />
}
