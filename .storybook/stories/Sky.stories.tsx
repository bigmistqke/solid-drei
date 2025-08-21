import { createSignal } from 'solid-js'
import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Color, Vector3 } from 'three'
import { Plane, Sky } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Sky',
  component: Sky,
  args: {
    azimuth: 0.25,
    inclination: 0.49,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    rayleigh: 6,
    turbidity: 8,
    sunPosition: [1, 0, 0],
  },
  argTypes: {
    azimuth: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    inclination: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    mieCoefficient: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    mieDirectionalG: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    rayleigh: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
    turbidity: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
  },
  decorators: [
    Story => (
      <Setup
        scene={{ background: new Color('white') }}
        defaultCamera={{ position: new Vector3(-20, 20, -20) }}
      >
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Html',
      },
    },
  },
} satisfies Meta<typeof Sky>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                       Sky                                      */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render(props) {
    return (
      <>
        <Sky {...props} />
        <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
          <T.MeshBasicMaterial color="black" wireframe />
        </Plane>
        <T.AxesHelper />
      </>
    )
  },
}

export const CustomAngles: Story = {
  render(props) {
    return (
      <>
        <Sky distance={3000} {...props} />
        <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
          <T.MeshBasicMaterial color="black" wireframe />
        </Plane>
        <T.AxesHelper />
      </>
    )
  },
}

export const Rotation: Story = {
  render(props) {
    // NOT the right way to do it...
    const [inclination, setInclination] = createSignal(0)
    useFrame(() => {
      setInclination(a => a + 0.002)
    })

    return (
      <>
        <Sky distance={3000} {...props} inclination={inclination()} />
        <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]}>
          <T.MeshBasicMaterial color="black" wireframe />
        </Plane>
        <T.AxesHelper />
      </>
    )
  },
}
