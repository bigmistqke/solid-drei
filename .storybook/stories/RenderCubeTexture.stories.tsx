import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { RenderCubeTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Portals/RenderCubeTexture',
  component: RenderCubeTexture,
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
        component: 'RenderCubeTexture renders a scene into a cube texture for use as environment maps.',
      },
    },
  },
} satisfies Meta<typeof RenderCubeTexture>

export default meta
type Story = StoryObj<typeof meta>

function RenderCubeTextureScene() {
  return (
    <T.Mesh>
      <T.SphereGeometry args={[1.5, 32, 32]} />
      <T.MeshStandardMaterial metalness={1} roughness={0.2}>
        <RenderCubeTexture attach="envMap">
          <T.Mesh position={[-2, 0, 0]}>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="red" />
          </T.Mesh>
          <T.Mesh position={[2, 0, 0]}>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="blue" />
          </T.Mesh>
          <T.Mesh position={[0, 2, 0]}>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="green" />
          </T.Mesh>
          <T.Mesh position={[0, -2, 0]}>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="yellow" />
          </T.Mesh>
          <T.Mesh position={[0, 0, 2]}>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="purple" />
          </T.Mesh>
          <T.Mesh position={[0, 0, -2]}>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="orange" />
          </T.Mesh>
          <T.AmbientLight intensity={0.5} />
        </RenderCubeTexture>
      </T.MeshStandardMaterial>
    </T.Mesh>
  )
}

export const Default: Story = {
  render() {
    return <RenderCubeTextureScene />
  },
}
