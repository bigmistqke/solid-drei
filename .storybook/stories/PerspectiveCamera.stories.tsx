import type { JSX } from 'solid-js'
import { For, createMemo } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Icosahedron, OrbitControls, PerspectiveCamera } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Camera/PerspectiveCamera',
  component: PerspectiveCamera,
  decorators: [
    (Story: () => JSX.Element) => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 10) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof PerspectiveCamera>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                Perspective Camera                              */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    amount: 3,
  },
  render(props) {
    const positions = createMemo(() => {
      const half = (props.amount - 1) / 2
      return Array.from(
        (function* () {
          for (let x = 0; x < props.amount; x++) {
            for (let y = 0; y < props.amount; y++) {
              yield {
                id: `${x}-${y}`,
                position: [(x - half) * 4, (y - half) * 4, 0],
              }
            }
          }
        })(),
      )
    })

    return (
      <>
        <PerspectiveCamera makeCurrent position={[0, 0, 10]} />
        <OrbitControls enabled />
        <T.Group position={[0, 0, -10]}>
          <For each={positions()}>
            {({ id, position }) => (
              <Icosahedron position={position} args={[1, 1]}>
                <T.MeshBasicMaterial color="white" wireframe />
              </Icosahedron>
            )}
          </For>
        </T.Group>
      </>
    )
  },
}
