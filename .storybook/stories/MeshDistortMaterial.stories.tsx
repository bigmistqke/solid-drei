import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DistortMaterialImpl, Icosahedron, MeshDistortMaterial } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Shaders/MeshDistortMaterial',
  component: MeshDistortMaterial,
  args: {
    color: 'red',
    speed: 1,
    distort: 0.6,
    radius: 1,
  },
  argTypes: {
    color: {
      control: {
        type: 'color',
      },
    },
    speed: {
      control: {
        range: [0, 10],
        step: 0.1,
      },
    },
    distort: {
      control: {
        range: [0, 1],
        step: 0.1,
      },
    },
    radius: {
      control: {
        range: [0, 1],
        step: 0.1,
      },
    },
  },
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof MeshDistortMaterial>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                              Mesh Distort Material                             */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render(props) {
    return (
      <Icosahedron args={[1, 4]}>
        <MeshDistortMaterial {...props} />
      </Icosahedron>
    )
  },
}

export const Ref: Story = {
  render(props) {
    let material: DistortMaterialImpl = null!

    useFrame(({ clock }) => {
      material.distort = Math.sin(clock.getElapsedTime())
    })

    return (
      <Icosahedron args={[1, 4]}>
        <MeshDistortMaterial ref={material!} {...props} />
      </Icosahedron>
    )
  },
}
