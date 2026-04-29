import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { OrbitControls, Sphere, Stage } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Stage',
  component: Stage,
  decorators: [
    Story => (
      <Setup lights={false} defaultCamera={{ position: [0, 0, 3] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Stage',
      },
    },
  },
} satisfies Meta<typeof Stage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <Stage preset="rembrandt" intensity={0.5} shadows="contact">
          <Sphere args={[1, 64, 64]}>
            <T.MeshStandardMaterial roughness={0} color="royalblue" />
          </Sphere>
        </Stage>
        <OrbitControls />
      </>
    )
  },
}
