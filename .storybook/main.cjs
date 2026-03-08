const path = require('path')

const { mergeConfig, loadEnv } = require('vite')

const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: false,
    check: false,
  },
  async viteFinal(config, { configType }) {
    const freshEnv = loadEnv(configType, path.resolve(__dirname, '..'), 'VITE_')

    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
      define: {
        'import.meta.env.VITE_MAPBOX_ACCESS_TOKEN': JSON.stringify(
          freshEnv.VITE_MAPBOX_ACCESS_TOKEN || ''
        ),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(
          freshEnv.VITE_OPENAI_API_KEY || ''
        ),
        'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(
          freshEnv.VITE_OPENAI_MODEL || 'gpt-5-mini'
        ),
      },
    })
  },
}

module.exports = config
