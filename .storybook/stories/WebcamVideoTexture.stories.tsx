import { createSignal, Show, Suspense, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DoubleSide } from 'three'
import { Html, Plane, useWebcamVideoTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Web/WebcamVideoTexture',
  decorators: [
    (Story: () => JSX.Element) => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useWebcamVideoTexture>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                           Webcam Video Texture                                */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const [permissionGranted, setPermissionGranted] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)
    const texture = useWebcamVideoTexture()

    const handleRequestPermission = async () => {
      try {
        setError(null)
        setPermissionGranted(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to access webcam')
        setPermissionGranted(false)
      }
    }

    return (
      <>
        <Suspense fallback={null}>
          <Show when={texture()}>
            <Plane args={[4, 3]} rotation={[0, 0, 0]}>
              <T.MeshBasicMaterial side={DoubleSide} map={texture()} toneMapped={false} />
            </Plane>
          </Show>
        </Suspense>

        <Show when={error()}>
          <Html
            position={[0, 0, 0]}
            center
            distanceFactor={1}
            style={{
              width: '300px',
              padding: '20px',
              background: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              'border-radius': '4px',
              'text-align': 'center',
              'font-family': 'system-ui',
              'font-size': '14px',
            }}
          >
            <div>Webcam access denied or unavailable</div>
            <div style={{ 'font-size': '12px', 'margin-top': '8px' }}>{error()}</div>
          </Html>
        </Show>

        <Show when={!permissionGranted() && !error()}>
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              'z-index': 100,
            }}
          >
            <button
              onClick={handleRequestPermission}
              style={{
                padding: '10px 20px',
                'font-size': '14px',
                'background-color': '#28a745',
                color: 'white',
                border: 'none',
                'border-radius': '4px',
                cursor: 'pointer',
                'font-family': 'system-ui',
              }}
            >
              Enable Webcam
            </button>
          </div>
        </Show>

        <Show when={permissionGranted() && texture()}>
          <Html
            position={[0, -1.8, 0]}
            center
            distanceFactor={1}
            style={{
              width: '200px',
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              'border-radius': '4px',
              'text-align': 'center',
              'font-family': 'system-ui',
              'font-size': '12px',
            }}
          >
            Webcam stream active
          </Html>
        </Show>
      </>
    )
  },
}
