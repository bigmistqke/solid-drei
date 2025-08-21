import { useOrbitControls } from '@/core'
import { processProps } from '@/utils/process-props'
import { createEffect, Show, type ParentComponent } from 'solid-js'
import { Canvas, createT, type CanvasProps } from 'solid-three'
import * as THREE from 'three'
import './index.css'

const T = createT(THREE)

export const Setup: ParentComponent<
  CanvasProps & { lights?: boolean; controls?: boolean }
> = _props => {
  const [props, rest] = processProps(
    _props,
    {
      controls: true,
      lights: true,
    },
    ['controls', 'lights', 'children'],
  )

  return (
    <>
      <Canvas
        ref={() => createEffect(() => props.controls && useOrbitControls())}
        shadows
        {...rest}
      >
        {props.children}
        <Show when={props.lights}>
          <T.AmbientLight intensity={0.8} />
          <T.PointLight intensity={1} position={[0, 6, 0]} />
        </Show>
      </Canvas>
    </>
  )
}
