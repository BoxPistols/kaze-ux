// Disable custom manager config to stabilize UI during SB10 migration.
import { addons } from 'storybook/manager-api'
// Use default theme and config; only keep stable sidebar roots once.
addons.setConfig({
  sidebar: { showRoots: true, collapsedRoots: [] },
})
