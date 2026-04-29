import { createEffect } from 'solid-js'
import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useCubeCamera } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/useCubeCamera',
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
        component: 'useCubeCamera: Create reflective surfaces using dynamic cube camera textures',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                 Use Cube Camera                               */
/*                                                                                */
/**********************************************************************************/

/**
 * Example cube camera scene demonstrating real-time reflections.
 * A cube camera captures the scene from all directions and applies it as an envMap.
 */
function UseCubeCameraScene() {
  const cubeCameraResult = useCubeCamera({ resolution: 256 })

  // Update cube camera each frame to capture reflections
  useFrame(() => {
    cubeCameraResult.update()
  })

  return (
    <>
      {/* Reflective sphere using cube camera texture */}
      <T.Mesh position={[0, 0, 0]}>
        <T.SphereGeometry args={[1.5, 64, 64]} />
        <T.MeshStandardMaterial
          color="white"
          roughness={0}
          metalness={1}
          envMap={cubeCameraResult.fbo().texture}
        />
      </T.Mesh>

      {/* Surrounding geometry to reflect */}
      <T.Mesh position={[-3, 0, 0]}>
        <T.BoxGeometry args={[2, 2, 2]} />
        <T.MeshPhysicalMaterial color="hotpink" />
      </T.Mesh>
      <T.Mesh position={[3, 0, 0]}>
        <T.BoxGeometry args={[2, 2, 2]} />
        <T.MeshPhysicalMaterial color="cyan" />
      </T.Mesh>
    </>
  )
}

export const Default: Story = {
  render() {
    return <UseCubeCameraScene />
  },
}
