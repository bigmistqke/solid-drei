import { CurveModifier, useLoader } from '@/core'
import { createMemo, type JSX } from 'solid-js'
import { Entity, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { BufferGeometry, CatmullRomCurve3, LineBasicMaterial, LineLoop, Vector3 } from 'three'
import { FontLoader, TextGeometry } from 'three-stdlib'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Modifiers/CurveModifier',
  component: CurveModifier,
  decorators: [
    (Story: () => JSX.Element) => {
      return (
        <Setup environment lights defaultCamera={{ position: [0, 10, 20] }}>
          <Story />
        </Setup>
      )
    },
  ],
} satisfies Meta<typeof CurveModifier>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                 Curve Modifier                                 */
/*                                                                                */
/**********************************************************************************/

const HANDLE_POS = [
  { x: 10, y: 0, z: -10 },
  { x: 10, y: 0, z: 10 },
  { x: -10, y: 0, z: 10 },
  { x: -10, y: 0, z: -10 },
].map(hand => new Vector3(...Object.values(hand)))

export const Default: Story = {
  render() {
    const font = useLoader(FontLoader, '/fonts/helvetiker_regular.typeface.json')

    const curve = createMemo(() => new CatmullRomCurve3(HANDLE_POS, true, 'centripetal'))
    const line = createMemo(
      () =>
        new LineLoop(
          new BufferGeometry().setFromPoints(curve().getPoints(50)),
          new LineBasicMaterial({ color: 0x00ff00 }),
        ),
    )

    return (
      <>
        <Entity from={line()} />
        <CurveModifier
          ref={({ moveAlongCurve }) => useFrame(() => moveAlongCurve(0.001))}
          curve={curve()}
        >
          <T.Mesh>
            <Entity
              from={TextGeometry}
              attach="geometry"
              args={[
                // @ts-ignore
                'hello solid-drei',
                {
                  font: font()!,
                  size: 2,
                  height: 0.05,
                  curveSegments: 12,
                  bevelEnabled: true,
                  bevelThickness: 0.02,
                  bevelSize: 0.01,
                  bevelOffset: 0,
                },
              ]}
            />
            <T.MeshNormalMaterial attach="material" />
          </T.Mesh>
        </CurveModifier>
      </>
    )
  },
}
