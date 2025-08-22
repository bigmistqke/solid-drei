// import { number, withKnobs } from '@storybook/addon-knobs'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { useTrailTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'misc/useTrailTexture',
  component: useTrailTexture,
  decorators: [
    Story => (
      <Setup environment defaultCamera={{ fov: 20, position: new Vector3(0, 0, 30) }}>
        <T.Color args={['white']} attach="background" />
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Stats',
      },
    },
  },
} satisfies Meta<typeof useTrailTexture>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Gizmo Helper                                */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    size: 256,
    radius: 0.3,
    maxAge: 750,
  },
  argTypes: {
    size: { min: 64, step: 8 },
    radius: { control: { type: 'range', min: 0.1, max: 1, step: 0.1 } },
    maxAge: { control: { type: 'range', min: 300, max: 1_000, step: 100 } },
  },
  render(props) {
    const { update, texture } = useTrailTexture(props)
    return (
      <T.Mesh scale={7} onPointerMove={update}>
        <T.PlaneGeometry />
        <T.MeshBasicMaterial map={texture()} />
      </T.Mesh>
    )
  },
}
