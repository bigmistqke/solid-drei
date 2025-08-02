import { Setup } from '../Setup.tsx'

import { T } from 'solid-three'
import { StatsGl } from '../../src/index.ts'

export default {
  title: 'Misc/StatsGl',
  component: StatsGl,
  decorators: [storyFn => <Setup>{storyFn()}</Setup>],
}

function Scene() {
  return (
    <>
      <T.AxesHelper />
      <StatsGl />
    </>
  )
}

export const DefaultStory = () => <Scene />
DefaultStory.storyName = 'Default'
