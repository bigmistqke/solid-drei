import { Box } from '@/index'
import * as THREE from 'three'
import { Setup } from '../Setup'
import { T } from '../t'

export function BoxStory() {
  return (
    <T.Mesh>
      <T.BoxGeometry />
      <T.MeshBasicMaterial color="red" />
    </T.Mesh>
  )
}

const meta = {
  component: Box,
  decorators: [
    Story => {
      return (
        <div style={{ margin: '3em' }}>
          <Setup camera={{ position: new THREE.Vector3(0, 0, 5) }}>
            <Story />
          </Setup>
        </div>
      )
    },
  ],
}

export default meta
