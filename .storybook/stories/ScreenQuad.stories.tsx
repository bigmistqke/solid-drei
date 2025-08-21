import { version } from '@/utils/constants'
import { Entity, useFrame, useThree, type S3 } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { ScreenQuad, shaderMaterial } from '../../src'
import { Setup } from '../Setup'

const meta = {
  title: 'Shapes/ScreenQuad',
  component: ScreenQuad,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof ScreenQuad>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                   Screen Quad                                  */
/*                                                                                */
/**********************************************************************************/

const ColorShiftMaterial = shaderMaterial(
  { time: 0, resolution: new THREE.Vector2() },
  `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
  `,
  `
  uniform float time;
  uniform vec2 resolution;
  vec3 colorA = vec3(0.149,0.141,0.912);
  vec3 colorB = vec3(1.000,0.833,0.224);
  void main() {
    vec3 color = vec3(0.0);
    float pct = abs(sin(time));
    color = mix(colorA, colorB, pct);
    gl_FragColor = vec4(color,1.0);

    #include <tonemapping_fragment>
    #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
  }
  `,
)

type ColorShiftMaterialImpl = {
  time: number
  resolution: number[]
} & S3.Props<THREE.ShaderMaterial>

export const Default: Story = {
  render() {
    const store = useThree()
    let ref: ColorShiftMaterialImpl = null!

    useFrame(state => {
      if (ref?.uniforms) {
        ref.uniforms.time.value = state.clock.elapsedTime
      }
    })

    return (
      <ScreenQuad>
        <Entity
          from={new ColorShiftMaterial()}
          ref={ref!}
          time={0}
          resolution={[store.bounds.width, store.bounds.height]}
        />
      </ScreenQuad>
    )
  },
}
