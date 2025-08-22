import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { GizmoHelper, GizmoViewcube, OrbitControls, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Gizmos/GizmoHelper',
  component: GizmoHelper,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 10) }}>
        <T.Color args={['white']} attach="background" />
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Stats',
      },
    },
  },
} satisfies Meta<typeof GizmoHelper>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Gizmo Helper                                */
/*                                                                                */
/**********************************************************************************/

const ALIGNMENT = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
  'bottom-center',
  'center-right',
  'center-left',
  'center-center',
  'top-center',
] as const
const CONTROLS = ['OrbitControls', 'TrackballControls'] as const
const FACES = ['Right', 'Left', 'Top', 'Bottom', 'Front', 'Back'] as const
const GIZMOS = ['GizmoViewcube', 'GizmoViewport'] as const

const COLOR_ARG_TYPE = { control: { type: 'color' } }
const GENERAL_TABLE = { table: { categry: 'General' } }
const HELPER_TABLE = { table: { category: 'GizmoHelper' } }
const VIEWCUBE_TABLE = { table: { category: 'GizmoViewcube' } }
const VIEWPORT_TABLE = { table: { category: 'GizmoViewport' } }

export const Default: Story = {
  args: {
    alignment: ALIGNMENT[2],
    color: 'white',
    colorX: 'red',
    colorY: 'green',
    colorZ: 'blue',
    controls: CONTROLS[0],
    faces: FACES,
    gizmo: GIZMOS[0],
    hideNegativeAxes: false,
    hoverColor: '#999',
    labelColor: 'black',
    marginX: 80,
    marginY: 80,
    opacity: 1,
    strokeColor: 'gray',
    textColor: 'black',
  },

  argTypes: {
    alignment: { control: { type: 'select' }, options: ALIGNMENT, ...HELPER_TABLE },
    color: { ...COLOR_ARG_TYPE, ...VIEWCUBE_TABLE },
    colorX: { ...COLOR_ARG_TYPE, ...VIEWPORT_TABLE },
    colorY: { ...COLOR_ARG_TYPE, ...VIEWPORT_TABLE },
    colorZ: { ...COLOR_ARG_TYPE, ...VIEWPORT_TABLE },
    controls: {
      control: { type: 'select' },
      name: 'Controls',
      options: CONTROLS,
      ...GENERAL_TABLE,
    },
    faces: {
      control: { type: 'array' },
      options: FACES,
      ...VIEWCUBE_TABLE,
    },
    gizmo: {
      control: { type: 'select' },
      name: 'Gizmo',
      options: GIZMOS,
      ...GENERAL_TABLE,
    },
    hideNegativeAxes: { ...VIEWPORT_TABLE },
    hoverColor: { ...VIEWPORT_TABLE },
    labelColor: { ...VIEWPORT_TABLE },
    marginX: { ...HELPER_TABLE },
    marginY: { ...HELPER_TABLE },
    opacity: {
      control: { min: 0, max: 1, step: 0.01, type: 'range' },
      ...VIEWCUBE_TABLE,
    },
    strokeColor: { ...COLOR_ARG_TYPE, ...VIEWCUBE_TABLE },
    textColor: { ...COLOR_ARG_TYPE, ...VIEWCUBE_TABLE },
  },
  render(props) {
    const resource = useGLTF(() => 'LittlestTokyo.glb')
    return (
      <>
        <Entity from={resource()?.scene!} />
        {/* <Box /> */}
        <GizmoHelper alignment={props.alignment}>
          <GizmoViewcube
            color={props.color}
            faces={props.faces}
            hoverColor={props.hoverColor}
            opacity={props.opacity}
            strokeColor={props.strokeColor}
            textColor={props.textColor}
          />
          {/* <GizmoViewport
            axisColors={[props.colorX, props.colorY, props.colorZ]}
            hideNegativeAxes={props.hideNegativeAxes}
            labelColor={props.labelColor}
          /> */}
          {/* <Show
            when={props.gizmo === 'GizmoViewcube'}
            fallback={
              <GizmoViewport
                axisColors={[props.colorX, props.colorY, props.colorZ]}
                hideNegativeAxes={props.hideNegativeAxes}
                labelColor={props.labelColor}
              />
            }
          >
            <GizmoViewcube
              color={props.color}
              faces={props.faces}
              hoverColor={props.hoverColor}
              opacity={props.opacity}
              strokeColor={props.strokeColor}
              textColor={props.textColor}
            />
          </Show> */}
        </GizmoHelper>

        <OrbitControls enabled />
        {/* <Show
          when={props.controls === 'TrackballControls'}
          fallback={<OrbitControls makeCurrent />}
        >
          <TrackballControls makeCurrent />
        </Show> */}
      </>
    )
  },
}
