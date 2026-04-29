import { createSignal, Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { useCubeTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/useCubeTexture',
  component: () => null,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'useCubeTexture: Load cube textures as environment maps',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                 Use Cube Texture                              */
/*                                                                                */
/**********************************************************************************/

/**
 * Example cube texture scene.
 * Shows how useCubeTexture loads and applies cube textures as environment maps.
 * Requires cube texture files (px.png, nx.png, py.png, ny.png, pz.png, nz.png).
 */
function UseCubeTextureScene() {
  // Example usage with file paths:
  // const textureResource = useCubeTexture(
  //   () => ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
  //   { path: 'cube-textures/' }
  // )
  //
  // Then bind the texture to an envMap:
  // <T.MeshStandardMaterial
  //   envMap={textureResource()}
  //   roughness={0}
  //   metalness={1}
  // />

  return (
    <T.Mesh position={[0, 0, 0]}>
      <T.SphereGeometry args={[2, 64, 64]} />
      {/* Placeholder material - normally would use the loaded cube texture as envMap */}
      <T.MeshStandardMaterial color="white" roughness={0.2} metalness={0.8} />
    </T.Mesh>
  )
}

export const Default: Story = {
  render() {
    return (
      <Suspense>
        <UseCubeTextureScene />
      </Suspense>
    )
  },
}
