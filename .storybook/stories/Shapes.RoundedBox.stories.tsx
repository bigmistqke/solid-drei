import { Vector3 } from 'three'
import { RoundedBox } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Color } from 'three'

const meta = {
  title: 'Shapes/RoundedBox',
  component: RoundedBox,
  args: {
    args: [25, 25, 25],
    radius: 1,
    smoothness: 5,
  },

  decorators: [
    Story => (
      <Setup
        scene={{ background: new Color('white') }}
        defaultCamera={{ position: new Vector3(-2, 2, -2) }}
      >
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Html',
      },
    },
  },
} satisfies Meta<typeof RoundedBox>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                   Rounded Box                                  */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render(props) {
    const turntable = useTurntable()

    return (
      <RoundedBox ref={turntable} {...props}>
        <T.MeshPhongMaterial color="#f3f3f3" wireframe />
      </RoundedBox>
    )
  },
}

export const Solid: Story = {
  render(props) {
    const turntable = useTurntable()

    return (
      <>
        <T.SpotLight position={[35, 35, 35]} intensity={2} />
        <RoundedBox ref={turntable} {...props}>
          <T.MeshPhongMaterial color="#f3f3f3" />
        </RoundedBox>
      </>
    )
  },
}
