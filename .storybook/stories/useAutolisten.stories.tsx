import { createSignal } from 'solid-js'
import { useThree } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useAutolisten } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/useAutolisten',
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
        component: 'useAutolisten: Automatically manage event listeners with automatic cleanup',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                  Use Autolisten                               */
/*                                                                                */
/**********************************************************************************/

/**
 * Example scene demonstrating useAutolisten for automatic event listener management.
 * Click on the canvas or interact with the scene. The hook automatically manages cleanup.
 */
function UseAutolistenScene() {
  const store = useThree()
  const [clickCount, setClickCount] = createSignal(0)

  // useAutolisten automatically manages event listener cleanup
  // The listener will be automatically removed when the component unmounts
  const listen = useAutolisten(() => store.gl.domElement)

  // Set up a click listener that logs and counts clicks
  listen('click', () => {
    const count = clickCount() + 1
    setClickCount(count)
    console.log(`Canvas clicked ${count} time(s)`)
  })

  return (
    <>
      {/* Interactive cube - shows visual feedback on click */}
      <T.Mesh position={[0, 0, 0]}>
        <T.BoxGeometry args={[2, 2, 2]} />
        <T.MeshPhysicalMaterial color="orange" />
      </T.Mesh>

      {/* Rotating torus - provides visual feedback for interaction count */}
      <T.Mesh
        position={[0, 3, 0]}
        rotation-z={() => (clickCount() * Math.PI) / 4}
      >
        <T.TorusGeometry args={[1, 0.3, 16, 100]} />
        <T.MeshStandardMaterial color="cyan" />
      </T.Mesh>

      {/* Display click count indicator */}
      <T.Mesh position={[0, -2.5, 0]}>
        <T.PlaneGeometry args={[4, 1]} />
        <T.MeshBasicMaterial color="#ffffff" />
      </T.Mesh>
    </>
  )
}

export const Default: Story = {
  render() {
    return <UseAutolistenScene />
  },
}
