import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { OrbitControls, Segment, Segments } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Performance/Segments',
  component: Segments,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: [10, 10, 10] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Segments>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render() {
    return (
      <>
        <Segments limit={6} lineWidth={2}>
          <Segment start={[0, 0, 0]} end={[10, 0, 0]} color="red" />
          <Segment start={[0, 0, 0]} end={[0, 10, 0]} color="blue" />
          <Segment start={[0, 0, 0]} end={[0, 0, 10]} color="green" />
          <Segment start={[0, 0, 0]} end={[-10, 0, 0]} color={[1, 0, 0]} />
          <Segment start={[0, 0, 0]} end={[0, -10, 0]} color={[0, 1, 0]} />
          <Segment start={[0, 0, 0]} end={[0, 0, -10]} color={[1, 1, 0]} />
        </Segments>
        <OrbitControls />
      </>
    )
  },
}
