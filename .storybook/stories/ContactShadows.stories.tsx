import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mesh } from 'three'
import { ContactShadows, Plane, Sphere } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/ContactShadows',
  component: ContactShadows,
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
        component: 'Use Fbo',
      },
    },
  },
} satisfies Meta<typeof ContactShadows>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                  Contact Shadows                               */
/*                                                                                */
/**********************************************************************************/

function ContactShadowScene({ colorized }: any) {
  let mesh: Mesh = null!
  useFrame(({ clock }) => {
    mesh.position.y = Math.sin(clock.getElapsedTime()) + 2
  })

  return (
    <>
      <Sphere ref={mesh} args={[1, 32, 32]} position-y={2}>
        <T.MeshBasicMaterial color="#2A8AFF" />
      </Sphere>
      <ContactShadows
        position={[0, 0, 0]}
        scale={10}
        far={3}
        blur={3}
        rotation={[Math.PI / 2, 0, 0]}
        color={colorized ? '#2A8AFF' : 'black'}
      />
      <Plane args={[10, 10]} position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <T.MeshBasicMaterial color="white" />
      </Plane>
    </>
  )
}

export const Default: Story = {
  render() {
    return <ContactShadowScene />
  },
}

export const Colorized: Story = {
  render() {
    return <ContactShadowScene colorized />
  },
}
