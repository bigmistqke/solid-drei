import { Entity } from 'solid-three'
import { MeshBasicMaterial } from 'three'
import { Box, FlyControls } from '../../src'
import { Setup } from '../Setup'

export const FlyControlsStory = ({ ...args }) => (
  <>
    <FlyControls {...args} />
    <Box>
      <Entity from={new MeshBasicMaterial()} wireframe />
    </Box>
  </>
)

FlyControlsStory.args = {
  autoForward: false,
  dragToLook: false,
  movementSpeed: 1.0,
  rollSpeed: 0.005,
}

FlyControlsStory.storyName = 'Default'

export default {
  title: 'Controls/FlyControls',
  component: FlyControls,
  decorators: [storyFn => <Setup controls={false}>{storyFn()}</Setup>],
}
