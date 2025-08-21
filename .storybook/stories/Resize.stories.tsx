import { Box, Resize, type ResizeProps } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const meta = {
  title: 'Staging/Resize',
  component: Resize,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [1, 1, 1], zoom: 150 }} orthographic>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'SVG',
      },
    },
  },
} satisfies Meta<typeof Resize>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                     Resize                                     */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    width: undefined,
    height: undefined,
    depth: undefined,
  },
  argTypes: {
    width: { control: { type: 'boolean' } },
    height: { control: { type: 'boolean' } },
    depth: { control: { type: 'boolean' } },
  },
  render(props) {
    return (
      <>
        <T.AxesHelper />
        <Resize width={props.width} height={props.height} depth={props.depth}>
          <Box args={[70, 40, 20]}>
            <T.MeshBasicMaterial wireframe />
          </Box>
        </Resize>
      </>
    )
  },
}

export const ResizeSt = (props: ResizeProps) => (
  <>
    <T.AxesHelper />
    <Resize width={props.width} height={props.height} depth={props.depth}>
      <Box args={[70, 40, 20]}>
        <T.MeshBasicMaterial wireframe />
      </Box>
    </Resize>
  </>
)
