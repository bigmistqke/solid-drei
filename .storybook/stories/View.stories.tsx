import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { View } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Web/View',
  component: View,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }} controls={false}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'View renders into a tracked DOM element, allowing multiple canvases to render into different parts of the page.',
      },
    },
  },
} satisfies Meta<typeof View>

export default meta
type Story = StoryObj<typeof meta>

function ViewScene() {
  const [leftRef, setLeftRef] = createSignal<HTMLDivElement | undefined>()
  const [rightRef, setRightRef] = createSignal<HTMLDivElement | undefined>()

  return (
    <div style={{ display: 'flex', gap: '20px', width: '100%', height: '100%' }}>
      <div
        ref={setLeftRef}
        style={{
          flex: 1,
          border: '2px solid #333',
          'border-radius': '8px',
          height: '300px',
          background: 'rgba(0, 0, 0, 0.1)',
        }}
      />
      <div
        ref={setRightRef}
        style={{
          flex: 1,
          border: '2px solid #333',
          'border-radius': '8px',
          height: '300px',
          background: 'rgba(0, 0, 0, 0.1)',
        }}
      />
      {leftRef() && (
        <View track={leftRef()!} index={1}>
          <T.PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <T.Mesh>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="red" />
          </T.Mesh>
          <T.AmbientLight intensity={0.8} />
        </View>
      )}
      {rightRef() && (
        <View track={rightRef()!} index={2}>
          <T.PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <T.Mesh>
            <T.SphereGeometry args={[0.8, 32, 32]} />
            <T.MeshStandardMaterial color="blue" />
          </T.Mesh>
          <T.AmbientLight intensity={0.8} />
        </View>
      )}
    </div>
  )
}

export const Default: Story = {
  render() {
    return <ViewScene />
  },
}
