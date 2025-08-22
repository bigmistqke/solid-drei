import { For, createMemo } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Icosahedron, TrackballControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/TrackballControls',
  component: TrackballControls,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 20) }}>
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
} satisfies Meta<typeof TrackballControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                 Trackball Controls                             */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    amount: 3,
    rotateSpeed: 10,
  },
  render(props) {
    const positions = createMemo(() => {
      return Array.from(
        (function* () {
          const half = (props.amount - 1) / 2

          for (let x = 0; x < props.amount; x++) {
            for (let y = 0; y < props.amount; y++) {
              for (let z = 0; z < props.amount; z++) {
                yield [(x - half) * 4, (y - half) * 4, (z - half) * 4] as [number, number, number]
              }
            }
          }
        })(),
      )
    })

    return (
      <>
        <T.Group>
          <For each={positions()}>
            {position => (
              <Icosahedron args={[1, 1]} position={position}>
                <T.MeshBasicMaterial color="white" wireframe />
              </Icosahedron>
            )}
          </For>
        </T.Group>
        <TrackballControls rotateSpeed={props.rotateSpeed} />
      </>
    )
  },
}
