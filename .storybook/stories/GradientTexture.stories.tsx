import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { GradientTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/GradientTexture',
  component: GradientTexture,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof GradientTexture>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={1} />
        <T.Mesh>
          <T.SphereGeometry args={[1.5, 64, 64]} />
          <T.MeshStandardMaterial>
            <GradientTexture
              attach="map"
              stops={[0, 0.5, 1]}
              colors={['#e63946', '#f1faee', '#a8dadc']}
            />
          </T.MeshStandardMaterial>
        </T.Mesh>
      </>
    )
  },
}
