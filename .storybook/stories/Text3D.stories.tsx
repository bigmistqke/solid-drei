import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Center, Float, Text, Text3D } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Abstractions/Text3D',
  component: Text,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                     Text 3D                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    return (
      <>
        <T.Color args={[0, 0, 0]} attach="background" />
        <Center>
          <Float floatIntensity={5} speed={2}>
            <Text3D font={'/fonts/helvetiker_regular.typeface.json'} bevelEnabled bevelSize={0.05}>
              Text 3D
              <T.MeshNormalMaterial />
            </Text3D>
          </Float>
        </Center>
      </>
    )
  },
}
