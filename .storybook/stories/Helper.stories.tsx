import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { BoxHelper, CameraHelper } from 'three'
import { VertexNormalsHelper } from 'three-stdlib'
import { Helper, PerspectiveCamera, Sphere } from '../../src'
import { Setup } from '../Setup'
import { ComponentProps } from 'solid-js'

const meta = {
  title: 'Gizmos/Helper',
  component: Helper,
  decorators: [
    Story => (
      <Setup>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Helper>

export default meta
type Story = StoryObj<typeof meta>

const HelperScene1 = (_props: ComponentProps<typeof Helper>) => {
  return (
    <Sphere>
      <meshBasicMaterial />

      <Helper type={BoxHelper} args={['royalblue']} />
      <Helper type={VertexNormalsHelper} args={[1, 0xff0000]} />
    </Sphere>
  )
}

export const Default: Story = {
  render(args) {
    return <HelperScene1 {...args} />
  },
  name: 'Default',
}

const HelperScene2 = (_props: ComponentProps<typeof Helper>) => {
  let camera: THREE.PerspectiveCamera = null!

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (camera) {
      camera.lookAt(0, 0, 0)
      camera.position.x = Math.sin(t) * 4
      camera.position.z = Math.cos(t) * 4
    }
  })

  return (
    <PerspectiveCamera makeDefault={false} position={[0, 3, 3]} near={1} far={4} ref={camera}>
      <meshBasicMaterial />
      <Helper type={CameraHelper} />
    </PerspectiveCamera>
  )
}

export const CameraHelper: Story = {
  render(args) {
    return <HelperScene2 {...args} />
  },
  name: 'Camera Helper',
}
