import { createMemo } from 'solid-js'
import { Suspense } from 'solid-js'
import { Vector2 } from 'three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useGLTF, useDreiNormalTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/NormalTexture',
  component: useDreiNormalTexture,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 3] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useDreiNormalTexture>

export default meta
type Story = StoryObj<typeof meta>

function NormalTextureScene(props: { id: number; repeat: number[]; anisotropy: number }) {
  const { nodes }: any = useGLTF(() => 'suzanne.glb')
  const result = useDreiNormalTexture(() => props.id, { repeat: props.repeat, anisotropy: props.anisotropy })

  const normalScale = createMemo(() => {
    const r = result()
    return r ? new Vector2().fromArray(props.repeat) : undefined
  })

  return (
    <Suspense>
      <T.Mesh geometry={() => (nodes()?.Suzanne as any)?.geometry}>
        <T.MeshStandardMaterial
          color="darkmagenta"
          roughness={0.9}
          metalness={0.1}
          normalScale={() => normalScale()}
          normalMap={() => result()?.texture}
        />
      </T.Mesh>
    </Suspense>
  )
}

export const Default: Story = {
  render() {
    return <NormalTextureScene id={3} repeat={[4, 4]} anisotropy={8} />
  },
}
