import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Html, PositionalAudio, Sphere } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Abstractions/PositionalAudio',
  component: PositionalAudio,
  decorators: [
    (Story: () => JSX.Element) => (
      <Setup defaultCamera={{ position: [0, 0, 8] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof PositionalAudio>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                             Positional Audio                                  */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const [isPlaying, setIsPlaying] = createSignal(false)

    const audioUrl = 'https://cdn.jsdelivr.net/npm/three@r128/examples/sounds/Kolento_-_Satisfaction_70bpm.mp3'

    return (
      <>
        <T.Group position={[0, 0, 0]}>
          <Sphere args={[1, 32, 32]} onClick={() => setIsPlaying(!isPlaying())}>
            <T.MeshStandardMaterial color={isPlaying() ? '#ff6b6b' : '#4dabf7'} emissive={isPlaying() ? '#ff6b6b' : '#000000'} emissiveIntensity={isPlaying() ? 0.3 : 0} />
          </Sphere>

          {/* Audio positioned at the sphere center */}
          <PositionalAudio
            url={audioUrl}
            distance={5}
            loop={true}
            autoplay={isPlaying()}
          />

          {/* Helper text */}
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
            {isPlaying() ? 'Playing' : 'Click to play'}
          </Html>
        </T.Group>

        {/* Camera indicator (this is where the listener is) */}
        <T.Group position={[0, 0, 8]}>
          <Sphere args={[0.2, 16, 16]}>
            <T.MeshBasicMaterial color="#ffd43b" />
          </Sphere>
          <Html
            position={[0, 0.5, 0]}
            center
            distanceFactor={1}
            style={{
              color: 'white',
              'font-family': 'system-ui',
              'font-size': '10px',
              'background': 'rgba(0, 0, 0, 0.7)',
              padding: '4px 8px',
              'border-radius': '2px',
              'white-space': 'nowrap',
            }}
          >
            Listener
          </Html>
        </T.Group>
      </>
    )
  },
}
