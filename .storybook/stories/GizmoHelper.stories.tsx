import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { GizmoHelper, OrbitControls, useGLTF, GizmoViewcube, GizmoViewport } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { ComponentProps, Suspense } from 'solid-js'

const alignments = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
  'bottom-center',
  'center-right',
  'center-left',
  'center-center',
  'top-center',
] as const

const meta = {
  title: 'Gizmos/GizmoHelper',
  component: GizmoHelper,
  decorators: [
    (Story) => (
      <Setup controls={false} defaultCamera={{ position: [0, 0, 10] }}>
        <Story />
      </Setup>
    ),
  ],
  args: {
    alignment: alignments[2],
    margin: [80, 80],
  },
  argTypes: {
    alignment: {
      control: { type: 'select' },
      options: alignments,
    },
  },
} satisfies Meta<typeof GizmoHelper>

export default meta
type Story = StoryObj<typeof meta>

function Tokyo() {
  const gltf = useGLTF(() => 'LittlestTokyo.glb')
  return <T.Primitive object={() => gltf()?.scene} scale={0.01} />
}

const GizmoHelperScene1 = (props: ComponentProps<typeof GizmoHelper>) => {
  return (
    <Suspense fallback={null}>
      <Tokyo />
      <GizmoHelper {...props}>
        <GizmoViewcube />
      </GizmoHelper>
      <OrbitControls makeDefault />
    </Suspense>
  )
}

export const GizmoHelperSt1: Story = {
  name: 'Cube',
  render: (args) => <GizmoHelperScene1 {...args} />,
} satisfies Story

const GizmoHelperScene2 = (props: ComponentProps<typeof GizmoHelper>) => {
  return (
    <Suspense fallback={null}>
      <Tokyo />
      <GizmoHelper {...props}>
        <GizmoViewport />
      </GizmoHelper>
      <OrbitControls makeDefault />
    </Suspense>
  )
}

export const GizmoHelperSt2: Story = {
  name: 'Viewport',
  render: (args) => <GizmoHelperScene2 {...args} />,
} satisfies Story
