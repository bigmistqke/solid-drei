import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Decal } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Abstractions/Decal',
  component: Decal,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Decal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <T.Mesh>
        <T.SphereGeometry args={[2, 32, 32]} />
        <T.MeshStandardMaterial color="white" />
        <Decal
          position={[0, 0, 1.5]}
          scale={[1, 1, 1]}
          rotation={0}
        >
          <T.Mesh>
            <T.PlaneGeometry args={[1.5, 1.5]} />
            <T.MeshBasicMaterial color="red" />
          </T.Mesh>
        </Decal>
      </T.Mesh>
    )
  },
}
