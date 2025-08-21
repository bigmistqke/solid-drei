import { WireframeMaterialShaders } from '@/materials/WireframeMaterial'
import { Suspense } from 'solid-js'
import { Resource } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { CubeTextureLoader, IcosahedronGeometry, Vector3 } from 'three'
import { Wireframe } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Wireframe',
  component: Wireframe,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(2, 2, 2) }}>
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
        component: 'Transform Controls',
      },
    },
  },
} satisfies Meta<typeof Wireframe>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Wireframe                                   */
/*                                                                                */
/**********************************************************************************/

export const WireframeScene: Story = {
  render() {
    const geom = new IcosahedronGeometry(1, 16)

    return (
      <Suspense fallback={null}>
        <T.Mesh>
          <T.IcosahedronGeometry args={[1, 16]} />
          <T.MeshPhysicalMaterial color="red" roughness={0.2} metalness={1} />

          <Wireframe stroke="white" squeeze dash />
        </T.Mesh>

        <T.Mesh position={[0, 0, -2.5]}>
          <T.TorusKnotGeometry />
          <T.MeshBasicMaterial color="red" />

          <Wireframe simplify stroke="white" squeeze dash fillMix={1} fillOpacity={0.2} />
        </T.Mesh>

        <T.Group position={[-2.5, 0, -2.5]}>
          <Wireframe
            fill="blue"
            geometry={geom}
            stroke="white"
            squeeze
            dash
            fillMix={1}
            fillOpacity={0.2}
          />
        </T.Group>

        <T.Mesh position={[-2.5, 0, 0]}>
          <T.SphereGeometry args={[1, 16, 16]} />
          <T.ShaderMaterial
            vertexShader={
              /* glsl */ WireframeMaterialShaders.vertex +
              `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `
            }
            fragmentShader={
              /* glsl */ WireframeMaterialShaders.fragment +
              `
      
        void main() {
          float edge = getWireframe();
          gl_FragColor = vec4(1.0, 1.0, 0.0, edge);
        }
      `
            }
          />

          <Wireframe stroke="white" squeeze dash />
        </T.Mesh>
      </Suspense>
    )
  },
}
