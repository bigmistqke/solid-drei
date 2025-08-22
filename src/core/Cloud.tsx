import { processProps } from '@/utils'
import { createMemo, For } from 'solid-js'
import type { S3 } from 'solid-three'
import { createT, Entity, useFrame } from 'solid-three'
import type { ColorRepresentation } from 'three'
import { Group, MeshStandardMaterial } from 'three'
import { Billboard } from './Billboard'
import { Plane } from './shapes'
import { useTexture } from './useTexture'

const T = createT({ Group, MeshStandardMaterial })

const CLOUD_URL =
  'https://rawcdn.githack.com/pmndrs/drei-assets/9225a9f1fbd449d9411125c2f419b843d0308c9f/cloud.png'

interface CloudProps extends S3.Props<Group> {
  opacity?: number
  speed?: number
  width?: number
  depth?: number
  segments?: number
  texture?: string
  color?: ColorRepresentation
  depthTest?: boolean
}

export function Cloud(props: CloudProps) {
  const [config, rest] = processProps(
    props,
    {
      opacity: 0.5,
      speed: 0.4,
      width: 10,
      depth: 1.5,
      segments: 20,
      texture: CLOUD_URL,
      color: '#ffffff',
      depthTest: true,
    },
    ['opacity', 'speed', 'width', 'depth', 'segments', 'texture', 'color', 'depthTest'],
  )

  const group = new Group()
  const cloudTexture = useTexture(() => config.texture)

  const clouds = createMemo(() =>
    [...new Array(config.segments)].map((_, index) => ({
      x: config.width / 2 - Math.random() * config.width,
      y: config.width / 2 - Math.random() * config.width,
      scale:
        0.4 + Math.sin(((index + 1) / config.segments) * Math.PI) * ((0.2 + Math.random()) * 10),
      density: Math.max(0.2, Math.random()),
      rotation: Math.max(0.002, 0.005 * Math.random()) * config.speed,
    })),
  )

  useFrame(state =>
    group.children.forEach((cloud, index) => {
      cloud.children[0]!.rotation.z += clouds()[index]!.rotation
      cloud.children[0]!.scale.setScalar(
        clouds()[index]!.scale +
          (((1 + Math.sin(state.clock.getElapsedTime() / 10)) / 2) * index) / 10,
      )
    }),
  )

  return (
    <T.Group {...rest}>
      <Entity from={group} position={[0, 0, (config.segments / 2) * config.depth]}>
        <For each={clouds()}>
          {(cloud, index) => (
            <Billboard position={[cloud.x, cloud.y, -index() * config.depth]}>
              <Plane scale={cloud.scale} rotation={[0, 0, 0]}>
                <T.MeshStandardMaterial
                  map={cloudTexture()}
                  transparent
                  opacity={(cloud.scale / 6) * cloud.density * config.opacity}
                  depthTest={config.depthTest}
                  color={config.color}
                />
              </Plane>
            </Billboard>
          )}
        </For>
      </Entity>
    </T.Group>
  )
}
