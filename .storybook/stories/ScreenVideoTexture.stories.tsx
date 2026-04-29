import { createSignal, onMount, Suspense, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DoubleSide } from 'three'
import { Html, Plane, useScreenVideoTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Web/ScreenVideoTexture',
  decorators: [
    (Story: () => JSX.Element) => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useScreenVideoTexture>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                            Screen Video Texture                               */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const [showCaptureButton, setShowCaptureButton] = createSignal(true)
    const texture = useScreenVideoTexture()

    return (
      <>
        <Suspense fallback={null}>
          {texture() && (
            <>
              <Plane args={[4, 2.25]} rotation={[0, 0, 0]}>
                <T.MeshBasicMaterial side={DoubleSide} map={texture()} toneMapped={false} />
              </Plane>
              <Html
                position={[0, -1.5, 0]}
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
                Screen capture active
              </Html>
            </>
          )}
        </Suspense>

        {showCaptureButton() && (
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
              onClick={() => {
                setShowCaptureButton(false)
              }}
              style={{
                padding: '10px 20px',
                'font-size': '14px',
                'background-color': '#007bff',
                color: 'white',
                border: 'none',
                'border-radius': '4px',
                cursor: 'pointer',
                'font-family': 'system-ui',
              }}
            >
              Start Screen Capture
            </button>
          </div>
        )}
      </>
    )
  },
}
