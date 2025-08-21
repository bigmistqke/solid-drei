import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Stats } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/Stats',
  component: Stats,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(5, 5, 5) }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Stats',
      },
    },
  },
} satisfies Meta<typeof Stats>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                       Stats                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    return (
      <>
        <T.AxesHelper />
        <Stats />
      </>
    )
  },
}
