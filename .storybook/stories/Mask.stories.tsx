import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mask, useMask } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Portals/Mask',
  component: Mask,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }} lights={false}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Mask>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                            Circular Mask Story                                 */
/*                                                                                */
/**********************************************************************************/

function MaskScene() {
  const maskId = 1
  const maskProps = useMask(maskId)

  return (
    <>
      {/* Background plane */}
      <T.Mesh position={[0, 0, -0.5]}>
        <T.PlaneGeometry args={[8, 8]} />
        <T.MeshStandardMaterial color="hotpink" />
      </T.Mesh>

      {/* Circular mask */}
      <Mask id={maskId} position={[0, 0, 0]}>
        <T.CircleGeometry args={[2, 32]} />
        <T.MeshStandardMaterial color="black" />
      </Mask>

      {/* Content visible through the mask */}
      <T.Mesh position={[0, 0, 0.5]}>
        <T.CircleGeometry args={[2, 32]} />
        <T.MeshStandardMaterial
          color="cyan"
          emissive="cyan"
          emissiveIntensity={0.5}
          {...maskProps}
        />
      </T.Mesh>
    </>
  )
}

export const Default: Story = {
  render() {
    return <MaskScene />
  },
}
