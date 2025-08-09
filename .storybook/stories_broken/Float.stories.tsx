import * as THREE from 'three'

import { Setup } from '../Setup'

import { T } from 'solid-three'
import { Float } from '../../src'

export default {
  title: 'Staging/Float',
  component: Float,
  decorators: [
    storyFn => <Setup cameraPosition={new THREE.Vector3(0, 0, 10)}> {storyFn()}</Setup>,
  ],
  argTypes: {
    rotationIntensity: { control: { type: 'number', min: 0, max: 10, step: 0.1 } },
    floatIntensity: { control: { type: 'number', min: 0, max: 10, step: 0.1 } },
    speed: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
  },
}

export const Default = {
  args: {
    rotationIntensity: 4,
    floatIntensity: 2,
    speed: 5,
  },
  render: (args) => <FloatScene {...args} />,
}

function FloatScene(args) {
  let cube

  return (
    <>
      <T.Suspense fallback={null}>
        <Float
          position={[0, 1.1, 0]}
          floatingRange={[-0.1, 0.1]}
          rotation={[Math.PI / 3.5, 0, 0]}
          rotationIntensity={args.rotationIntensity || 4}
          floatIntensity={args.floatIntensity || 2}
          speed={args.speed || 5}
        >
          <T.Mesh ref={cube}>
            <T.BoxGeometry args={[2, 2, 2]} />
            <T.MeshStandardMaterial wireframe color="white" />
          </T.Mesh>
        </Float>
      </T.Suspense>

      {/* ground plane */}
      <T.Mesh position={[0, -6, 0]} rotation={[Math.PI / -2, 0, 0]}>
        <T.PlaneGeometry args={[200, 200, 75, 75]} />
        <T.MeshBasicMaterial wireframe color="red" side={THREE.DoubleSide} />
      </T.Mesh>
    </>
  )
}

export const FloatSt = () => <FloatScene />
FloatSt.storyName = 'Default'
