import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mesh, MeshStandardMaterial } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Extrude, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/GLTF',
  component: useGLTF,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Lathe',
      },
    },
  },
} satisfies Meta<typeof Extrude>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Use Gltf                                    */
/*                                                                                */
/**********************************************************************************/

interface Suzanne extends GLTF {
  nodes: {
    Suzanne: Mesh
  }
  materials: {
    ['Material.001']: MeshStandardMaterial
  }
}

export const Default: Story = {
  render() {
    const suzanne = useGLTF(() => 'suzanne.glb', true)
    return <Entity from={suzanne()?.scene} />
  },
}

export const LocalBinaries: Story = {
  render() {
    const suzanne = useGLTF<Suzanne>(() => 'suzanne.glb', '/draco-gltf/')
    return (
      <T.Group>
        <T.Mesh
          material={suzanne()?.materials['Material.001']}
          geometry={suzanne()?.nodes.Suzanne.geometry}
        />
      </T.Group>
    )
  },
}
