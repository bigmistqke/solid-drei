import { Setup } from '../Setup.tsx'

import { T } from 'solid-three'
import { Stats } from '../../src/index.ts'

export default {
  title: 'Misc/Stats',
  component: Stats,
  decorators: [storyFn => <Setup>{storyFn()}</Setup>],
}

function Scene() {
  return (
    <>
      <T.AxesHelper />
      <Stats />
    </>
  )
}

export const DefaultStory = () => <Scene />
DefaultStory.storyName = 'Default'
