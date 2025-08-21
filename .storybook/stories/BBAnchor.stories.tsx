import { whenEffect } from '@/utils/conditionals'
import { type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { BoxHelper, Mesh, Vector3 } from 'three'
import { BBAnchor, Html, Icosahedron, OrbitControls, Sphere, useHelper } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/BBAnchor',
  component: BBAnchor,

  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(2, 2, 2) }}>
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
} satisfies Meta<typeof BBAnchor>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      BBAnchor                                  */
/*                                                                                */
/**********************************************************************************/

const args = {
  anchorX: 1,
  anchorY: 1,
  anchorZ: 1,
  drawBoundingBox: true,
}

const argTypes = {
  anchorX: { control: { type: 'range', min: -1, max: 1, step: 0.1 } },
  anchorY: { control: { type: 'range', min: -1, max: 1, step: 0.1 } },
  anchorZ: { control: { type: 'range', min: -1, max: 1, step: 0.1 } },
  drawBoundingBox: { control: 'boolean' },
}

function BBAnchorScene(props: {
  anchorX: number
  anchorY: number
  anchorZ: number
  drawBoundingBox: boolean
  children?: JSX.Element
}) {
  let ref: Mesh = null!

  whenEffect(
    () => props.drawBoundingBox,
    () => useHelper(ref, BoxHelper, 'cyan'),
  )

  return (
    <>
      <OrbitControls autoRotate />
      <Icosahedron ref={ref}>
        <T.MeshBasicMaterial color="hotpink" wireframe />
        <BBAnchor anchor={[props.anchorX, props.anchorY, props.anchorZ]}>{props.children}</BBAnchor>
      </Icosahedron>
    </>
  )
}

export const WithHtmlComponent: Story = {
  args,
  argTypes,
  render(props) {
    return (
      <BBAnchorScene {...props}>
        <Html
          style={{
            color: 'black',
            'white-space': 'nowrap',
          }}
          center
        >
          Html element
        </Html>
      </BBAnchorScene>
    )
  },
}

export const WithMesh: Story = {
  args,
  argTypes,
  render(props) {
    return (
      <BBAnchorScene {...props}>
        <Sphere args={[0.25]}>
          <T.MeshBasicMaterial color="lime" />
        </Sphere>
      </BBAnchorScene>
    )
  },
}
