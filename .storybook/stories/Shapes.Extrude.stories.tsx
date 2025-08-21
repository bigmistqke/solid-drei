import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Extrude } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Shapes/Extrude',
  component: Extrude,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new THREE.Vector3(-30, 30, 30) }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Extrude',
      },
    },
  },
} satisfies Meta<typeof Extrude>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                     Extrude                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const shape = new THREE.Shape()

    const width = 8,
      length = 12

    shape.moveTo(0, 0)
    shape.lineTo(0, width)
    shape.lineTo(length, width)
    shape.lineTo(length, 0)
    shape.lineTo(0, 0)

    const extrudeSettings = {
      steps: 2,
      depth: 16,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 1,
    }

    return (
      <>
        <Extrude args={[shape, extrudeSettings]}>
          <Entity from={THREE.MeshPhongMaterial} color="#f3f3f3" wireframe />
        </Extrude>
      </>
    )
  },
}
