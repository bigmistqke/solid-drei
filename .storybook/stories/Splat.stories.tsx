import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Splat, OrbitControls } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Abstractions/Splat',
  component: Splat,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 1.5, 6) }}>
        <Suspense fallback={null}>
          <Story />
        </Suspense>
      </Setup>
    ),
  ],
} satisfies Meta<typeof Splat>

export default meta
type Story = StoryObj<typeof meta>

// Public gaussian splat from antimatter15/splat
const SPLAT_URL = 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/point_cloud/iteration_7000/point_cloud.splat'

export const Default: Story = {
  args: {
    alphaTest: 0.1,
  },
  argTypes: {
    alphaTest: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
  },
  render(args) {
    return (
      <>
        <Splat src={SPLAT_URL} alphaTest={args.alphaTest} />
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </>
    )
  },
}
