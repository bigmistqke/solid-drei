import type { StorybookConfig } from 'storybook-solidjs-vite'
import { mergeConfig } from 'vite'
import path from 'path'
import glslify from 'vite-plugin-glslify'

const config: StorybookConfig = {
  staticDirs: ['./public'],
  stories: ['./stories/**/*.stories.{ts,tsx}'],
  addons: [],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          // Also alias the src folder directly for story imports
          '../../src': path.resolve(__dirname, '../src'),
        },
      },
      plugins: [glslify()],
    })
  },
}
export default config
