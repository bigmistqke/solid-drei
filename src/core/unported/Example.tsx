/* eslint react-hooks/exhaustive-deps: 1 */
import { Suspense, createSignal } from 'solid-js'
import { T, ThreeProps, type Color } from 'solid-three'

import { processProps } from '../utils/process-props'
import { RefComponent } from '../utils/type-utils'
import { createImperativeHandle } from '../utils/use-imperative-handle'
import { Center } from '../Center.tsx'
import { Text3D } from '../Text3D.tsx'

export type ExampleProps = {
  font: string
  color?: Color
  debug?: boolean
  bevelSize?: number
} & ThreeProps<THREE.Group>

export type ExampleApi = {
  incr: (x?: number) => void
  decr: (x?: number) => void
}

export const Example: RefComponent<ExampleApi, ExampleProps, true> = _props => {
  const [props, rest] = processProps(
    _props,
    {
      color: '#cbcbcb',
      bevelSize: 0.04,
      debug: false,
    },
    ['font', 'color', 'bevelSize', 'debug', 'children', 'ref'],
  )

  const [counter, setCounter] = createSignal(0)

  const incr = (x = 1) => setCounter(counter() + x)
  const decr = (x = 1) => setCounter(counter() - x)

  const api = {
    incr,
    decr,
  }

  createImperativeHandle(props, () => api)

  return (
    <T.Group {...rest}>
      <Suspense fallback={null}>
        <Center top cacheKey={JSON.stringify({ counter, font: props.font })}>
          <Text3D bevelEnabled bevelSize={props.bevelSize} font={props.font}>
            {props.debug ? (
              <T.MeshNormalMaterial wireframe />
            ) : (
              <T.MeshStandardMaterial color={props.color} />
            )}
            {counter()}
          </Text3D>
        </Center>
      </Suspense>
      {props.children}
    </T.Group>
  )
}
