import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Box, Center, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Staging/Center',
  component: Center,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, -10] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Use Fbo',
      },
    },
  },
} satisfies Meta<typeof Center>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                       Center                                   */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const gltf = useGLTF(() => 'LittlestTokyo.glb')

    const turntable = useTurntable()

    return (
      <Center>
        <T.Group position={[0, 0, 10]}>
          <Box args={[10, 10, 10]}>
            <T.MeshNormalMaterial wireframe />
          </Box>
          <Entity from={gltf()?.scene} ref={turntable} scale={[0.01, 0.01, 0.01]} />
        </T.Group>
      </Center>
    )
  },
}
