import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { StatsGl } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/StatsGl',
  component: StatsGl,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [5, 5, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof StatsGl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.AxesHelper />
        <StatsGl />
      </>
    )
  },
}
