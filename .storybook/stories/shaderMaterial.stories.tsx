import { createT } from 'solid-three'
import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { shaderMaterial } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const ColorShiftMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(0.2, 0.0, 0.1) },
  `varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  `varying vec2 vUv;
  uniform float time;
  uniform vec3 color;
  void main() {
    gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + time) + color, 1.0);
  }`,
)

const TMat = createT({ ColorShiftMaterial })

const meta = {
  title: 'Shaders/shaderMaterial',
  component: shaderMaterial,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof shaderMaterial>

export default meta
type Story = StoryObj<typeof meta>

function ShaderScene() {
  let ref: InstanceType<typeof ColorShiftMaterial> = null!
  useFrame((_, delta) => {
    if (ref) ref.time += delta
  })
  return (
    <T.Mesh>
      <T.BoxGeometry args={[2, 2, 2]} />
      <TMat.ColorShiftMaterial ref={r => (ref = r!)} />
    </T.Mesh>
  )
}

export const Default: Story = {
  render() {
    return <ShaderScene />
  },
}
