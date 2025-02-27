import { For, createMemo } from 'solid-js'
import { Vector3 } from 'three'

import { Setup } from '../Setup'

import { T } from '@solid-three/fiber'
import { Icosahedron, TrackballControls } from '../../src'

export default {
  title: 'Controls/TrackballControls',
  component: TrackballControlsScene,
  decorators: [(storyFn) => <Setup cameraPosition={new Vector3(0, 0, 10)}>{storyFn()}</Setup>],
}

const NUM = 2

interface Positions {
  id: string
  position: [number, number, number]
}

function TrackballControlsScene() {
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
    <>
      <T.Group>
        <For each={positions()}>
          {({ id, position }) => (
            <Icosahedron key={id} args={[1, 1]} position={position}>
              <T.MeshBasicMaterial color="white" wireframe />
            </Icosahedron>
          )}
        </For>
      </T.Group>
      <TrackballControls />
    </>
  )
}

export const TrackballControlsSceneSt = () => <TrackballControlsScene />
TrackballControlsSceneSt.story = {
  name: 'Default',
}
