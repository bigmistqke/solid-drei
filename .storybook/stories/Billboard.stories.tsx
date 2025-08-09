import type { JSX } from 'solid-js'
import { createT } from 'solid-three'
import type { Meta } from 'storybook-solidjs-vite'
import { Group, MeshStandardMaterial, Vector3 } from 'three'
import { Billboard, Box, Cone, Text as DreiText, OrbitControls, Plane } from '../../src'
import { Setup } from '../Setup'

const T = createT({ Group, MeshStandardMaterial })

type BillboardProps = {
  follow: boolean
  lockX: boolean
  lockY: boolean
  lockZ: boolean
}

export function Planes(props: BillboardProps) {
  return (
    <>
      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[-4, -2, 0]}
      >
        <Plane args={[3, 2]} material-color="red" />
      </Billboard>
      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[-4, 2, 0]}
      >
        <Plane args={[3, 2]} material-color="orange" />
      </Billboard>
      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[0, 0, 0]}
      >
        <Plane args={[3, 2]} material-color="green" />
      </Billboard>
      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[4, -2, 0]}
      >
        <Plane args={[3, 2]} material-color="blue" />
      </Billboard>
      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[4, 2, 0]}
      >
        <Plane args={[3, 2]} material-color="yellow" />
      </Billboard>

      <OrbitControls enablePan={true} zoomSpeed={0.5} />
    </>
  )
}

Planes.args = {
  follow: true,
  lockX: false,
  lockY: false,
  lockZ: false,
}

export function Text(props: BillboardProps) {
  return (
    <>
      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[0.5, 2.05, 0.5]}
      >
        <DreiText fontSize={1} outlineWidth={'5%'} outlineColor="#000000" outlineOpacity={1}>
          box
        </DreiText>
      </Billboard>
      <Box position={[0.5, 1, 0.5]}>
        <T.MeshStandardMaterial color="red" />
      </Box>
      <T.Group position={[-2.5, -3, -1]}>
        <Billboard
          follow={props.follow}
          lockX={props.lockX}
          lockY={props.lockY}
          lockZ={props.lockZ}
          position={[0, 1.05, 0]}
        >
          <DreiText fontSize={1} outlineWidth={'5%'} outlineColor="#000000" outlineOpacity={1}>
            cone
          </DreiText>
        </Billboard>
        <Cone>
          <T.MeshStandardMaterial color="green" />
        </Cone>
      </T.Group>

      <Billboard
        follow={props.follow}
        lockX={props.lockX}
        lockY={props.lockY}
        lockZ={props.lockZ}
        position={[0, 0, -5]}
      >
        <Plane args={[2, 2]}>
          <T.MeshStandardMaterial color="#000066" />
        </Plane>
      </Billboard>

      <OrbitControls enablePan={true} zoomSpeed={0.5} />
    </>
  )
}
Text.args = {
  follow: true,
  lockX: false,
  lockY: false,
  lockZ: false,
}

const meta = {
  title: 'Abstractions/Billboard',
  component: Billboard,
  decorators: [
    (Story: () => JSX.Element) => (
      <Setup controls={false} cameraPosition={new Vector3(0, 0, 10)}>
        <Story />
      </Setup>
    ),
  ],
  args: {
    follow: true,
    lockX: false,
    lockY: false,
    lockZ: false,
  },
} satisfies Meta<typeof Billboard>

export default meta
