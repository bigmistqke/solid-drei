import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { BakeShadows } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Performance/BakeShadows',
  component: BakeShadows,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 3, 8] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof BakeShadows>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <BakeShadows />
        <T.DirectionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <T.AmbientLight intensity={0.3} />
        <T.Mesh position={[0, 1, 0]} castShadow receiveShadow>
          <T.BoxGeometry args={[1.5, 1.5, 1.5]} />
          <T.MeshStandardMaterial color="orange" />
        </T.Mesh>
        <T.Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <T.PlaneGeometry args={[10, 10]} />
          <T.MeshStandardMaterial color="#888" />
        </T.Mesh>
      </>
    )
  },
}
