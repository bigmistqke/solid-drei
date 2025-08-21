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

const NUM = 3

interface Positions {
  id: string
  position: [number, number, number]
}

export const Default: Story = {
  render() {
    const positions = createMemo(() => {
      const pos: Positions[] = []
      const half = (NUM - 1) / 2

      for (let x = 0; x < NUM; x++) {
        for (let y = 0; y < NUM; y++) {
          pos.push({
            id: `${x}-${y}`,
            position: [(x - half) * 4, (y - half) * 4, 0],
          })
        }
      }

      return pos
    }, [])

    return (
      <>
        <PerspectiveCamera makeCurrent position={[0, 0, 10]} />
        <T.Group position={[0, 0, -10]}>
          <For each={positions()}>
            {({ id, position }) => (
              <Icosahedron position={position} args={[1, 1]}>
                <T.MeshBasicMaterial color="white" wireframe />
              </Icosahedron>
            )}
          </For>
        </T.Group>
        <OrbitControls />
      </>
    )
  },
}
