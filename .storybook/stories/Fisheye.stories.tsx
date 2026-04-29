import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Fisheye } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Cameras/Fisheye',
  component: Fisheye,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Fisheye>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <Fisheye zoom={1}>
        <T.Mesh position={[-2, 0, 0]}>
          <T.BoxGeometry />
          <T.MeshStandardMaterial color="red" />
        </T.Mesh>
        <T.Mesh position={[0, 0, 0]}>
          <T.BoxGeometry />
          <T.MeshStandardMaterial color="green" />
        </T.Mesh>
        <T.Mesh position={[2, 0, 0]}>
          <T.BoxGeometry />
          <T.MeshStandardMaterial color="blue" />
        </T.Mesh>
        <T.AmbientLight intensity={0.8} />
        <T.DirectionalLight intensity={1} position={[0, 6, 0]} />
      </Fisheye>
    )
  },
}
