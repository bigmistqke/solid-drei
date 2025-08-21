import { Show, createSignal } from 'solid-js'
import { autolisten } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Object3D, Vector3 } from 'three'
import { TransformControls as TransformControlsImpl } from 'three-stdlib'
import { Box, OrbitControls, Select, TransformControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/TransformControls',
  component: TransformControls,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 3) }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Transform Controls',
      },
    },
  },
} satisfies Meta<typeof TransformControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                               Transform Controls                               */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    let ref: TransformControlsImpl = null!

    autolisten(document)('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ref.reset()
      }
    })

    return (
      <TransformControls ref={ref!}>
        <Box>
          <T.MeshBasicMaterial wireframe />
        </Box>
      </TransformControls>
    )
  },
}

export const WithSelect: Story = {
  render() {
    const [selected, setSelected] = createSignal<Object3D[]>([])
    const active = () => selected()[0]

    return (
      <Setup controls={false}>
        <OrbitControls />
        <Show when={active()}>
          <TransformControls object={active()} />
        </Show>
        <Select box onChange={setSelected}>
          <T.Group>
            <Box position={[-1, 0, 0]}>
              <T.MeshBasicMaterial wireframe color="orange" />
            </Box>
          </T.Group>
          <T.Group>
            <Box position={[0, 0, 0]}>
              <T.MeshBasicMaterial wireframe color="green" />
            </Box>
          </T.Group>
        </Select>
      </Setup>
    )
  },
}

export const LockOrbitControls: Story = {
  args: {
    mode: 'translate',
  },
  argTypes: {
    mode: {
      control: {
        type: 'radio',
        options: ['rotate', 'scale', 'translate'],
      },
    },
  },
  name: 'Lock orbit controls while transforming',
  render(props) {
    const [orbitEnabled, setOrbitEnabled] = createSignal(true)

    return (
      <>
        <TransformControls
          ref={controls => {
            autolisten(controls)('dragging-changed', event => setOrbitEnabled(!event.value))
          }}
          mode={props.mode}
          showX={props.showX}
          showY={props.showY}
          showZ={props.showZ}
        >
          <Box>
            <T.MeshBasicMaterial wireframe />
          </Box>
        </TransformControls>
        <OrbitControls enabled={orbitEnabled()} />
      </>
    )
  },
}
