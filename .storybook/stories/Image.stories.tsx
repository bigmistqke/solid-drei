import { splitProps, Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Image, useTexture } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Abstractions/Image',
  component: Image,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: [0, 0, 10] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Image component that displays textures in 3D space',
      },
    },
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Image                                     */
/*                                                                                */
/**********************************************************************************/

function TextureWrapper(props: any) {
  const texture = useTexture('/images/living-room-1.jpg')
  const texture2 = useTexture('/images/living-room-3.jpg')

  return (
    <>
      <Image texture={texture()} scale={[4, 4]} position={[-2, -2, -1.5]} {...props} />
      <Image texture={texture2()} scale={[4, 4]} position={[2, 2, -1]} {...props} />
    </>
  )
}

export const ImageBasic: Story = {
  render: props => {
    const [localProps, args] = splitProps(props, ['url'])

    return (
      <Suspense>
        <TextureWrapper {...args} />
        <Image
          url={localProps.url?.[0] || '/images/living-room-2.jpg'}
          scale={[6, 4]}
          position={[0, 0, 0]}
          {...args}
        />
      </Suspense>
    )
  },
  name: 'Image Basic',
  args: {
    transparent: true,
    opacity: 0.5,
    url: null,
  },
  argTypes: {
    url: {
      control: {
        type: 'file',
        accept: ['.png', '.jpg'],
      },
    },
  },
}
