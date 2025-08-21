import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Box, FirstPersonControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/FirstPersonControls',
  component: FirstPersonControls,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 3) }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'First Person Controls',
      },
    },
  },
} satisfies Meta<typeof FirstPersonControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                             First Person Controls                              */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    activeLook: true,
    autoForward: false,
    constrainVertical: false,
    enabled: true,
    heightCoef: 1,
    heightMax: 1,
    heightMin: 0,
    heightSpeed: false,
    lookVertical: true,
    lookSpeed: 0.05,
    movementSpeed: 1,
    verticalMax: Math.PI,
    verticalMin: 0,
  },
  render(args) {
    return (
      <>
        <FirstPersonControls {...args} />
        <Box>
          <T.MeshBasicMaterial wireframe />
        </Box>
      </>
    )
  },
}
