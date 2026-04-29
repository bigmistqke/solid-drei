import { resolve } from '@/utils'
import { createEffect, createMemo, omit, type Accessor, type JSX, type Ref } from 'solid-js'
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
  const rest = omit(
    props,
    'camera',
    'children',
    'domElement',
    'onChange',
    'onMouseDown',
    'onMouseUp',
    'onObjectChange',
    'object',
    'makeCurrent',
  )

  const objectProps = omit(
    rest,
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
  )

  const store = useThree()
  const group = new Group()

  const controls = createMemo(() => {
    const controls = new ThreeTransformControls(
      props.camera ?? store.camera,
      props.domElement ?? store.canvas,
    )
    const autolisten = useAutolisten(controls)
    createEffect(
      () => props.onChange,
      onChange => autolisten('change', onChange),
    )
    createEffect(
      () => props.onMouseUp,
      onMouseUp => autolisten('mouseUp', onMouseUp),
    )
    createEffect(
      () => props.onMouseDown,
      onMouseDown => autolisten('mouseDown', onMouseDown),
    )
    createEffect(
      () => props.onObjectChange,
      onObjectChange => autolisten('objectChange', onObjectChange),
    )
    return controls
  })

  createEffect(
    () => [controls(), resolve(props.object)] as const,
    ([ctrl, obj]) => {
      ctrl.attach(obj || group)
      return ctrl.detach.bind(ctrl)
    },
  )

  return (
    <>
      <Entity from={group} {...objectProps}>
        {props.children}
      </Entity>
      <Portal>
        <Entity
          from={controls()}
          {...({
            ref: rest.ref,
            enabled: rest.enabled,
            axis: rest.axis,
            mode: rest.mode,
            translationSnap: rest.translationSnap,
            rotationSnap: rest.rotationSnap,
            scaleSnap: rest.scaleSnap,
            space: rest.space,
            size: rest.size,
            showX: rest.showX,
            showY: rest.showY,
            showZ: rest.showZ,
          } as any)}
        />
      </Portal>
    </>
  )
}
