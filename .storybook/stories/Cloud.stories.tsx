import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Cloud, OrbitControls } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Staging/Cloud',
  component: Cloud,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 20) }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'SVG',
      },
    },
  },
} satisfies Meta<typeof Cloud>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Cloud                                     */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    return (
      <>
        <Suspense fallback={null}>
          <Cloud position={[-4, -2, 0]} args={[3, 2]} />
          <Cloud position={[-4, 2, 0]} args={[3, 2]} />
          <Cloud args={[3, 2]} />
          <Cloud position={[4, -2, 0]} args={[3, 2]} />
          <Cloud position={[4, 2, 0]} args={[3, 2]} />
        </Suspense>
        <OrbitControls enablePan={false} zoomSpeed={0.5} />
      </>
    )
  },
}
