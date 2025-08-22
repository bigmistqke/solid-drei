import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Float } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Float',
  component: Float,
  args: {
    rotationIntensity: 4,
    floatIntensity: 2,
    speed: 5,
  },
  argTypes: {
    rotationIntensity: { control: { type: 'number', min: 0, max: 10, step: 0.1 } },
    floatIntensity: { control: { type: 'number', min: 0, max: 10, step: 0.1 } },
    speed: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
  },
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new THREE.Vector3(0, 0, 10) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Float>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Float                                     */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render(args) {
    let cube

    return (
      <>
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
        {/* ground plane */}
        <T.Mesh position={[0, -6, 0]} rotation={[Math.PI / -2, 0, 0]}>
          <T.PlaneGeometry args={[200, 200, 75, 75]} />
          <T.MeshBasicMaterial wireframe color="red" side={THREE.DoubleSide} />
        </T.Mesh>
      </>
    )
  },
}
