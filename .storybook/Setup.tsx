import { OrbitControls } from '@/core'
import { processProps } from '@/utils'
import { Show } from 'solid-js'
import { Canvas, createT, Resource, type CanvasProps } from 'solid-three'
import * as THREE from 'three'
import './index.css'

const T = createT(THREE)

export function Setup(
  props: CanvasProps & { lights?: boolean; controls?: boolean; environment?: boolean },
) {
  const [config, rest] = processProps(
    props,
    {
      controls: true,
      lights: true,
    },
    ['controls', 'lights', 'children', 'environment'],
  )

  return (
    <>
      <Canvas shadows {...rest}>
        <OrbitControls enabled={config.controls} />
        {config.children}
        <Show when={config.lights}>
          <T.AmbientLight intensity={0.8} />
          <T.PointLight intensity={5} position={[0, 6, 0]} />
        </Show>
        <Show when={config.environment}>
          <Resource
            loader={THREE.CubeTextureLoader}
            attach="environment"
            path="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r80/examples/textures/cube/Bridge2/"
            url={['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']}
          />
        </Show>
      </Canvas>
    </>
  )
}
