import { Vector3 } from 'three'
import { Setup } from '../Setup'
import { useTurntable } from '../useTurntable'
import { T } from 'solid-three'
import { Box, Center, useGLTF } from '@/src'
import { Suspense } from 'solid-js'

export default {
  title: 'Staging/Center',
  component: Center,
  decorators: [storyFn => <Setup cameraPosition={new Vector3(0, 0, -10)}>{storyFn()}</Setup>],
}

const SimpleExample = () => {
  const resource = useGLTF(() => 'LittlestTokyo.glb')

  const turntable = useTurntable()

  return (
    <Center position={[5, 5, 10]}>
      <Box args={[10, 10, 10]}>
        <T.MeshNormalMaterial wireframe />
      </Box>
      <T.Primitive ref={turntable} object={resource()?.scene!} scale={[0.01, 0.01, 0.01]} />
    </Center>
  )
}

export const DefaultStory = () => (
  <Suspense>
    <SimpleExample />
  </Suspense>
)

DefaultStory.storyName = 'Default'
