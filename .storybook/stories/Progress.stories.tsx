import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Html, useGLTF, useProgress } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/Progress',
  component: useProgress,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useProgress>

export default meta
type Story = StoryObj<typeof meta>

function Shoe() {
  const { nodes } = useGLTF(
    () => 'https://threejs.org/examples/models/gltf/MaterialsVariantsShoe/glTF/MaterialsVariantsShoe.gltf',
  )

  return <T.Primitive object={() => nodes?.Shoe} />
}

function CustomLoader() {
  const progress = useProgress()
  return (
    <Html center>
      <span style={{ color: 'white' }}>{() => `${progress.progress.toFixed(2)} % loaded`}</span>
    </Html>
  )
}

function ProgressScene() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <Shoe />
    </Suspense>
  )
}

export const Default: Story = {
  render() {
    return <ProgressScene />
  },
}
