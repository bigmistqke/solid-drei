import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import type { Mesh } from 'three'
import { RenderTexture, PerspectiveCamera } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Portals/RenderTexture',
  component: RenderTexture,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'RenderTexture renders a scene into a texture that can be used as a material map.',
      },
    },
  },
} satisfies Meta<typeof RenderTexture>

export default meta
type Story = StoryObj<typeof meta>

function RenderTextureScene() {
  let torusRef: Mesh | undefined

  useFrame(({ clock }) => {
    if (torusRef) {
      const t = clock.getElapsedTime()
      torusRef.rotation.x = t
      torusRef.rotation.y = t
    }
  })

  return (
    <T.Mesh>
      <T.BoxGeometry />
      <T.MeshStandardMaterial>
        <RenderTexture attach="map" frames={Infinity}>
          <PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <T.Mesh ref={torusRef}>
            <T.TorusGeometry />
            <T.MeshStandardMaterial color="hotpink" />
          </T.Mesh>
        </RenderTexture>
      </T.MeshStandardMaterial>
    </T.Mesh>
  )
}

export const Default: Story = {
  render() {
    return <RenderTextureScene />
  },
}
