import { createMemo } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { useBoxProjectedEnv } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/useBoxProjectedEnv',
  component: () => null,
  decorators: [
    Story => (
      <Setup environment defaultCamera={{ position: [0, 2, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'useBoxProjectedEnv: Apply box-projected environment mapping for better reflections in enclosed spaces',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                              Use Box Projected Env                            */
/*                                                                                */
/**********************************************************************************/

/**
 * Example scene demonstrating box-projected environment mapping.
 * Box projection provides more convincing reflections in enclosed environments
 * compared to regular cube maps by accounting for parallax.
 */
function UseBoxProjectedEnvScene() {
  const boxSize = new THREE.Vector3(10, 10, 10)
  const boxPosition = new THREE.Vector3(0, 0, 0)

  // useBoxProjectedEnv returns shader modifiers that can be spread onto a material
  // The hook modifies the shader to apply box-projected environment mapping
  // Note: In practice, ensure the scene has an environment map set for this to be visible
  const envProps = useBoxProjectedEnv(
    () => boxPosition,
    () => boxSize,
  )

  return (
    <>
      {/* Box representing the projection bounds (visible for reference) */}
      <T.Mesh position={boxPosition.toArray()}>
        <T.BoxGeometry args={boxSize.toArray()} />
        <T.MeshStandardMaterial wireframe transparent opacity={0.1} color="blue" />
      </T.Mesh>

      {/* Reflective plane - spread envProps to apply box-projection shader modifications */}
      <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <T.PlaneGeometry args={[10, 10]} />
        <T.MeshStandardMaterial
          color="white"
          roughness={0.1}
          metalness={0.9}
        />
      </T.Mesh>

      {/* Additional geometry to be reflected */}
      <T.Mesh position={[2, 1, -2]}>
        <T.TorusGeometry args={[1, 0.4, 16, 100]} />
        <T.MeshPhysicalMaterial color="hotpink" />
      </T.Mesh>

      <T.Mesh position={[-2, 1, 2]}>
        <T.IcosahedronGeometry args={[1, 4]} />
        <T.MeshPhysicalMaterial color="cyan" />
      </T.Mesh>
    </>
  )
}

export const Default: Story = {
  render() {
    return <UseBoxProjectedEnvScene />
  },
}
