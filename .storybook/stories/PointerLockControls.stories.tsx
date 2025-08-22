import { createMemo, createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Extrude, Icosahedron, PointerLockControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/PointerLockControls',
  parameters: {
    docs: {
      description: {
        component: 'Lathe',
      },
    },
  },
} satisfies Meta<typeof Extrude>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                              Pointer Lock Controls                             */
/*                                                                                */
/**********************************************************************************/

const NUM = 2

interface Positions {
  id: string
  position: [number, number, number]
}

function Icosahedrons() {
  const positions = createMemo(() => {
    const pos: Positions[] = []
    const half = (NUM - 1) / 2

    for (let x = 0; x < NUM; x++) {
      for (let y = 0; y < NUM; y++) {
        for (let z = 0; z < NUM; z++) {
          pos.push({
            id: `${x}-${y}-${z}`,
            position: [(x - half) * 4, (y - half) * 4, (z - half) * 4],
          })
        }
      }
    }

    return pos
  }, [])

  return (
    <T.Group>
      <For each={positions()}>
        {({ id, position }) => {
          const [hovered, setHovered] = createSignal(false)
          return (
            <Icosahedron
              args={[1, 1]}
              position={position}
              onPointerEnter={e => {
                setHovered(true)
              }}
              onPointerLeave={e => {
                setHovered(false)
              }}
            >
              <T.MeshBasicMaterial color={hovered() ? 'red' : 'white'} wireframe />
            </Icosahedron>
          )
        }}
      </For>
    </T.Group>
  )
}

export const Default: Story = {
  render() {
    return (
      <Setup controls={false} defaultCamera={{ position: [0, 0, 10] }}>
        <PointerLockControls />
        <Icosahedrons />
      </Setup>
    )
  },
}

export const WithSelector: Story = {
  render() {
    return (
      <>
        <div
          id="instructions"
          style={{
            display: 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            height: '2em',
            background: 'white',
          }}
        >
          Click here to play
        </div>
        <Setup controls={false} defaultCamera={{ position: [0, 0, 10] }}>
          <PointerLockControls selector="#instructions" onLock={console.log} />
          <Icosahedrons />
        </Setup>
        <div
          id="instructions"
          style={{
            display: 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            height: '2em',
            background: 'white',
          }}
        >
          Click here to play
        </div>
      </>
    )
  },
}
