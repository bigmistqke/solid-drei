import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Setup } from '../Setup'
import { useCubeTexture, useFBX } from '../../src'
import { T } from '../t'

const meta = {
  title: 'Loaders/Fbx',
  component: useFBX,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useFBX>

export default meta
type Story = StoryObj<typeof meta>

function FbxScene(props: { path: string }) {
  const fbx = useFBX(() => props.path)
  const envMap = useCubeTexture(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], { path: 'cube/' })

  return (
    <>
      <T.Color attach="background" args={['#51392c']} />
      <Suspense>
        <T.Entity from={fbx}>
          <T.MeshStandardMaterial envMap={envMap()} envMapIntensity={1} metalness={1} roughness={0} />
        </T.Entity>
      </Suspense>
    </>
  )
}

export const Default: Story = {
  render() {
    return (
      <FbxScene path="suzanne/suzanne.fbx" />
    )
  },
}
