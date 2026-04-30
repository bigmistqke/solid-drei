import { resolve } from '@/utils'
import {
  createEffect,
  createMemo,
  createRenderEffect,
  splitProps,
  type Accessor,
  type JSX,
  type Ref,
} from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, Portal, useThree } from 'solid-three'
import { Group, Object3D, type Event as ThreeEvent } from 'three'
import { TransformControls as ThreeTransformControls } from 'three-stdlib'

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
      config.camera ?? store.camera,
      config.domElement ?? store.canvas,
    )
    createRenderEffect(
      () => config.onChange,
      onChange => {
        if (!onChange) return
        controls.addEventListener('change', onChange as any)
        return () => controls.removeEventListener('change', onChange as any)
      },
    )
    createRenderEffect(
      () => config.onMouseUp,
      onMouseUp => {
        if (!onMouseUp) return
        controls.addEventListener('mouseUp', onMouseUp as any)
        return () => controls.removeEventListener('mouseUp', onMouseUp as any)
      },
    )
    createRenderEffect(
      () => config.onMouseDown,
      onMouseDown => {
        if (!onMouseDown) return
        controls.addEventListener('mouseDown', onMouseDown as any)
        return () => controls.removeEventListener('mouseDown', onMouseDown as any)
      },
    )
    createRenderEffect(
      () => config.onObjectChange,
      onObjectChange => {
        if (!onObjectChange) return
        controls.addEventListener('objectChange', onObjectChange as any)
        return () => controls.removeEventListener('objectChange', onObjectChange as any)
      },
    )
    return controls
  })

  createEffect(
    () => [controls(), resolve(config.object) || group] as [ThreeTransformControls, Object3D],
    (pair: [ThreeTransformControls, Object3D]) => {
      pair[0].attach(pair[1])
      return () => { pair[0].detach() }
    },
  )

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
