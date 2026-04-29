import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Backdrop } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Backdrop',
  component: Backdrop,
  decorators: [
    Story => (
      <Setup shadows defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Backdrop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.DirectionalLight position={[2, 5, 2]} intensity={2} castShadow />
        <Backdrop floor={0.25} segments={20} receiveShadow position={[0, -1, -2]}>
          <T.MeshStandardMaterial color="#353540" />
        </Backdrop>
        <T.Mesh position={[0, -0.5, 0]} castShadow receiveShadow>
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshStandardMaterial color="royalblue" />
        </T.Mesh>
      </>
    )
  },
}
