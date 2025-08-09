import { check } from '@/utils/conditionals'
import { createEffect, createSignal } from 'solid-js'
import { createT, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mesh, MeshPhongMaterial, Vector3 } from 'three'
import * as shapes from '../../src/core/shapes'
import { Setup } from '../Setup'

const T = createT({ MeshPhongMaterial })

const meta = {
  title: 'Shapes',
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 3)}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Various 3D geometric shapes from solid-drei',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function useTurntable() {
  const [ref, setRef] = createSignal<Mesh>()
  useFrame(() => check(ref, ref => (ref.rotation.y += 0.01)))
  createEffect(() => console.log(ref()))
  return setRef
}

function StoryComponent({ comp, args }: { comp: keyof typeof shapes; args?: any }) {
  const Comp = shapes[comp]
  const turntable = useTurntable()

  return (
    <Comp ref={turntable} args={args ?? []}>
      <T.MeshPhongMaterial color="#f3f3f3" wireframe />
    </Comp>
  )
}

export const Box: Story = {
  render: () => <StoryComponent comp="Box" />,
  name: 'Box',
}

export const Circle: Story = {
  render: () => <StoryComponent comp="Circle" />,
  name: 'Circle',
}

export const Cone: Story = {
  render: () => <StoryComponent comp="Cone" />,
  name: 'Cone',
}

export const Cylinder: Story = {
  render: () => <StoryComponent comp="Cylinder" />,
  name: 'Cylinder',
}

export const Sphere: Story = {
  render: () => <StoryComponent comp="Sphere" />,
  name: 'Sphere',
}

export const Plane: Story = {
  render: () => <StoryComponent comp="Plane" />,
  name: 'Plane',
}

export const Torus: Story = {
  render: () => <StoryComponent comp="Torus" />,
  name: 'Torus',
}

export const TorusKnot: Story = {
  render: () => <StoryComponent comp="TorusKnot" />,
  name: 'TorusKnot',
}

export const Tetrahedron: Story = {
  render: () => <StoryComponent comp="Tetrahedron" />,
  name: 'Tetrahedron',
}

export const Ring: Story = {
  render: () => <StoryComponent comp="Ring" />,
  name: 'Ring',
}

// prettier-ignore
const verticesOfCube = [
  -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
  -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
];

// prettier-ignore
const indicesOfFaces = [
  2, 1, 0, 0, 3, 2,
  0, 4, 7, 7, 3, 0,
  0, 1, 5, 5, 4, 0,
  1, 2, 6, 6, 5, 1,
  2, 3, 7, 7, 6, 2,
  4, 5, 6, 6, 7, 4
];

export const Polyhedron: Story = {
  render: () => <StoryComponent comp="Polyhedron" args={[verticesOfCube, indicesOfFaces]} />,
  name: 'Polyhedron',
}

export const Icosahedron: Story = {
  render: () => <StoryComponent comp="Icosahedron" />,
  name: 'Icosahedron',
}

export const Octahedron: Story = {
  render: () => <StoryComponent comp="Octahedron" />,
  name: 'Octahedron',
}

export const Dodecahedron: Story = {
  render: () => <StoryComponent comp="Dodecahedron" />,
  name: 'Dodecahedron',
}
