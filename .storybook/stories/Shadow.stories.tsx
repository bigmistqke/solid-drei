import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Color, Mesh } from 'three'
import { Icosahedron, Plane, Shadow } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/Shadow',
  component: Shadow,
  decorators: [
    Story => (
      <Setup scene={{ background: new Color() }} defaultCamera={{ position: [0, 10, 10] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Shadow>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                       Shadow                                     */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    let shadow: Mesh = null!
    let mesh: Mesh = null!

    useFrame(({ clock }) => {
      shadow.scale.x = Math.sin(clock.getElapsedTime()) + 3
      shadow.scale.y = Math.sin(clock.getElapsedTime()) + 3
      mesh.position.y = Math.sin(clock.getElapsedTime()) + 2.5
    })

    return (
      <>
        <Icosahedron ref={mesh!} args={[1, 2]} position-y={2}>
          <T.MeshBasicMaterial color="lightblue" wireframe />
        </Icosahedron>
        <Shadow ref={shadow!} scale={[2, 2, 2]} position-y={0.1} rotation-x={-Math.PI / 2} />
        {/* Ground */}
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <T.MeshBasicMaterial color="white" />
        </Plane>
      </>
    )
  },
}
