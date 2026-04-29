import { useRef } from '@/utils'
import { createEffect, createSignal, type JSX, type Ref } from 'solid-js'
import { Suspense } from '@solidjs/web'
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
  const [modifier, setModifier] = createSignal<Flow>()

  useRef(props, {
    moveAlongCurve: (val: number) => modifier()?.moveAlongCurve(val),
  })

  return (
    <>
      <Portal
        element={scene}
        onUpdate={({ children }) => {
          if (children[0] instanceof Mesh) {
            const modifier = new Flow(children[0])
            setModifier(modifier)
            createEffect(
              () => props.curve,
              (curve) => { if (curve) modifier.updateCurve(0, curve) },
            )
          }
        }}
      >
        <Suspense>{props.children}</Suspense>
      </Portal>
      <Entity from={modifier()?.object3D} />
    </>
  )
}
