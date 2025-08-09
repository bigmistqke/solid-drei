import { when } from '@/utils/conditionals'
import type { Accessor, JSX, Ref } from 'solid-js'
import { createEffect, createMemo, onCleanup, splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import { Group, Object3D, type Event as ThreeEvent } from 'three'
import { TransformControls as ThreeTransformControls } from 'three-stdlib'
import { ControlUtils } from './control-utils'

type TransformControlsPropsBase = Omit<
  S3.Props<typeof Group> & S3.Props<typeof ThreeTransformControls>,
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
  object?: Object3D | Accessor<Object3D>
  onChange?: (e?: ThreeEvent) => void
  onMouseDown?: (e?: ThreeEvent) => void
  onMouseUp?: (e?: ThreeEvent) => void
  onObjectChange?: (e?: ThreeEvent) => void
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
  const group = new Group()

  ControlUtils.makeDefault(controls, store, config)
  ControlUtils.addEventHandler(controls, 'change', event => config.onChange?.(event))
  ControlUtils.addEventHandler(controls, 'mouseUp', event => config.onMouseUp?.(event))
  ControlUtils.addEventHandler(controls, 'mouseDown', event => config.onMouseDown?.(event))
  ControlUtils.addEventHandler(controls, 'objectChange', event => config.onObjectChange?.(event))

  createEffect(
    when(controls, controls => {
      createEffect(() => {
        if (!store.controls) return
        function callback(event: ThreeEvent<'dragging-changed'>) {
          // @ts-expect-error TODO: fix type-error
          return ((store.controls as any).enabled = !event.value)
        }
        controls.addEventListener('dragging-changed', callback)
        onCleanup(() => controls.removeEventListener('dragging-changed', callback))
      })
      createEffect(() => {
        if (config.object) {
          controls.attach(config.object instanceof Object3D ? config.object : config.object())
        } else {
          controls.attach(group)
        }
        onCleanup(() => controls.detach())
      })
    }),
  )

  return (
    <>
      <Entity from={controls()} {...transformProps} />
      <Entity from={group} {...objectProps}>
        {config.children}
      </Entity>
    </>
  )
}
