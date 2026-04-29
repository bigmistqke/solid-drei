import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { PerformanceMonitor } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Performance/PerformanceMonitor',
  component: PerformanceMonitor,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof PerformanceMonitor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    const [quality, setQuality] = createSignal(1)

    return (
      <PerformanceMonitor
        onDecline={() => setQuality(q => Math.max(0.1, q - 0.1))}
        onIncline={() => setQuality(q => Math.min(1, q + 0.1))}
      >
        <T.Mesh>
          <T.TorusKnotGeometry />
          <T.MeshStandardMaterial color="hotpink" />
        </T.Mesh>
        <T.AmbientLight intensity={0.5} />
        <T.PointLight position={[10, 10, 10]} />
      </PerformanceMonitor>
    )
  },
}
