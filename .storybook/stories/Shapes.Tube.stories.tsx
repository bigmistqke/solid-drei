import * as THREE from 'three'
import { Tube } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

export default {
  title: 'Shapes/Tube',
  component: Tube,
  decorators: [
    StoryFn => (
      <Setup cameraPosition={new THREE.Vector3(-30, 30, 30)}>
        <StoryFn />
      </Setup>
    ),
  ],
}

// curve example from https://threejs.org/docs/#api/en/geometries/TubeGeometry
function TubeScene() {
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

  const path = new CustomSinCurve(10)

  return (
    <Tube /* ref={useTurntable()} */ args={[path]}>
      <T.MeshPhongMaterial color="#f3f3f3" wireframe />
    </Tube>
  )
}

export const TubeSt = () => <TubeScene />
TubeSt.storyName = 'Default'
