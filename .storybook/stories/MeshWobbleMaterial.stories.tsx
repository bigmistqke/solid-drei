import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshWobbleMaterial, Torus, WobbleMaterialImpl } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Shaders/MeshWobbleMaterial',
  component: MeshWobbleMaterial,
  args: {
    speed: 1,
    factory: 0.6,
  },
  argTypes: {
    speed: {
      control: {
        range: [0, 10],
        step: 0.1,
      },
    },
    factor: {
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
} satisfies Meta<typeof MeshWobbleMaterial>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                               Mesh Wobble Material                             */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render(props) {
    return (
      <Torus args={[1, 0.25, 16, 100]}>
        <MeshWobbleMaterial color="#f25042" {...props} />
      </Torus>
    )
  },
}

export const Ref: Story = {
  render(props) {
    let material: WobbleMaterialImpl = null!

    useFrame(({ clock }) => {
      material.factor = Math.abs(Math.sin(clock.getElapsedTime())) * 2
      material.speed = Math.abs(Math.sin(clock.getElapsedTime())) * 10
    })

    return (
      <Torus args={[1, 0.25, 16, 100]}>
        <MeshWobbleMaterial color="#f25042" ref={material!} {...props} />
      </Torus>
    )
  },
}
