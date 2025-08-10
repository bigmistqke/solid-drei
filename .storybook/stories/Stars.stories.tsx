import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Plane, Stars } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Stars',
  component: Stars,
  decorators: [
    Story => (
      <Setup>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Stars>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                     Stars                                      */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render: () => (
    <>
      <T.Color args={[0, 0, 0]} attach="background" />
      <Stars />
      <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
        <T.MeshBasicMaterial color="black" wireframe />
      </Plane>
      <T.AxesHelper />
    </>
  ),
}
