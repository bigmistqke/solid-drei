import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { type EnvironmentPreset, Environment, OrbitControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const PRESETS: EnvironmentPreset[] = [
  'apartment', 'city', 'dawn', 'forest', 'lobby',
  'night', 'park', 'studio', 'sunset', 'warehouse',
]

const meta = {
  title: 'Staging/Environment',
  component: Environment,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 4) }}>
        <Suspense fallback={null}>
          <Story />
        </Suspense>
      </Setup>
    ),
  ],
} satisfies Meta<typeof Environment>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    preset: 'city',
    background: true,
    blur: 0,
  },
  argTypes: {
    preset: {
      options: PRESETS,
      control: { type: 'select' },
    },
    background: { control: 'boolean' },
    blur: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
  },
  render(args) {
    return (
      <>
        <Environment preset={args.preset as EnvironmentPreset} background={args.background} blur={args.blur} />
        <T.Mesh>
          <T.TorusKnotGeometry args={[1, 0.4, 128, 32]} />
          <T.MeshStandardMaterial metalness={1} roughness={0} color="white" />
        </T.Mesh>
        <OrbitControls autoRotate autoRotateSpeed={1} />
      </>
    )
  },
}

export const BackgroundOnly: Story = {
  render() {
    return (
      <>
        <Environment preset="sunset" background="only" />
        <T.Mesh>
          <T.TorusKnotGeometry args={[1, 0.4, 128, 32]} />
          <T.MeshStandardMaterial color="orange" roughness={0.8} />
        </T.Mesh>
        <T.AmbientLight intensity={1} />
        <OrbitControls autoRotate autoRotateSpeed={1} />
      </>
    )
  },
}
