import { whenever } from '@/utils/conditionals'
import { createEffect, createMemo, JSX, on, Ref, Show } from 'solid-js'
import { T } from 'solid-three'
import { Curve, Mesh, Scene, Vector3 } from 'three'
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

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(api)
    else props.ref = api
  })

  createEffect(
    whenever(modifier, modifier => {
      if (props.curve) {
        modifier.updateCurve(0, props.curve)
      }
    }),
  )

  return (
    <>
      <T.Portal>{props.children}</T.Portal>
      <Show when={modifier()?.object3D}>{obj => <T.Primitive object={obj()} />}</Show>
    </>
  )
}
