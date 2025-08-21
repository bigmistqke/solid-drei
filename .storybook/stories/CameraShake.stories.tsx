import { Entity, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CameraShake, OrbitControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const frequencyArgType = {
  control: {
    max: 10,
    min: 0,
    step: 0.1,
    type: 'range',
  },
}

const numberArgType = {
  control: {
    max: 1,
    min: 0,
    step: 0.05,
    type: 'range',
  },
}

const meta = {
  title: 'Staging/CameraShake',
  component: CameraShake,
  args: {
    maxPitch: 0.05,
    maxRoll: 0.05,
    maxYaw: 0.05,
    pitchFrequency: 0.8,
    rollFrequency: 0.8,
    yawFrequency: 0.8,
  },
  argTypes: {
    maxPitch: numberArgType,
    maxRoll: numberArgType,
    maxYaw: numberArgType,
    pitchFrequency: frequencyArgType,
    rollFrequency: frequencyArgType,
    yawFrequency: frequencyArgType,
  },
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 3) }} controls={false}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Camera Shake',
      },
    },
  },
} satisfies Meta<typeof CameraShake>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                  Camera Shake                                  */
/*                                                                                */
/**********************************************************************************/

function Scene() {
  const cube = new THREE.Mesh()

  useFrame(() => {
    if (cube) {
      cube.rotation.x = cube.rotation.y += 0.01
    }
  })
  return (
    <>
      <Entity from={cube!}>
        <T.BoxGeometry args={[2, 2, 2]} />
        <T.MeshStandardMaterial wireframe color="white" />
      </Entity>
      <T.Mesh position={[0, -6, 0]} rotation={[Math.PI / -2, 0, 0]}>
        <T.PlaneGeometry args={[200, 200, 75, 75]} />
        <T.MeshBasicMaterial wireframe color="red" side={THREE.DoubleSide} />
      </T.Mesh>
    </>
  )
}

export const Default: Story = {
  render(props) {
    return (
      <>
        <CameraShake {...props} />
        <Scene />
      </>
    )
  },
}

export const WithOrbitControls: Story = {
  render(props) {
    let controlsRef: OrbitControlsImpl = null!
    return (
      <>
        <OrbitControls ref={controlsRef} />
        <CameraShake {...props} controls={controlsRef} />
        <Scene />
      </>
    )
  },
}
