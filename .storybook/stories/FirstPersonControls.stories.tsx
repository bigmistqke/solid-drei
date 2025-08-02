import { Setup } from '../Setup.tsx'

import { T } from 'solid-three'
import { Box, FirstPersonControls } from '../../src/index.ts'

export const FirstPersonControlsStory = ({ ...args }) => (
  <>
    <FirstPersonControls {...args} />
    <Box>
      <T.MeshBasicMaterial wireframe />
    </Box>
  </>
)

FirstPersonControlsStory.args = {
  activeLook: true,
  autoForward: false,
  constrainVertical: false,
  enabled: true,
  heightCoef: 1,
  heightMax: 1,
  heightMin: 0,
  heightSpeed: false,
  lookVertical: true,
  lookSpeed: 0.005,
  movementSpeed: 1,
  verticalMax: Math.PI,
  verticalMin: 0,
}

FirstPersonControlsStory.storyName = 'Default'

export default {
  title: 'Controls/FirstPersonControls',
  component: FirstPersonControls,
  decorators: [storyFn => <Setup controls={false}>{storyFn()}</Setup>],
}
