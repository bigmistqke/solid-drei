import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { Clone } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Abstractions/Clone',
  component: Clone,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 2, 8) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Clone>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    let original: THREE.Mesh = null!

    return (
      <>
        <T.Mesh ref={original} position={[-4, 0, 0]}>
          <T.BoxGeometry />
          <T.MeshStandardMaterial color="orange" />
        </T.Mesh>
        <Clone object={original} position={[0, 0, 0]} />
        <Clone object={original} position={[4, 0, 0]} />
      </>
    )
  },
}
