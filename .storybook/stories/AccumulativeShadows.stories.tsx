import { Suspense } from 'solid-js'
import { Entity, Resource } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { CubeTextureLoader, Mesh, MeshStandardMaterial } from 'three'
import { AccumulativeShadows, OrbitControls, RandomizedLight, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/AccumulativeShadows',
  component: AccumulativeShadows,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 17] }}>
        <Resource
          loader={CubeTextureLoader}
          attach="environment"
          path="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r80/examples/textures/cube/Bridge2/"
          url={['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']}
        />
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Accumulative Shadows',
      },
    },
  },
} satisfies Meta<typeof AccumulativeShadows>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                               Accumulative Shadows                             */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const resource = useGLTF(
      () =>
        'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf',
    )

    return (
      <>
        <T.Color attach="background" args={['goldenrod']} />
        {/* Needs Suspense, otherwise some funky stuff happens with <AccumulativeShadows /> */}
        <Suspense>
          <Entity
            from={resource()?.scene}
            ref={scene =>
              scene.traverse(
                obj => obj instanceof Mesh && (obj.receiveShadow = obj.castShadow = true),
              )
            }
            children-0-material={
              new MeshStandardMaterial({
                color: 'orange',
                roughness: 0,
              })
            }
            position={[0, -1.175, 0]}
            rotation={[-0.63, 0, 0]}
            scale={2}
          />
          <AccumulativeShadows
            temporal
            frames={100}
            color="goldenrod"
            alphaTest={0.65}
            opacity={2}
            scale={14}
            position={[0, -0.5, 0]}
          >
            <RandomizedLight
              amount={8}
              radius={4}
              ambient={0.5}
              bias={0.001}
              position={[5, 5, -10]}
            />
          </AccumulativeShadows>
        </Suspense>
        <OrbitControls autoRotate={true} />
      </>
    )
  },
}
