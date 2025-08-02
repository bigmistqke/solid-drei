import { addons } from '@storybook/addons'
import theme from './theme.ts'

addons.setConfig({
  theme,
  panelPosition: 'right',
  showPanel: true,
})
