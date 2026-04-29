import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerformanceMonitor } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Performance/Adaptive',
  component: AdaptiveDpr,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: [0, 0, 3] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof AdaptiveDpr>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <PerformanceMonitor>
        <T.Mesh>
          <T.TorusKnotGeometry args={[1, 0.4, 128, 32]} />
          <T.MeshStandardMaterial color="hotpink" />
        </T.Mesh>
        <T.PointLight position={[10, 10, 10]} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <OrbitControls regress />
      </PerformanceMonitor>
    )
  },
}
