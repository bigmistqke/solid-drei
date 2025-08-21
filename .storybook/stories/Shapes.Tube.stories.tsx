import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Tube } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Shapes/Tube',
  component: Tube,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [-30, 30, 30] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Tube>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Tube                                      */
/*                                                                                */
/**********************************************************************************/

// Custom curve class example from https://threejs.org/docs/#api/en/geometries/TubeGeometry
class CustomSinCurve extends THREE.Curve<THREE.Vector3> {
  private scale: number

  constructor(scale = 1) {
    super()
    this.scale = scale
  }

  getPoint(t: number) {
    const tx = t * 3 - 1.5
    const ty = Math.sin(2 * Math.PI * t)
    const tz = 0

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale)
  }
}

export const Default: Story = {
  render: () => {
    const path = new CustomSinCurve(10)

    return (
      <Tube ref={useTurntable()} args={[path]}>
        <T.MeshPhongMaterial color="#f3f3f3" wireframe />
      </Tube>
    )
  },
}
