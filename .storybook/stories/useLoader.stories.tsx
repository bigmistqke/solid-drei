import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { TextureLoader } from 'three'
import { Image, useLoader } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/useLoader',
  component: useLoader,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [0, 0, 5] }} lights={false}>
        <T.PointLight position={[1, 1, 2]} intensity={3} distance={20} />
        <T.PointLight position={[-1, 1, 2]} intensity={0.05} distance={20} />
        <T.AmbientLight intensity={0.25} />
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Use Gltf',
      },
    },
  },
} satisfies Meta<typeof useLoader>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Use Gltf                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const texture = useLoader(TextureLoader, '/images/living-room-1.jpg')
    useLoader.cache.emptyFreeList()
    return <Image texture={texture()} scale={[4, 4]} position={[-2, -2, -1.5]} />
  },
}
