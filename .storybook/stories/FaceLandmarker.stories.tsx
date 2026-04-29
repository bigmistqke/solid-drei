import { createResource, createSignal, Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Setup } from '../Setup'
import { FaceLandmarker, FaceControls } from '../../src'

const meta = {
  title: 'Misc/FaceLandmarker',
  component: FaceLandmarker,
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 5)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof FaceLandmarker>

export default meta
type Story = StoryObj<typeof meta>

function FaceLandmarkerScene() {
  const [video, setVideo] = createSignal<HTMLVideoElement>()

  return (
    <Suspense fallback={null}>
      <FaceLandmarker>
        <FaceControls>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </FaceControls>
        <mesh position={[0, -2, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color="gray" />
        </mesh>
      </FaceLandmarker>
      <video
        ref={setVideo}
        style={{ position: 'absolute', bottom: '20px', right: '20px', width: '200px', 'z-index': 10 }}
        autoplay
        muted
        playsinline
      />
    </Suspense>
  )
}

export const Default: Story = {
  render() {
    return <FaceLandmarkerScene />
  },
  name: 'Default',
  parameters: {
    docs: {
      description: {
        component: 'FaceLandmarker uses MediaPipe to detect faces. Requires webcam access.',
      },
    },
  },
}
