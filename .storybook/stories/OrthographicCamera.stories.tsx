import { For } from 'solid-js'
import { Canvas } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Icosahedron, OrbitControls, OrthographicCamera } from '../../src'
import { T } from '../t'

const meta = {
  title: 'Camera/OrthographicCamera',
  component: OrthographicCamera,
} satisfies Meta<typeof OrthographicCamera>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                              Orthographic Camera                               */
/*                                                                                */
/**********************************************************************************/

const NUM = 3

interface Position {
  id: string
  position: [number, number, number]
}

export const Default: Story = {
  render: () => {
    const half = (NUM - 1) / 2
    const positions: Position[] = Array.from(
      (function* () {
        for (let x = 0; x < NUM; x++) {
          for (let y = 0; y < NUM; y++) {
            yield {
              id: `${x}-${y}`,
              position: [(x - half) * 4, (y - half) * 4, 0],
            }
          }
        }
      })(),
    )

    return (
      <Canvas style={{ height: '100vh' }}>
        <OrthographicCamera makeCurrent position={[0, 0, 10]} zoom={40} />
        <OrbitControls enabled />
        <T.Group position={[0, 0, -10]}>
          <For each={positions}>
            {({ position }) => (
              <Icosahedron position={position} args={[1, 1]}>
                <T.MeshBasicMaterial color="white" wireframe />
              </Icosahedron>
            )}
          </For>
        </T.Group>
      </Canvas>
    )
  },
}
