import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Html, Loader, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/Loader',
  component: Loader,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Loader>

export default meta
type Story = StoryObj<typeof meta>

function Helmet() {
  const { nodes } = useGLTF(() => 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf')

  return <T.Primitive object={() => nodes['node_damagedHelmet_-6514']} />
}

function LoaderScene() {
  return (
    <Suspense
      fallback={
        <Html>
          <Loader />
        </Html>
      }
    >
      <Helmet />
    </Suspense>
  )
}

export const Default: Story = {
  render() {
    return <LoaderScene />
  },
}
