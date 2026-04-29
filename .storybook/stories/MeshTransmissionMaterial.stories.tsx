import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshTransmissionMaterial } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/MeshTransmissionMaterial',
  component: MeshTransmissionMaterial,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 0, 8] }}><Story /></Setup>)],
} satisfies Meta<typeof MeshTransmissionMaterial>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.8} />
        <T.DirectionalLight castShadow position={[5, 10, 5]} intensity={1} />
        {/* Frosted glass sphere */}
        <T.Mesh position={[0, 0, 0]}>
          <T.SphereGeometry args={[1.5, 32, 32]} />
          <MeshTransmissionMaterial transmission={1} thickness={0.5} roughness={0.1} ior={1.5} />
        </T.Mesh>
        {/* Colored boxes behind */}
        <T.Mesh position={[-2, -1.5, -3]}>
          <T.BoxGeometry args={[1.5, 1.5, 1.5]} />
          <T.MeshPhongMaterial color="red" />
        </T.Mesh>
        <T.Mesh position={[0, -1.5, -3]}>
          <T.BoxGeometry args={[1.5, 1.5, 1.5]} />
          <T.MeshPhongMaterial color="green" />
        </T.Mesh>
        <T.Mesh position={[2, -1.5, -3]}>
          <T.BoxGeometry args={[1.5, 1.5, 1.5]} />
          <T.MeshPhongMaterial color="blue" />
        </T.Mesh>
      </>
    )
  },
}
