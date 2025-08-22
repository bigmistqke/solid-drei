import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector2, Vector3 } from 'three'
import { useDreiNormalTexture, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/useDreiNormalTexture',
  component: useDreiNormalTexture,
  decorators: [
    Story => (
      <Setup environment defaultCamera={{ position: new Vector3(0, 0, 3) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useDreiNormalTexture>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                             Use Drei Normal Texture                            */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    repeat: 1.1,
    scale: 0.5,
    textureIndex: 4,
  },
  argTypes: {
    repeat: {
      control: { type: 'range', max: 20, min: 0, step: 0.1 },
    },
    scale: {
      control: { type: 'range', max: 2, min: 0, step: 0.1 },
    },
  },
  render(props) {
    const gltf = useGLTF(() => 'suzanne.glb', { useDraco: true })
    const resource = useDreiNormalTexture(() => props.textureIndex, {
      get repeat() {
        return [props.repeat, props.repeat]
      },
      anisotropy: 8,
    })

    return (
      <Entity from={gltf()?.scene}>
        <T.MeshStandardMaterial
          attach="children-0-material"
          color="darkmagenta"
          roughness={0.9}
          metalness={0.1}
          normalScale={new Vector2(props.scale, props.scale)}
          normalMap={resource()?.texture}
        />
      </Entity>
    )
  },
}
