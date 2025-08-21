import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshBasicMaterial } from 'three'
import { Box, FlyControls } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Controls/FlyControls',
  component: FlyControls,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: [0, 0, 3] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Fly Controls',
      },
    },
  },
} satisfies Meta<typeof FlyControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                   Fly Controls                                 */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    autoForward: true,
    dragToLook: false,
    movementSpeed: 1.0,
    rollSpeed: 0.2,
  },
  render({ ...args }) {
    return (
      <>
        <FlyControls {...args} />
        <Box>
          <Entity from={MeshBasicMaterial} wireframe />
        </Box>
      </>
    )
  },
}
