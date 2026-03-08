import baseConfig from '../../tailwind.config.js'

export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../src/**/*.{js,jsx,ts,tsx}',
  ],
}
