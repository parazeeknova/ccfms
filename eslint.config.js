import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  node: true,
  rules: {
    'no-console': 'off',
  },
  ignores: [
    'dist',
    'node_modules',
    'bun.lockb',
  ],
})
