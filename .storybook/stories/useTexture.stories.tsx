import { Suspense, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Icosahedron, useTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/Texture',
  component: useTexture,
  decorators: [
    (Story: () => JSX.Element) => {
      return (
        <Setup environment lights defaultCamera={{ position: [0, 0, 5] }}>
          <Story />
        </Setup>
      )
    },
  ],
} satisfies Meta<typeof useTexture>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                   Use Texture                                  */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const map1 = useTexture('matcap-1.png')
    const map2 = useTexture('matcap-2.png')

    return (
      <Suspense>
        <Icosahedron position={[-2, 0, 0]}>
          <T.MeshMatcapMaterial matcap={map1()} />
        </Icosahedron>
        <Icosahedron position={[2, 0, 0]}>
          <T.MeshMatcapMaterial matcap={map2()} />
        </Icosahedron>
      </Suspense>
    )
  },
}

export const Record: Story = {
  render() {
    // You can also use a Record<string, url> as input
    const textures = useTexture({
      map: 'matcap-1.png',
      metalnessMap: 'matcap-2.png',
    })

    return (
      <Suspense>
        <Icosahedron position={[0, 0, 0]}>
          <T.MeshStandardMaterial
            map={textures()?.map}
            metalnessMap={textures()?.metalnessMap}
            metalness={1}
          />
        </Icosahedron>
      </Suspense>
    )
  },
}

export const Reactive: Story = {
  args: {
    map: 'matcap-1.png',
  },
  argTypes: {
    map: {
      control: 'radio',
      options: ['matcap-1.png', 'matcap-2.png'],
    },
  },
  render(props) {
    const map = useTexture(() => props.map)

    return (
      <Suspense>
        <Icosahedron position={[0, 0, 0]}>
          <T.MeshMatcapMaterial matcap={map()} />
        </Icosahedron>
      </Suspense>
    )
  },
}
