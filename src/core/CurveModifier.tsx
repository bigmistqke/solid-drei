import { when } from '@/utils/conditionals'
import { useRef } from '@/utils/use-refs'
import type { JSX, Ref } from 'solid-js'
import { createEffect, createMemo, on, Show } from 'solid-js'
import { Entity, Portal } from 'solid-three'
import type { Curve, Vector3 } from 'three'
import { Mesh, Scene } from 'three'
import { Flow } from 'three-stdlib'

export type CurveModifierApi = Pick<Flow, 'moveAlongCurve'>

export interface CurveModifierProps {
  ref?: Ref<CurveModifierApi>
  children: JSX.Element
  curve?: Curve<Vector3>
}

export const CurveModifier = (props: CurveModifierProps) => {
  const scene = new Scene()
  const api: CurveModifierApi = {
    moveAlongCurve: (val: number) => modifier()?.moveAlongCurve(val),
  }

  const modifier = createMemo(
    on(
      () => scene.children,
      children => new Flow(children[0] as Mesh),
    ),
  )

  useRef(props, api)

  createEffect(
    when(modifier, modifier => {
      if (props.curve) {
        modifier.updateCurve(0, props.curve)
      }
    }),
  )

  return (
    <>
      <Portal>{props.children}</Portal>
      <Show when={modifier()?.object3D}>{obj => <Entity from={obj()} />}</Show>
    </>
  )
}
