import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Color, type Group, Vector3 } from 'three'
import { MarchingCube, MarchingCubes, MarchingPlane, OrbitControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Abstractions/MarchingCubes',
  component: MarchingCubes,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 10) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof MarchingCubes>

export default meta
type Story = StoryObj<typeof meta>

function Scene(props: { resolution: number; maxPolyCount: number; planeX: boolean; planeY: boolean; planeZ: boolean }) {
  let cubeRefOne: Group = null!
  let cubeRefTwo: Group = null!

  useFrame(({ clock }) => {
    if (!cubeRefOne || !cubeRefTwo) return
    const time = clock.getElapsedTime()
    cubeRefOne.position.set(0.5, Math.sin(time * 0.4) * 0.5 + 0.5, 0.5)
    cubeRefTwo.position.set(0.5, Math.cos(time * 0.4) * 0.5 + 0.5, 0.5)
  })

  return (
    <>
      <MarchingCubes resolution={props.resolution} maxPolyCount={props.maxPolyCount} enableColors={true} scale={2}>
        <MarchingCube ref={r => (cubeRefOne = r!)} color={new Color('#f0f')} position={[0.5, 0.6, 0.5]} />
        <MarchingCube ref={r => (cubeRefTwo = r!)} color={new Color('#ff0')} position={[0.5, 0.5, 0.5]} />
        {props.planeX && <MarchingPlane planeType="x" />}
        {props.planeY && <MarchingPlane planeType="y" />}
        {props.planeZ && <MarchingPlane planeType="z" />}
        <T.MeshPhongMaterial specular={0xffffff} shininess={2} vertexColors={true} />
      </MarchingCubes>
      <T.AxesHelper />
      <OrbitControls enablePan={false} zoomSpeed={0.5} />
    </>
  )
}

export const Default: Story = {
  args: {
    resolution: 40,
    maxPolyCount: 40000,
  },
  argTypes: {
    resolution: { control: { type: 'range', min: 10, max: 80, step: 1 } },
    maxPolyCount: { control: { type: 'range', min: 1000, max: 100000, step: 1000 } },
  },
  render(args) {
    return (
      <Scene
        resolution={args.resolution ?? 40}
        maxPolyCount={args.maxPolyCount ?? 40000}
        planeX={false}
        planeY={true}
        planeZ={false}
      />
    )
  },
}

export const WithPlanes: Story = {
  args: {
    resolution: 40,
    maxPolyCount: 40000,
  },
  render(args) {
    return (
      <Scene
        resolution={args.resolution ?? 40}
        maxPolyCount={args.maxPolyCount ?? 40000}
        planeX={true}
        planeY={true}
        planeZ={true}
      />
    )
  },
}
