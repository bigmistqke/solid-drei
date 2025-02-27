import { withKnobs } from '@storybook/addon-knobs'
import { Vector3 } from 'three'

import { Setup } from '../Setup'

import { T } from '@solid-three/fiber'
import { Example, ExampleApi } from '../../src'

export default {
  title: 'Misc/Example',
  component: Example,
  decorators: [
    withKnobs,
    (storyFn) => (
      <Setup cameraPosition={new Vector3(1, 2, 4)} cameraFov={60}>
        {storyFn()}
      </Setup>
    ),
  ],
}

// s3f:   unclear if we still should allow for the api to decr/incr when clicking without metakey
//        a/b with r3f to make sure
export const ExampleSt = ({ fontUrl, color, bevelSize, debug }) => {
  let apiRef: ExampleApi = null!

  return (
    <>
      <T.Color attach="background" args={['#303030']} />
      <T.AxesHelper />

      <Example
        font={fontUrl}
        color={color}
        bevelSize={bevelSize}
        debug={debug}
        ref={apiRef!}
        onClick={(e) => {
          if ((e as any as PointerEvent).metaKey) {
            apiRef?.decr()
          } else {
            apiRef?.incr()
          }
        }}
      />
    </>
  )
}
ExampleSt.args = {
  fontUrl: '/fonts/Inter_Bold.json',
  bevelSize: undefined,
  color: '#cbcbcb',
  debug: false,
}

ExampleSt.argTypes = {
  fontUrl: { control: 'select', options: ['/fonts/Inter_Bold.json', '/fonts/helvetiker_regular.typeface.json'] },
  bevelSize: { control: { type: 'range', min: 0, max: 0.1, step: 0.01 } },
  color: { control: { type: 'color' } },
  debug: { control: { type: 'boolean' } },
}

ExampleSt.storyName = 'Default'
