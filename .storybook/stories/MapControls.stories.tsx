import { SVGLoader } from 'three-stdlib'
import { Box3, Sphere, Vector3 } from 'three'
import { useLoader } from 'solid-three'
import { Meta, StoryObj } from 'storybook-solidjs-vite'

import { MapControls } from '../../src'

import { Setup, T } from '../Setup'
import { createEffect, createMemo, createSignal } from 'solid-js'

const meta = {
  title: 'Controls/MapControls',
  component: MapControls,
  decorators: [
    (Story) => (
      <Setup orthographic camera={{ position: [0, 0, 50], zoom: 10, up: [0, 0, 1], far: 10000 }} controls={false}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof MapControls>

export default meta
type Story = StoryObj<typeof meta>

const Cell = (props: any) => (
  <mesh>
    <T.MeshBasicMaterial color={props.color} opacity={props.fillOpacity} depthWrite={false} transparent />
    <shapeGeometry args={[props.shape]} />
  </mesh>
)

function Svg() {
  const [center, setCenter] = createSignal(() => new Vector3(0, 0, 0))
  let ref: any = null!

  const { paths } = useLoader(SVGLoader, 'map.svg')

  const shapes = createMemo(() =>
    paths.flatMap((p: any) =>
      p.toShapes(true).map((shape: any) => ({ shape, color: p.color, fillOpacity: p.userData.style.fillOpacity }))
    )
  )

  createEffect(() => {
    const box = new Box3().setFromObject(ref)
    const sphere = new Sphere()
    box.getBoundingSphere(sphere)
    setCenter((vec: any) => vec.set(-sphere.center.x, -sphere.center.y, 0))
  })

  return (
    <group position={center()} ref={(el: any) => (ref = el)}>
      {shapes().map((props: any) => (
        <Cell key={props.shape.uuid} {...props} />
      ))}
    </group>
  )
}

function MapControlsScene(props: any) {
  return (
    <>
      <T.Color attach="background" args={[243, 243, 243]} />

      <Suspense fallback={null}>
        <Svg />
      </Suspense>

      <MapControls {...props} />
    </>
  )
}

export const Default: Story = {
  render: (args) => <MapControlsScene {...args} />,
  name: 'Default',
}
