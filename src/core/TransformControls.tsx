import { whenever } from '@/utils/conditionals'
import { createEffect, createMemo, onCleanup, splitProps } from 'solid-js'
import type { Accessor, JSX, Ref } from 'solid-js'
import { T, useThree } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'
import { TransformControls as ThreeTransformControls } from 'three-stdlib'
import { ControlUtils } from './control-utils'

type TransformControlsPropsBase = Omit<
  S3.Props<'Group'> & S3.ClassProps<typeof ThreeTransformControls>,
  'object' | 'onMouseDown' | 'onMouseUp'
>
export interface TransformControlsProps extends TransformControlsPropsBase {
  ref?: Ref<ThreeTransformControls>
  axis?: string | null
  camera?: S3.CameraType
  children?: JSX.Element
  domElement?: HTMLElement
  enabled?: boolean
  makeDefault?: boolean
  mode?: 'translate' | 'rotate' | 'scale'
  object?: THREE.Object3D | Accessor<THREE.Object3D>
  onChange?: (e?: THREE.Event) => void
  onMouseDown?: (e?: THREE.Event) => void
  onMouseUp?: (e?: THREE.Event) => void
  onObjectChange?: (e?: THREE.Event) => void
  rotationSnap?: number | null
  scaleSnap?: number | null
  showX?: boolean
  showY?: boolean
  showZ?: boolean
  size?: number
  space?: 'world' | 'local'
  translationSnap?: number | null
}

export function TransformControls(props: TransformControlsProps) {
  const [config, rest] = splitProps(props, [
    'camera',
    'children',
    'domElement',
    'onChange',
    'onMouseDown',
    'onMouseUp',
    'onObjectChange',
    'object',
    'makeDefault',
  ])

  const [transformProps, objectProps] = splitProps(rest, [
    'ref',
    'enabled',
    'axis',
    'mode',
    'translationSnap',
    'rotationSnap',
    'scaleSnap',
    'space',
    'size',
    'showX',
    'showY',
    'showZ',
  ])

  const store = useThree()
  const camera = () => ControlUtils.getCamera(store, config)
  const element = () => ControlUtils.getDomElement(store, config)
  const controls = createMemo(() => new ThreeTransformControls(camera(), element()))
  let group: THREE.Group

  ControlUtils.makeDefault(controls, store, config)
  ControlUtils.addEventHandler(controls, 'change', event => config.onChange?.(event))
  ControlUtils.addEventHandler(controls, 'mouseUp', event => config.onMouseUp?.(event))
  ControlUtils.addEventHandler(controls, 'mouseDown', event => config.onMouseDown?.(event))
  ControlUtils.addEventHandler(controls, 'objectChange', event => config.onObjectChange?.(event))

  createEffect(
    whenever(controls, controls => {
      createEffect(() => {
        if (!store.controls) return
        function callback(event: THREE.Event<'dragging-changed'>) {
          // @ts-expect-error TODO: fix type-error
          return ((store.controls as any).enabled = !event.value)
        }
        controls.addEventListener('dragging-changed', callback)
        onCleanup(() => controls.removeEventListener('dragging-changed', callback))
      })
      createEffect(() => {
        if (config.object) {
          controls.attach(config.object instanceof THREE.Object3D ? config.object : config.object())
        } else {
          controls.attach(group)
        }
        onCleanup(() => controls.detach())
      })
    }),
  )

  return (
    <>
      <T.Primitive object={controls()} {...transformProps} />
      <T.Group ref={group!} {...objectProps}>
        {config.children}
      </T.Group>
    </>
  )
}
