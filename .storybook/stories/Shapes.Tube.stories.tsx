import * as THREE from 'three'

import { Setup } from '../Setup'
import { useTurntable } from '../useTurntable'

import { T } from '@solid-three/fiber'
import { Tube } from '../../src'

export default {
  title: 'Shapes/Tube',
  component: Tube,
  decorators: [(storyFn) => <Setup cameraPosition={new THREE.Vector3(-30, 30, 30)}>{storyFn()}</Setup>],
}

function TubeScene() {
  // curve example from https://threejs.org/docs/#api/en/geometries/TubeGeometry
  const path = (() => {
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

    return new CustomSinCurve(10)
  })()

  const turntable = useTurntable()

  return (
    <Tube ref={turntable} args={[path]}>
      <T.MeshPhongMaterial color="#f3f3f3" wireframe />
    </Tube>
  )
}

export const TubeSt = () => <TubeScene />
TubeSt.storyName = 'Default'
