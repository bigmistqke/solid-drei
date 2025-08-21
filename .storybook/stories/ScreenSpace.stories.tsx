import { Box, Html, OrbitControls, ScreenSpace } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const meta = {
  title: 'Abstractions/ScreenSpace',
  component: ScreenSpace,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, -10] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Screen Space',
      },
    },
  },
} satisfies Meta<typeof ScreenSpace>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                     Screen Space                               */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: { depth: 1 },
  render(props) {
    return (
      <>
        <Box args={[1, 1, 1]}>
          <T.MeshPhysicalMaterial />
        </Box>
        <ScreenSpace depth={props.depth}>
          <Box args={[0.1, 0.1, 0.1]} position={[0.5, 0.1, 0]}>
            <T.MeshPhysicalMaterial color={'blue'} />
            <Html center sprite>
              <div style={{ color: 'hotpink' }}>Hi i'm in screen space</div>
            </Html>
          </Box>
        </ScreenSpace>
        <OrbitControls enablePan={true} zoomSpeed={0.5} />
      </>
    )
  },
}
