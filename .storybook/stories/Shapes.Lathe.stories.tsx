import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Lathe } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Shapes/Lathe',
  component: Lathe,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [-30, 30, 30] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Lathe',
      },
    },
  },
} satisfies Meta<typeof Lathe>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Lathe                                     */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const points = Array.from(
      (function* () {
        for (let i = 0; i < 10; i++) {
          yield new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2)
        }
      })(),
    )

    return (
      <Lathe ref={useTurntable()} args={[points]}>
        <T.MeshPhongMaterial color="#f3f3f3" wireframe />
      </Lathe>
    )
  },
}
