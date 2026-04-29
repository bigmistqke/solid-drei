import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshPortalMaterial, RoundedBox } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/MeshPortalMaterial',
  component: MeshPortalMaterial,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [0, 0, 4] }}>
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'MeshPortalMaterial',
      },
    },
  },
} satisfies Meta<typeof MeshPortalMaterial>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                         MeshPortalMaterial Portal Scene                        */
/*                                                                                */
/**********************************************************************************/

function PortalScene() {
  return (
    <RoundedBox args={[2, 3, 0.1]} radius={0.05}>
      <MeshPortalMaterial>
        <T.AmbientLight intensity={1} />
        <T.Color attach="background" args={['#ff6030']} />
        <T.Mesh>
          <T.TorusKnotGeometry args={[0.6, 0.2, 100, 16]} />
          <T.MeshStandardMaterial color="white" />
        </T.Mesh>
      </MeshPortalMaterial>
    </RoundedBox>
  )
}

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 5, 5]} />
        <PortalScene />
      </>
    )
  },
}

/**********************************************************************************/
/*                                                                                */
/*                       MeshPortalMaterial with Blend Story                      */
/*                                                                                */
/**********************************************************************************/

function BlendPortalScene() {
  return (
    <RoundedBox args={[2, 3, 0.1]} radius={0.05}>
      <MeshPortalMaterial blend={1}>
        <T.AmbientLight intensity={1} />
        <T.Color attach="background" args={['#1a1a2e']} />
        <T.Mesh>
          <T.SphereGeometry args={[0.8, 32, 32]} />
          <T.MeshStandardMaterial color="#e94560" roughness={0.2} metalness={0.8} />
        </T.Mesh>
        <T.DirectionalLight position={[3, 3, 3]} intensity={2} />
      </MeshPortalMaterial>
    </RoundedBox>
  )
}

export const Blend: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 5, 5]} />
        <BlendPortalScene />
      </>
    )
  },
}
