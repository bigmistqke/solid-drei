import { T, useFrame } from '@solid-three/fiber'
import { number, withKnobs } from '@storybook/addon-knobs'
import { createSignal } from 'solid-js'

import { Setup } from '../Setup'

import { Plane, Sky } from '../../src'

export default {
  title: 'Staging/Sky',
  component: Sky,
  decorators: [withKnobs, (storyFn) => <Setup> {storyFn()}</Setup>],
}

// s3f  there are no errors but i am only seeing a grey background
//      compare w r3f what is expected result
function SkyScene() {
  let ref

  return (
    <>
      <Sky
        ref={ref}
        turbidity={number('Turbidity', 8, { range: true, max: 10, step: 0.1 })}
        rayleigh={number('Rayleigh', 6, { range: true, max: 10, step: 0.1 })}
        mieCoefficient={number('mieCoefficient', 0.005, { range: true, max: 0.1, step: 0.001 })}
        mieDirectionalG={number('mieDirectionalG', 0.8, { range: true, max: 1, step: 0.01 })}
        sunPosition={[number('Pos X', 0), number('Pos Y', 0), number('Pos Z', 0)]}
      />
      <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
        <T.MeshBasicMaterial color="black" wireframe />
      </Plane>
      <T.AxesHelper />
    </>
  )
}

export const SkySt = () => <SkyScene />
SkySt.storyName = 'Default'

function SkyScene2() {
  return (
    <>
      <Sky
        distance={3000}
        turbidity={number('Turbidity', 8, { range: true, max: 10, step: 0.1 })}
        rayleigh={number('Rayleigh', 6, { range: true, max: 10, step: 0.1 })}
        mieCoefficient={number('mieCoefficient', 0.005, { range: true, max: 0.1, step: 0.001 })}
        mieDirectionalG={number('mieDirectionalG', 0.8, { range: true, max: 1, step: 0.01 })}
        inclination={number('Inclination', 0.49, { range: true, max: 1, step: 0.01 })}
        azimuth={number('Azimuth', 0.25, { range: true, max: 1, step: 0.01 })}
      />
      <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
        <T.MeshBasicMaterial color="black" wireframe />
      </Plane>
      <T.AxesHelper />
    </>
  )
}

export const SkySt2 = () => <SkyScene2 />
SkySt2.storyName = 'Custom angles'

function SkyScene3() {
  // NOT the right way to do it...
  const [inclination, setInclination] = createSignal(0)
  useFrame(() => {
    setInclination((a) => a + 0.002)
  })

  return (
    <>
      <Sky
        distance={3000}
        // turbidity={number('Turbidity', 8, { range: true, max: 10, step: 0.1 })}
        // rayleigh={number('Rayleigh', 6, { range: true, max: 10, step: 0.1 })}
        // mieCoefficient={number('mieCoefficient', 0.005, { range: true, max: 0.1, step: 0.001 })}
        // mieDirectionalG={number('mieDirectionalG', 0.8, { range: true, max: 1, step: 0.01 })}
        inclination={inclination()}
        // azimuth={number('Azimuth', 0.25, { range: true, max: 1, step: 0.01 })}
      />
      <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
        <T.MeshBasicMaterial color="black" wireframe />
      </Plane>
      <T.AxesHelper />
    </>
  )
}

export const SkySt3 = () => <SkyScene3 />
SkySt3.storyName = 'Rotation'
