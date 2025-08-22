import { resolve } from '@/utils'
import {
  createEffect,
  createMemo,
  onCleanup,
  splitProps,
  type Accessor,
  type JSX,
  type Ref,
} from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, Portal, useThree } from 'solid-three'
import { Group, Object3D, type Event as ThreeEvent } from 'three'
import { TransformControls as ThreeTransformControls } from 'three-stdlib'
import { useAutolisten } from './useAutolisten'

export interface TransformControlsProps
  extends Omit<
    S3.Props<Group> & S3.Props<ThreeTransformControls>,
    'object' | 'onMouseDown' | 'onMouseUp' | 'ref'
  > {
  ref?: Ref<ThreeTransformControls>
  axis?: string | null
  camera?: S3.CameraKind
  children?: JSX.Element
  domElement?: HTMLElement
  enabled?: boolean
  makeCurrent?: boolean
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
    'makeCurrent',
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
  const group = new Group()

  const controls = createMemo(() => {
    const controls = new ThreeTransformControls(
      config.camera ?? store.currentCamera,
      config.domElement ?? store.canvas,
    )
    const autolisten = useAutolisten(controls)
    createEffect(() => autolisten('change', config.onChange))
    createEffect(() => autolisten('mouseUp', config.onMouseUp))
    createEffect(() => autolisten('mouseDown', config.onMouseDown))
    createEffect(() => autolisten('objectChange', config.onObjectChange))
    return controls
  })

  createEffect(() => {
    controls().attach(resolve(config.object) || group)
    onCleanup(controls().detach.bind(controls()))
  })

  return (
    <>
      <Entity from={group} {...objectProps}>
        {config.children}
      </Entity>
      <Portal>
        <Entity from={controls()} {...transformProps} />
      </Portal>
    </>
  )
}
