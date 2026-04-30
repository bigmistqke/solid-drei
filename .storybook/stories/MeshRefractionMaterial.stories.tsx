import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshRefractionMaterial, useCubeTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/MeshRefractionMaterial',
  component: MeshRefractionMaterial,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 0, 5] }} lights={false}><Story /></Setup>)],
} satisfies Meta<typeof MeshRefractionMaterial>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    const [texture] = useCubeTexture(
      () => ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'],
      { path: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r80/examples/textures/cube/Bridge2/' }
    )

    return (
      <>
        <T.AmbientLight intensity={1.5} />
        <T.DirectionalLight castShadow position={[5, 10, 5]} intensity={1} />
        {texture() && (
          <T.Mesh position={[0, 0, 0]}>
            <T.IcosahedronGeometry args={[1.5, 5]} />
            <MeshRefractionMaterial envMap={texture()!} bounces={2} ior={2.4} fresnel={0} aberrationStrength={0.03} />
          </T.Mesh>
        )}
      </>
    )
  },
}
