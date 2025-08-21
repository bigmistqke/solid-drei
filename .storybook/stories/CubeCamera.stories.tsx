import { Resource, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { CubeTextureLoader } from 'three'
import { Box, CubeCamera } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Camera/CubeCamera',
  component: CubeCamera,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 5, 50] }}>
        <Resource
          loader={CubeTextureLoader}
          attach="environment"
          path="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r80/examples/textures/cube/Bridge2/"
          url={['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']}
        />
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Accumulative Shadows',
      },
    },
  },
} satisfies Meta<typeof CubeCamera>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Cube Camera                                 */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    offset: 2000,
  },
  render(props) {
    return (
      <>
        <T.Fog attach="fog" args={['#f0f0f0', 100, 200]} />
        <T.Group position={[0, -10, 0]}>
          <Box material-color="hotpink" args={[5, 5, 5]} position-y={2.5} />
          <CubeCamera
            ref={ref => {
              useFrame(({ clock }) => {
                ref!.position.y = Math.sin(props.offset + clock.elapsedTime) * 5 + 20
              })
            }}
          >
            {texture => (
              <T.Mesh>
                <T.SphereGeometry args={[5, 64, 64]} />
                <T.MeshStandardMaterial
                  color="white"
                  roughness={0}
                  metalness={1}
                  envMap={texture}
                />
              </T.Mesh>
            )}
          </CubeCamera>
          <T.GridHelper args={[100, 10]} />
        </T.Group>
      </>
    )
  },
}
