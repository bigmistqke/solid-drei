import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { Setup } from '../Setup'
import { Facemesh, FacemeshDatas } from '../../src'
import { ComponentProps } from 'solid-js'

const meta = {
  title: 'Shapes/Facemesh',
  component: Facemesh,
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 5)} cameraFov={60}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Facemesh>

export default meta
type Story = StoryObj<typeof meta>

function FacemeshScene(props: ComponentProps<typeof Facemesh>) {
  return (
    <>
      <color attach="background" args={['#303030']} />
      <axesHelper />

      <Facemesh
        {...props}
        faceBlendshapes={FacemeshDatas.SAMPLE_FACELANDMARKER_RESULT.faceBlendshapes[0]}
        facialTransformationMatrix={FacemeshDatas.SAMPLE_FACELANDMARKER_RESULT.facialTransformationMatrixes[0]}
        rotation-z={Math.PI}
      >
        <meshStandardMaterial side={THREE.DoubleSide} color="#cbcbcb" flatShading={true} transparent opacity={0.98} />
      </Facemesh>
    </>
  )
}

export const Default: Story = {
  render: (args) => <FacemeshScene {...args} />,
  args: {
    debug: true,
  },
  argTypes: {
    depth: { control: { type: 'range', min: 0, max: 6.5, step: 0.01 } },
    origin: { control: 'select', options: [undefined, 168, 9] },
    eyes: { control: { type: 'boolean' } },
    eyesAsOrigin: { control: { type: 'boolean' } },
    offset: { control: { type: 'boolean' } },
    offsetScalar: { control: { type: 'range', min: 0, max: 200, step: 1 } },
    debug: { control: { type: 'boolean' } },
  },
  name: 'Default',
}
