import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useGLTF, useMatcapTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/MatcapTexture',
  component: useMatcapTexture,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 3] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useMatcapTexture>

export default meta
type Story = StoryObj<typeof meta>

function MatcapTextureScene(props: { id: number; format: number }) {
  const { nodes }: any = useGLTF(() => 'suzanne.glb')
  const [texture] = useMatcapTexture(props.id, props.format)

  return (
    <>
      <T.Color attach="background" args={['#291203']} />
      <Suspense>
        <T.Mesh geometry={() => (nodes()?.Suzanne as any)?.geometry}>
          <T.MeshMatcapMaterial matcap={() => texture()} />
        </T.Mesh>
      </Suspense>
    </>
  )
}

export const Default: Story = {
  render() {
    return <MatcapTextureScene id={111} format={1024} />
  },
}
