import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useSpriteLoader } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/useSpriteLoader',
  component: () => null,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'useSpriteLoader: Load and animate sprite sheets',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                  Use Sprite Loader                            */
/*                                                                                */
/**********************************************************************************/

/**
 * Example sprite loader scene.
 * Note: requires an actual sprite sheet image at the specified path.
 * Shows the hook usage pattern with placeholder visuals.
 */
function UseSpriteLoaderScene() {
  // Example usage:
  // const { spriteObj, play, pause, totalFrames } = useSpriteLoader(
  //   '/sprite.png',
  //   { frameWidth: 64, frameHeight: 64 },
  //   [],
  //   24
  // )
  // play()
  //
  // This would create an animated sprite with 64x64 pixel frames at 24 fps.

  return (
    <>
      <T.Mesh position={[0, 0, 0]}>
        <T.BoxGeometry args={[2, 2, 0.1]} />
        <T.MeshStandardMaterial color="orange" />
      </T.Mesh>
      {/* Placeholder: In a real scenario, place the spriteObj here with Entity component */}
      {/* <Entity from={spriteObj} position={[0, 0, 0]} /> */}
    </>
  )
}

export const Default: Story = {
  render() {
    return <UseSpriteLoaderScene />
  },
}
